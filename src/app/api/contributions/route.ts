import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import ContributionModel from '@/models/Contribution';
import { getSessionUser } from '@/lib/auth';
import { isPlatformAdmin } from '@/lib/rbac';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const sessionUser = await getSessionUser(request);

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const clubId = searchParams.get('clubId');

    const query: Record<string, any> = {};

    if (clubId && clubId !== 'all') {
      query.clubId = clubId;
    }

    if (userId) {
      query.userId = userId;
    } else if (sessionUser && !isPlatformAdmin(sessionUser)) {
      // If no explicit userId filter is passed, default to caller's contributions or club contributions
      const filterMode = searchParams.get('filter');
      if (filterMode === 'me') {
        const legacySlug = sessionUser.email ? sessionUser.email.split('@')[0].split('.')[0] : '';
        query.$or = [
          { userId: sessionUser.id },
          { userName: sessionUser.name },
          ...(legacySlug ? [{ userId: `usr_${legacySlug}` }] : []),
        ];
      }
    }

    const contributions = await ContributionModel.find(query)
      .sort({ date: -1, createdAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      count: contributions.length,
      contributions,
    });
  } catch (error: unknown) {
    console.error('[CONTRIBUTIONS_GET_ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve contributions ledger' },
      { status: 500 }
    );
  }
}

