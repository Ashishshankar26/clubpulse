import { User, Club, Task, Application, ClubMember } from '@/types';

export interface MinimalUser {
  id?: string;
  email?: string;
  role?: string;
  name?: string;
  registrationNumber?: string;
  avatar?: string;
  status?: string;
}

export interface MinimalClub {
  id: string;
  leadId?: string;
  leadEmail?: string;
  leadName?: string;
  members?: Array<{
    userId: string;
    userName?: string;
    userEmail?: string;
    clubRole?: string;
    avatar?: string;
    tasksCompleted?: number;
    participationRate?: number;
    xpEarned?: number;
    isGhostRisk?: boolean;
    joinedDate?: string;
  }>;
}

/**
 * Ensures any avatar URL is valid, non-empty, and provides an institutional monogram fallback if blank.
 */
export function getAvatarUrl(avatar?: string | null, name?: string | null): string {
  if (avatar && typeof avatar === 'string' && avatar.trim().length > 0) {
    return avatar.trim();
  }
  const cleanName = name && typeof name === 'string' && name.trim().length > 0 ? name.trim() : 'User';
  return `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
    cleanName
  )}&backgroundColor=0f172a,1e293b,334155&textColor=ffffff`;
}

/**
 * Checks whether a given user is an official lead, co-lead, or administrator for a club.
 * Supports matching across both MongoDB ObjectIds and legacy string identifiers.
 */
export function isUserLeadOfClub(
  user: MinimalUser | null | undefined,
  club: MinimalClub | null | undefined
): boolean {
  if (!user || !club) return false;
  if (user.status === 'suspended') return false;

  // Platform administrators have global management privileges
  if (user.role === 'admin') return true;

  // 1. Direct leadId match
  if (club.leadId && user.id && club.leadId === user.id) {
    return true;
  }

  // 2. Lead email match
  if (
    club.leadEmail &&
    user.email &&
    club.leadEmail.trim().toLowerCase() === user.email.trim().toLowerCase()
  ) {
    return true;
  }

  // 3. Normalized legacy ID match (e.g. 'usr_priya' in 'priya.patel@college.edu')
  if (club.leadId && user.email) {
    const slug = club.leadId.replace(/^usr_/, '').toLowerCase();
    if (slug.length > 2 && user.email.toLowerCase().includes(slug)) {
      return true;
    }
  }

  // 4. Club members array check for Lead / Co-Lead designations
  if (club.members && Array.isArray(club.members)) {
    const memberLead = club.members.find(m => {
      const isLeadRole = m.clubRole === 'Lead' || m.clubRole === 'Co-Lead';
      if (!isLeadRole) return false;

      if (m.userId && user.id && m.userId === user.id) return true;
      if (
        m.userEmail &&
        user.email &&
        m.userEmail.trim().toLowerCase() === user.email.trim().toLowerCase()
      ) {
        return true;
      }
      if (m.userId && user.email) {
        const slug = m.userId.replace(/^usr_/, '').toLowerCase();
        if (slug.length > 2 && user.email.toLowerCase().includes(slug)) {
          return true;
        }
      }
      return false;
    });

    if (memberLead) return true;
  }

  return false;
}

/**
 * Returns the list of clubs that the user has authority to lead or administer.
 */
export function getManagedClubs(
  user: MinimalUser | null | undefined,
  clubs: Club[]
): Club[] {
  if (!user) return [];
  if (user.role === 'admin') return clubs;
  return clubs.filter(c => isUserLeadOfClub(user, c));
}

/**
 * Checks whether an application was submitted by a specific user.
 */
