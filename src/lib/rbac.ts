import { SessionUser } from './auth';

export type SystemRole = 'student' | 'club_lead' | 'admin';

export interface ClubMembershipCheck {
  clubId?: string;
  id?: string;
  leadId?: string;
  leadEmail?: string;
  leadName?: string;
  members?: Array<{
    userId: string;
    userEmail?: string;
    clubRole: string;
  }>;
}

/**
 * Checks if a user has platform-wide administrator privileges
 */
export function isPlatformAdmin(user: SessionUser | null): boolean {
  if (!user || user.status === 'suspended') return false;
  return user.role === 'admin';
}

/**
 * Determines a user's role specifically within a given club
 */
export function getClubRole(
  user: SessionUser | null,
  club: ClubMembershipCheck
): 'Lead' | 'Co-Lead' | 'Core Member' | 'General Member' | 'Non-Member' {
  if (!user || user.status === 'suspended') return 'Non-Member';

  // Platform admin has implicit lead authority
  if (user.role === 'admin') {
    return 'Lead';
  }

  // If user is designated lead of the club (matches by ID, email, or mock user ID)
  if (
    club.leadId === user.id ||
    (club.leadEmail && club.leadEmail.toLowerCase() === user.email.toLowerCase()) ||
    (club.leadId && user.email.toLowerCase().includes(club.leadId.replace('usr_', '')))
  ) {
    return 'Lead';
  }

  // Check members array
  if (club.members && Array.isArray(club.members)) {
    const member = club.members.find(
      (m) =>
        m.userId === user.id ||
        (m.userEmail && m.userEmail.toLowerCase() === user.email.toLowerCase()) ||
        (m.userId && user.email.toLowerCase().includes(m.userId.replace('usr_', '')))
    );
    if (member) {
      return (member.clubRole as any) || 'General Member';
    }
  }

  return 'Non-Member';
}

/**
 * Checks if a user is authorized to manage a specific club (approve apps, create tasks, verify work)
 */
export function canManageClub(user: SessionUser | null, club: ClubMembershipCheck): boolean {
  if (!user || user.status === 'suspended') return false;
  if (isPlatformAdmin(user)) return true;

  const roleInClub = getClubRole(user, club);
  return roleInClub === 'Lead' || roleInClub === 'Co-Lead';
}

/**
 * Checks if a user is an active member of a club
 */
export function isClubMember(user: SessionUser | null, club: ClubMembershipCheck): boolean {
  if (!user || user.status === 'suspended') return false;
  if (isPlatformAdmin(user)) return true;
  const role = getClubRole(user, club);
  return role !== 'Non-Member';
}

/**
 * Checks if a user can apply to a club
 */
export function canApplyToClub(user: SessionUser | null, club: ClubMembershipCheck): boolean {
  if (!user || user.status === 'suspended') return false;
  // Cannot apply if already a member or lead
  return !isClubMember(user, club);
}

/**
 * Verification policy: Ensures leads can verify tasks, but prevents self-verification!
 */
export function canVerifyTask(
  user: SessionUser | null,
  task: { assigneeId: string; clubId: string },
  club: ClubMembershipCheck
): { allowed: boolean; reason?: string } {
  if (!user || user.status === 'suspended') {
    return { allowed: false, reason: 'Authentication required' };
  }

  if (!canManageClub(user, club)) {
    return { allowed: false, reason: 'Only club leads or admins can verify submissions' };
  }

  // Prevent self-verification: lead cannot verify their own assigned task
  if (user.id === task.assigneeId || (user.email && task.assigneeId.includes(user.name.split(' ')[0].toLowerCase()))) {
    return { allowed: false, reason: 'Self-verification violation: Leads cannot verify their own submissions' };
  }

  return { allowed: true };
}

/**
 * Audit / Feedback view policy: Prevents ordinary club leads from seeing identifying details of anonymous responses.
 */
export function canViewFeedbackRawIdentity(user: SessionUser | null): boolean {
  return isPlatformAdmin(user);
}
