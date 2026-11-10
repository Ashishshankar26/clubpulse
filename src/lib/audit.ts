import connectDB from './mongodb';
import AuditLogModel from '@/models/AuditLog';

export interface AuditEventParams {
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string;
  targetType: string;
  targetId: string;
  details?: Record<string, any>;
  ipAddress?: string;
  status?: 'SUCCESS' | 'DENIED' | 'FAILED';
}

/**
 * Records a security or business audit event safely into the database
 */
export async function logAuditEvent(params: AuditEventParams): Promise<void> {
  try {
    await connectDB();
    // Sanitize details to avoid logging passwords or sensitive tokens
    const sanitizedDetails = params.details ? { ...params.details } : undefined;
    if (sanitizedDetails) {
      delete sanitizedDetails.password;
      delete sanitizedDetails.token;
      delete sanitizedDetails.secret;
    }

    await AuditLogModel.create({
      actorId: params.actorId,
      actorName: params.actorName,
      actorRole: params.actorRole,
      action: params.action,
      targetType: params.targetType,
      targetId: params.targetId,
      details: sanitizedDetails,
      ipAddress: params.ipAddress,
      status: params.status || 'SUCCESS',
    });
  } catch (error) {
    // Audit logging failure should not crash primary operations, but should print to server error log
    console.error('[AUDIT_LOG_ERROR]', error);
  }
}