export function isApplicationOwnedByUser(
  app: { userId?: string; userEmail?: string; userName?: string } | null | undefined,
  user: MinimalUser | null | undefined
): boolean {
  if (!user || !app) return false;
  if (app.userId && user.id && app.userId === user.id) return true;
  if (
    app.userEmail &&
    user.email &&
    app.userEmail.trim().toLowerCase() === user.email.trim().toLowerCase()
  ) {
    return true;
  }
  if (app.userId && user.email) {
    const slug = app.userId.replace(/^usr_/, '').toLowerCase();
    if (slug.length > 2 && user.email.toLowerCase().includes(slug)) {
      return true;
    }
  }
  return false;
}

/**
 * Checks whether a task is assigned to a specific user.
 */
export function isTaskAssignedToUser(
  task: { assigneeId?: string; assigneeName?: string } | null | undefined,
  user: MinimalUser | null | undefined
): boolean {
  if (!user || !task) return false;
  if (task.assigneeId && user.id && task.assigneeId === user.id) return true;
  if (
    task.assigneeName &&
    user.name &&
    task.assigneeName.trim().toLowerCase() === user.name.trim().toLowerCase()
  ) {
    return true;
  }
  if (task.assigneeId && user.email) {
    const slug = task.assigneeId.replace(/^usr_/, '').toLowerCase();
    if (slug.length > 2 && user.email.toLowerCase().includes(slug)) {
      return true;
    }
  }
  return false;
}

/**
 * Checks whether a contribution belongs to a specific user.
 */
export function isContributionOwnedByUser(
  contrib: { userId?: string; userName?: string } | null | undefined,
  user: MinimalUser | null | undefined
): boolean {
  if (!user || !contrib) return false;
  if (contrib.userId && user.id && contrib.userId === user.id) return true;
  if (
    contrib.userName &&
    user.name &&
    contrib.userName.trim().toLowerCase() === user.name.trim().toLowerCase()
  ) {
    return true;
  }
  if (contrib.userId && user.email) {
    const slug = contrib.userId.replace(/^usr_/, '').toLowerCase();
    if (slug.length > 2 && user.email.toLowerCase().includes(slug)) {
      return true;
    }
  }
  return false;
}

/**
 * Retrieves the specific member profile of a user inside a club.
 */
export function findClubMemberData(
  club: MinimalClub | null | undefined,
  user: MinimalUser | null | undefined
) {
  if (!club || !user) return null;

  if (club.members && Array.isArray(club.members)) {
    const member = club.members.find(
      m =>
        (m.userId && user.id && m.userId === user.id) ||
        (m.userEmail && user.email && m.userEmail.trim().toLowerCase() === user.email.trim().toLowerCase()) ||
        (m.userName && user.name && m.userName.trim().toLowerCase() === user.name.trim().toLowerCase()) ||
        (m.userId && user.email && user.email.toLowerCase().includes(m.userId.replace(/^usr_/, '')))
    );
    if (member) return member;
  }

  // If user is designated lead but wasn't explicitly duplicated in members array
  if (isUserLeadOfClub(user, club)) {
    return {
      userId: user.id || club.leadId || 'lead',
      userName: user.name || club.leadName || 'Club Lead',
      userEmail: user.email || club.leadEmail || '',
      avatar: user.avatar || '',
      clubRole: 'Lead',
      joinedDate: 'Founding Lead',
      tasksCompleted: 14,
      participationRate: 98,
      xpEarned: 450,
      isGhostRisk: false,
    };
  }

  return null;
}

/**
 * Scopes a list of applications to only those clubs managed by the user.
 * Administrators see all applications; students see only their own.
 */
export function getScopedApplications<T extends { clubId: string; userId?: string; userEmail?: string }>(
  user: MinimalUser | null | undefined,
  applications: T[],
  clubs: Club[]
): T[] {
  if (!user) return [];
  if (user.role === 'admin') return applications;
  if (user.role === 'student') {
    return applications.filter(a => isApplicationOwnedByUser(a, user));
  }

  const managedClubIds = new Set(getManagedClubs(user, clubs).map(c => c.id));
  return applications.filter(a => managedClubIds.has(a.clubId));
}
