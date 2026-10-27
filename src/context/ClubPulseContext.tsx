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
  
  // Actions
  switchUser: (userId: string) => void;
  switchRole: (role: UserRole) => void;
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
  ) => void;
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
  ) => void;
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

const STORAGE_KEY = 'clubpulse_demo_state_v1';

const ClubPulseContext = createContext<ClubPulseContextType | undefined>(undefined);

export function ClubPulseProvider({ children }: { children: React.ReactNode }) {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [currentUserId, setCurrentUserId] = useState<string>('usr_aarav');
  const [clubs, setClubs] = useState<Club[]>(INITIAL_CLUBS);
  const [applications, setApplications] = useState<Application[]>(INITIAL_APPLICATIONS);
  const [tasks, setTasks] = useState<Task[]>(INITIAL_TASKS);
  const [contributions, setContributions] = useState<Contribution[]>(INITIAL_CONTRIBUTIONS);
  const [feedbacks, setFeedbacks] = useState<ClubFeedback[]>(INITIAL_FEEDBACK);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount (demo persistence)
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.users) setUsers(parsed.users);
        if (parsed.currentUserId) setCurrentUserId(parsed.currentUserId);
        if (parsed.clubs) setClubs(parsed.clubs);
        if (parsed.applications) setApplications(parsed.applications);
        if (parsed.tasks) setTasks(parsed.tasks);
        if (parsed.contributions) setContributions(parsed.contributions);
        if (parsed.feedbacks) setFeedbacks(parsed.feedbacks);
        if (parsed.notifications) setNotifications(parsed.notifications);
      }
    } catch {
      // Ignore parse error and keep defaults
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage whenever state changes
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          users,
          currentUserId,
          clubs,
          applications,
          tasks,
          contributions,
          feedbacks,
          notifications,
        })
      );
    } catch {
      // Storage quota or error safe
    }
  }, [
    isLoaded,
    users,
    currentUserId,
    clubs,
    applications,
    tasks,
    contributions,
    feedbacks,
    notifications,
  ]);

  const currentUser = users.find(u => u.id === currentUserId) || users[0];

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

    setApplications(prev => [newApp, ...prev]);

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

  const reviewApplication = (
    appId: string,
    status: 'approved' | 'rejected',
    notes?: string
  ) => {
    const app = applications.find(a => a.id === appId);
    if (!app) return;

    const today = new Date().toISOString().split('T')[0];
    const updatedApps = applications.map(a =>
      a.id === appId
        ? {
            ...a,
            status: status as ApplicationStatus,
            reviewedDate: today,
            reviewedBy: currentUser.name,
            notes: notes || a.notes,
          }
        : a
    );
    setApplications(updatedApps);

    // If approved, add applicant as a member of the club
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
                xpEarned: 50, // Welcome bonus XP
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

      // Add club to user's clubsJoined list & award XP
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

      // Notify the applicant
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
      // Notify applicant of rejection
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
      assigneeAvatar: assignee?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
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
    const now = new Date().toLocaleString();
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
              ...t.activities,
            ],
          };
        }
        return t;
      })
    );
  };

  const submitTaskForReview = (
    taskId: string,
    submissionNote: string,
    submissionLink?: string
  ) => {
    const now = new Date().toLocaleString();
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

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
              ...t.activities,
            ],
          };
        }
        return t;
      })
    );

    // Notify club lead
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
  };

  const reviewTask = (
    taskId: string,
    action: 'approve' | 'request_changes',
    reviewNote?: string
  ) => {
    const now = new Date().toLocaleString();
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    if (action === 'approve') {
      const todayDate = new Date().toISOString().split('T')[0];
      
      // Update task to completed
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
                ...t.activities,
              ],
            };
          }
          return t;
        })
      );

      // Create verified contribution record
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
        category: task.tags.includes('Design') ? 'Design' : task.tags.includes('Sponsorship') ? 'Sponsorship' : 'Development',
        verifiedBy: `${currentUser.name} (${currentUser.role === 'club_lead' ? 'Lead' : 'Admin'})`,
        verifiedAt: now,
        certificateHash: `CP-${task.clubId.substring(5, 9).toUpperCase()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}-VERIFIED`,
      };
      setContributions(prev => [newContrib, ...prev]);

      // Award XP to assignee and update club member stats
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
                      tasksCompleted: m.tasksCompleted + 1,
                      xpEarned: m.xpEarned + task.xpReward,
                      participationRate: Math.min(100, m.participationRate + 5),
                      isGhostRisk: false,
                    }
                  : m
              ),
            };
          }
          return c;
        })
      );

      // Notify the assignee
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
      // Request changes: move back to in_progress
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
                ...t.activities,
              ],
            };
          }
          return t;
        })
      );

      // Notify assignee
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

  const markAllNotificationsAsRead = () => {
    setNotifications(prev =>
      prev.map(n =>
        n.userId === currentUser.id ? { ...n, read: true } : n
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

  const userNotifications = notifications.filter(
    n => n.userId === currentUser.id
  );
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
        switchUser,
        switchRole,
        applyToClub,
        reviewApplication,
        createTask,
        updateTaskStatus,
        submitTaskForReview,
        reviewTask,
        submitFeedback,
        respondToFeedback,
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
