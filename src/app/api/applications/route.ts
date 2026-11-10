import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectToDatabase } from '@/lib/mongodb';
import ApplicationModel from '@/models/Application';
import ClubModel from '@/models/Club';
import { getSessionUser } from '@/lib/auth';
import { canManageClub, canApplyToClub, isPlatformAdmin } from '@/lib/rbac';
import { logAuditEvent } from '@/lib/audit';

const ApplicationSubmitSchema = z.object({
  clubId: z.string().min(1, 'Club ID is required'),
  appliedRole: z.string().min(2).max(100),
  statementOfPurpose: z.string().min(20, 'Please write at least 20 characters').max(2000),
  skills: z.array(z.string()).min(1, 'Add at least one skill'),
  portfolioUrl: z.string().url().optional().or(z.literal('')),
});

const formatApp = (app: any) => ({
  ...app,
  id: app.id || app._id?.toString(),
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

    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const clubId = searchParams.get('clubId');

    // 1. If platform admin, they can query all or by club
    if (isPlatformAdmin(sessionUser)) {
      const query = clubId ? { clubId } : {};
      const applications = await ApplicationModel.find(query).sort({ createdAt: -1 }).lean();
      return NextResponse.json({ success: true, applications: applications.map(formatApp) });
    }

    // 2. If filtering by a specific club, check if caller is lead of that club
    if (clubId) {
      const club = await ClubModel.findOne({ id: clubId });
      if (club && canManageClub(sessionUser, club)) {
        const applications = await ApplicationModel.find({ clubId }).sort({ createdAt: -1 }).lean();
        return NextResponse.json({ success: true, applications: applications.map(formatApp) });
      }
    }

    // 3. If caller manages any clubs, include applications for those clubs as well
    const managedClubs = await ClubModel.find({
      $or: [
        { leadId: sessionUser.id },
        { leadEmail: sessionUser.email },
        { 'members.userId': sessionUser.id, 'members.clubRole': { $in: ['Lead', 'Co-Lead'] } },
      ],
    }).select('id');

    const managedClubIds = managedClubs.map((c) => c.id);

    const userMatchConditions: any[] = [
      { userId: sessionUser.id },
      ...(sessionUser.email ? [{ userEmail: sessionUser.email }] : []),
    ];
    if (sessionUser.email) {
      const slug = `usr_${sessionUser.email.split('.')[0]}`;
      userMatchConditions.push({ userId: slug });
    }

    const query =
      managedClubIds.length > 0
        ? { $or: [{ clubId: { $in: managedClubIds } }, ...userMatchConditions] }
        : { $or: userMatchConditions };

    const applications = await ApplicationModel.find(query)
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ success: true, applications: applications.map(formatApp) });
  } catch (error: unknown) {
    console.error('[APPLICATIONS_GET_ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve applications' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser(request);
    if (!sessionUser) {
      return NextResponse.json(
        { success: false, message: 'Authentication required to apply' },
        { status: 401 }
      );
    }

    const rawBody = await request.json().catch(() => ({}));
    const parseResult = ApplicationSubmitSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed for club application',
          errors: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { clubId, appliedRole, statementOfPurpose, skills, portfolioUrl } = parseResult.data;

    await connectToDatabase();
    const club = await ClubModel.findOne({ id: clubId });

    if (!club) {
      return NextResponse.json(
        { success: false, message: 'Target club does not exist' },
        { status: 404 }
      );
    }

    // Check if club is accepting applications
    if (!club.activeRecruitment) {
      return NextResponse.json(
        { success: false, message: 'This club is not currently accepting new recruitment applications' },
        { status: 400 }
      );
    }

    // Check eligibility: user cannot apply if already a member or lead
    if (!canApplyToClub(sessionUser, club)) {
      return NextResponse.json(
        { success: false, message: 'You are already an active member or lead in this club' },
        { status: 409 }
      );
    }

    // Check if user already has an active pending/under_review application for this club
    const activeApp = await ApplicationModel.findOne({
      clubId,
      userId: sessionUser.id,
      status: { $in: ['pending', 'under_review', 'interview_scheduled'] },
    });

    if (activeApp) {
      return NextResponse.json(
        { success: false, message: 'You already have an active application under review for this club' },
        { status: 409 }
      );
    }

    const application = await ApplicationModel.create({
      clubId,
      clubName: club.name,
      userId: sessionUser.id,
      userName: sessionUser.name,
      userEmail: sessionUser.email,
      userAvatar: sessionUser.avatar || '',
      department: sessionUser.department,
      year: sessionUser.year,
      appliedRole,
      statementOfPurpose,
      skills,
      portfolioUrl: portfolioUrl || '',
      status: 'pending',
      appliedDate: new Date().toISOString().split('T')[0],
    });

    await logAuditEvent({
      actorId: sessionUser.id,
      actorName: sessionUser.name,
      actorRole: sessionUser.role,
      action: 'APPLICATION_SUBMITTED',
      targetType: 'application',
      targetId: application._id.toString(),
      status: 'SUCCESS',
      details: { clubId, appliedRole },
    });

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully to club leads',
      application: formatApp(application.toObject ? application.toObject() : application),
    });
  } catch (error: unknown) {
    console.error('[APPLICATION_SUBMIT_ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Failed to submit application' },
      { status: 500 }
    );
  }
}
