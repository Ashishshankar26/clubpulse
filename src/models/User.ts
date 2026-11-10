import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  id: string;
  name: string;
  registrationNumber: string;
  email: string;
  password?: string;
  role: 'student' | 'club_lead' | 'admin';
  avatar: string;
  department: string;
  year: string;
  bio?: string;
  skills: string[];
  clubsJoined: string[];
  xpPoints: number;
  status?: 'active' | 'suspended';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    registrationNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['student', 'club_lead', 'admin'],
      default: 'student',
    },
    status: {
      type: String,
      enum: ['active', 'suspended'],
      default: 'active',
      index: true,
    },
    avatar: {
      type: String,
      default: function (this: any) {
        const seed = this?.name ? encodeURIComponent(this.name) : 'User';
        return `https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundColor=0f172a,1e293b,334155&textColor=ffffff`;
      },
    },
    department: {
      type: String,
      required: true,
    },
    year: {
      type: String,
      required: true,
    },
    bio: {
      type: String,
      default: '',
    },
    skills: {
      type: [String],
      default: [],
    },
    clubsJoined: {
      type: [String],
      default: [],
    },
    xpPoints: {
      type: Number,
      default: 50,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent mongoose from recompiling model in Next.js hot reload
export const UserModel: Model<IUser> =
  mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default UserModel;
