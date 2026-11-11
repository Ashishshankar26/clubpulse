'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import { useClubPulse } from '@/context/ClubPulseContext';
import { calculateClubKPIs } from '@/lib/metrics';
import { isUserLeadOfClub, isApplicationOwnedByUser, isTaskAssignedToUser, getAvatarUrl } from '@/lib/permissions';
import {
  Flame,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Award,
  Calendar,
  ArrowRight,
  TrendingUp,
  FileCheck,
  ChevronRight,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  Send,
  Building,
  CheckSquare,
  Camera,
} from 'lucide-react';
import ProfilePictureModal from '@/components/profile/ProfilePictureModal';

export default function DashboardPage() {
  const {
    currentUser,
    clubs,
    tasks,
    applications,
    feedbacks,
    reviewApplication,
    reviewTask,
    updateTaskStatus,
    sendNudge,
  } = useClubPulse();

  const [nudgeSent, setNudgeSent] = useState<string | null>(null);
  const [nudgedMemberIds, setNudgedMemberIds] = useState<Set<string>>(new Set());
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  // Derive club led by current user if lead
  const myLeadClub = clubs.find(c => isUserLeadOfClub(currentUser, c)) || clubs[0];
  const gdscKpis = calculateClubKPIs(myLeadClub, tasks, feedbacks);

  // User's joined clubs
  const myClubs = clubs.filter(c => currentUser.clubsJoined.includes(c.id) || isUserLeadOfClub(currentUser, c));

  // User's assigned tasks
  const myTasks = tasks.filter(t => isTaskAssignedToUser(t, currentUser));
  const myPendingTasks = myTasks.filter(t => t.status !== 'completed');

  // User's submitted applications
  const myApplications = applications.filter(a => isApplicationOwnedByUser(a, currentUser));

  // Lead review queues (strictly exclude self-approval/self-verification)
  const pendingApplicants = applications.filter(
    a => a.clubId === myLeadClub?.id && (a.status === 'pending' || a.status === 'under_review') && !isApplicationOwnedByUser(a, currentUser)
  );
  const tasksAwaitingReview = tasks.filter(
    t => t.clubId === myLeadClub?.id && t.status === 'under_review' && !isTaskAssignedToUser(t, currentUser)
  );

  // Ghost members for lead club
  const ghostMembers = myLeadClub ? myLeadClub.members.filter(
    m => m.isGhostRisk || m.participationRate < 25
  ) : [];

  const handleNudge = (memberId: string, memberName: string) => {
    const res = sendNudge(memberId, memberName, myLeadClub.name);
    if (res.success) {
      setNudgedMemberIds(prev => new Set(prev).add(memberId));
      setNudgeSent(res.message);
      setTimeout(() => setNudgeSent(null), 4000);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-xl p-5 sm:p-6 border border-slate-200/90 shadow-xs">
          <div className="flex items-center gap-4">
            <div
              className="relative group cursor-pointer shrink-0"
              onClick={() => setIsAvatarModalOpen(true)}
              title="Click to change profile picture"
            >
              <img
                src={getAvatarUrl(currentUser.avatar, currentUser.name)}
                alt={currentUser.name}
                className="w-14 h-14 rounded-xl object-cover ring-1 ring-slate-200 group-hover:opacity-85 transition"
              />
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  setIsAvatarModalOpen(true);
                }}
                className="absolute -bottom-1 -right-1 p-1 rounded-md bg-slate-900 hover:bg-slate-800 text-white ring-2 ring-white shadow-xs transition"
                title="Change photo"
              >
                <Camera className="w-3 h-3" />
              </button>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                  Welcome back, {currentUser.name.split(' ')[0]}
                </h1>
                <span className="px-2 py-0.5 rounded-md text-[11px] font-medium uppercase tracking-wide bg-slate-100 text-slate-700 border border-slate-200/80">
                  {currentUser.role === 'club_lead'
                    ? 'Club Lead'
                    : currentUser.role === 'admin'
                    ? 'Council Dean'
                    : 'Student Member'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                <span className="font-mono text-slate-600 font-medium">
                  {currentUser.registrationNumber || '2023BCSE014'}
                </span>{' '}
                • {currentUser.department} • {currentUser.year}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {currentUser.role === 'student' && (
              <div className="flex items-center gap-2.5 bg-slate-50 px-3.5 py-2 rounded-lg border border-slate-200/80">
                <Award className="w-4 h-4 text-slate-600" />
                <div className="text-left">
                  <p className="text-[10px] uppercase font-semibold text-slate-400">Activity Credits</p>
                  <p className="text-sm font-bold text-slate-900">{currentUser.xpPoints} XP</p>
                </div>
              </div>
            )}

            {currentUser.role === 'club_lead' && (
              <Link
                href="/tasks"
                className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition shadow-xs flex items-center gap-1.5"
              >
                <span>Manage Tasks</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}

            {currentUser.role === 'admin' && (
              <Link
                href="/reports"
                className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition shadow-xs flex items-center gap-1.5"
              >
                <span>Governance Report</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        </div>

        {/* =========================================================================
            ROLE VIEW 1: CLUB LEAD (Priya Patel)
        ========================================================================= */}
        {currentUser.role === 'club_lead' && (
          <div className="space-y-6">
            {/* Burnout Risk Assessment Card - Clean Executive Panel */}
            <div className="rounded-xl p-5 sm:p-6 bg-white border border-slate-200/90 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center shrink-0">
                    <Flame className="w-5 h-5 text-slate-700" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        Early Warning Alert
                      </span>
                      <span className="text-xs font-semibold text-slate-700">
                        {gdscKpis.burnoutIndex}/100 Risk Score
                      </span>
                    </div>
                    <h2 className="text-base font-bold text-slate-900 mt-1">
                      Lead Task Concentration Alert for {myLeadClub.shortName}
                    </h2>
                  </div>
                </div>
                <Link
                  href="/workload"
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium transition shadow-xs self-start md:self-auto"
                >
                  Workload Rebalancer →
                </Link>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200/80">
                  <p className="text-slate-500 font-medium">Lead Task Allocation</p>
                  <p className="text-lg font-bold text-slate-900 mt-0.5">65% of open tasks</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Campus recommended limit is &lt;35%</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200/80">
                  <p className="text-slate-500 font-medium">Available Core Members</p>
                  <p className="text-lg font-bold text-slate-900 mt-0.5">3 Available</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">Active team members have open bandwidth</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3 border border-slate-200/80">
                  <p className="text-slate-500 font-medium">Inactive Members Flagged</p>
                  <p className="text-lg font-bold text-slate-900 mt-0.5">{ghostMembers.length} Members</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">0 tasks completed in past 30 days</p>
                </div>
              </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-1.5">
                  <span className="text-[11px] font-medium uppercase tracking-wider">Total Members</span>
                  <Users className="w-4 h-4 text-slate-400" />
                </div>
                <p className="text-2xl font-bold text-slate-900">{myLeadClub.memberCount}</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  {gdscKpis.participationRate}% active participation
                </p>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-1.5">
                  <span className="text-[11px] font-medium uppercase tracking-wider">Task Completion</span>
                  <CheckCircle2 className="w-4 h-4 text-slate-400" />
                </div>
                <p className="text-2xl font-bold text-slate-900">{gdscKpis.taskCompletionRate}%</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  {gdscKpis.completedTasks} completed / {gdscKpis.totalTasks} total
                </p>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-1.5">
                  <span className="text-[11px] font-medium uppercase tracking-wider">Pending Applicants</span>
                  <Sparkles className="w-4 h-4 text-slate-400" />
                </div>
                <p className="text-2xl font-bold text-slate-900">{pendingApplicants.length}</p>
                <Link
                  href="/recruitment"
                  className="text-[11px] text-slate-600 font-medium mt-1 inline-block hover:text-slate-900 hover:underline"
                >
                  Review pipeline →
                </Link>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-xs">
                <div className="flex items-center justify-between text-slate-500 mb-1.5">
                  <span className="text-[11px] font-medium uppercase tracking-wider">Satisfaction</span>
                  <Award className="w-4 h-4 text-slate-400" />
                </div>
                <p className="text-2xl font-bold text-slate-900">{gdscKpis.averageSatisfaction} / 5.0</p>
                <p className="text-[11px] text-slate-500 mt-1">Based on student feedback</p>
              </div>
            </div>

            {/* Action Grids */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Task Submissions Awaiting Approval */}
              <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-xs">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm">
                      Task Submissions Awaiting Approval
                    </h3>
                    <p className="text-xs text-slate-500">
                      Verify proof-of-work to grant activity credits
                    </p>
                  </div>
                  <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                    {tasksAwaitingReview.length} Pending
                  </span>
                </div>

                {tasksAwaitingReview.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    All task submissions have been reviewed.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tasksAwaitingReview.map(t => (
                      <div
                        key={t.id}
                        className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-900 truncate">{t.title}</span>
                            <span className="font-mono text-[11px] text-slate-600 bg-white px-1.5 py-0.5 rounded border border-slate-200 shrink-0">
                              +{t.xpReward} XP
                            </span>
                          </div>
                          <p className="text-slate-500 mt-0.5 truncate">
                            By <strong className="text-slate-700">{t.assigneeName}</strong>
                          </p>
                          {t.submissionNote && (
                            <p
                              className="text-slate-600 mt-1 bg-white p-2 rounded border border-slate-200/60 text-[11px] truncate break-all"
                              title={t.submissionNote}
                            >
                              "{t.submissionNote}"
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => reviewTask(t.id, 'approve', 'Approved from Lead Dashboard')}
                          className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition shadow-xs shrink-0"
                        >
                          Approve
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Applicant Review Quick Queue */}
              <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-xs">
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm">
                      Recruitment Pipeline Queue
                    </h3>
                    <p className="text-xs text-slate-500">
                      Applications submitted for {myLeadClub.shortName}
                    </p>
                  </div>
                  <Link
                    href="/recruitment"
                    className="text-xs text-slate-600 hover:text-slate-900 font-medium"
                  >
                    View All →
                  </Link>
                </div>

                {pendingApplicants.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No pending applications.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingApplicants.slice(0, 2).map((app, idx) => (
                      <div
                        key={app.id || (app as any)._id || `applicant_${idx}`}
                        className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-start gap-3 min-w-0 flex-1">
                          <img
                            src={getAvatarUrl(app.userAvatar, app.userName)}
                            alt={app.userName}
                            className="w-9 h-9 rounded-lg object-cover ring-1 ring-slate-200 shrink-0"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="font-semibold text-slate-900 truncate">{app.userName}</p>
                            <p className="text-slate-500 font-medium truncate">Role: {app.appliedRole}</p>
                            <p
                              className="text-slate-500 truncate break-all mt-0.5 text-[11px]"
                              title={app.statementOfPurpose}
                            >
                              {app.statementOfPurpose}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => reviewApplication(app.id, 'approved', 'Welcome to the club!')}
                            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition shadow-xs"
                          >
                            Approve
                          </button>
                          <Link
                            href="/recruitment"
                            className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 font-medium text-xs"
                          >
                            Details
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Inactivity Radar Alert */}
            <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-slate-500" />
                  <div>
                    <h3 className="font-semibold text-slate-900 text-sm">
                      Ghost Member Detection ({ghostMembers.length} Flagged)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Members who enrolled but have 0 verified contributions in 30 days
                    </p>
                  </div>
                </div>
                {nudgeSent && (
                  <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-md animate-in fade-in">
                    ✓ {nudgeSent}
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {ghostMembers.map(m => (
                  <div
                    key={m.userId}
                    className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <img
                        src={getAvatarUrl(m.avatar, m.userName)}
                        alt={m.userName}
                        className="w-8 h-8 rounded-lg object-cover grayscale shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-slate-900 truncate">{m.userName}</p>
                        <p className="text-slate-400 text-[11px] truncate">{m.userEmail}</p>
                        <span className="inline-block mt-0.5 text-[10px] text-slate-500">
                          {m.participationRate}% participation
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleNudge(m.userId, m.userName)}
                      disabled={nudgedMemberIds.has(m.userId)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition flex items-center gap-1.5 shrink-0 ${
                        nudgedMemberIds.has(m.userId)
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 cursor-default'
                          : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200 shadow-xs'
                      }`}
                    >
                      {nudgedMemberIds.has(m.userId) ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Nudged ✓</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3 h-3 text-slate-400" />
                          <span>Nudge</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            ROLE VIEW 2: STUDENT / MEMBER
        ========================================================================= */}
        {currentUser.role === 'student' && (
          <div className="space-y-6">
            {/* Quick summary cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-xs">
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                  Clubs Enrolled
                </span>
                <p className="text-2xl font-bold text-slate-900 mt-1">{myClubs.length}</p>
                <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                  {myClubs.map(c => c.shortName || c.name).join(', ') || 'No clubs joined'}
                </p>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-xs">
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                  Active Tasks
                </span>
                <p className="text-2xl font-bold text-slate-900 mt-1">{myPendingTasks.length}</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Assigned to you</p>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-xs">
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                  Verified XP Earned
                </span>
                <p className="text-2xl font-bold text-slate-900 mt-1">{currentUser.xpPoints} XP</p>
                <p className="text-[11px] text-slate-500 mt-0.5">In personal ledger</p>
              </div>

              <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200/90 shadow-xs">
                <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
                  Latest Application
                </span>
                {myApplications.length > 0 ? (
                  <>
                    <p className="text-base font-semibold text-slate-900 mt-1 truncate">
                      {myApplications[0].clubName}
                    </p>
                    <span className="inline-block mt-1 text-[10px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/60 uppercase">
                      {myApplications[0].status.replace('_', ' ')}
                    </span>
                  </>
                ) : (
                  <>
                    <p className="text-base font-semibold text-slate-900 mt-1 truncate">
                      None Pending
                    </p>
                    <Link
                      href="/clubs"
                      className="inline-block mt-1 text-[11px] font-semibold text-blue-600 hover:underline"
                    >
                      Browse Clubs →
                    </Link>
                  </>
                )}
              </div>
            </div>

            {/* My Active Tasks Queue */}
            <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">
                    My Assigned Tasks
                  </h3>
                  <p className="text-xs text-slate-500">
                    Track and submit progress for club tasks
                  </p>
                </div>
                <Link
                  href="/my-tasks"
                  className="text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Full Task Board →
                </Link>
              </div>

              {myPendingTasks.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  You have completed all assigned tasks.
                </div>
              ) : (
                <div className="space-y-3">
                  {myPendingTasks.map(t => (
                    <div
                      key={t.id}
                      className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-white border border-slate-200 text-slate-700 shrink-0">
                            {t.priority}
                          </span>
                          <span className="font-semibold text-slate-900 truncate">{t.title}</span>
                          <span className="font-mono text-slate-600 shrink-0">+{t.xpReward} XP</span>
                        </div>
                        <p className="text-slate-500 mt-0.5 truncate">{t.clubName}</p>
                        <p className="text-slate-600 mt-1 leading-relaxed line-clamp-2 break-all" title={t.description}>
                          {t.description}
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {t.status === 'todo' && (
                          <button
                            onClick={() => updateTaskStatus(t.id, 'in_progress', 'Started working on task')}
                            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition shadow-xs"
                          >
                            Start Task
                          </button>
                        )}

                        {t.status === 'in_progress' && (
                          <Link
                            href="/my-tasks"
                            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs transition shadow-xs"
                          >
                            Submit for Review
                          </Link>
                        )}

                        {t.status === 'under_review' && (
                          <span className="text-xs font-medium text-slate-700 bg-white px-3 py-1.5 rounded-lg border border-slate-200">
                            Under Lead Review
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Application Status & Upcoming Events */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Application Tracking */}
              <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-xs">
                <h3 className="font-semibold text-slate-900 text-sm mb-0.5">
                  My Recruitment Applications
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Status of club memberships you applied for
                </p>

                {myApplications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400 space-y-2">
                    <p>You haven't submitted any club applications yet.</p>
                    <Link
                      href="/clubs"
                      className="inline-flex items-center gap-1 text-slate-900 font-semibold hover:underline"
                    >
                      <span>Explore & Apply to Campus Clubs</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                ) : (
                  myApplications.map((app, idx) => (
                    <div
                      key={app.id || (app as any)._id || `my_app_${idx}`}
                      className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 space-y-2 text-xs min-w-0"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-slate-900 truncate">{app.clubName}</span>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded shrink-0">
                          {app.status.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-slate-600 truncate">
                        Applied Role: <strong className="text-slate-800">{app.appliedRole}</strong>
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Applied Date: {app.appliedDate}
                      </p>
                      {app.notes && (
                        <p
                          className="text-slate-700 bg-white p-2 rounded border border-slate-200 text-[11px] line-clamp-2 break-all"
                          title={app.notes}
                        >
                          Note: {app.notes}
                        </p>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Upcoming Events */}
              <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-xs">
                <h3 className="font-semibold text-slate-900 text-sm mb-0.5">
                  Upcoming Events in Your Clubs
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Confirmed campus sessions and workshops
                </p>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-900">GDSC Workshop</span>
                      <span className="text-slate-500 flex items-center gap-1 text-[11px]">
                        <Calendar className="w-3 h-3 text-slate-400" /> Nov 04, 2026
                      </span>
                    </div>
                    <p className="text-slate-700 font-medium">
                      Android & Jetpack Compose Hands-on
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Audi 2 & YouTube Live
                    </p>
                  </div>

                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200/80 text-xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-slate-900">RoboCrafters Sprint</span>
                      <span className="text-slate-500 flex items-center gap-1 text-[11px]">
                        <Calendar className="w-3 h-3 text-slate-400" /> Nov 14, 2026
                      </span>
                    </div>
                    <p className="text-slate-700 font-medium">
                      LiDAR & SLAM Navigation Testing
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Robotics Bay Lab 102
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            ROLE VIEW 3: CAMPUS ADMINISTRATOR (Dr. Rajesh Kumar)
        ========================================================================= */}
        {currentUser.role === 'admin' && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200/90 shadow-xs">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                Dean of Student Affairs Governance Console
              </span>
              <h2 className="text-xl font-bold text-slate-900 mt-1 tracking-tight">
                Campus Organization Health & Governance Index
              </h2>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                Overseeing 5 registered student societies representing 150+ students. Monitoring lead burnout risk, verified activity credits, and council compliance.
              </p>

              <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200/80">
                  <p className="text-slate-500 font-medium">Registered Clubs</p>
                  <p className="text-xl font-bold text-slate-900 mt-0.5">5 Active</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200/80">
                  <p className="text-slate-500 font-medium">Avg Campus Burnout</p>
                  <p className="text-xl font-bold text-slate-900 mt-0.5">52 / 100</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200/80">
                  <p className="text-slate-500 font-medium">Verified Credits</p>
                  <p className="text-xl font-bold text-slate-900 mt-0.5">3,450 XP</p>
                </div>
                <div className="bg-slate-50 rounded-lg p-3.5 border border-slate-200/80">
                  <p className="text-slate-500 font-medium">Council Compliance</p>
                  <p className="text-xl font-bold text-slate-900 mt-0.5">98.4%</p>
                </div>
              </div>
            </div>

            {/* University Clubs Governance Table */}
            <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                <div>
                  <h3 className="font-semibold text-slate-900 text-sm">
                    Registered Student Organizations Audit
                  </h3>
                  <p className="text-xs text-slate-500">
                    Comparative health score and lead burnout risk
                  </p>
                </div>
                <Link
                  href="/reports"
                  className="text-xs font-medium text-slate-600 hover:text-slate-900"
                >
                  Print Report →
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200/80">
                    <tr>
                      <th className="py-2.5 px-3">Club</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Lead</th>
                      <th className="py-2.5 px-3">Members</th>
                      <th className="py-2.5 px-3">Burnout Index</th>
                      <th className="py-2.5 px-3">Council Health</th>
                      <th className="py-2.5 px-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {clubs.map(c => (
                      <tr key={c.id} className="hover:bg-slate-50/60 transition">
                        <td className="py-3 px-3 font-semibold text-slate-900">
                          {c.name}
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          {c.category}
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          {c.leadName}
                        </td>
                        <td className="py-3 px-3 font-mono text-slate-700">
                          {c.memberCount}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              c.burnoutScore > 65
                                ? 'bg-slate-900 text-white shadow-xs'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {c.burnoutScore} / 100
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span className="font-semibold text-slate-800">
                            {c.healthScore}%
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <Link
                            href={`/clubs/${c.id}`}
                            className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition"
                          >
                            Audit Details
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Profile Picture Change Modal */}
        <ProfilePictureModal
          isOpen={isAvatarModalOpen}
          onClose={() => setIsAvatarModalOpen(false)}
        />
      </div>
    </AppShell>
  );
}
