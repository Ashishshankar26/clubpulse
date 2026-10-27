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
} from 'lucide-react';

export default function ClubAnalyticsPage() {
  const { clubs, tasks, feedbacks, currentUser } = useClubPulse();

  const [selectedClubId, setSelectedClubId] = useState<string>('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState<string>('semester');

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
    link.setAttribute('download', `clubpulse_export_${selectedClubId}_${Date.now()}.csv`);
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
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
              Module 3 • Analytics & Feedback
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Club Participation & Health Analytics
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Transparent telemetry across campus organizations. Track task velocity, member retention, and pulse satisfaction.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export CSV</span>
            </button>

            <Link
              href="/reports"
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition flex items-center gap-1.5"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Print Club Report</span>
            </Link>
          </div>
        </div>

        {/* Filters Toolbar */}
        <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-slate-400 font-bold uppercase text-[10px]">Filter Club:</span>
            <select
              value={selectedClubId}
              onChange={e => setSelectedClubId(e.target.value)}
              className="p-2 rounded-xl border border-slate-200 bg-slate-50 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
            <span className="text-slate-400 font-bold uppercase text-[10px]">Date Range:</span>
            <select
              value={selectedTimeframe}
              onChange={e => setSelectedTimeframe(e.target.value)}
              className="p-2 rounded-xl border border-slate-200 bg-slate-50 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="month">Current Month (October)</option>
              <option value="semester">Fall Semester 2026</option>
              <option value="year">Academic Year 2025-26</option>
            </select>
          </div>
        </div>

        {/* 4 Core KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-bold uppercase">Active Participation</span>
              <Users className="w-4 h-4 text-indigo-500" />
            </div>
            <p className="text-2xl font-black text-slate-900">{kpis.participationRate}%</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {kpis.activeMembers} active / {kpis.totalMembers} total members
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-bold uppercase">Task Completion</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="text-2xl font-black text-slate-900">{kpis.taskCompletionRate}%</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {kpis.completedTasks} of {kpis.totalTasks} deliverables done
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-bold uppercase">Lead Burnout Score</span>
              <Flame className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-black text-amber-600">{kpis.burnoutIndex}/100</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Risk Level: <strong>{kpis.burnoutRiskLevel}</strong>
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px] font-bold uppercase">Member CSAT Rating</span>
              <Award className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-2xl font-black text-purple-600">{kpis.averageSatisfaction} / 5.0</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              From {feedbacks.length} submitted reviews
            </p>
          </div>
        </div>

        {/* Charts & Trends Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Task Completion Velocity Trend */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">
                  Weekly Deliverables Velocity
                </h3>
                <p className="text-xs text-slate-500">
                  Cumulative verified tasks delivered per week
                </p>
              </div>
              <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                +24% vs Prev Month
              </span>
            </div>

            {/* Custom SVG Bar Chart */}
            <div className="pt-4">
              <div className="h-48 flex items-end justify-between gap-3 px-2 border-b border-slate-200 pb-2">
                {weeklyTrends.map((w, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-[10px] font-bold text-indigo-600 group-hover:scale-110 transition">
                      {w.tasksCompleted}
                    </span>
                    <div
                      className="w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-xl transition-all duration-500 group-hover:opacity-90"
                      style={{ height: `${(w.tasksCompleted / 22) * 100}%` }}
                    ></div>
                    <span className="text-[10px] font-bold text-slate-500 truncate">{w.week}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chart 2: Active Member Participation Trend */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">
                  Active Member Retention Curve
                </h3>
                <p className="text-xs text-slate-500">
                  Weekly active attendees without dropping out
                </p>
              </div>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                Zero Dropouts
              </span>
            </div>

            {/* Custom SVG Line/Bar Chart */}
            <div className="pt-4">
              <div className="h-48 flex items-end justify-between gap-3 px-2 border-b border-slate-200 pb-2">
                {weeklyTrends.map((w, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                    <span className="text-[10px] font-bold text-purple-600 group-hover:scale-110 transition">
                      {w.activeMembers}
                    </span>
                    <div
                      className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-xl transition-all duration-500 group-hover:opacity-90"
                      style={{ height: `${(w.activeMembers / 40) * 100}%` }}
                    ></div>
                    <span className="text-[10px] font-bold text-slate-500 truncate">{w.week}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Club Comparison Table */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">
                Inter-Club Participation & Burnout Benchmark
              </h3>
              <p className="text-xs text-slate-500">
                Comparing all 5 campus student organizations
              </p>
            </div>
            <Link
              href="/feedback"
              className="text-xs font-bold text-indigo-600 hover:underline"
            >
              Review Member Feedback →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
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
              <tbody className="divide-y divide-slate-100">
                {clubs.map(c => {
                  const clubKPI = calculateClubKPIs(c, tasks, feedbacks);
                  return (
                    <tr key={c.id} className="hover:bg-slate-50 transition">
                      <td className="py-3 px-4 font-bold text-slate-900">{c.name}</td>
                      <td className="py-3 px-4 text-slate-600">{c.leadName}</td>
                      <td className="py-3 px-4 font-semibold text-slate-800">{c.memberCount}</td>
                      <td className="py-3 px-4 text-emerald-600 font-bold">{clubKPI.completedTasks} completed</td>
                      <td className="py-3 px-4">
                        <span
                          className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                            c.burnoutScore >= 60
                              ? 'bg-rose-100 text-rose-700'
                              : c.burnoutScore >= 45
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {c.burnoutScore}/100
                        </span>
                      </td>
                      <td className="py-3 px-4 font-bold text-purple-600">{clubKPI.averageSatisfaction} / 5</td>
                      <td className="py-3 px-4 text-right">
                        <Link
                          href={`/clubs/${c.id}`}
                          className="text-indigo-600 font-semibold hover:underline"
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
