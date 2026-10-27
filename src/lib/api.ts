/**
 * ClubPulse Client Service Layer
 * 
 * BACKEND INTEGRATION PREPARATION:
 * Currently delegates to local client-side state / localStorage persistence for demo mode.
 * Tomorrow, replace the internal bodies of these methods with fetch('/api/...') or Supabase/Prisma clients.
 * All method signatures and return shapes remain unchanged.
 */

import {
  Club,
  Application,
  Task,
  Contribution,
  ClubFeedback,
  NotificationItem,
  User,
  TaskStatus,
  ApplicationStatus,
} from '@/types';

export interface ClubPulseService {
  // Authentication & Session
  getCurrentUser(): Promise<User>;
  switchUser(userId: string): Promise<User>;
  
  // Clubs
  getClubs(): Promise<Club[]>;
  getClubById(id: string): Promise<Club | null>;
  
  // Recruitment & Applications
  getApplications(clubId?: string): Promise<Application[]>;
  submitApplication(data: Omit<Application, 'id' | 'appliedDate' | 'status'>): Promise<Application>;
  approveApplication(applicationId: string, reviewerName: string): Promise<{ application: Application; updatedClub: Club }>;
  rejectApplication(applicationId: string, reviewerName: string, reason?: string): Promise<Application>;
  
  // Tasks & Contributions
  getTasks(clubId?: string): Promise<Task[]>;
  createTask(data: Omit<Task, 'id' | 'activities'>): Promise<Task>;
  updateTaskStatus(taskId: string, status: TaskStatus, note?: string): Promise<Task>;
  submitTaskForReview(taskId: string, submissionNote: string, submissionLink: string): Promise<Task>;
  approveTaskSubmission(taskId: string, reviewerName: string): Promise<{ task: Task; contribution: Contribution }>;
  getContributions(userId?: string): Promise<Contribution[]>;
  
  // Feedback & Analytics
  getFeedback(clubId?: string): Promise<ClubFeedback[]>;
  submitFeedback(data: Omit<ClubFeedback, 'id' | 'submittedDate' | 'responded'>): Promise<ClubFeedback>;
  respondToFeedback(feedbackId: string, note: string): Promise<ClubFeedback>;
  
  // Notifications
  getNotifications(userId: string): Promise<NotificationItem[]>;
  markNotificationRead(notificationId: string): Promise<void>;
}

/* API Endpoints planned for tomorrow:
   POST /api/auth/login
   GET  /api/clubs
   GET  /api/clubs/:id
   POST /api/clubs/:id/apply
   POST /api/applications/:id/approve
   POST /api/applications/:id/reject
   GET  /api/tasks
   POST /api/tasks
   PATCH /api/tasks/:id/status
   POST /api/tasks/:id/submit
   POST /api/tasks/:id/approve
   GET  /api/contributions
   POST /api/feedback
   GET  /api/analytics/summary
*/
