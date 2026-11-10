import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IContribution extends Document {
  userId: string;
  userName: string;
  clubId: string;
  clubName: string;
  taskId: string;
  taskTitle: string;
  date: string;
  xpEarned: number;
  category: 'Development' | 'Design' | 'Event Prep' | 'Sponsorship' | 'Content' | 'Mentorship';
  verifiedBy: string;
  verifiedAt: string;
  certificateHash?: string;
  createdAt: Date;
}

const ContributionSchema: Schema = new Schema(
  {
    userId: { type: String, required: true, index: true },
    userName: { type: String, required: true },
    clubId: { type: String, required: true, index: true },
    clubName: { type: String, required: true },
    taskId: { type: String, required: true, index: true },
    taskTitle: { type: String, required: true },
    date: { type: String, required: true },
    xpEarned: { type: Number, required: true, min: 0 },
    category: {
      type: String,
      enum: ['Development', 'Design', 'Event Prep', 'Sponsorship', 'Content', 'Mentorship'],
      default: 'Development',
    },
    verifiedBy: { type: String, required: true },
    verifiedAt: { type: String, required: true },
    certificateHash: { type: String },
  },
  {
    timestamps: { createdAt: true, updatedAt: false }, // Immutable ledger
  }
);

// Enforce idempotency: A task cannot be credited more than once to the same user
ContributionSchema.index({ taskId: 1, userId: 1 }, { unique: true });

export const ContributionModel: Model<IContribution> =
  mongoose.models.Contribution || mongoose.model<IContribution>('Contribution', ContributionSchema);

export default ContributionModel;
