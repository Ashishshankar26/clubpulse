import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITaskActivity {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  note?: string;
}

export interface ITask extends Document {
  id: string;
  clubId: string;
  clubName: string;
  title: string;
  description: string;
  assigneeId: string;
  assigneeName: string;
  assigneeAvatar: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'under_review' | 'completed' | 'blocked';
  dueDate: string;
  estimatedHours: number;
  actualHours?: number;
  tags: string[];
  xpReward: number;
  submissionNote?: string;
  submissionLink?: string;
  proofHash?: string;
  activities?: ITaskActivity[];
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema(
  {
    id: { type: String, required: true, unique: true, index: true },
    clubId: { type: String, required: true, index: true },
    clubName: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    assigneeId: { type: String, required: true, index: true },
    assigneeName: { type: String, required: true },
    assigneeAvatar: { type: String, default: '' },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    status: {
      type: String,
      enum: ['todo', 'in_progress', 'under_review', 'completed', 'blocked'],
      default: 'todo',
    },
    dueDate: { type: String, required: true },
    estimatedHours: { type: Number, default: 4 },
    actualHours: { type: Number },
    tags: { type: [String], default: [] },
    xpReward: { type: Number, default: 50 },
    submissionNote: { type: String },
    submissionLink: { type: String },
    proofHash: { type: String },
    activities: {
      type: [
        {
          id: { type: String },
          timestamp: { type: String },
          userId: { type: String },
          userName: { type: String },
          action: { type: String },
          note: { type: String },
        },
      ],
      default: [],
    },
  },
  { timestamps: true }
);

export const TaskModel: Model<ITask> =
  mongoose.models.Task || mongoose.model<ITask>('Task', TaskSchema);

export default TaskModel;
