export type UserRole = 'student' | 'club_lead' | 'admin';

export type ApplicationStatus = 'pending' | 'under_review' | 'interview_scheduled' | 'approved' | 'rejected';

export type TaskStatus = 'todo' | 'in_progress' | 'under_review' | 'completed' | 'blocked';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export type ClubCategory = 'Technology' | 'Design & Creative' | 'Entrepreneurship' | 'Robotics & AI' | 'Literary & Arts' | 'Social Impact';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar: string;
  department: string;
  year: string;
  bio?: string;
  skills: string[];
  clubsJoined: string[]; // Club IDs
  xpPoints: number;
}

export interface ClubMember {
  userId: string;
  userName: string;
  userEmail: string;
  avatar: string;
  clubRole: 'Lead' | 'Co-Lead' | 'Core Member' | 'General Member';
  joinedDate: string;
  tasksCompleted: number;
  participationRate: number; // 0 - 100
  isGhostRisk?: boolean; // Inactive > 30 days
  xpEarned: number;
}

export interface Club {
  id: string;
  name: string;
  shortName: string;
  tagline: string;
  description: string;
  category: ClubCategory;
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
  members: ClubMember[];
  achievements: string[];
  upcomingEvents: {
    id: string;
    title: string;
    date: string;
    location: string;
    description: string;
  }[];
  meetingSchedule: string;
  socialLinks: {
    website?: string;
    github?: string;
    instagram?: string;
    linkedin?: string;
    discord?: string;
  };
  burnoutScore: number; // 0 - 100 (risk meter)
  healthScore: number; // 0 - 100
}

export interface Application {
  id: string;
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
  status: ApplicationStatus;
  appliedDate: string;
  reviewedDate?: string;
  reviewedBy?: string;
  interviewDate?: string;
  notes?: string;
}

export interface TaskActivity {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  note?: string;
}

export interface Task {
  id: string;
  clubId: string;
  clubName: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assigneeId: string;
  assigneeName: string;
  assigneeAvatar: string;
  creatorId: string;
  creatorName: string;
  dueDate: string;
  estimatedHours: number;
  tags: string[];
  xpReward: number;
  submissionNote?: string;
  submissionLink?: string;
  submittedAt?: string;
  completedAt?: string;
  activities: TaskActivity[];
}

export interface Contribution {
  id: string;
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
}

export interface ClubFeedback {
  id: string;
  clubId: string;
  clubName: string;
  userId?: string;
  isAnonymous: boolean;
  userName?: string;
  overallSatisfaction: number; // 1-5
  workloadFairness: number; // 1-5
  leadershipSupport: number; // 1-5
  eventFatigueScore: number; // 1-5
  feedbackText: string;
  submittedDate: string;
  sentiment: 'positive' | 'neutral' | 'concerning';
  responded: boolean;
  responseNote?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'task' | 'recruitment' | 'burnout_alert' | 'feedback' | 'system';
  link?: string;
  createdAt: string;
  read: boolean;
}

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  linkText?: string;
  linkHref?: string;
}
