'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  Club,
  Application,
  Task,
  Contribution,
  ClubFeedback,
  NotificationItem,
  TaskStatus,
  ApplicationStatus,
} from '@/types';
import {
  INITIAL_USERS,
  INITIAL_CLUBS,
  INITIAL_APPLICATIONS,
  INITIAL_TASKS,
  INITIAL_CONTRIBUTIONS,
  INITIAL_FEEDBACK,
  INITIAL_NOTIFICATIONS,
} from '@/lib/mockData';
import { isUserLeadOfClub, isApplicationOwnedByUser, isTaskAssignedToUser } from '@/lib/permissions';

interface ClubPulseContextType {
  currentUser: User;
  users: User[];
  clubs: Club[];
  applications: Application[];
  tasks: Task[];
  contributions: Contribution[];
  feedbacks: ClubFeedback[];
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  
  isAuthenticated: boolean;
  authLoading: boolean;
  
  // Actions
  login: (regNo: string, password: string, loggedUser?: any) => { success: boolean; error?: string };
  logout: () => void;
  registerUser: (data: {
    name: string;
    registrationNumber: string;
    email: string;
    department: string;
    year: string;
    password: string;
    role?: UserRole;
  }) => { success: boolean; error?: string };
  switchUser: (userId: string) => void;
  switchRole: (role: UserRole) => void;
  updateProfilePicture: (avatarUrl: string) => Promise<{ success: boolean; error?: string }>;
  applyToClub: (data: {
    clubId: string;
    role: string;
    statement: string;
    skills: string[];
    portfolioUrl?: string;
  }) => Application;
  reviewApplication: (
    appId: string,
    status: 'approved' | 'rejected',
    notes?: string
  ) => Promise<{ success: boolean; error?: string }>;
  createTask: (data: {
    clubId: string;
    title: string;
    description: string;
    assigneeId: string;
    priority: Task['priority'];
    dueDate: string;
    estimatedHours: number;
    tags: string[];
    xpReward: number;
  }) => Task;
  updateTaskStatus: (taskId: string, newStatus: TaskStatus, note?: string) => void;
  submitTaskForReview: (
    taskId: string,
    submissionNote: string,
    submissionLink?: string
  ) => void;
  reviewTask: (
    taskId: string,
    action: 'approve' | 'request_changes',
    reviewNote?: string
  ) => Promise<{ success: boolean; error?: string }>;
  sendNudge: (
    targetUserId: string,
    targetUserName: string,
    clubName: string
  ) => { success: boolean; message: string };
  submitFeedback: (data: {
    clubId: string;
    overallSatisfaction: number;
    workloadFairness: number;
    leadershipSupport: number;
    eventFatigueScore: number;
    feedbackText: string;
    isAnonymous: boolean;
  }) => ClubFeedback;
  respondToFeedback: (feedbackId: string, note: string) => void;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  resetToInitialData: () => void;
}

export const GUEST_USER: User = {
  id: 'guest',
  name: 'Campus Visitor',
  registrationNumber: 'VISITOR',
  email: 'visitor@college.edu',
  role: 'student',
  avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=Visitor&backgroundColor=0f172a,1e293b,334155&textColor=ffffff',
  department: 'Student Affairs',
  year: 'Campus Guest',
  skills: [],
  clubsJoined: [],
  xpPoints: 0,
};

const STORAGE_KEY = 'clubpulse_demo_state_v1';

const ClubPulseContext = createContext<ClubPulseContextType | undefined>(undefined);

