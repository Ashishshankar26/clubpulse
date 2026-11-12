import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import ClubModel from '@/models/Club';
import TaskModel from '@/models/Task';
import { getSessionUser } from '@/lib/auth';
import { canManageClub, isPlatformAdmin } from '@/lib/rbac';

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
        { success: false, message: 'Club ID query parameter is required' },
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

    // Role-based check: Caller must be lead of this club, active member, or platform admin
    const isLeadOrAdmin = canManageClub(sessionUser, club) || isPlatformAdmin(sessionUser);

    const tasks = await TaskModel.find({ clubId }).lean();

    // 1. Calculate active vs completed vs overdue tasks
    const today = new Date().toISOString().split('T')[0];
    const totalTasks = tasks.length;
    const completedTasks = tasks.filter((t) => t.status === 'completed').length;
    const pendingTasks = tasks.filter((t) => t.status !== 'completed');
    const overdueTasks = pendingTasks.filter((t) => t.dueDate < today).length;

    // 2. Member workload distribution
    const memberWorkload: Record<string, { name: string; taskCount: number; estimatedHours: number }> = {};

    club.members.forEach((m) => {
      memberWorkload[m.userId] = {
        name: m.userName,
        taskCount: 0,
        estimatedHours: 0,
      };
    });

    tasks.forEach((t) => {
      if (memberWorkload[t.assigneeId]) {
        memberWorkload[t.assigneeId].taskCount += 1;
        memberWorkload[t.assigneeId].estimatedHours += t.estimatedHours || 4;
      }
    });

    // 3. Imbalance & Burnout advisory calculations
    const memberCounts = Object.values(memberWorkload).map((w) => w.taskCount);
    const maxAssigned = memberCounts.length > 0 ? Math.max(...memberCounts) : 0;
    const avgAssigned =
      memberCounts.length > 0 ? memberCounts.reduce((a, b) => a + b, 0) / memberCounts.length : 0;

    // Advisory concentration ratio
    const concentrationRatio = avgAssigned > 0 ? Math.round((maxAssigned / avgAssigned) * 10) / 10 : 1;

    // Advisory burnout risk assessment
    let burnoutRisk: 'low' | 'moderate' | 'elevated' | 'high' = 'low';
    if (concentrationRatio > 3.0 || overdueTasks >= 5) {
      burnoutRisk = 'high';
    } else if (concentrationRatio > 2.0 || overdueTasks >= 3) {
      burnoutRisk = 'elevated';
    } else if (concentrationRatio > 1.5 || overdueTasks >= 1) {
      burnoutRisk = 'moderate';
    }

    // Identify ghost risk members (Advisory only: suggests proactive outreach rather than penalty)
    const ghostRiskMembers = club.members
      .filter((m) => (m.tasksCompleted === 0 || m.isGhostRisk) && m.clubRole !== 'Lead')
      .map((m) => ({
        userId: isLeadOrAdmin ? m.userId : 'redacted',
        userName: isLeadOrAdmin ? m.userName : 'Active Member',
        joinedDate: m.joinedDate,
        advisoryNote: 'No recent verified contributions in this cycle; recommended for check-in.',
      }));

    return NextResponse.json({
      success: true,
      clubId: club.id,
      clubName: club.name,
      metrics: {
        totalMembers: club.memberCount,
        totalTasks,
        completedTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 100,
        overdueTasks,
        maxAssignedToSingleMember: maxAssigned,
        averageTasksPerMember: Math.round(avgAssigned * 10) / 10,
        concentrationRatio,
        burnoutRiskLevel: burnoutRisk,
        advisorySummary:
          burnoutRisk === 'high' || burnoutRisk === 'elevated'
            ? 'High task concentration detected on core leads. Consider redistributing pending backlog.'
            : 'Workload distribution is within balanced club thresholds.',
        ghostRiskCount: ghostRiskMembers.length,
        ghostRiskMembers,
      },
    });
  } catch (error: unknown) {
    console.error('[WORKLOAD_ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Failed to calculate workload indicators' },
      { status: 500 }
    );
  }
}
