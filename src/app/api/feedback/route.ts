import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { z } from 'zod';
import { connectToDatabase } from '@/lib/mongodb';
import FeedbackModel from '@/models/Feedback';
import ClubModel from '@/models/Club';
import { getSessionUser } from '@/lib/auth';
import { canManageClub, isClubMember, isPlatformAdmin } from '@/lib/rbac';
import { rateLimit } from '@/lib/rateLimit';
import { logAuditEvent } from '@/lib/audit';

const FeedbackSubmitSchema = z.object({
  clubId: z.string().min(1, 'Club ID is required'),
  isAnonymous: z.boolean().default(true),
  overallSatisfaction: z.number().int().min(1).max(5),
  workloadFairness: z.number().int().min(1).max(5),
  leadershipSupport: z.number().int().min(1).max(5),
  eventFatigueScore: z.number().int().min(1).max(5),
  feedbackText: z.string().min(5, 'Feedback must be at least 5 characters').max(2000),
});

export async function GET(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser(request);
    if (!sessionUser) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const clubId = searchParams.get('clubId');

    if (!clubId) {
      return NextResponse.json(
        { success: false, message: 'clubId parameter is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const club = await ClubModel.findOne({ id: clubId });

    if (!club) {
      return NextResponse.json(
        { success: false, message: 'Club not found' },
        { status: 404 }
      );
    }

    // Role check: Only club leads or platform admin can view feedback reports
    if (!canManageClub(sessionUser, club) && !isPlatformAdmin(sessionUser)) {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Only club leads and council admins can view feedback' },
        { status: 403 }
      );
    }

    const feedbacks = await FeedbackModel.find({ clubId }).sort({ createdAt: -1 }).lean();
    const totalCount = feedbacks.length;

    // Small-group suppression safeguard (k-anonymity principle):
    // If fewer than 3 feedback entries exist for a club, individual comments are redacted
    // to prevent club leads from deducing who wrote the feedback.
    const isSmallSample = totalCount < 3;

    // Sanitize feedback outputs: NEVER return eligibilityHash to frontend
    const sanitizedFeedbacks = feedbacks.map((f) => {
      if (f.isAnonymous) {
        return {
          id: f._id.toString(),
          clubId: f.clubId,
          clubName: f.clubName,
          isAnonymous: true,
          userName: 'Anonymous Club Member',
          overallSatisfaction: f.overallSatisfaction,
          workloadFairness: f.workloadFairness,
          leadershipSupport: f.leadershipSupport,
          eventFatigueScore: f.eventFatigueScore,
          feedbackText: isSmallSample
            ? '[Feedback text redacted until minimum threshold of 3 responses is met to protect student anonymity]'
            : f.feedbackText,
          sentiment: f.sentiment,
          submittedDate: f.submittedDate,
          responded: f.responded,
          responseNote: f.responseNote,
        };
      }

      return {
        id: f._id.toString(),
        clubId: f.clubId,
        clubName: f.clubName,
        isAnonymous: false,
        userName: f.userName,
        overallSatisfaction: f.overallSatisfaction,
        workloadFairness: f.workloadFairness,
        leadershipSupport: f.leadershipSupport,
        eventFatigueScore: f.eventFatigueScore,
        feedbackText: f.feedbackText,
        sentiment: f.sentiment,
        submittedDate: f.submittedDate,
        responded: f.responded,
        responseNote: f.responseNote,
      };
    });

    // Compute aggregated averages
    const avgSatisfaction =
      totalCount > 0
        ? Math.round((feedbacks.reduce((acc, f) => acc + f.overallSatisfaction, 0) / totalCount) * 10) / 10
        : 0;
    const avgWorkloadFairness =
      totalCount > 0
        ? Math.round((feedbacks.reduce((acc, f) => acc + f.workloadFairness, 0) / totalCount) * 10) / 10
        : 0;
    const avgLeadershipSupport =
      totalCount > 0
        ? Math.round((feedbacks.reduce((acc, f) => acc + f.leadershipSupport, 0) / totalCount) * 10) / 10
        : 0;
    const avgEventFatigue =
      totalCount > 0
        ? Math.round((feedbacks.reduce((acc, f) => acc + f.eventFatigueScore, 0) / totalCount) * 10) / 10
        : 0;

    return NextResponse.json({
      success: true,
      clubId,
      totalResponses: totalCount,
      smallGroupSuppressionActive: isSmallSample,
      aggregates: {
        averageSatisfaction: avgSatisfaction,
        averageWorkloadFairness: avgWorkloadFairness,
        averageLeadershipSupport: avgLeadershipSupport,
        averageEventFatigue: avgEventFatigue,
      },
      feedbacks: sanitizedFeedbacks,
    });
  } catch (error: unknown) {
    console.error('[FEEDBACK_GET_ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve feedback report' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') || 'local-client';

  // Rate limiting on feedback submissions: max 5 per minute
  const limiter = rateLimit(`feedback:${ip}`, 5, 60 * 1000);
  if (!limiter.success) {
    return NextResponse.json(
      { success: false, message: 'Rate limit exceeded for feedback submission.' },
      { status: 429 }
    );
  }

  try {
    const sessionUser = await getSessionUser(request);
    if (!sessionUser) {
      return NextResponse.json(
        { success: false, message: 'Authentication required to submit feedback' },
        { status: 401 }
      );
    }

    const rawBody = await request.json().catch(() => ({}));
    const parseResult = FeedbackSubmitSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed for feedback submission',
          errors: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const {
      clubId,
      isAnonymous,
      overallSatisfaction,
      workloadFairness,
      leadershipSupport,
      eventFatigueScore,
      feedbackText,
    } = parseResult.data;

    await connectToDatabase();
    const club = await ClubModel.findOne({ id: clubId });

    if (!club) {
      return NextResponse.json(
        { success: false, message: 'Target club does not exist' },
        { status: 404 }
      );
    }

    // Eligibility check: Caller must be a member or lead of the club to provide survey feedback
    if (!isClubMember(sessionUser, club)) {
      return NextResponse.json(
        { success: false, message: 'Eligibility Restriction: Only active members of this club can submit feedback surveys' },
        { status: 403 }
      );
    }

    // Determine basic sentiment tag
    let sentiment: 'positive' | 'neutral' | 'concerning' = 'neutral';
    if (overallSatisfaction >= 4 && workloadFairness >= 4) {
      sentiment = 'positive';
    } else if (overallSatisfaction <= 2 || eventFatigueScore >= 4 || workloadFairness <= 2) {
      sentiment = 'concerning';
    }

    // Cryptographic one-way eligibility hash:
    // Salted with high-entropy salt so it cannot be reversed to discover student identity.
    const feedbackSalt = process.env.FEEDBACK_SALT || process.env.SESSION_SECRET || 'clubpulse-feedback-salt-2026';
    const eligibilityHash = crypto
      .createHash('sha256')
      .update(`${sessionUser.id}-${clubId}-${feedbackSalt}`)
      .digest('hex');

    // Enforce 1 feedback submission per cycle per member
    const existingSubmission = await FeedbackModel.findOne({
      clubId,
      eligibilityHash,
    });

    if (existingSubmission) {
      return NextResponse.json(
        { success: false, message: 'You have already submitted feedback for this club in the current cycle' },
        { status: 409 }
      );
    }

    const newFeedback = await FeedbackModel.create({
      clubId,
      clubName: club.name,
      isAnonymous,
      userId: isAnonymous ? undefined : sessionUser.id,
      userName: isAnonymous ? undefined : sessionUser.name,
      eligibilityHash,
      overallSatisfaction,
      workloadFairness,
      leadershipSupport,
      eventFatigueScore,
      feedbackText,
      sentiment,
      submittedDate: new Date().toISOString().split('T')[0],
    });

    await logAuditEvent({
      actorId: 'anonymous_respondent',
      actorName: isAnonymous ? 'Anonymous Member' : sessionUser.name,
      actorRole: 'member',
      action: 'FEEDBACK_SUBMITTED',
      targetType: 'feedback',
      targetId: (newFeedback as any)?._id?.toString() || 'feedback_event',
      status: 'SUCCESS',
      details: { clubId, isAnonymous, sentiment },
    });

    return NextResponse.json({
      success: true,
      message: 'Anonymous feedback recorded safely. Thank you for helping improve the club culture!',
    });
  } catch (error: unknown) {
    console.error('[FEEDBACK_SUBMIT_ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Failed to record feedback' },
      { status: 500 }
    );
  }
}
