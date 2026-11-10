import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IFeedback extends Document {
  clubId: string;
  clubName: string;
  isAnonymous: boolean;
  userId?: string; // Only populated if isAnonymous is false
  userName?: string; // Only populated if isAnonymous is false
  eligibilityHash?: string; // Salted one-way hash to prevent duplicate submissions while preserving absolute anonymity
  overallSatisfaction: number; // 1-5
  workloadFairness: number; // 1-5
  leadershipSupport: number; // 1-5
  eventFatigueScore: number; // 1-5
  feedbackText: string;
  sentiment: 'positive' | 'neutral' | 'concerning';
  responded: boolean;
  responseNote?: string;
  submittedDate: string;
  createdAt: Date;
}

const FeedbackSchema: Schema = new Schema(
  {
    clubId: { type: String, required: true, index: true },
    clubName: { type: String, required: true },
    isAnonymous: { type: Boolean, default: true },
    userId: { type: String, default: null },
    userName: { type: String, default: null },
    eligibilityHash: { type: String, index: true },
    overallSatisfaction: { type: Number, required: true, min: 1, max: 5 },
    workloadFairness: { type: Number, required: true, min: 1, max: 5 },
    leadershipSupport: { type: Number, required: true, min: 1, max: 5 },
    eventFatigueScore: { type: Number, required: true, min: 1, max: 5 },
    feedbackText: { type: String, required: true, maxlength: 2000 },
    sentiment: {
      type: String,
      enum: ['positive', 'neutral', 'concerning'],
      default: 'neutral',
    },
    responded: { type: Boolean, default: false },
    responseNote: { type: String, default: '' },
    submittedDate: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate anonymous responses in the same cycle using the one-way eligibility hash
FeedbackSchema.index({ clubId: 1, eligibilityHash: 1 }, { unique: true, sparse: true });

export const FeedbackModel: Model<IFeedback> =
  mongoose.models.Feedback || mongoose.model<IFeedback>('Feedback', FeedbackSchema);

export default FeedbackModel;
