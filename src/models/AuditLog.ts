import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAuditLog extends Document {
  actorId: string;
  actorName: string;
  actorRole: string;
  action: string; // e.g., 'AUTH_LOGIN', 'APPLICATION_APPROVED', 'TASK_VERIFIED', 'ACCESS_DENIED'
  targetType: string; // 'user', 'club', 'task', 'application', 'feedback'
  targetId: string;
  details?: Record<string, any>;
  ipAddress?: string;
  status: 'SUCCESS' | 'DENIED' | 'FAILED';
  createdAt: Date;
}

const AuditLogSchema: Schema = new Schema(
  {
    actorId: { type: String, required: true, index: true },
    actorName: { type: String, required: true },
    actorRole: { type: String, required: true },
    action: { type: String, required: true, index: true },
    targetType: { type: String, required: true },
    targetId: { type: String, required: true, index: true },
    details: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
    status: {
      type: String,
      enum: ['SUCCESS', 'DENIED', 'FAILED'],
      default: 'SUCCESS',
      index: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Immutable append-only audit trail
  }
);

export const AuditLogModel: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);

export default AuditLogModel;
