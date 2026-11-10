import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IClub extends Document {
  id: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  category: string;
  logo: string;
  banner: string;
  leadId: string;
  leadName: string;
  leadEmail: string;
  leadAvatar: string;
  foundedYear: number;
  memberCount: number;
  activeRecruitment: boolean;
  recruitmentDeadline?: string;
  recruitmentRoles: string[];
  meetingSchedule: string;
  burnoutScore: number;
  healthScore: number;
  achievements: string[];
  members: Array<{
    userId: string;
    userName: string;
    userEmail: string;
    avatar: string;
    clubRole: string;
    joinedDate: string;
    tasksCompleted: number;
    participationRate: number;
    isGhostRisk?: boolean;
    xpEarned: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const ClubSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    shortName: { type: String, required: true },
    tagline: { type: String, default: '' },
    description: { type: String, default: '' },
    category: { type: String, required: true },
    logo: { type: String, default: '' },
    banner: { type: String, default: '' },
    leadId: { type: String, required: true },
    leadName: { type: String, required: true },
    leadEmail: { type: String, required: true },
    leadAvatar: { type: String, default: '' },
    foundedYear: { type: Number, default: 2022 },
    memberCount: { type: Number, default: 0 },
    activeRecruitment: { type: Boolean, default: false },
    recruitmentDeadline: { type: String },
    recruitmentRoles: { type: [String], default: [] },
    meetingSchedule: { type: String, default: '' },
    burnoutScore: { type: Number, default: 0 },
    healthScore: { type: Number, default: 80 },
    achievements: { type: [String], default: [] },
    members: { type: [Schema.Types.Mixed], default: [] },
  },
  { timestamps: true }
);

export const ClubModel: Model<IClub> =
  mongoose.models.Club || mongoose.model<IClub>('Club', ClubSchema);

export default ClubModel;
