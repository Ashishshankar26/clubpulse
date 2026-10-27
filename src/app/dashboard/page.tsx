'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import { useClubPulse } from '@/context/ClubPulseContext';
import { calculateClubKPIs } from '@/lib/metrics';
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
  Zap,
} from 'lucide-react';

export default function DashboardPage() {
  const {
    currentUser,
    clubs,
    tasks,
    applications,
    contributions,
    feedbacks,
    reviewApplication,
    reviewTask,
    updateTaskStatus,
  } = useClubPulse();

  const [nudgeSent, setNudgeSent] = useState<string | null>(null);

  // Derive club led by current user if lead
  const myLeadClub = clubs.find(c => c.leadId === currentUser.id) || clubs[0];
  const gdscKpis = calculateClubKPIs(myLeadClub, tasks, feedbacks);

  // User's joined clubs
  const myClubs = clubs.filter(c => currentUser.clubsJoined.includes(c.id));

  // User's assigned tasks
  const myTasks = tasks.filter(t => t.assigneeId === currentUser.id);
  const myPendingTasks = myTasks.filter(t => t.status !== 'completed');

  // Lead review queues
  const pendingApplicants = applications.filter(
    a => a.clubId === myLeadClub.id && (a.status === 'pending' || a.status === 'under_review')
  );
  const tasksAwaitingReview = tasks.filter(
    t => t.clubId === myLeadClub.id && t.status === 'under_review'
  );

  // Ghost members for lead club
  const ghostMembers = myLeadClub.members.filter(
    m => m.isGhostRisk || m.participationRate < 25
  );

  const handleNudge = (memberName: string) => {
    setNudgeSent(memberName);
    setTimeout(() => setNudgeSent(null), 3000);
  };

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Welcome Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-16 h-16 rounded-2xl object-cover ring-4 ring-indigo-50 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-slate-900">
                  Welcome back, {currentUser.name.split(' ')[0]}!
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-200">
                  {currentUser.role === 'club_lead'
                    ? 'Club Lead'
                    : currentUser.role === 'admin'
                    ? 'Campus Dean'
                    : 'Student Member'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {currentUser.department} • {currentUser.year}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {currentUser.role === 'student' && (
              <div className="flex items-center gap-3 bg-gradient-to-r from-indigo-50 to-purple-50 px-4 py-2.5 rounded-2xl border border-indigo-100">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400">Verified Activity XP</p>
                  <p className="text-lg font-black text-indigo-700">{currentUser.xpPoints} XP</p>
                </div>
              </div>
            )}

            {currentUser.role === 'club_lead' && (
              <Link
                href="/tasks"
                className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition flex items-center gap-1.5"
              >
                <span>Manage GDSC Tasks</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}

            {currentUser.role === 'admin' && (
              <Link
                href="/reports"
                className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-600/20 transition flex items-center gap-1.5"
              >
                <span>Council Governance Report</span>
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
            {/* Burnout Risk Early Warning Card */}
            <div className="rounded-3xl p-6 bg-gradient-to-br from-amber-500 via-amber-600 to-rose-600 text-white shadow-xl shadow-amber-500/10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-white/20">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                    <Flame className="w-7 h-7 text-white animate-bounce" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-black/20 px-2 py-0.5 rounded-full">
                      Burnout Early Warning Triggered
                    </span>
                    <h2 className="text-xl font-black mt-1">
                      Lead Task Concentration Alert: {gdscKpis.burnoutIndex}/100 Risk Score
                    </h2>
                  </div>
                </div>
                <Link
                  href="/workload"
                  className="px-4 py-2 rounded-xl bg-white text-amber-900 font-bold text-xs hover:bg-amber-50 transition shadow self-start md:self-auto"
                >
                  Workload Rebalancer →
                </Link>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="bg-black/15 rounded-2xl p-3 border border-white/10">
                  <p className="text-white/80">Lead Task Allocation</p>
                  <p className="text-xl font-bold mt-1">65% of open tasks</p>
                  <p className="text-[11px] text-white/70 mt-0.5">Threshold recommendation is &lt;35%</p>
                </div>
                <div className="bg-black/15 rounded-2xl p-3 border border-white/10">
                  <p className="text-white/80">Available Core Members</p>
                  <p className="text-xl font-bold mt-1">3 Available</p>
                  <p className="text-[11px] text-white/70 mt-0.5">Aarav and Ananya have capacity</p>
                </div>
                <div className="bg-black/15 rounded-2xl p-3 border border-white/10">
                  <p className="text-white/80">Ghost Members Detected</p>
                  <p className="text-xl font-bold mt-1">{ghostMembers.length} Members</p>
                  <p className="text-[11px] text-white/70 mt-0.5">0 tasks completed in past 30 days</p>
                </div>
              </div>
            </div>

            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase">Total GDSC Members</span>
                  <Users className="w-4 h-4 text-indigo-500" />
                </div>
                <p className="text-2xl font-black text-slate-900">{myLeadClub.memberCount}</p>
                <p className="text-[11px] text-emerald-600 font-medium mt-1 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  <span>{gdscKpis.participationRate}% Active Participation</span>
                </p>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase">Task Completion</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                </div>
                <p className="text-2xl font-black text-slate-900">{gdscKpis.taskCompletionRate}%</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  {gdscKpis.completedTasks} completed / {gdscKpis.totalTasks} total
                </p>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase">Pending Applicants</span>
                  <Sparkles className="w-4 h-4 text-amber-500" />
                </div>
                <p className="text-2xl font-black text-slate-900">{pendingApplicants.length}</p>
                <Link
                  href="/recruitment"
                  className="text-[11px] text-indigo-600 font-semibold mt-1 inline-block hover:underline"
                >
                  Review pipeline →
                </Link>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between text-slate-500 mb-2">
                  <span className="text-xs font-semibold uppercase">Satisfaction (CSAT)</span>
                  <Award className="w-4 h-4 text-purple-500" />
                </div>
                <p className="text-2xl font-black text-slate-900">{gdscKpis.averageSatisfaction} / 5.0</p>
                <p className="text-[11px] text-slate-500 mt-1">Based on pulse feedback</p>
              </div>
            </div>

            {/* Quick Action Grids: Pending Review & Pending Applicants */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Task Submissions Awaiting Lead Approval */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      Task Submissions Awaiting Approval
                    </h3>
                    <p className="text-xs text-slate-500">
                      Verify submissions to release verified XP to members
                    </p>
                  </div>
                  <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full">
                    {tasksAwaitingReview.length} Pending
                  </span>
                </div>

                {tasksAwaitingReview.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    All task submissions have been reviewed!
                  </div>
                ) : (
                  <div className="space-y-3">
                    {tasksAwaitingReview.map(t => (
                      <div
                        key={t.id}
                        className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">{t.title}</span>
                            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                              +{t.xpReward} XP
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5">
                            Submitted by <strong>{t.assigneeName}</strong>
                          </p>
                          {t.submissionNote && (
                            <p className="text-[11px] text-slate-600 italic mt-1 bg-white p-2 rounded-lg border border-slate-100">
                              "{t.submissionNote}"
                            </p>
                          )}
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => reviewTask(t.id, 'approve', 'Approved from Lead Dashboard')}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm"
                          >
                            Approve (+{t.xpReward} XP)
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Applicant Review Quick Queue */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      Recruitment Pipeline Queue
                    </h3>
                    <p className="text-xs text-slate-500">
                      Screen applicants for {myLeadClub.shortName}
                    </p>
                  </div>
                  <Link
                    href="/recruitment"
                    className="text-xs text-indigo-600 font-semibold hover:underline"
                  >
                    View All →
                  </Link>
                </div>

                {pendingApplicants.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No pending applications for this club.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingApplicants.slice(0, 2).map(app => (
                      <div
                        key={app.id}
                        className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="flex items-start gap-3">
                          <img
                            src={app.userAvatar}
                            alt={app.userName}
                            className="w-10 h-10 rounded-xl object-cover ring-2 ring-indigo-50"
                          />
                          <div>
                            <p className="text-xs font-bold text-slate-900">{app.userName}</p>
                            <p className="text-[11px] text-indigo-600 font-semibold">
                              Applying for: {app.appliedRole}
                            </p>
                            <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                              {app.statementOfPurpose}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => reviewApplication(app.id, 'approved', 'Welcome to GDSC!')}
                            className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm"
                          >
                            Approve
                          </button>
                          <Link
                            href="/recruitment"
                            className="px-2.5 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-semibold"
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

            {/* Ghost Members Inactivity Radar Alert */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-500" />
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      Ghost Member Detection Alert ({ghostMembers.length} Flagged)
                    </h3>
                    <p className="text-xs text-slate-500">
                      These members joined during recruitment but have 0 verified contributions in 30 days
                    </p>
                  </div>
                </div>
                {nudgeSent && (
                  <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200 animate-in fade-in">
                    ✓ Re-engagement Nudge sent to {nudgeSent}!
                  </span>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {ghostMembers.map(m => (
                  <div
                    key={m.userId}
                    className="p-4 rounded-2xl bg-rose-50/40 border border-rose-200 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={m.avatar}
                        alt={m.userName}
                        className="w-10 h-10 rounded-xl object-cover grayscale"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900">{m.userName}</p>
                        <p className="text-[11px] text-slate-500">{m.userEmail}</p>
                        <span className="inline-block mt-1 text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                          Participation: {m.participationRate}% • 0 Tasks Done
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleNudge(m.userName)}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-rose-100 text-rose-700 border border-rose-300 text-xs font-bold transition flex items-center gap-1 shrink-0"
                    >
                      <Send className="w-3 h-3" />
                      <span>Nudge</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            ROLE VIEW 2: STUDENT / MEMBER (Aarav Sharma)
        ========================================================================= */}
        {currentUser.role === 'student' && (
          <div className="space-y-6">
            {/* Quick summary cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                <span className="text-xs font-semibold text-slate-500 uppercase">Clubs Enrolled</span>
                <p className="text-2xl font-black text-indigo-600 mt-1">{myClubs.length}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">GDSC & RoboCrafters</p>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                <span className="text-xs font-semibold text-slate-500 uppercase">Active Tasks</span>
                <p className="text-2xl font-black text-amber-600 mt-1">{myPendingTasks.length}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Assigned to you</p>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                <span className="text-xs font-semibold text-slate-500 uppercase">Verified XP Earned</span>
                <p className="text-2xl font-black text-emerald-600 mt-1">{currentUser.xpPoints} XP</p>
                <p className="text-[11px] text-slate-400 mt-0.5">In personal ledger</p>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
                <span className="text-xs font-semibold text-slate-500 uppercase">Active Application</span>
                <p className="text-base font-bold text-slate-900 mt-1">DesignHub</p>
                <span className="inline-block mt-0.5 text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                  Under Review
                </span>
              </div>
            </div>

            {/* My Active Tasks Queue */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    My Tasks & Workload Queue
                  </h3>
                  <p className="text-xs text-slate-500">
                    Move tasks to Under Review to submit work to your club lead
                  </p>
                </div>
                <Link
                  href="/my-tasks"
                  className="text-xs font-bold text-indigo-600 hover:underline"
                >
                  Open Full Task View →
                </Link>
              </div>

              {myPendingTasks.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  🎉 You have completed all assigned tasks! Great job!
                </div>
              ) : (
                <div className="space-y-3">
                  {myPendingTasks.map(t => (
                    <div
                      key={t.id}
                      className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              t.priority === 'urgent'
                                ? 'bg-rose-100 text-rose-700'
                                : t.priority === 'high'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {t.priority}
                          </span>
                          <span className="text-xs font-bold text-slate-900">{t.title}</span>
                          <span className="text-xs font-bold text-indigo-600">+{t.xpReward} XP</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">{t.clubName}</p>
                        <p className="text-xs text-slate-600 mt-1">{t.description}</p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {t.status === 'todo' && (
                          <button
                            onClick={() => updateTaskStatus(t.id, 'in_progress', 'Started working on task')}
                            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-sm"
                          >
                            Start Task
                          </button>
                        )}

                        {t.status === 'in_progress' && (
                          <Link
                            href="/my-tasks"
                            className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-sm"
                          >
                            Submit for Review
                          </Link>
                        )}

                        {t.status === 'under_review' && (
                          <span className="text-xs font-bold text-purple-700 bg-purple-50 px-3 py-1.5 rounded-xl border border-purple-200">
                            ⏳ Under Lead Review
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Application Status & Upcoming Events */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Application Tracking */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-900 text-sm mb-1">
                  My Recruitment Applications
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Track status of club memberships you applied for
                </p>

                {applications.filter(a => a.userId === currentUser.id).map(app => (
                  <div
                    key={app.id}
                    className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-slate-900">{app.clubName}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                        {app.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Applied Role: <strong>{app.appliedRole}</strong>
                    </p>
                    <p className="text-[11px] text-slate-500">
                      Applied Date: {app.appliedDate}
                    </p>
                    {app.notes && (
                      <p className="text-[11px] text-indigo-700 bg-white p-2 rounded-lg border border-indigo-100">
                        Lead Note: {app.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>

              {/* Upcoming Events */}
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
                <h3 className="font-bold text-slate-900 text-sm mb-1">
                  Upcoming Events in Your Clubs
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  Confirmed sessions and workshops
                </p>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-indigo-700">GDSC Workshop</span>
                      <span className="text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Nov 04, 2026
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800">
                      Android & Jetpack Compose Hands-on
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Audi 2 & YouTube Live
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="font-bold text-purple-700">RoboCrafters Sprint</span>
                      <span className="text-slate-500 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> Nov 14, 2026
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800">
                      LiDAR & SLAM Navigation Testing
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Bay 2 Robotics Lab
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
            <div className="bg-gradient-to-r from-purple-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
              <span className="text-xs font-bold text-purple-300 uppercase tracking-wider">
                Dean of Student Affairs Governance Console
              </span>
              <h2 className="text-2xl font-black mt-1">
                Campus Organization Health & Governance Index
              </h2>
              <p className="text-xs text-purple-200 mt-1 max-w-2xl leading-relaxed">
                Overseeing 5 registered student societies representing 150+ students. Monitoring lead burnout risk, verified activity credits, and council compliance.
              </p>

              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                  <p className="text-purple-200">Registered Clubs</p>
                  <p className="text-2xl font-black text-white mt-1">5 Active</p>
                </div>
                <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                  <p className="text-purple-200">Avg Campus Burnout</p>
                  <p className="text-2xl font-black text-amber-400 mt-1">52 / 100</p>
                </div>
                <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                  <p className="text-purple-200">Verified Activity Credits</p>
                  <p className="text-2xl font-black text-emerald-400 mt-1">3,450 XP</p>
                </div>
                <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
                  <p className="text-purple-200">Council Compliance</p>
                  <p className="text-2xl font-black text-white mt-1">98.4%</p>
                </div>
              </div>
            </div>

            {/* University Clubs Governance Table */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Registered Student Organizations Audit
                  </h3>
                  <p className="text-xs text-slate-500">
                    Comparative health score and lead burnout risk
                  </p>
                </div>
                <Link
                  href="/reports"
                  className="text-xs font-bold text-purple-600 hover:underline"
                >
                  Print Full Council Report →
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-4">Club</th>
                      <th className="py-3 px-4">Category</th>
                      <th className="py-3 px-4">Lead</th>
                      <th className="py-3 px-4">Members</th>
                      <th className="py-3 px-4">Burnout Index</th>
                      <th className="py-3 px-4">Council Health</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {clubs.map(club => (
                      <tr key={club.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4 font-bold text-slate-900">
                          {club.name}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {club.category}
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {club.leadName}
                        </td>
                        <td className="py-3 px-4 font-semibold text-slate-800">
                          {club.memberCount}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                              club.burnoutScore >= 60
                                ? 'bg-rose-100 text-rose-700 border border-rose-200'
                                : club.burnoutScore >= 45
                                ? 'bg-amber-100 text-amber-700 border border-amber-200'
                                : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {club.burnoutScore}/100 {club.burnoutScore >= 60 ? 'HIGH' : 'NORMAL'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-indigo-700">
                          {club.healthScore}/100
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Link
                            href={`/clubs/${club.id}`}
                            className="text-indigo-600 font-semibold hover:underline"
                          >
                            Inspect
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
      </div>
    </AppShell>
  );
}
