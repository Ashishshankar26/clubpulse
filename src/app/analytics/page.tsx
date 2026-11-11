'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import { useClubPulse } from '@/context/ClubPulseContext';
import { calculateClubKPIs } from '@/lib/metrics';
import {
  BarChart3,
  TrendingUp,
  Users,
  CheckCircle2,
  Award,
  Download,
  Calendar,
  Filter,
  FileText,
  Flame,
  ArrowUpRight,
  ShieldCheck,
  ArrowRight,
} from 'lucide-react';

export default function ClubAnalyticsPage() {
  const { clubs, tasks, feedbacks, currentUser } = useClubPulse();

  const [selectedClubId, setSelectedClubId] = useState<string>('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('semester');

  // If student, display access-restricted screen pointing to their verified contributions
  if (currentUser.role === 'student') {
    return (
      <AppShell>
        <div className="max-w-xl mx-auto my-12 bg-white dark:bg-slate-900 rounded-xl p-8 border border-slate-200/90 dark:border-slate-800 shadow-xs text-center space-y-4 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center justify-center mx-auto">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-800 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded border border-slate-300 dark:border-slate-700">
              Role Access Restricted
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-2">
              Club Participation & Health Analytics
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              Institutional velocity metrics, retention curves, and campus-wide performance summaries are reserved for Club Leads and Council Administrators. To inspect your personal achievements, visit your Verified Credits page.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/contributions"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-semibold shadow-xs transition"
            >
              <span>View My Verified Credits</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  const selectedClub = selectedClubId === 'all' ? undefined : clubs.find(c => c.id === selectedClubId);
  const kpis = calculateClubKPIs(selectedClub, tasks, feedbacks);

  // Client-side CSV export functionality
  const handleExportCSV = () => {
    const relevantTasks = selectedClub ? tasks.filter(t => t.clubId === selectedClub.id) : tasks;
    const headers = ['Task ID', 'Club', 'Title', 'Priority', 'Status', 'Assignee', 'Due Date', 'XP Reward'];
    const rows = relevantTasks.map(t => [
      t.id,
      `"${t.clubName}"`,
      `"${t.title.replace(/"/g, '""')}"`,
      t.priority,
      t.status,
      `"${t.assigneeName}"`,
      t.dueDate,
      t.xpReward,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `clubing_export_${selectedClubId}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Mock weekly trends
  const weeklyTrends = [
    { week: 'Week 1', tasksCompleted: 4, activeMembers: 18, satisfaction: 4.8 },
    { week: 'Week 2', tasksCompleted: 8, activeMembers: 24, satisfaction: 4.7 },
    { week: 'Week 3', tasksCompleted: 11, activeMembers: 30, satisfaction: 4.5 },
    { week: 'Week 4', tasksCompleted: 15, activeMembers: 32, satisfaction: 4.6 },
    { week: 'Week 5', tasksCompleted: 19, activeMembers: 36, satisfaction: 4.6 },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Module 3 • Analytics & Feedback
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
              Club Participation & Health Analytics
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Transparent telemetry across campus organizations. Track task velocity, member retention, and pulse satisfaction.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-medium transition flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <Link
              href="/reports"
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-medium shadow-xs transition flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Print Club Report</span>
            </Link>
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs transition-colors">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-slate-400 dark:text-slate-500 font-semibold uppercase text-[10px]">Filter Club:</span>
            <select
              value={selectedClubId}
              onChange={e => setSelectedClubId(e.target.value)}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-slate-900 dark:focus:border-slate-400 transition-colors"
            >
              <option value="all">All Campus Clubs Aggregate</option>
              {clubs.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <span className="text-slate-400 dark:text-slate-500 font-semibold uppercase text-[10px]">Date Range:</span>
            <select
              value={selectedTimeframe}
              onChange={e => setSelectedTimeframe(e.target.value)}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-slate-900 dark:focus:border-slate-400 transition-colors"
            >
              <option value="month">Current Month (October)</option>
              <option value="semester">Fall Semester 2026</option>
              <option value="year">Academic Year 2025-26</option>
            </select>
          </div>
        </div>

        {/* 4 Core KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs transition-colors">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
              <span className="text-[11px] font-semibold uppercase">Active Participation</span>
              <Users className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{kpis.participationRate}%</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              {kpis.activeMembers} active / {kpis.totalMembers} total members
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs transition-colors">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
              <span className="text-[11px] font-semibold uppercase">Task Completion</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{kpis.taskCompletionRate}%</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              {kpis.completedTasks} of {kpis.totalTasks} deliverables done
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs transition-colors">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
              <span className="text-[11px] font-semibold uppercase">Lead Burnout Score</span>
              <Flame className="w-4 h-4 text-slate-700 dark:text-slate-300" />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{kpis.burnoutIndex}/100</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              Risk Level: <strong className="text-slate-700 dark:text-slate-300">{kpis.burnoutRiskLevel}</strong>
            </p>
          </div>

          <div className="bg-white dark:bg-slate-900 p-5 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs transition-colors">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1">
              <span className="text-[11px] font-semibold uppercase">Member CSAT Rating</span>
              <Award className="w-4 h-4 text-slate-700 dark:text-slate-300" />
            </div>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{kpis.averageSatisfaction} / 5.0</p>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
              From {feedbacks.length} submitted reviews
            </p>
          </div>
        </div>

        {/* Charts & Trends Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Task Completion Velocity Trend */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Weekly Deliverables Velocity
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Cumulative verified tasks delivered per week
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                +24% vs Prev Month
              </span>
            </div>

            {/* Custom SVG Bar Chart */}
            <div className="pt-4">
              <div className="h-48 flex items-end justify-between gap-3 px-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                {weeklyTrends.map((w, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-[10px] font-bold text-slate-900 dark:text-white group-hover:scale-110 transition">
                      {w.tasksCompleted}
                    </span>
                    <div
                      className="w-full bg-slate-900 dark:bg-slate-100 rounded-lg transition-all duration-500 group-hover:opacity-90"
                      style={{ height: `${(w.tasksCompleted / 22) * 100}%` }}
                    ></div>
                    <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 truncate">{w.week}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chart 2: Active Member Participation Trend */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Active Member Retention Curve
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Weekly active attendees without dropping out
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 rounded">
                Zero Dropouts
              </span>
            </div>

            {/* Custom SVG Line/Bar Chart */}
            <div className="pt-4">
              <div className="h-48 flex items-end justify-between gap-3 px-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                {weeklyTrends.map((w, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 group-hover:scale-110 transition">
                      {w.activeMembers}
                    </span>
                    <div
                      className="w-full bg-slate-900 dark:bg-slate-100 rounded-md transition-all duration-300 group-hover:bg-slate-800 dark:group-hover:bg-slate-200"
                      style={{ height: `${(w.activeMembers / 40) * 100}%` }}
                    ></div>
                    <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 truncate">{w.week}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Club Comparison Table */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Inter-Club Participation & Burnout Benchmark
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Comparing all 5 campus student organizations
              </p>
            </div>
            <Link
              href="/feedback"
              className="text-xs font-semibold text-slate-900 dark:text-white hover:underline"
            >
              Review Member Feedback →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 uppercase font-semibold border-b border-slate-200 dark:border-slate-700">
                <tr>
                  <th className="py-3 px-4">Club Name</th>
                  <th className="py-3 px-4">Lead</th>
                  <th className="py-3 px-4">Members</th>
                  <th className="py-3 px-4">Tasks Done</th>
                  <th className="py-3 px-4">Burnout Risk</th>
                  <th className="py-3 px-4">Satisfaction</th>
                  <th className="py-3 px-4 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {clubs.map(c => {
                  const clubKPI = calculateClubKPIs(c, tasks, feedbacks);
                  return (
                    <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40 transition">
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">{c.name}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-300">{c.leadName}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200">{c.memberCount}</td>
                      <td className="py-3 px-4 text-emerald-700 dark:text-emerald-400 font-medium">{clubKPI.completedTasks} completed</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded font-semibold text-[10px] ${
                            c.burnoutScore >= 60
                              ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                              : c.burnoutScore >= 45
                              ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700'
                              : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                          }`}
                        >
                          {c.burnoutScore}/100
                        </span>
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">{clubKPI.averageSatisfaction} / 5</td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/clubs/${c.id}`}
                          className="text-slate-900 dark:text-white font-semibold hover:underline"
                        >
                          View Profile
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
