import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectToDatabase } from '@/lib/mongodb';
import ClubModel from '@/models/Club';
import { getSessionUser } from '@/lib/auth';
import { canManageClub } from '@/lib/rbac';
import { logAuditEvent } from '@/lib/audit';

const UpdateClubSchema = z.object({
  tagline: z.string().min(5).max(250).optional(),
  description: z.string().min(10).max(3000).optional(),
  activeRecruitment: z.boolean().optional(),
  recruitmentRoles: z.array(z.string()).optional(),
  recruitmentDeadline: z.string().optional(),
  meetingSchedule: z.string().optional(),
  logo: z.string().optional(),
  banner: z.string().optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();

    const club = await ClubModel.findOne({ id }).lean();
    if (!club) {
      return NextResponse.json(
        { success: false, message: 'Club not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      club,
    });
  } catch (error: unknown) {
    console.error('[CLUB_GET_BY_ID_ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Error retrieving club' },
      { status: 500 }
    );
  }
}

export async function PATCH(
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

    await connectToDatabase();
    const club = await ClubModel.findOne({ id });

    if (!club) {
      return NextResponse.json(
        { success: false, message: 'Club not found' },
        { status: 404 }
      );
    }

    // Role-based authorization scoped to this specific club
    if (!canManageClub(sessionUser, club)) {
      await logAuditEvent({
        actorId: sessionUser.id,
        actorName: sessionUser.name,
        actorRole: sessionUser.role,
        action: 'CLUB_UPDATE_DENIED',
        targetType: 'club',
        targetId: id,
        status: 'DENIED',
      });

      return NextResponse.json(
        { success: false, message: 'Forbidden: You do not have permissions to manage this club' },
        { status: 403 }
      );
    }

    const rawBody = await request.json().catch(() => ({}));
    const parseResult = UpdateClubSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid update attributes',
          errors: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    // Apply allowed updates only (prevents mass-assignment of sensitive fields like leadId or ratings)
    const allowedUpdates = parseResult.data;
    Object.assign(club, allowedUpdates);
    await club.save();

    await logAuditEvent({
      actorId: sessionUser.id,
      actorName: sessionUser.name,
      actorRole: sessionUser.role,
      action: 'CLUB_UPDATED',
      targetType: 'club',
      targetId: id,
      status: 'SUCCESS',
      details: { updatedFields: Object.keys(allowedUpdates) },
    });

    return NextResponse.json({
      success: true,
      message: 'Club details updated successfully',
      club,
    });
  } catch (error: unknown) {
    console.error('[CLUB_PATCH_ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update club' },
      { status: 500 }
    );
  }
}
