import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectToDatabase } from '@/lib/mongodb';
import ClubModel from '@/models/Club';
import { getSessionUser } from '@/lib/auth';
import { isPlatformAdmin } from '@/lib/rbac';
import { logAuditEvent } from '@/lib/audit';

const CreateClubSchema = z.object({
  id: z.string().min(3).max(50).regex(/^[a-z0-9_-]+$/i, 'ID must be alphanumeric, hyphen or underscore'),
  name: z.string().min(2).max(100).trim(),
  shortName: z.string().min(2).max(30).trim(),
  tagline: z.string().min(5).max(250).trim(),
  description: z.string().min(10).max(3000).trim(),
  category: z.enum([
    'Technology',
    'Design & Creative',
    'Entrepreneurship',
    'Robotics & AI',
    'Literary & Arts',
    'Social Impact',
  ]),
  logo: z.string().url().or(z.string().startsWith('/')),
  banner: z.string().url().or(z.string().startsWith('/')),
  leadId: z.string().min(1),
  leadName: z.string().min(1),
  leadEmail: z.string().email(),
  foundedYear: z.number().int().min(1950).max(new Date().getFullYear()),
  activeRecruitment: z.boolean().default(false),
  recruitmentRoles: z.array(z.string()).default([]),
  meetingSchedule: z.string().default('TBD'),
});

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const search = searchParams.get('search');
    const recruiting = searchParams.get('recruiting');

    const query: Record<string, any> = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    if (recruiting === 'true') {
      query.activeRecruitment = true;
    }

    if (search) {
      const sanitizedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      query.$or = [
        { name: { $regex: sanitizedSearch, $options: 'i' } },
        { shortName: { $regex: sanitizedSearch, $options: 'i' } },
        { description: { $regex: sanitizedSearch, $options: 'i' } },
      ];
    }

    const clubs = await ClubModel.find(query).sort({ memberCount: -1 }).lean();

    return NextResponse.json({
      success: true,
      count: clubs.length,
      clubs,
    });
  } catch (error: unknown) {
    console.error('[CLUBS_GET_ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve clubs catalog' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser(request);
    if (!sessionUser) {
      return NextResponse.json(
        { success: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Only platform admin can create new clubs
    if (!isPlatformAdmin(sessionUser)) {
      await logAuditEvent({
        actorId: sessionUser.id,
        actorName: sessionUser.name,
        actorRole: sessionUser.role,
        action: 'CLUB_CREATE_DENIED',
        targetType: 'club',
        targetId: 'new',
        status: 'DENIED',
      });

      return NextResponse.json(
        { success: false, message: 'Forbidden: Only College/Platform Administrators can register new clubs' },
        { status: 403 }
      );
    }

    const rawBody = await request.json().catch(() => ({}));
    const parseResult = CreateClubSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Validation failed for new club submission',
          errors: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const clubData = parseResult.data;
    await connectToDatabase();

    const existing = await ClubModel.findOne({
      $or: [{ id: clubData.id }, { name: clubData.name }],
    });

    if (existing) {
      return NextResponse.json(
        { success: false, message: 'A club with this ID or name already exists' },
        { status: 409 }
      );
    }

    const newClub = await ClubModel.create({
      ...clubData,
      memberCount: 1,
      burnoutScore: 20,
      healthScore: 85,
      members: [
        {
          userId: clubData.leadId,
          userName: clubData.leadName,
          userEmail: clubData.leadEmail,
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
          clubRole: 'Lead',
          joinedDate: new Date().toISOString().split('T')[0],
          tasksCompleted: 0,
          participationRate: 100,
          xpEarned: 100,
        },
      ],
    });

    await logAuditEvent({
      actorId: sessionUser.id,
      actorName: sessionUser.name,
      actorRole: sessionUser.role,
      action: 'CLUB_CREATED',
      targetType: 'club',
      targetId: newClub.id,
      status: 'SUCCESS',
    });

    return NextResponse.json({
      success: true,
      message: 'Club registered successfully',
      club: newClub,
    });
  } catch (error: unknown) {
    console.error('[CLUB_CREATE_ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Could not create club record' },
      { status: 500 }
    );
  }
}
