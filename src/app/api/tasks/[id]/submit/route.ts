import mongoose from 'mongoose';
import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { z } from 'zod';
import { connectToDatabase } from '@/lib/mongodb';
import TaskModel from '@/models/Task';
import { getSessionUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';
import { isTaskAssignedToUser } from '@/lib/permissions';

const TaskSubmitSchema = z.object({
  submissionNote: z.string().min(5, 'Please provide details about what was completed').max(1000),
  submissionLink: z.string().url('Please provide a valid URL (GitHub PR, Figma link, Google Doc, etc.)').or(z.literal('')),
  actualHours: z.number().min(0.5).max(100).optional(),
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
    const parseResult = TaskSubmitSchema.safeParse(rawBody);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: 'Invalid submission data',
          errors: parseResult.error.flatten().fieldErrors,
        },
        { status: 400 }
      );
    }

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

    // Authorization: Only the assigned member (or admin) can submit work for this task
    const isAssigned =
      task.assigneeId === sessionUser.id ||
      isTaskAssignedToUser(task, sessionUser);

    if (!isAssigned && sessionUser.role !== 'admin') {
      await logAuditEvent({
        actorId: sessionUser.id,
        actorName: sessionUser.name,
        actorRole: sessionUser.role,
        action: 'TASK_SUBMISSION_DENIED',
        targetType: 'task',
        targetId: id,
        status: 'DENIED',
      });

      return NextResponse.json(
        { success: false, message: 'Forbidden: You cannot submit work on behalf of another member' },
        { status: 403 }
      );
    }

    const { submissionNote, submissionLink, actualHours } = parseResult.data;

    // Generate cryptographic hash of submission artifacts
    const rawPayload = `${id}-${sessionUser.id}-${submissionNote}-${submissionLink}-${Date.now()}`;
    const proofHash = crypto.createHash('sha256').update(rawPayload).digest('hex');

    task.submissionNote = submissionNote;
    task.submissionLink = submissionLink;
    task.actualHours = actualHours || task.estimatedHours;
    task.proofHash = proofHash;
    task.status = 'under_review';
    await task.save();

    await logAuditEvent({
      actorId: sessionUser.id,
      actorName: sessionUser.name,
      actorRole: sessionUser.role,
      action: 'TASK_SUBMITTED',
      targetType: 'task',
      targetId: id,
      status: 'SUCCESS',
      details: { proofHash },
    });

    return NextResponse.json({
      success: true,
      message: 'Work submitted for lead verification',
      task,
    });
  } catch (error: unknown) {
    console.error('[TASK_SUBMIT_ERROR]', error);
    return NextResponse.json(
      { success: false, message: 'Failed to submit task' },
      { status: 500 }
    );
  }
}
