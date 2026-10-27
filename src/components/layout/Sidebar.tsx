'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useClubPulse } from '@/context/ClubPulseContext';
import {
  LayoutDashboard,
  Compass,
  Users,
  UserCheck,
  CheckSquare,
  Kanban,
  Flame,
  Award,
  BarChart3,
  MessageSquareHeart,
  FileText,
  Bell,
  Sparkles,
  Settings,
  HelpCircle,
  Shield,
  Layers,
  ArrowUpRight,
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { currentUser, applications, tasks } = useClubPulse();

  // Pending applications for lead badge
  const pendingAppsCount = applications.filter(
    a => a.status === 'pending' || a.status === 'under_review'
  ).length;

  // Pending review tasks for lead badge
  const pendingTasksReviewCount = tasks.filter(
    t => t.status === 'under_review'
  ).length;

  const myTasksCount = tasks.filter(
    t => t.assigneeId === currentUser.id && t.status !== 'completed'
  ).length;

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-slate-200 bg-white/70 backdrop-blur-md min-h-[calc(100vh-4rem)] p-4 select-none shrink-0">
      {/* Role Badge Indicator */}
      <div className="mb-4 p-3 rounded-2xl bg-gradient-to-br from-indigo-50 to-slate-100 border border-indigo-100/80">
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium mb-1">
          <span>Active Role</span>
          <span className="flex items-center gap-1 font-bold text-indigo-700 bg-indigo-100/70 px-2 py-0.5 rounded-full text-[10px] uppercase">
            {currentUser.role === 'club_lead'
              ? 'Lead'
              : currentUser.role === 'admin'
              ? 'Dean'
              : 'Student'}
          </span>
        </div>
        <p className="font-bold text-slate-900 text-sm truncate">{currentUser.name}</p>
        <p className="text-[11px] text-slate-500 truncate mt-0.5">
          {currentUser.department}
        </p>
      </div>

      <div className="flex-1 space-y-6 overflow-y-auto pr-1">
        {/* Core Nav */}
        <div>
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Overview
          </p>
          <div className="space-y-1">
            <Link
              href="/dashboard"
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition ${
                pathname === '/dashboard'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </Link>
          </div>
        </div>

        {/* Module 1: Clubs & Recruitment */}
        <div>
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Clubs & Recruitment
          </p>
          <div className="space-y-1">
            <Link
              href="/clubs"
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition ${
                pathname === '/clubs'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Discover Clubs</span>
            </Link>

            <Link
              href="/my-clubs"
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition ${
                pathname === '/my-clubs'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>My Clubs & Status</span>
            </Link>

            <Link
              href="/recruitment"
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                pathname === '/recruitment'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4" />
                <span>Recruitment Pipeline</span>
              </div>
              {pendingAppsCount > 0 && currentUser.role !== 'student' && (
                <span className="text-[10px] bg-amber-500 text-white font-bold px-1.5 py-0.5 rounded-full">
                  {pendingAppsCount}
                </span>
              )}
            </Link>

            <Link
              href="/members"
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition ${
                pathname === '/members'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>Member Directory</span>
            </Link>

            <Link
              href="/onboarding"
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition ${
                pathname === '/onboarding'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>Member Onboarding</span>
            </Link>
          </div>
        </div>

        {/* Module 2: Tasks & Contributions */}
        <div>
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Tasks & Workload
          </p>
          <div className="space-y-1">
            <Link
              href="/my-tasks"
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                pathname === '/my-tasks'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <CheckSquare className="w-4 h-4" />
                <span>My Assigned Tasks</span>
              </div>
              {myTasksCount > 0 && (
                <span className="text-[10px] bg-indigo-100 text-indigo-700 font-bold px-1.5 py-0.5 rounded-full">
                  {myTasksCount}
                </span>
              )}
            </Link>

            <Link
              href="/tasks"
              className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition ${
                pathname === '/tasks'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Kanban className="w-4 h-4" />
                <span>Kanban Task Board</span>
              </div>
              {pendingTasksReviewCount > 0 && currentUser.role !== 'student' && (
                <span className="text-[10px] bg-purple-500 text-white font-bold px-1.5 py-0.5 rounded-full">
                  {pendingTasksReviewCount}
                </span>
              )}
            </Link>

            <Link
              href="/workload"
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition ${
                pathname === '/workload'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Flame className="w-4 h-4 text-amber-500" />
              <span>Burnout & Workload</span>
            </Link>

            <Link
              href="/contributions"
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition ${
                pathname === '/contributions'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>Verified Ledger</span>
            </Link>
          </div>
        </div>

        {/* Module 3: Feedback & Analytics */}
        <div>
          <p className="px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Feedback & Health
          </p>
          <div className="space-y-1">
            <Link
              href="/analytics"
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition ${
                pathname === '/analytics'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Club Analytics</span>
            </Link>

            <Link
              href="/feedback"
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition ${
                pathname === '/feedback'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <MessageSquareHeart className="w-4 h-4" />
              <span>Pulse 360 Feedback</span>
            </Link>

            <Link
              href="/reports"
              className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition ${
                pathname === '/reports'
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/20'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Printable Report</span>
            </Link>
          </div>
        </div>

        {/* Demo Switcher Quick Card */}
        <div className="pt-2">
          <Link
            href="/demo-select"
            className="flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md hover:shadow-indigo-500/25 transition group"
          >
            <div>
              <p className="text-xs font-bold flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                Demo Personas
              </p>
              <p className="text-[10px] text-indigo-100">Try Member, Lead, Dean</p>
            </div>
            <ArrowUpRight className="w-4 h-4 text-indigo-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
