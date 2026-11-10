import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { z } from 'zod';
import { connectToDatabase } from '@/lib/mongodb';
import TaskModel from '@/models/Task';
import ClubModel from '@/models/Club';
import UserModel from '@/models/User';
import ContributionModel from '@/models/Contribution';
import { getSessionUser } from '@/lib/auth';
import { canVerifyTask } from '@/lib/rbac';
import { logAuditEvent } from '@/lib/audit';

const VerifySchema = z.object({
  action: z.enum(['verify', 'request_changes']),
  feedback: z.string().max(500).optional(),
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
    const parseResult = VerifySchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid verification payload',
          errors: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const { action, feedback } = parseResult.data;

    await connectToDatabase();
    const task = await TaskModel.findOne({
      $or: [{ id }, { _id: mongoose.isValidObjectId(id) ? id : null }],
    });

    if (!task) {
      return NextResponse.json(
        { success: false, message: 'Task not found' },
        { status: 404 }
      );
    }

    const club = await ClubModel.findOne({ id: task.clubId });
    if (!club) {
      return NextResponse.json(
        { success: false, message: 'Associated club does not exist' },
        { status: 404 }
      );
    }

    // Role-based policy check with anti-self-verification rule
    const policy = canVerifyTask(sessionUser, task, club);
    if (!policy.allowed) {
      await logAuditEvent({
        actorId: sessionUser.id,
        actorName: sessionUser.name,
        actorRole: sessionUser.role,
        action: 'TASK_VERIFICATION_DENIED',
        targetType: 'task',
        targetId: id,
        status: 'DENIED',
        details: { reason: policy.reason },
      });

      return NextResponse.json(
        { success: false, message: `Access Denied: ${policy.reason}` },
        { status: 403 }
      );
    }

    if (action === 'request_changes') {
      task.status = 'in_progress';
      task.submissionNote = `Changes Requested by ${sessionUser.name}: ${feedback || 'Please refine the submission.'}`;
      await task.save();

      await logAuditEvent({
        actorId: sessionUser.id,
        actorName: sessionUser.name,
        actorRole: sessionUser.role,
        action: 'TASK_CHANGES_REQUESTED',
        targetType: 'task',
        targetId: id,
        status: 'SUCCESS',
        details: { feedback },
      });

      return NextResponse.json({
        success: true,
        message: 'Task sent back to assignee for requested adjustments',
        task,
      });
    }

    // Handle 'verify'
    if (task.status === 'completed') {
      return NextResponse.json(
        { success: false, message: 'This task has already been verified and completed' },
        { status: 409 }
      );
    }

    const now = new Date().toISOString();
    const certString = `CERT-${task.clubId}-${task.id}-${task.assigneeId}-${sessionUser.id}-${Date.now()}`;
    const certHash = crypto.createHash('sha256').update(certString).digest('hex');

    // 1. Mark task completed
    task.status = 'completed';
    await task.save();

    // 2. Append to immutable contribution ledger (idempotent: unique index prevents duplicates)
    try {
      await ContributionModel.create({
        userId: task.assigneeId,
        userName: task.assigneeName,
        clubId: task.clubId,
        clubName: task.clubName,
        taskId: task.id,
        taskTitle: task.title,
        date: now.split('T')[0],
        xpEarned: task.xpReward,
        category: 'Development',
        verifiedBy: sessionUser.id,
        verifiedAt: now,
        certificateHash: certHash,
      });
    } catch (e: any) {
      // If already recorded (duplicate retry), do not fail task completion
      console.warn('[CONTRIBUTION_LEDGER_DUPLICATE_IGNORED]', e.message);
    }

    // 3. Increment XP on User record
    const userQuery = mongoose.isValidObjectId(task.assigneeId)
      ? { _id: task.assigneeId }
      : {
          $or: [
            { id: task.assigneeId },
            { name: task.assigneeName },
            ...(task.assigneeId.startsWith('usr_')
              ? [{ email: new RegExp(`^${task.assigneeId.replace('usr_', '')}\\.`, 'i') }]
              : []),
          ],
        };
    await UserModel.findOneAndUpdate(userQuery, {
      $inc: { xpPoints: task.xpReward },
    }).catch(() => null);

    // 4. Update club member's stats
    const memberIndex = club.members.findIndex(
      (m) =>
        m.userId === task.assigneeId ||
        (task.assigneeName && m.userName?.toLowerCase() === task.assigneeName.toLowerCase()) ||
        (task.assigneeId && m.userId && m.userId.replace(/^usr_/, '') === task.assigneeId.replace(/^usr_/, ''))
    );
    if (memberIndex !== -1) {
      club.members[memberIndex].tasksCompleted = (club.members[memberIndex].tasksCompleted || 0) + 1;
      club.members[memberIndex].xpEarned = (club.members[memberIndex].xpEarned || 0) + task.xpReward;
      club.members[memberIndex].isGhostRisk = false; // Activity clears ghost risk
      await club.save();
    }

    await logAuditEvent({
      actorId: sessionUser.id,
      actorName: sessionUser.name,
      actorRole: sessionUser.role,
      action: 'TASK_VERIFIED',
      targetType: 'task',
      targetId: id,
      status: 'SUCCESS',
      details: {
        assigneeId: task.assigneeId,
        xpAwarded: task.xpReward,
        certificateHash: certHash,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Task verified! ${task.xpReward} XP awarded to ${task.assigneeName}.`,
      task,
      certificateHash: certHash,
    });
  } catch (error: unknown) {
    console.error('[TASK_VERIFY_ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Failed to verify task' },
      { status: 500 }
    );
  }
}
