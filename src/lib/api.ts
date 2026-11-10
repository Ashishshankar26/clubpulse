/**
 * ClubPulse Production API Service Client
 * Strongly-typed client wrapper for Next.js App Router API endpoints.
 */

import {
  Club,
  Application,
  Task,
  Contribution,
  ClubFeedback,
  User,
} from '@/types';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const res = await fetch(endpoint, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data;
}

export const api = {
  auth: {
    me: () => request<{ success: boolean; authenticated: boolean; user: User }>('/api/auth/me'),
    login: (registrationNumber: string, password: string) =>
      request<{ success: boolean; user: User; token: string }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ registrationNumber, password }),
      }),
    logout: () => request<{ success: boolean }>('/api/auth/logout', { method: 'POST' }),
  },

  clubs: {
    getAll: (params?: { category?: string; search?: string; recruiting?: boolean }) => {
      const query = new URLSearchParams();
      if (params?.category) query.set('category', params.category);
      if (params?.search) query.set('search', params.search);
      if (params?.recruiting) query.set('recruiting', 'true');
      return request<{ success: boolean; clubs: Club[] }>(`/api/clubs?${query.toString()}`);
    },
    getById: (id: string) => request<{ success: boolean; club: Club }>(`/api/clubs/${id}`),
    update: (id: string, updates: Partial<Club>) =>
      request<{ success: boolean; club: Club }>(`/api/clubs/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      }),
  },

  applications: {
    getAll: (clubId?: string) => {
      const query = clubId ? `?clubId=${encodeURIComponent(clubId)}` : '';
      return request<{ success: boolean; applications: Application[] }>(`/api/applications${query}`);
    },
    submit: (payload: {
      clubId: string;
      appliedRole: string;
      statementOfPurpose: string;
      skills: string[];
      portfolioUrl?: string;
    }) =>
      request<{ success: boolean; application: Application }>('/api/applications', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    review: (id: string, action: 'approve' | 'reject', notes?: string) =>
      request<{ success: boolean; application: Application }>(`/api/applications/${id}/review`, {
        method: 'POST',
        body: JSON.stringify({ action, notes }),
      }),
  },

  tasks: {
    getAll: (params?: { clubId?: string; assigneeId?: string; status?: string }) => {
      const query = new URLSearchParams();
      if (params?.clubId) query.set('clubId', params.clubId);
      if (params?.assigneeId) query.set('assigneeId', params.assigneeId);
      if (params?.status) query.set('status', params.status);
      return request<{ success: boolean; tasks: Task[] }>(`/api/tasks?${query.toString()}`);
    },
    create: (payload: {
      clubId: string;
      title: string;
      description?: string;
      assigneeId: string;
      priority: string;
      dueDate: string;
      estimatedHours: number;
      tags: string[];
      xpReward: number;
    }) =>
      request<{ success: boolean; task: Task }>('/api/tasks', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    submit: (taskId: string, submissionNote: string, submissionLink?: string) =>
      request<{ success: boolean; task: Task }>(`/api/tasks/${taskId}/submit`, {
        method: 'POST',
        body: JSON.stringify({ submissionNote, submissionLink }),
      }),
    verify: (taskId: string, action: 'verify' | 'request_changes', feedback?: string) =>
      request<{ success: boolean; task: Task; certificateHash?: string }>(`/api/tasks/${taskId}/verify`, {
        method: 'POST',
        body: JSON.stringify({ action, feedback }),
      }),
  },

  contributions: {
    getAll: (params?: { clubId?: string; userId?: string; filter?: string }) => {
      const query = new URLSearchParams();
      if (params?.clubId) query.set('clubId', params.clubId);
      if (params?.userId) query.set('userId', params.userId);
      if (params?.filter) query.set('filter', params.filter);
      return request<{ success: boolean; contributions: Contribution[] }>(`/api/contributions?${query.toString()}`);
    },
  },

  feedback: {
    submit: (payload: {
      clubId: string;
      isAnonymous: boolean;
      overallSatisfaction: number;
      workloadFairness: number;
      leadershipSupport: number;
      eventFatigueScore: number;
      feedbackText: string;
    }) =>
      request<{ success: boolean; message: string }>('/api/feedback', {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    getReport: (clubId: string) =>
      request<{
        success: boolean;
        aggregates: any;
        feedbacks: ClubFeedback[];
        smallGroupSuppressionActive: boolean;
      }>(`/api/feedback?clubId=${encodeURIComponent(clubId)}`),
  },

  analytics: {
    getOverview: (clubId?: string) => {
      const query = clubId ? `?clubId=${encodeURIComponent(clubId)}` : '';
      return request<{ success: boolean; platformMetrics: any; categoryBreakdown: any[]; topContributors: any[] }>(
        `/api/analytics${query}`
      );
    },
  },
};

export default api;
