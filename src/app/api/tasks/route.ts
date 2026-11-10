import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { z } from 'zod';
import { connectToDatabase } from '@/lib/mongodb';
import TaskModel from '@/models/Task';
import ClubModel from '@/models/Club';
import UserModel from '@/models/User';
import { getSessionUser } from '@/lib/auth';
import { canManageClub, isClubMember } from '@/lib/rbac';
import { logAuditEvent } from '@/lib/audit';

const CreateTaskSchema = z.object({
  clubId: z.string().min(1, 'Club ID is required'),
  title: z.string().min(3).max(150).trim(),
  description: z.string().max(2000).default(''),
  assigneeId: z.string().min(1, 'Assignee is required'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  dueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Due date must be YYYY-MM-DD format'),
  estimatedHours: z.number().min(1).max(100).default(4),
  xpReward: z.number().min(10).max(500).default(50),
  tags: z.array(z.string()).default([]),
});

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const clubId = searchParams.get('clubId');
    const assigneeId = searchParams.get('assigneeId');
    const status = searchParams.get('status');

    const query: Record<string, any> = {};
    if (clubId) query.clubId = clubId;
    if (assigneeId) {
      const user = mongoose.isValidObjectId(assigneeId)
        ? await UserModel.findById(assigneeId).catch(() => null)
        : await UserModel.findOne({ id: assigneeId }).catch(() => null);
      if (user) {
        const legacySlug = user.email ? `usr_${user.email.split('.')[0]}` : '';
        query.$or = [
          { assigneeId: user.id || user._id?.toString() },
          { assigneeName: user.name },
          ...(legacySlug ? [{ assigneeId: legacySlug }] : []),
        ];
      } else {
        query.assigneeId = assigneeId;
      }
    }
    if (status) query.status = status;

    const tasks = await TaskModel.find(query).sort({ dueDate: 1 }).lean();

    return NextResponse.json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error: unknown) {
    console.error('[TASKS_GET_ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Failed to retrieve tasks' },
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

    const rawBody = await request.json().catch(() => ({}));
    const parseResult = CreateTaskSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Task validation failed',
          errors: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

    const taskData = parseResult.data;
    await connectToDatabase();

    const club = await ClubModel.findOne({ id: taskData.clubId });
    if (!club) {
      return NextResponse.json(
        { success: false, message: 'Target club does not exist' },
        { status: 404 }
      );
    }

    // Role-based check: Only club lead or admin can create and assign tasks
    if (!canManageClub(sessionUser, club)) {
      await logAuditEvent({
        actorId: sessionUser.id,
        actorName: sessionUser.name,
        actorRole: sessionUser.role,
        action: 'TASK_CREATE_DENIED',
        targetType: 'task',
        targetId: 'new',
        status: 'DENIED',
      });

      return NextResponse.json(
        { success: false, message: 'Forbidden: Only club leads can create and assign tasks' },
        { status: 403 }
      );
    }

    const assignee = mongoose.isValidObjectId(taskData.assigneeId)
      ? await UserModel.findById(taskData.assigneeId).catch(() => null)
      : await UserModel.findOne({
          $or: [{ id: taskData.assigneeId }, { registrationNumber: taskData.assigneeId }],
        }).catch(() => null);

    // Assignee validation: Assignee MUST be a registered member or lead of this club!
    const isMemberOfClub =
      club.members.some(
        (m) =>
          m.userId === taskData.assigneeId ||
          (assignee && m.userEmail && m.userEmail.toLowerCase() === assignee.email.toLowerCase())
      ) ||
      club.leadId === taskData.assigneeId ||
      (assignee && club.leadEmail && club.leadEmail.toLowerCase() === assignee.email.toLowerCase()) ||
      (assignee && club.leadId && assignee.email.toLowerCase().includes(club.leadId.replace('usr_', '')));

    if (!isMemberOfClub) {
      return NextResponse.json(
        { success: false, message: 'Integrity Violation: Cannot assign a task to a non-member of this club' },
        { status: 400 }
      );
    }
    const assigneeName = assignee ? assignee.name : 'Club Member';
    const assigneeAvatar = assignee ? assignee.avatar : '';

    const taskId = `task_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const newTask = await TaskModel.create({
      id: taskId,
      clubId: club.id,
      clubName: club.name,
      title: taskData.title,
      description: taskData.description,
      assigneeId: taskData.assigneeId,
      assigneeName,
      assigneeAvatar,
      priority: taskData.priority,
      status: 'todo',
      dueDate: taskData.dueDate,
      estimatedHours: taskData.estimatedHours,
      tags: taskData.tags,
      xpReward: taskData.xpReward,
    });

    await logAuditEvent({
      actorId: sessionUser.id,
      actorName: sessionUser.name,
      actorRole: sessionUser.role,
      action: 'TASK_CREATED',
      targetType: 'task',
      targetId: newTask.id,
      status: 'SUCCESS',
      details: { clubId: club.id, assigneeId: taskData.assigneeId, title: newTask.title },
    });

    return NextResponse.json({
      success: true,
      message: 'Task created and assigned successfully',
      task: newTask,
    });
  } catch (error: unknown) {
    console.error('[TASK_CREATE_ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Failed to create task' },
      { status: 500 }
    );
  }
}