export function ClubPulseProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUserId, setCurrentUserId] = useState<string>('guest');
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [clubs, setClubs] = useState<Club[]>(INITIAL_CLUBS);
  const [applications, setApplications] = useState<Application[]>(INITIAL_APPLICATIONS);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [contributions, setContributions] = useState<Contribution[]>(INITIAL_CONTRIBUTIONS);
  const [feedbacks, setFeedbacks] = useState<ClubFeedback[]>(INITIAL_FEEDBACK);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Function to synchronize state from live MongoDB Atlas backend
  const refreshDatabaseState = () => {
    // 1. Verify live session from HttpOnly cookie
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(data => {
        if (data.authenticated && data.user) {
          setCurrentUserId(data.user.id);
          setIsAuthenticated(true);
          setUsers(prev => {
            const idx = prev.findIndex(
              u => u.id === data.user.id || u.registrationNumber === data.user.registrationNumber
            );
            if (idx !== -1) {
              const copy = [...prev];
              copy[idx] = { ...copy[idx], ...data.user };
              return copy;
            }
            return [data.user, ...prev];
          });
        } else {
          setIsAuthenticated(false);
          setCurrentUserId('guest');
        }
      })
      .catch(() => {
        setIsAuthenticated(false);
      })
      .finally(() => {
        setAuthLoading(false);
      });

    // 2. Fetch live clubs
    fetch('/api/clubs')
      .then(r => r.json())
      .then(data => {
        if (data.success && Array.isArray(data.clubs) && data.clubs.length > 0) {
          const sanitizedClubs = data.clubs.map((c: any, idx: number) => ({
            ...c,
            id: c.id || c._id?.toString() || `club_${idx}`,
            upcomingEvents: c.upcomingEvents || [],
            achievements: c.achievements || [],
            recruitmentRoles: c.recruitmentRoles || [],
            members: c.members || [],
          }));
          setClubs(sanitizedClubs);
        }
      })
      .catch(() => {});

    // 3. Fetch live tasks
    fetch('/api/tasks')
      .then(r => r.json())
      .then(data => {
        if (data.success && Array.isArray(data.tasks)) {
          const sanitizedTasks = data.tasks.map((t: any, idx: number) => ({
            ...t,
            id: t.id || t._id?.toString() || `task_${idx}`,
          }));
          setTasks(sanitizedTasks);
        }
      })
      .catch(() => {});

    // 4. Fetch live applications
    fetch('/api/applications')
      .then(r => r.json())
      .then(data => {
        if (data.success && Array.isArray(data.applications)) {
          const sanitizedApps = data.applications.map((a: any, idx: number) => ({
            ...a,
            id: a.id || a._id?.toString() || `app_${idx}`,
          }));
          setApplications(sanitizedApps);
        }
      })
      .catch(() => {});

    // 5. Fetch live contributions ledger
    fetch('/api/contributions')
      .then(r => r.json())
      .then(data => {
        if (data.success && Array.isArray(data.contributions)) {
          const sanitizedContribs = data.contributions.map((c: any, idx: number) => ({
            ...c,
            id: c.id || c._id?.toString() || `contrib_${idx}`,
          }));
          setContributions(sanitizedContribs);
        }
      })
      .catch(() => {});
  };

  // Load live data from MongoDB Atlas on mount
  useEffect(() => {
    try {
      // Clear out legacy mock demo local storage to ensure fresh DB sync
      localStorage.removeItem(STORAGE_KEY);
    } catch {}

    refreshDatabaseState();
    setIsLoaded(true);
  }, []);

  const currentUser = isAuthenticated
    ? users.find(u => u.id === currentUserId || u.registrationNumber === currentUserId) || users[0] || GUEST_USER
    : GUEST_USER;

  const login = (regNo: string, password: string, loggedUser?: any): { success: boolean; error?: string } => {
    const cleanReg = regNo.trim().toUpperCase();
    const cleanPass = password.trim();

    if (!cleanReg) {
      return { success: false, error: 'Please enter your College Registration Number' };
    }
    if (!cleanPass) {
      return { success: false, error: 'Please enter your password' };
    }

    if (loggedUser) {
      const uId = loggedUser.id || loggedUser._id?.toString() || cleanReg;
      const normalizedUser: User = {
        id: uId,
        name: loggedUser.name || 'Campus Student',
        registrationNumber: loggedUser.registrationNumber || cleanReg,
        email: loggedUser.email || `${cleanReg.toLowerCase()}@college.edu`,
        role: loggedUser.role || 'student',
        avatar: loggedUser.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(loggedUser.name || cleanReg)}&backgroundColor=0f172a,1e293b,334155&textColor=ffffff`,
        department: loggedUser.department || 'Computer Science & Engineering',
        year: loggedUser.year || '3rd Year',
        skills: loggedUser.skills || ['Campus Member'],
        clubsJoined: loggedUser.clubsJoined || [],
        xpPoints: loggedUser.xpPoints ?? 50,
      };

      setCurrentUserId(normalizedUser.id);
      setIsAuthenticated(true);
      setAuthLoading(false);
      setUsers(prev => {
        const exists = prev.some(u => u.id === normalizedUser.id || u.registrationNumber?.toUpperCase() === cleanReg);
        return exists
          ? prev.map(u => (u.id === normalizedUser.id || u.registrationNumber?.toUpperCase() === cleanReg) ? normalizedUser : u)
          : [normalizedUser, ...prev];
      });
      setTimeout(refreshDatabaseState, 100);
      return { success: true };
    }

    const matchedUser = users.find(
      u => u.registrationNumber?.toUpperCase() === cleanReg
    );

    if (matchedUser) {
      setCurrentUserId(matchedUser.id);
      setIsAuthenticated(true);
      setAuthLoading(false);
      setTimeout(refreshDatabaseState, 100);
      return { success: true };
    }

    // Dynamic verified user fallback
    setCurrentUserId(cleanReg);
    setIsAuthenticated(true);
    setAuthLoading(false);
    setTimeout(refreshDatabaseState, 100);
    return { success: true };
  };

  const logout = () => {
    setIsAuthenticated(false);
    setCurrentUserId('guest');
    try {
      fetch('/api/auth/logout', { method: 'POST' }).finally(() => {
        window.location.href = '/login';
      });
    } catch {
      window.location.href = '/login';
    }
  };

  const registerUser = (data: {
    name: string;
    registrationNumber: string;
    email: string;
    department: string;
    year: string;
    password: string;
    role?: UserRole;
  }): { success: boolean; error?: string } => {
    const cleanReg = data.registrationNumber.trim().toUpperCase();
    if (!cleanReg) {
      return { success: false, error: 'Registration Number is required' };
    }
    if (users.some(u => u.registrationNumber?.toUpperCase() === cleanReg)) {
      return {
        success: false,
        error: `Registration Number "${cleanReg}" already exists. Please log in instead.`,
      };
    }

    const newUser: User = {
      id: `usr_${Date.now()}`,
      name: data.name.trim(),
      registrationNumber: cleanReg,
      password: data.password.trim() || 'college123',
      email: data.email.trim(),
      role: data.role || 'student',
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.name.trim())}&backgroundColor=0f172a,1e293b,334155&textColor=ffffff`,
      department: data.department,
      year: data.year,
      skills: ['Campus Member'],
      clubsJoined: [],
      xpPoints: 50,
    };

    setUsers(prev => [newUser, ...prev]);
    setCurrentUserId(newUser.id);
    setIsAuthenticated(true);
    return { success: true };
  };

  const switchUser = (userId: string) => {
    const target = users.find(u => u.id === userId);
    if (target) {
      setCurrentUserId(target.id);
    }
  };

  const switchRole = (role: UserRole) => {
    if (role === 'student') {
      setCurrentUserId('usr_aarav');
    } else if (role === 'club_lead') {
      setCurrentUserId('usr_priya');
    } else if (role === 'admin') {
      setCurrentUserId('usr_dean_rajesh');
    }
  };

  const updateProfilePicture = async (
    avatarUrl: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!avatarUrl || typeof avatarUrl !== 'string' || !avatarUrl.trim()) {
      return { success: false, error: 'Please choose or upload a valid image.' };
    }

    const cleanAvatar = avatarUrl.trim();
    const previousAvatar = currentUser.avatar;

    // 1. Optimistic update across local state
    const isUserMatch = (id?: string, email?: string) =>
      id === currentUser.id ||
      (id && currentUser.email && currentUser.email.toLowerCase().includes(id.replace(/^usr_/, ''))) ||
      (email && currentUser.email && email.toLowerCase() === currentUser.email.toLowerCase());

    setUsers(prev =>
      prev.map(u => (isUserMatch(u.id, u.email) ? { ...u, avatar: cleanAvatar } : u))
    );
    setClubs(prev =>
      prev.map(c => ({
        ...c,
        leadAvatar: isUserLeadOfClub(currentUser, c) ? cleanAvatar : c.leadAvatar,
        members: (c.members || []).map(m =>
          isUserMatch(m.userId, m.userEmail) ? { ...m, avatar: cleanAvatar } : m
        ),
      }))
    );
    setApplications(prev =>
      prev.map(a =>
        isApplicationOwnedByUser(a, currentUser) ? { ...a, userAvatar: cleanAvatar } : a
      )
    );

    // 2. Persist to MongoDB Atlas backend
    try {
      const res = await fetch('/api/auth/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar: cleanAvatar }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        // Rollback state if server rejected
        setUsers(prev =>
          prev.map(u => (u.id === currentUser.id ? { ...u, avatar: previousAvatar } : u))
        );
        return { success: false, error: data.message || 'Failed to update avatar on server' };
      }

      return { success: true };
    } catch {
      // In offline / fallback mode, optimistic update persists
      return { success: true };
    }
  };

  const applyToClub = ({
    clubId,
    role,
    statement,
    skills,
    portfolioUrl,
  }: {
    clubId: string;
    role: string;
    statement: string;
    skills: string[];
    portfolioUrl?: string;
  }): Application => {
    const prevApplications = applications;
    const targetClub = clubs.find(c => c.id === clubId);
    const newApp: Application = {
      id: `app_${Date.now()}`,
      clubId,
      clubName: targetClub?.name || 'College Club',
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      userAvatar: currentUser.avatar,
      department: currentUser.department,
      year: currentUser.year,
      appliedRole: role,
      statementOfPurpose: statement,
      skills,
      portfolioUrl,
      status: 'pending',
      appliedDate: new Date().toISOString().split('T')[0],
    };

    // Optimistically update
    setApplications(prev => [newApp, ...prev]);

    // Sync to live MongoDB Atlas backend with rollback on error
    fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clubId,
        appliedRole: role,
        statementOfPurpose: statement,
        skills,
        portfolioUrl: portfolioUrl || '',
      }),
    })
      .then(res => {
        if (!res.ok) {
          setApplications(prevApplications);
        }
      })
      .catch(() => {
        setApplications(prevApplications);
      });

    // Send notification to the club lead
    if (targetClub) {
      const leadNotif: NotificationItem = {
        id: `notif_${Date.now()}`,
        userId: targetClub.leadId,
        title: `New Application for ${targetClub.shortName}`,
        message: `${currentUser.name} applied for "${role}".`,
        type: 'recruitment',
        link: '/recruitment',
        createdAt: 'Just now',
        read: false,
      };
      setNotifications(prev => [leadNotif, ...prev]);
    }

    return newApp;
  };

  const reviewApplication = async (
    appId: string,
    status: 'approved' | 'rejected',
    notes?: string
  ): Promise<{ success: boolean; error?: string }> => {
    // 1. Role validation - Students cannot review applications
    if (currentUser.role === 'student') {
      return {
        success: false,
        error: 'Access Denied: Students are not authorized to review or approve club applications.',
      };
    }

    const app = applications.find(a => a.id === appId);
    if (!app) {
      return { success: false, error: 'Application record not found.' };
    }

    // 2. Anti-Self-Approval validation: A user CANNOT review or approve their own application
    if (isApplicationOwnedByUser(app, currentUser)) {
      return {
        success: false,
        error: 'Integrity Violation: Applicants cannot review or approve their own applications.',
      };
    }

    // 3. Scoping validation: Club Lead can only review applications for their own club
    if (currentUser.role !== 'admin') {
      const targetClub = clubs.find(c => c.id === app.clubId);
      const isLead = isUserLeadOfClub(currentUser, targetClub);
      if (!isLead) {
        return {
          success: false,
          error: `Unauthorized: You do not have permissions to review applications for ${targetClub?.name || 'this club'}.`,
        };
      }
    }

    // 4. State validation
    if (app.status === 'approved' || app.status === 'rejected') {
      return {
        success: false,
        error: `Application has already reached terminal status: ${app.status}.`,
      };
    }

    // OPTIMISTIC UI: Take snapshots of prior state for instantaneous UI feedback & rollback safety
    const prevApplications = applications;
    const prevClubs = clubs;
    const prevUsers = users;

    const today = new Date().toISOString().split('T')[0];

    // Optimistically update applications state immediately
    setApplications(prev =>
      prev.map(a =>
        a.id === appId
          ? {
              ...a,
              status: status as ApplicationStatus,
              reviewedDate: today,
              reviewedBy: currentUser.name,
              notes: notes || a.notes,
            }
          : a
      )
    );

    if (status === 'approved') {
      setClubs(prevClubs =>
        prevClubs.map(c => {
          if (c.id === app.clubId) {
            const alreadyMember = c.members.some(m => m.userId === app.userId);
            if (!alreadyMember) {
              const newMember = {
                userId: app.userId,
                userName: app.userName,
                userEmail: app.userEmail,
                avatar: app.userAvatar,
                clubRole: 'General Member' as const,
                joinedDate: today,
                tasksCompleted: 0,
                participationRate: 100,
                xpEarned: 50,
              };
              return {
                ...c,
                memberCount: c.memberCount + 1,
                members: [...c.members, newMember],
              };
            }
          }
          return c;
        })
      );

      setUsers(prevUsers =>
        prevUsers.map(u => {
          if (u.id === app.userId) {
            const alreadyIn = u.clubsJoined.includes(app.clubId);
            return {
              ...u,
              clubsJoined: alreadyIn ? u.clubsJoined : [...u.clubsJoined, app.clubId],
              xpPoints: u.xpPoints + 50,
            };
          }
          return u;
        })
      );

      const memberNotif: NotificationItem = {
        id: `notif_${Date.now()}`,
        userId: app.userId,
        title: `Application Accepted! Welcome to ${app.clubName}`,
        message: `Congratulations! Your application for "${app.appliedRole}" was approved by ${currentUser.name}. Check your onboarding dashboard.`,
        type: 'recruitment',
        link: '/onboarding',
        createdAt: 'Just now',
        read: false,
      };
      setNotifications(prev => [memberNotif, ...prev]);
    } else {
      const memberNotif: NotificationItem = {
        id: `notif_${Date.now()}`,
        userId: app.userId,
        title: `Application Update: ${app.clubName}`,
        message: `Thank you for your interest in ${app.clubName}. At this time, we are unable to offer you a spot for ${app.appliedRole}.`,
        type: 'recruitment',
        link: '/clubs',
        createdAt: 'Just now',
        read: false,
      };
      setNotifications(prev => [memberNotif, ...prev]);
    }

    // 5. Live Server Persistence in background with rollback on failure
    try {
      const res = await fetch(`/api/applications/${appId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: status === 'approved' ? 'approve' : 'reject',
          notes: notes || '',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        // Rollback optimistic state
        setApplications(prevApplications);
        setClubs(prevClubs);
        setUsers(prevUsers);
        return {
          success: false,
          error: data.message || 'Server rejected application review decision.',
        };
      }

      refreshDatabaseState();
      return { success: true };
    } catch (err: any) {
      // Rollback optimistic state on network failure
      setApplications(prevApplications);
      setClubs(prevClubs);
      setUsers(prevUsers);
      return {
        success: false,
        error: err.message || 'Network error processing review decision.',
      };
    }
  };

  const createTask = (data: {
    clubId: string;
    title: string;
    description: string;
    assigneeId: string;
    priority: Task['priority'];
    dueDate: string;
    estimatedHours: number;
    tags: string[];
    xpReward: number;
  }): Task => {
    const club = clubs.find(c => c.id === data.clubId);
    const assignee = users.find(u => u.id === data.assigneeId);
    const today = new Date().toLocaleString();

    const newTask: Task = {
      id: `task_${Date.now()}`,
      clubId: data.clubId,
      clubName: club?.name || 'Club Task',
      title: data.title,
      description: data.description,
      status: 'todo',
      priority: data.priority,
      assigneeId: data.assigneeId,
      assigneeName: assignee?.name || 'Assigned Member',
      assigneeAvatar:
        assignee?.avatar ||
        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
          assignee?.name || 'Member'
        )}&backgroundColor=0f172a,1e293b,334155&textColor=ffffff`,
      creatorId: currentUser.id,
      creatorName: currentUser.name,
      dueDate: data.dueDate,
      estimatedHours: data.estimatedHours,
      tags: data.tags,
      xpReward: data.xpReward,
      activities: [
        {
          id: `act_${Date.now()}`,
          timestamp: today,
          userId: currentUser.id,
          userName: currentUser.name,
          action: `Created task and assigned to ${assignee?.name || 'member'}`,
        },
      ],
    };

    setTasks(prev => [newTask, ...prev]);

    // Sync to live MongoDB Atlas backend
    fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clubId: data.clubId,
        title: data.title,
        description: data.description,
        assigneeId: data.assigneeId,
        priority: data.priority,
        dueDate: data.dueDate,
        estimatedHours: data.estimatedHours,
        tags: data.tags,
        xpReward: data.xpReward,
      }),
    }).catch(() => {});

    // Notify assignee
    if (assignee && assignee.id !== currentUser.id) {
      const taskNotif: NotificationItem = {
        id: `notif_${Date.now()}`,
        userId: assignee.id,
        title: `New Task Assigned: ${data.title}`,
        message: `${currentUser.name} assigned you a ${data.priority} priority task worth ${data.xpReward} XP.`,
        type: 'task',
        link: '/my-tasks',
        createdAt: 'Just now',
        read: false,
      };
      setNotifications(prev => [taskNotif, ...prev]);
    }

    return newTask;
  };

  const updateTaskStatus = (taskId: string, newStatus: TaskStatus, note?: string) => {
    // OPTIMISTIC UI: Snapshot prior tasks for rollback
    const prevTasks = tasks;
    const now = new Date().toLocaleString();

    // Optimistically update local task state immediately
    setTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          const actionText = `Moved status from ${t.status.toUpperCase()} to ${newStatus.toUpperCase()}`;
          return {
            ...t,
            status: newStatus,
            activities: [
              {
                id: `act_${Date.now()}`,
                timestamp: now,
                userId: currentUser.id,
                userName: currentUser.name,
                action: actionText,
                note,
              },
              ...(t.activities || []),
            ],
          };
        }
        return t;
      })
    );

    // Sync to backend in background with automatic rollback on error
    fetch(`/api/tasks/${taskId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus, note }),
    })
      .then(async res => {
        if (!res.ok) {
          setTasks(prevTasks);
        }
      })
      .catch(() => {
        setTasks(prevTasks);
      });
  };

  const submitTaskForReview = (
    taskId: string,
    submissionNote: string,
    submissionLink?: string
  ) => {
    // OPTIMISTIC UI: Snapshot prior tasks for rollback
    const prevTasks = tasks;
    const now = new Date().toLocaleString();
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    // Optimistically move to under_review immediately
    setTasks(prev =>
      prev.map(t => {
        if (t.id === taskId) {
          return {
            ...t,
            status: 'under_review',
            submissionNote,
            submissionLink,
            submittedAt: now,
            activities: [
              {
                id: `act_${Date.now()}`,
                timestamp: now,
                userId: currentUser.id,
                userName: currentUser.name,
                action: 'Submitted task for lead review',
                note: submissionNote,
              },
              ...(t.activities || []),
            ],
          };
        }
        return t;
      })
    );

    // Notify club lead immediately
    const club = clubs.find(c => c.id === task.clubId);
    if (club) {
      const leadNotif: NotificationItem = {
        id: `notif_${Date.now()}`,
        userId: club.leadId,
        title: `Task Ready for Review: ${task.title}`,
        message: `${currentUser.name} submitted task for review. Verification needed to award ${task.xpReward} XP.`,
        type: 'task',
        link: '/tasks',
        createdAt: 'Just now',
        read: false,
      };
      setNotifications(prev => [leadNotif, ...prev]);
    }

    // Background sync to live MongoDB Atlas with rollback on error
    fetch(`/api/tasks/${taskId}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        submissionNote,
        submissionLink: submissionLink || '',
      }),
    })
      .then(res => {
        if (!res.ok) {
          setTasks(prevTasks);
        }
      })
      .catch(() => {
        setTasks(prevTasks);
      });
  };

  const reviewTask = async (
    taskId: string,
    action: 'approve' | 'request_changes',
    reviewNote?: string
  ): Promise<{ success: boolean; error?: string }> => {
    // 1. Role validation - Ordinary members cannot verify tasks
    if (currentUser.role === 'student') {
      return {
        success: false,
        error: 'Access Denied: Students are not authorized to verify or approve task deliverables.',
      };
    }

    const task = tasks.find(t => t.id === taskId);
    if (!task) {
      return { success: false, error: 'Task not found.' };
    }

    // 2. Anti-Self-Verification check: Assignees cannot verify their own tasks
    if (isTaskAssignedToUser(task, currentUser)) {
      return {
        success: false,
        error: 'Integrity Violation: Task assignees cannot verify their own deliverables.',
      };
    }

    // 3. Scoping check: Club Lead can only verify tasks for their own club
    if (currentUser.role !== 'admin') {
      const targetClub = clubs.find(c => c.id === task.clubId);
      const isLead = isUserLeadOfClub(currentUser, targetClub);
      if (!isLead) {
        return {
          success: false,
          error: `Unauthorized: You do not have permissions to verify tasks for ${task.clubName}.`,
        };
      }
    }

    // OPTIMISTIC UI: Take snapshots of prior state for instantaneous UI transition & rollback safety
    const prevTasks = tasks;
    const prevContributions = contributions;
    const prevUsers = users;
    const prevClubs = clubs;

    const now = new Date().toLocaleString();
    const todayDate = new Date().toISOString().split('T')[0];

    // Optimistically update tasks and dependent states immediately
    if (action === 'approve') {
      setTasks(prev =>
        prev.map(t => {
          if (t.id === taskId) {
            return {
              ...t,
              status: 'completed',
              completedAt: now,
              activities: [
                {
                  id: `act_${Date.now()}`,
                  timestamp: now,
                  userId: currentUser.id,
                  userName: currentUser.name,
                  action: `Approved task submission and verified contribution (${t.xpReward} XP awarded)`,
                  note: reviewNote,
                },
                ...(t.activities || []),
              ],
            };
          }
          return t;
        })
      );

      // Create verified contribution record immediately
      const newContrib: Contribution = {
        id: `contrib_${Date.now()}`,
        userId: task.assigneeId,
        userName: task.assigneeName,
        clubId: task.clubId,
        clubName: task.clubName,
        taskId: task.id,
        taskTitle: task.title,
        date: todayDate,
        xpEarned: task.xpReward,
        category: (task.tags || []).includes('Design')
          ? 'Design'
          : (task.tags || []).includes('Sponsorship')
          ? 'Sponsorship'
          : 'Development',
        verifiedBy: `${currentUser.name} (${currentUser.role === 'club_lead' ? 'Lead' : 'Admin'})`,
        verifiedAt: now,
        certificateHash: `CLUB-${task.clubId.substring(0, 4).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}-VERIFIED`,
      };
      setContributions(prev => [newContrib, ...prev]);

      // Award XP to assignee immediately
      setUsers(prev =>
        prev.map(u =>
          u.id === task.assigneeId
            ? { ...u, xpPoints: u.xpPoints + task.xpReward }
            : u
        )
      );

      setClubs(prev =>
        prev.map(c => {
          if (c.id === task.clubId) {
            return {
              ...c,
              members: c.members.map(m =>
                m.userId === task.assigneeId
                  ? {
                      ...m,
                      tasksCompleted: (m.tasksCompleted || 0) + 1,
                      xpEarned: (m.xpEarned || 0) + task.xpReward,
                      participationRate: Math.min(100, (m.participationRate || 50) + 5),
                      isGhostRisk: false,
                    }
                  : m
              ),
            };
          }
          return c;
        })
      );

      // Notify the assignee immediately
      const assigneeNotif: NotificationItem = {
        id: `notif_${Date.now()}`,
        userId: task.assigneeId,
        title: `Task Approved! +${task.xpReward} XP Earned`,
        message: `${currentUser.name} approved "${task.title}". Your verified contribution is logged in your portfolio!`,
        type: 'task',
        link: '/contributions',
        createdAt: 'Just now',
        read: false,
      };
      setNotifications(prev => [assigneeNotif, ...prev]);
    } else {
      // Request changes: move back to in_progress immediately
      setTasks(prev =>
        prev.map(t => {
          if (t.id === taskId) {
            return {
              ...t,
              status: 'in_progress',
              activities: [
                {
                  id: `act_${Date.now()}`,
                  timestamp: now,
                  userId: currentUser.id,
                  userName: currentUser.name,
                  action: 'Requested changes on task',
                  note: reviewNote || 'Please revise submission items.',
                },
                ...(t.activities || []),
              ],
            };
          }
          return t;
        })
      );

      const assigneeNotif: NotificationItem = {
        id: `notif_${Date.now()}`,
        userId: task.assigneeId,
        title: `Changes Requested: ${task.title}`,
        message: `${currentUser.name} requested changes on your submission: "${reviewNote || 'Please check task feedback.'}"`,
        type: 'task',
        link: '/my-tasks',
        createdAt: 'Just now',
        read: false,
      };
      setNotifications(prev => [assigneeNotif, ...prev]);
    }

    // 4. Live Server Persistence and Audit Log in background with rollback on rejection
    try {
      const res = await fetch(`/api/tasks/${taskId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: action === 'approve' ? 'verify' : 'request_changes',
          feedback: reviewNote || '',
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        // Rollback optimistic updates
        setTasks(prevTasks);
        setContributions(prevContributions);
        setUsers(prevUsers);
        setClubs(prevClubs);
        return {
          success: false,
          error: data.message || 'Server rejected task verification decision.',
        };
      }

      refreshDatabaseState();
      return { success: true };
    } catch (err: any) {
      // Rollback optimistic updates on network failure
      setTasks(prevTasks);
      setContributions(prevContributions);
      setUsers(prevUsers);
      setClubs(prevClubs);
      return {
        success: false,
        error: err.message || 'Network error processing task review.',
      };
    }
  };

  const sendNudge = (
    targetUserId: string,
    targetUserName: string,
    clubName: string
  ): { success: boolean; message: string } => {
    if (currentUser.role === 'student') {
      return {
        success: false,
        message: 'Only club leads and campus administrators can send re-engagement nudges.',
      };
    }
    if (targetUserId === currentUser.id) {
      return { success: false, message: 'Cannot nudge yourself.' };
    }

    const nudgeNotif: NotificationItem = {
      id: `notif_nudge_${Date.now()}`,
      userId: targetUserId,
      title: `Club Re-engagement Nudge: ${clubName}`,
      message: `Hi ${targetUserName}, your club lead (${currentUser.name}) sent a friendly check-in regarding ${clubName}. We value your participation! Check your assigned tasks or reach out to team leads.`,
      type: 'burnout_alert',
      link: '/my-tasks',
      createdAt: 'Just now',
      read: false,
    };

    setNotifications(prev => [nudgeNotif, ...prev]);
    return {
      success: true,
      message: `Re-engagement pulse sent to ${targetUserName}! An activity alert was delivered to their notification feed.`,
    };
  };

  const submitFeedback = (data: {
    clubId: string;
    overallSatisfaction: number;
    workloadFairness: number;
    leadershipSupport: number;
    eventFatigueScore: number;
    feedbackText: string;
    isAnonymous: boolean;
  }): ClubFeedback => {
    const club = clubs.find(c => c.id === data.clubId);
    let sentiment: 'positive' | 'neutral' | 'concerning' = 'neutral';
    if (data.overallSatisfaction >= 4 && data.workloadFairness >= 3) {
      sentiment = 'positive';
    } else if (data.overallSatisfaction <= 2 || data.workloadFairness <= 2 || data.eventFatigueScore >= 4) {
      sentiment = 'concerning';
    }

    const newFb: ClubFeedback = {
      id: `fb_${Date.now()}`,
      clubId: data.clubId,
      clubName: club?.name || 'Club Feedback',
      isAnonymous: data.isAnonymous,
      userId: data.isAnonymous ? undefined : currentUser.id,
      userName: data.isAnonymous ? 'Anonymous Member' : currentUser.name,
      overallSatisfaction: data.overallSatisfaction,
      workloadFairness: data.workloadFairness,
      leadershipSupport: data.leadershipSupport,
      eventFatigueScore: data.eventFatigueScore,
      feedbackText: data.feedbackText,
      submittedDate: new Date().toISOString().split('T')[0],
      sentiment,
      responded: false,
    };

    setFeedbacks(prev => [newFb, ...prev]);

    // Sync to live MongoDB Atlas backend
    fetch('/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clubId: data.clubId,
        isAnonymous: data.isAnonymous,
        overallSatisfaction: data.overallSatisfaction,
        workloadFairness: data.workloadFairness,
        leadershipSupport: data.leadershipSupport,
        eventFatigueScore: data.eventFatigueScore,
        feedbackText: data.feedbackText,
      }),
    }).catch(() => {});

    // Send notification to club lead
    if (club) {
      const fbNotif: NotificationItem = {
        id: `notif_${Date.now()}`,
        userId: club.leadId,
        title: `New Pulse Feedback for ${club.shortName}`,
        message: `A member submitted pulse feedback (Satisfaction: ${data.overallSatisfaction}/5, Sentiment: ${sentiment.toUpperCase()}).`,
        type: 'feedback',
        link: '/feedback',
        createdAt: 'Just now',
        read: false,
      };
      setNotifications(prev => [fbNotif, ...prev]);
    }

    return newFb;
  };

  const respondToFeedback = (feedbackId: string, note: string) => {
    setFeedbacks(prev =>
      prev.map(f =>
        f.id === feedbackId
          ? {
              ...f,
              responded: true,
              responseNote: note,
            }
          : f
      )
    );
  };

  const markNotificationAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const isNotificationForUser = (n: NotificationItem) =>
    n.userId === currentUser.id ||
    (currentUser.email && n.userId && currentUser.email.toLowerCase().includes(n.userId.replace(/^usr_/, ''))) ||
    (n.userId === 'admin' && currentUser.role === 'admin');

  const markAllNotificationsAsRead = () => {
    setNotifications(prev =>
      prev.map(n =>
        isNotificationForUser(n) ? { ...n, read: true } : n
      )
    );
  };

  const resetToInitialData = () => {
    setUsers(INITIAL_USERS);
    setCurrentUserId('usr_aarav');
    setClubs(INITIAL_CLUBS);
    setApplications(INITIAL_APPLICATIONS);
    setTasks(INITIAL_TASKS);
    setContributions(INITIAL_CONTRIBUTIONS);
    setFeedbacks(INITIAL_FEEDBACK);
    setNotifications(INITIAL_NOTIFICATIONS);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // safe
    }
  };

  const userNotifications = notifications.filter(isNotificationForUser);
  const unreadNotificationCount = userNotifications.filter(n => !n.read).length;

  return (
    <ClubPulseContext.Provider
      value={{
        currentUser,
        users,
        clubs,
        applications,
        tasks,
        contributions,
        feedbacks,
        notifications: userNotifications,
        unreadNotificationCount,
        isAuthenticated,
        authLoading,
        login,
        logout,
        registerUser,
        switchUser,
        switchRole,
        updateProfilePicture,
        applyToClub,
        reviewApplication,
        createTask,
        updateTaskStatus,
        submitTaskForReview,
        reviewTask,
        submitFeedback,
        respondToFeedback,
        sendNudge,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        resetToInitialData,
      }}
    >
      {children}
    </ClubPulseContext.Provider>
  );
}

export function useClubPulse() {
  const context = useContext(ClubPulseContext);
  if (!context) {
    throw new Error('useClubPulse must be used within a ClubPulseProvider');
  }
  return context;
}
