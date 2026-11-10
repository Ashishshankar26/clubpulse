import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectToDatabase } from '@/lib/mongodb';
import ApplicationModel from '@/models/Application';
import ClubModel from '@/models/Club';
import UserModel from '@/models/User';
import { getSessionUser } from '@/lib/auth';
import { canManageClub } from '@/lib/rbac';
import { logAuditEvent } from '@/lib/audit';

const ReviewSchema = z.object({
  action: z.enum(['approve', 'reject', 'interview']),
  interviewDate: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const sessionUser = await getSessionUser(request);

    if (!sessionUser) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const rawBody = await request.json().catch(() => ({}));
    const parseResult = ReviewSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid review action parameters',
          errors: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { action, interviewDate, notes } = parseResult.data;

    await connectToDatabase();
    const application = mongoose.isValidObjectId(id)
      ? await ApplicationModel.findById(id)
      : await ApplicationModel.findOne({ id });

    if (!application) {
      return NextResponse.json(
        { success: false, message: 'Application not found' },
        { status: 404 }
      );
    }

    const club = await ClubModel.findOne({ id: application.clubId });
    if (!club) {
      return NextResponse.json(
        { success: false, message: 'Associated club does not exist' },
        { status: 404 }
      );
    }

    // Role-based check: Caller must be club lead or admin
    if (!canManageClub(sessionUser, club)) {
      await logAuditEvent({
        actorId: sessionUser.id,
        actorName: sessionUser.name,
        actorRole: sessionUser.role,
        action: 'APPLICATION_REVIEW_DENIED',
        targetType: 'application',
        targetId: id,
        status: 'DENIED',
      });

      return NextResponse.json(
        { success: false, message: 'Forbidden: You do not have permissions to review applications for this club' },
        { status: 403 }
      );
    }

    // Self-approval prevention
    if (sessionUser.id === application.userId) {
      await logAuditEvent({
        actorId: sessionUser.id,
        actorName: sessionUser.name,
        actorRole: sessionUser.role,
        action: 'SELF_APPROVAL_ATTEMPT',
        targetType: 'application',
        targetId: id,
        status: 'DENIED',
      });

      return NextResponse.json(
        { success: false, message: 'Integrity Violation: Applicants cannot review or approve their own applications' },
        { status: 403 }
      );
    }

    // State machine validation
    if (application.status === 'approved' || application.status === 'rejected') {
      return NextResponse.json(
        { success: false, message: `Application has already reached terminal status: ${application.status}` },
        { status: 409 }
      );
    }

    const now = new Date().toISOString();

    const formatApp = (doc: any) => ({
      ...(doc.toObject ? doc.toObject() : doc),
      id: doc.id || doc._id?.toString(),
    });

    if (action === 'approve') {
      application.status = 'approved';
      application.reviewedDate = now;
      application.reviewedBy = sessionUser.name;
      application.notes = notes || '';
      await application.save();

      // Check if user is already a member of the club
      const alreadyMember = club.members.some((m) => m.userId === application.userId);
      if (!alreadyMember) {
        club.members.push({
          userId: application.userId,
          userName: application.userName,
          userEmail: application.userEmail,
          avatar:
            application.userAvatar ||
            `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
              application.userName || 'Member'
            )}&backgroundColor=0f172a,1e293b,334155&textColor=ffffff`,
          clubRole: 'General Member',
          joinedDate: now.split('T')[0],
          tasksCompleted: 0,
          participationRate: 100,
          xpEarned: 50,
        });
        club.memberCount = club.members.length;
        await club.save();
      }

      // Add clubId to user's clubsJoined array
      await UserModel.findByIdAndUpdate(application.userId, {
        $addToSet: { clubsJoined: club.id },
      });

      await logAuditEvent({
        actorId: sessionUser.id,
        actorName: sessionUser.name,
        actorRole: sessionUser.role,
        action: 'APPLICATION_APPROVED',
        targetType: 'application',
        targetId: id,
        status: 'SUCCESS',
        details: { applicantId: application.userId, clubId: club.id },
      });

      return NextResponse.json({
        success: true,
        message: `Application approved! ${application.userName} has been inducted into ${club.name}.`,
        application: formatApp(application),
      });
    }

    if (action === 'reject') {
      application.status = 'rejected';
      application.reviewedDate = now;
      application.reviewedBy = sessionUser.name;
      application.notes = notes || '';
      await application.save();

      await logAuditEvent({
        actorId: sessionUser.id,
        actorName: sessionUser.name,
        actorRole: sessionUser.role,
        action: 'APPLICATION_REJECTED',
        targetType: 'application',
        targetId: id,
        status: 'SUCCESS',
        details: { applicantId: application.userId, clubId: club.id },
      });

      return NextResponse.json({
        success: true,
        message: 'Application marked as rejected',
        application: formatApp(application),
      });
    }

    if (action === 'interview') {
      application.status = 'interview_scheduled';
      application.interviewDate = interviewDate || now;
      application.notes = notes || '';
      await application.save();

      return NextResponse.json({
        success: true,
        message: 'Interview scheduled',
        application: formatApp(application),
      });
    }

    return NextResponse.json({ success: false, message: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    console.error('[APPLICATION_REVIEW_ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process application review' },
      { status: 500 }
    );
  }
}
