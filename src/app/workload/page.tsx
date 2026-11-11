'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import { useClubPulse } from '@/context/ClubPulseContext';
import { getAvatarUrl } from '@/lib/permissions';
import {
  Flame,
  ShieldAlert,
  Users,
  CheckCircle2,
  TrendingDown,
  ArrowRight,
  Sparkles,
  RotateCcw,
  AlertTriangle,
  Send,
  Zap,
} from 'lucide-react';

export default function WorkloadBurnoutRadarPage() {
  const { clubs, tasks, updateTaskStatus, sendNudge, currentUser } = useClubPulse();

  const [selectedClubId, setSelectedClubId] = useState<string>(clubs[0]?.id || '');
  const [rebalanceTriggered, setRebalanceTriggered] = useState(false);
  const [nudgedMemberIds, setNudgedMemberIds] = useState<Set<string>>(new Set());
  const [nudgeFeedback, setNudgeFeedback] = useState<string | null>(null);

  // If student, display access-restricted view directing them to their tasks
  if (currentUser.role === 'student') {
    return (
      <AppShell>
        <div className="max-w-xl mx-auto my-12 bg-white dark:bg-slate-900 rounded-xl p-8 border border-slate-200/90 dark:border-slate-800 shadow-xs text-center space-y-4 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
              Role Access Restricted
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-2">
              Leadership Burnout & Workload Radar
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              Task concentration telemetry, Gini coefficient rebalancing, and ghost member monitoring are tools reserved for Club Leads and Council Officers. As a member, you can track and submit your assigned deliverables on your task board.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/my-tasks"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-semibold shadow-xs transition"
            >
              <span>View My Tasks</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  const handleNudgeMember = (userId: string, userName: string) => {
    const res = sendNudge(userId, userName, club.name);
    if (res.success) {
      setNudgedMemberIds(prev => new Set(prev).add(userId));
      setNudgeFeedback(res.message);
      setTimeout(() => setNudgeFeedback(null), 4000);
    } else {
      setNudgeFeedback(res.message);
      setTimeout(() => setNudgeFeedback(null), 4000);
    }
  };

  const club = clubs.find(c => c.id === selectedClubId) || clubs[0];
  const clubTasks = tasks.filter(t => t.clubId === club.id);
  const openTasks = clubTasks.filter(t => t.status !== 'completed');

  // Calculate task distribution by member
  const memberTaskCounts: Record<string, { name: string; avatar: string; count: number; role: string }> = {};
  
  club.members.forEach(m => {
    memberTaskCounts[m.userId] = {
      name: m.userName,
      avatar: m.avatar,
      count: 0,
      role: m.clubRole,
    };
  });

  openTasks.forEach(t => {
    if (memberTaskCounts[t.assigneeId]) {
      memberTaskCounts[t.assigneeId].count += 1;
    } else {
      memberTaskCounts[t.assigneeId] = {
        name: t.assigneeName,
        avatar: t.assigneeAvatar,
        count: 1,
        role: 'Member',
      };
    }
  });

  const memberDistributions = Object.entries(memberTaskCounts).map(([id, data]) => ({
    userId: id,
    ...data,
    percentage: openTasks.length > 0 ? Math.round((data.count / openTasks.length) * 100) : 0,
  }));

  // Identify highest loaded member (often the lead)
  const sortedByLoad = [...memberDistributions].sort((a, b) => b.count - a.count);
  const topLoaded = sortedByLoad[0];
  const isSevereBurnout = topLoaded && topLoaded.percentage >= 50;

  // Identify idle members / ghost members
  const idleMembers = memberDistributions.filter(m => m.count === 0);

  const handleSimulateRebalance = () => {
    setRebalanceTriggered(true);
    setTimeout(() => {
      setRebalanceTriggered(false);
    }, 3500);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Module 2 • Burnout Early Warning
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
              Workload Distribution & Burnout Radar
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Detect task monopolization, prevent lead fatigue, and identify disengaged members before they drop out.
            </p>
          </div>

          {/* Club selector */}
          <select
            value={selectedClubId}
            onChange={e => setSelectedClubId(e.target.value)}
            className="self-start md:self-auto p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-medium text-xs shadow-xs focus:outline-none focus:border-slate-900 dark:focus:border-slate-400 transition-colors"
          >
            {clubs.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Burnout Assessment Panel */}
        <div className="rounded-xl p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-xs transition-colors">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                <Flame className="w-5 h-5 text-slate-700 dark:text-slate-300" />
              </div>
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                  Workload Concentration Analysis
                </span>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-1">
                  {club.shortName} Burnout Risk Index: {club.burnoutScore}/100
                </h2>
              </div>
            </div>

            <button
              onClick={handleSimulateRebalance}
              className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-medium text-xs transition flex items-center gap-2 self-start md:self-auto shadow-xs"
            >
              <Zap className="w-4 h-4 text-slate-300 dark:text-slate-700" />
              <span>Simulate Rebalancing Recommendations</span>
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-lg border border-slate-200/80 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400 block font-medium">Highest Load Bearer</span>
              <p className="text-base font-bold text-slate-900 dark:text-white mt-1">
                {topLoaded ? `${topLoaded.name} (${topLoaded.percentage}% of tasks)` : 'None'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {isSevereBurnout ? 'Exceeds recommended threshold of 35%' : 'Within healthy range'}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-lg border border-slate-200/80 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400 block font-medium">Idle Members (0 Tasks)</span>
              <p className="text-base font-bold text-slate-900 dark:text-white mt-1">{idleMembers.length} Members</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Available for task delegation</p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-lg border border-slate-200/80 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400 block font-medium">Total Active Tasks</span>
              <p className="text-base font-bold text-slate-900 dark:text-white mt-1">{openTasks.length} In Progress</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Across all club sub-teams</p>
            </div>
          </div>
        </div>

        {/* Rebalance Toast */}
        {rebalanceTriggered && (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white text-xs font-medium flex items-start gap-3 animate-in fade-in">
            <Sparkles className="w-5 h-5 text-slate-800 dark:text-slate-200 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">Rebalancing Recommendations Calculated:</p>
              <p className="font-normal text-slate-700 dark:text-slate-300 mt-0.5">
                Suggest reassigning 2 event logistics tasks from {club.leadName} to available general members. This reduces lead load from 65% down to 32%!
              </p>
            </div>
          </div>
        )}

        {/* Workload Breakdown Chart / Visualizer */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-6 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Individual Task Concentration vs Safe Threshold (35%)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Percentage of active deliverables carried by each team member
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {memberDistributions.map(item => {
              const isOverloaded = item.percentage >= 45;
              const isIdle = item.count === 0;

              return (
                <div key={item.userId} className="space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <img
                        src={getAvatarUrl(item.avatar, item.name)}
                        alt={item.name}
                        className="w-6 h-6 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                      />
                      <span className="font-bold text-slate-800 dark:text-slate-200">{item.name}</span>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">({item.role})</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">
                        {item.count} open {item.count === 1 ? 'task' : 'tasks'}
                      </span>
                      <span
                        className={`font-black ${
                          isOverloaded
                            ? 'text-slate-900 dark:text-white underline decoration-2'
                            : isIdle
                            ? 'text-slate-400 dark:text-slate-500'
                            : 'text-slate-900 dark:text-white'
                        }`}
                      >
                        {item.percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Bar */}
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isOverloaded
                          ? 'bg-slate-900 dark:bg-rose-500'
                          : isIdle
                          ? 'bg-slate-300 dark:bg-slate-700'
                          : 'bg-slate-700 dark:bg-slate-300'
                      }`}
                      style={{ width: `${Math.max(4, item.percentage)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ghost Members Alert Card */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-500 dark:text-rose-400" />
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Ghost Member Disengagement Early Warning
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Members with 0 tasks completed in past 30 days risking silent abandonment
              </p>
            </div>
          </div>

          {nudgeFeedback && (
            <div className="p-3.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>{nudgeFeedback}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {club.members
              .filter(m => m.isGhostRisk || m.participationRate < 30)
              .map(m => (
                <div
                  key={m.userId}
                  className="p-4 rounded-xl bg-rose-50/40 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={getAvatarUrl(m.avatar, m.userName)}
                      alt={m.userName}
                      className="w-10 h-10 rounded-lg object-cover grayscale ring-1 ring-slate-200 dark:ring-slate-700"
                    />
                    <div>
                      <p className="font-bold text-slate-900 dark:text-white">{m.userName}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">{m.userEmail}</p>
                      <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300 mt-0.5 inline-block">
                        Participation: {m.participationRate}%
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleNudgeMember(m.userId, m.userName)}
                    disabled={nudgedMemberIds.has(m.userId)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shrink-0 ${
                      nudgedMemberIds.has(m.userId)
                        ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 cursor-default'
                        : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-xs'
                    }`}
                  >
                    {nudgedMemberIds.has(m.userId) ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Nudged ✓</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-3 h-3 text-slate-400" />
                        <span>Send Nudge</span>
                      </>
                    )}
                  </button>
                </div>
              ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
