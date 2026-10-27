'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import { useClubPulse } from '@/context/ClubPulseContext';
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
  const { clubs, tasks, updateTaskStatus } = useClubPulse();

  const [selectedClubId, setSelectedClubId] = useState<string>(clubs[0]?.id || '');
  const [rebalanceTriggered, setRebalanceTriggered] = useState(false);

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
            <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
              Module 2 • Burnout Early Warning
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Workload Distribution & Burnout Radar
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Detect task monopolization, prevent lead fatigue, and identify disengaged members before they drop out.
            </p>
          </div>

          {/* Club selector */}
          <select
            value={selectedClubId}
            onChange={e => setSelectedClubId(e.target.value)}
            className="self-start md:self-auto p-2.5 rounded-2xl border border-slate-200 bg-white font-bold text-xs shadow-sm"
          >
            {clubs.map(c => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Burnout Meter Banner */}
        <div
          className={`rounded-3xl p-6 sm:p-8 text-white shadow-xl transition-all duration-300 ${
            isSevereBurnout
              ? 'bg-gradient-to-br from-amber-600 via-rose-600 to-red-700'
              : 'bg-gradient-to-br from-indigo-700 to-purple-800'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-white/20">
            <div className="flex items-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <Flame className="w-8 h-8 text-white animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-black/20 px-2.5 py-0.5 rounded-full">
                  Real-time Workload Analysis
                </span>
                <h2 className="text-xl sm:text-2xl font-black mt-1">
                  {club.shortName} Burnout Risk Index: {club.burnoutScore}/100
                </h2>
              </div>
            </div>

            <button
              onClick={handleSimulateRebalance}
              className="px-4 py-2.5 rounded-xl bg-white text-slate-900 font-extrabold text-xs shadow-lg hover:bg-slate-100 transition flex items-center gap-2 self-start md:self-auto"
            >
              <Zap className="w-4 h-4 text-amber-600 fill-amber-500" />
              <span>Simulate Rebalancing Recommendations</span>
            </button>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="bg-black/15 p-4 rounded-2xl border border-white/10">
              <span className="text-white/70 block">Highest Load Bearer</span>
              <p className="text-lg font-black mt-1">
                {topLoaded ? `${topLoaded.name} (${topLoaded.percentage}% of tasks)` : 'None'}
              </p>
              <p className="text-[11px] text-white/60 mt-0.5">
                {isSevereBurnout ? '⚠️ Exceeds safe threshold of 35%' : 'Within healthy range'}
              </p>
            </div>

            <div className="bg-black/15 p-4 rounded-2xl border border-white/10">
              <span className="text-white/70 block">Idle Members with 0 Tasks</span>
              <p className="text-lg font-black mt-1">{idleMembers.length} Members</p>
              <p className="text-[11px] text-white/60 mt-0.5">Available for task delegation</p>
            </div>

            <div className="bg-black/15 p-4 rounded-2xl border border-white/10">
              <span className="text-white/70 block">Total Active Tasks</span>
              <p className="text-lg font-black mt-1">{openTasks.length} In Progress</p>
              <p className="text-[11px] text-white/60 mt-0.5">Across all club sub-teams</p>
            </div>
          </div>
        </div>

        {/* Rebalance Toast */}
        {rebalanceTriggered && (
          <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-bold flex items-start gap-3 animate-in fade-in">
            <Sparkles className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
            <div>
              <p>Rebalancing Recommendations Calculated:</p>
              <p className="font-normal text-indigo-800 mt-0.5">
                Suggest reassigning 2 event logistics tasks from {club.leadName} to available general members (Aarav Sharma and Ananya Iyer). This reduces lead load from 65% down to 32%!
              </p>
            </div>
          </div>
        )}

        {/* Workload Breakdown Chart / Visualizer */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">
                Individual Task Concentration vs Safe Threshold (35%)
              </h3>
              <p className="text-xs text-slate-500">
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
                        src={item.avatar}
                        alt={item.name}
                        className="w-6 h-6 rounded-full object-cover"
                      />
                      <span className="font-bold text-slate-800">{item.name}</span>
                      <span className="text-[10px] text-slate-400">({item.role})</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-slate-500 font-medium">
                        {item.count} open {item.count === 1 ? 'task' : 'tasks'}
                      </span>
                      <span
                        className={`font-black ${
                          isOverloaded
                            ? 'text-rose-600'
                            : isIdle
                            ? 'text-amber-600'
                            : 'text-indigo-600'
                        }`}
                      >
                        {item.percentage}%
                      </span>
                    </div>
                  </div>

                  {/* Horizontal Bar */}
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-700 ${
                        isOverloaded
                          ? 'bg-rose-500'
                          : isIdle
                          ? 'bg-amber-300'
                          : 'bg-indigo-600'
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
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-500" />
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">
                Ghost Member Disengagement Early Warning
              </h3>
              <p className="text-xs text-slate-500">
                Members with 0 tasks completed in past 30 days risking silent abandonment
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {club.members
              .filter(m => m.isGhostRisk || m.participationRate < 30)
              .map(m => (
                <div
                  key={m.userId}
                  className="p-4 rounded-2xl bg-rose-50/40 border border-rose-200 flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={m.avatar}
                      alt={m.userName}
                      className="w-10 h-10 rounded-xl object-cover grayscale"
                    />
                    <div>
                      <p className="font-bold text-slate-900">{m.userName}</p>
                      <p className="text-[11px] text-slate-500">{m.userEmail}</p>
                      <span className="text-[10px] font-bold text-rose-700 mt-0.5 inline-block">
                        Participation: {m.participationRate}%
                      </span>
                    </div>
                  </div>

                  <Link
                    href="/members"
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-300 transition"
                  >
                    Nudge
                  </Link>
                </div>
              ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
