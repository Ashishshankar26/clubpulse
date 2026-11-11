import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import { z } from 'zod';
import { connectToDatabase } from '@/lib/mongodb';
import TaskModel from '@/models/Task';
import ClubModel from '@/models/Club';
import { getSessionUser } from '@/lib/auth';
import { canManageClub, isClubMember } from '@/lib/rbac';
import { logAuditEvent } from '@/lib/audit';

const PatchTaskSchema = z.object({
  status: z.enum(['todo', 'in_progress', 'under_review', 'completed', 'blocked']).optional(),
  note: z.string().max(1000).optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
});

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await connectToDatabase();

    const task = mongoose.isValidObjectId(id)
      ? await TaskModel.findById(id).lean()
      : await TaskModel.findOne({ id }).lean();

    if (!task) {
      return NextResponse.json({ success: false, message: 'Task not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, task });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch task' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionUser = await getSessionUser(request);
    if (!sessionUser) {
      return NextResponse.json({ success: false, message: 'Authentication required' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const parseResult = PatchTaskSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { success: false, message: 'Validation failed', errors: parseResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const task = mongoose.isValidObjectId(id)
      ? await TaskModel.findById(id)
      : await TaskModel.findOne({ id });

    if (!task) {
      return NextResponse.json({ success: false, message: 'Task not found' }, { status: 404 });
    }

    const { status, note, priority } = parseResult.data;
    const now = new Date().toLocaleString();

    if (status && status !== task.status) {
      const prevStatus = task.status;
      task.status = status;

      if (!task.activities) task.activities = [];
      task.activities.unshift({
        id: `act_${Date.now()}`,
        timestamp: now,
        userId: sessionUser.id,
        userName: sessionUser.name,
        action: `Moved status from ${prevStatus.toUpperCase()} to ${status.toUpperCase()}`,
        note,
      });
    }

    if (priority) {
      task.priority = priority;
    }

    await task.save();

    await logAuditEvent({
      actorId: sessionUser.id,
      actorName: sessionUser.name,
      actorRole: sessionUser.role,
      action: 'TASK_STATUS_UPDATED',
      targetType: 'Task',
      targetId: task.id || (task._id as any).toString(),
      details: {
        newStatus: status,
        note,
      },
    });

    return NextResponse.json({
      success: true,
      message: 'Task updated successfully',
      task,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to update task' },
      { status: 500 }
    );
  }
}

