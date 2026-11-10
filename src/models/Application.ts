import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IApplication extends Document {
  clubId: string;
  clubName: string;
  userId: string;
  userName: string;
  userEmail: string;
  userAvatar: string;
  department: string;
  year: string;
  appliedRole: string;
  statementOfPurpose: string;
  skills: string[];
  portfolioUrl?: string;
  status: 'pending' | 'under_review' | 'interview_scheduled' | 'approved' | 'rejected' | 'withdrawn';
  appliedDate: string;
  reviewedDate?: string;
  reviewedBy?: string;
  interviewDate?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ApplicationSchema: Schema = new Schema(
  {
    clubId: { type: String, required: true, index: true },
    clubName: { type: String, required: true },
    userId: { type: String, required: true, index: true },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    userAvatar: { type: String, default: '' },
    department: { type: String, required: true },
    year: { type: String, required: true },
    appliedRole: { type: String, required: true },
    statementOfPurpose: { type: String, required: true, maxlength: 2000 },
    skills: { type: [String], default: [] },
    portfolioUrl: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'under_review', 'interview_scheduled', 'approved', 'rejected', 'withdrawn'],
      default: 'pending',
      index: true,
    },
    appliedDate: { type: String, required: true },
    reviewedDate: { type: String },
    reviewedBy: { type: String },
    interviewDate: { type: String },
    notes: { type: String, default: '' },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate active applications from the same user to the same club
ApplicationSchema.index(
  { clubId: 1, userId: 1, status: 1 },
  {
    name: 'unique_active_club_application',
    unique: false, // We will enforce at application logic level for pending statuses
  }
);

export const ApplicationModel: Model<IApplication> =
  mongoose.models.Application || mongoose.model<IApplication>('Application', ApplicationSchema);

export default ApplicationModel;
