import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import {
  getSessionUser,
  createSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE,
  SessionUser,
} from '@/lib/auth';
import { connectToDatabase } from '@/lib/mongodb';
import UserModel from '@/models/User';
import ClubModel from '@/models/Club';
import ApplicationModel from '@/models/Application';
import { logAuditEvent } from '@/lib/audit';

export async function GET(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser(request);

    if (!sessionUser) {
      return NextResponse.json(
        { success: false, authenticated: false, message: 'Unauthenticated' },
        { status: 401 }
      );
    }

    await connectToDatabase();
    const user = mongoose.isValidObjectId(sessionUser.id)
      ? await UserModel.findById(sessionUser.id).select('-password')
      : await UserModel.findOne({
          $or: [{ id: sessionUser.id }, { registrationNumber: sessionUser.registrationNumber }],
        }).select('-password');

    if (!user || user.status === 'suspended') {
      return NextResponse.json(
        { success: false, authenticated: false, message: 'Account inaccessible or suspended' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      authenticated: true,
      user: {
        id: user._id.toString(),
        name: user.name,
        registrationNumber: user.registrationNumber,
        email: user.email,
        role: user.role,
        department: user.department,
        year: user.year,
        avatar: user.avatar,
        bio: user.bio,
        skills: user.skills,
        clubsJoined: user.clubsJoined,
        xpPoints: user.xpPoints,
      },
    });
  } catch (error: unknown) {
    console.error('[AUTH_ME_ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Failed to verify session' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const sessionUser = await getSessionUser(request);

    if (!sessionUser) {
      return NextResponse.json(
        { success: false, authenticated: false, message: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { avatar, bio, skills } = body;

    if (!avatar && bio === undefined && skills === undefined) {
      return NextResponse.json(
        { success: false, message: 'No valid profile update parameters provided' },
        { status: 400 }
      );
    }

    // Avatar format validation
    if (avatar !== undefined) {
      if (typeof avatar !== 'string' || !avatar.trim()) {
        return NextResponse.json(
          { success: false, message: 'Avatar must be a non-empty image URL or data URI' },
          { status: 400 }
        );
      }

      const trimmedAvatar = avatar.trim();
      const isHttp = trimmedAvatar.startsWith('http://') || trimmedAvatar.startsWith('https://');
      const isRelative = trimmedAvatar.startsWith('/');
      const isDataUri = trimmedAvatar.startsWith('data:image/');

      if (!isHttp && !isRelative && !isDataUri) {
        return NextResponse.json(
          { success: false, message: 'Avatar must be a valid HTTP(S) link or image data URI' },
          { status: 400 }
        );
      }

      // Max image size constraint (5MB for base64 encoded strings)
      if (trimmedAvatar.length > 5 * 1024 * 1024) {
        return NextResponse.json(
          { success: false, message: 'Image size exceeds maximum allowed limit (5MB)' },
          { status: 400 }
        );
      }
    }

    await connectToDatabase();
    const user = mongoose.isValidObjectId(sessionUser.id)
      ? await UserModel.findById(sessionUser.id)
      : await UserModel.findOne({
          $or: [{ id: sessionUser.id }, { registrationNumber: sessionUser.registrationNumber }],
        });

    if (!user || user.status === 'suspended') {
      return NextResponse.json(
        { success: false, message: 'User profile not found or account suspended' },
        { status: 404 }
      );
    }

    const oldAvatar = user.avatar;
    if (avatar) {
      user.avatar = avatar.trim();
    }
    if (bio !== undefined && typeof bio === 'string') {
      user.bio = bio.slice(0, 500);
    }
    if (skills !== undefined && Array.isArray(skills)) {
      user.skills = skills.map((s: any) => String(s).trim()).filter(Boolean).slice(0, 20);
    }

    await user.save();

    // Propagate avatar update to Club member rosters and lead profiles
    if (avatar) {
      const userIdStr = user._id.toString();
      const legacyId = user.email ? `usr_${user.email.split('.')[0]}` : '';

      // 1. Update leadAvatar if user leads any club
      await ClubModel.updateMany(
        {
          $or: [
            { leadId: userIdStr },
            { leadEmail: user.email },
            ...(legacyId ? [{ leadId: legacyId }] : []),
          ],
        },
        { $set: { leadAvatar: user.avatar } }
      ).catch(() => {});

      // 2. Update member avatar in rosters
      await ClubModel.updateMany(
        {
          $or: [
            { 'members.userId': userIdStr },
            { 'members.userEmail': user.email },
            ...(legacyId ? [{ 'members.userId': legacyId }] : []),
          ],
        },
        { $set: { 'members.$[elem].avatar': user.avatar } },
        {
          arrayFilters: [
            {
              $or: [
                { 'elem.userId': userIdStr },
                { 'elem.userEmail': user.email },
                ...(legacyId ? [{ 'elem.userId': legacyId }] : []),
              ],
            },
          ],
        }
      ).catch(() => {});

      // 3. Propagate to application cards
      await ApplicationModel.updateMany(
        {
          $or: [
            { userId: userIdStr },
            { userEmail: user.email },
            ...(legacyId ? [{ userId: legacyId }] : []),
          ],
        },
        { $set: { userAvatar: user.avatar } }
      ).catch(() => {});
    }

    // Refresh JWT session cookie with the new avatar
    const updatedSessionUser: SessionUser = {
      id: user._id.toString(),
      name: user.name,
      registrationNumber: user.registrationNumber,
      email: user.email,
      role: user.role,
      department: user.department,
      year: user.year,
      avatar: user.avatar,
      status: user.status,
    };

    const newSessionToken = await createSessionToken(updatedSessionUser);

    await logAuditEvent({
      actorId: user._id.toString(),
      actorName: user.name,
      actorRole: user.role,
      action: 'PROFILE_UPDATED',
      targetType: 'user',
      targetId: user._id.toString(),
      status: 'SUCCESS',
      details: {
        avatarChanged: oldAvatar !== user.avatar,
        hasBio: Boolean(user.bio),
      },
    });

    const response = NextResponse.json({
      success: true,
      message: 'Profile picture and details updated successfully',
      user: {
        id: user._id.toString(),
        name: user.name,
        registrationNumber: user.registrationNumber,
        email: user.email,
        role: user.role,
        department: user.department,
        year: user.year,
        avatar: user.avatar,
        bio: user.bio,
        skills: user.skills,
        clubsJoined: user.clubsJoined,
        xpPoints: user.xpPoints,
      },
    });

    response.cookies.set({
      name: SESSION_COOKIE_NAME,
      value: newSessionToken,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: SESSION_MAX_AGE,
    });

    return response;
  } catch (error: unknown) {
    console.error('[PROFILE_PATCH_ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update profile settings' },
      { status: 500 }
    );
  }
}
