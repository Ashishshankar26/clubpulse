'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useClubPulse } from '@/context/ClubPulseContext';
import { getManagedClubs, isTaskAssignedToUser } from '@/lib/permissions';
import ThemeToggle from './ThemeToggle';
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
  Shield,
  Layers,
  ArrowUpRight,
  LogIn,
} from 'lucide-react';

export default function Sidebar() {
  const pathname = usePathname();
  const { currentUser, clubs, applications, tasks, isAuthenticated } = useClubPulse();

  const myManagedClubIds = new Set(getManagedClubs(currentUser, clubs).map(c => c.id));

  const myJoinedClubs = clubs.filter(
    c =>
      (currentUser.clubsJoined || []).includes(c.id) ||
      (c.members || []).some(
        m =>
          m.userId === currentUser.id ||
          (m.userEmail && currentUser.email && m.userEmail.toLowerCase() === currentUser.email.toLowerCase())
      )
  );

  const hasActiveClubMembership =
    currentUser.role === 'admin' ||
    currentUser.role === 'club_lead' ||
    myJoinedClubs.length > 0;

  const pendingAppsCount =
    currentUser.role === 'student'
      ? 0
      : applications.filter(
          a =>
            (currentUser.role === 'admin' || myManagedClubIds.has(a.clubId)) &&
            (a.status === 'pending' || a.status === 'under_review')
        ).length;

  const pendingTasksReviewCount =
    currentUser.role === 'student'
      ? 0
      : tasks.filter(
          t =>
            (currentUser.role === 'admin' || myManagedClubIds.has(t.clubId)) &&
            t.status === 'under_review' &&
            !isTaskAssignedToUser(t, currentUser)
        ).length;

  const myTasksCount = tasks.filter(
    t => isTaskAssignedToUser(t, currentUser) && t.status !== 'completed'
  ).length;

  const navItemClass = (path: string) => {
    const isActive = pathname === path;
    return `flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition ${
      isActive
        ? 'bg-slate-900 dark:bg-white text-white dark:text-black font-semibold shadow-xs'
        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/80 dark:hover:bg-slate-800/70'
    }`;
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 border-r border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 min-h-[calc(100vh-4rem)] p-4 select-none shrink-0 transition-colors duration-150">
      {/* Active Profile Header Card */}
      {!isAuthenticated ? (
        <div className="mb-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700 text-left">
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium mb-1">
            <span className="text-[11px]">Campus Visitor</span>
            <span className="font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-1.5 py-0.5 rounded text-[10px]">
              Guest
            </span>
          </div>
          <p className="font-semibold text-slate-800 dark:text-slate-200 text-xs mt-1">Sign in with Registration No.</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
            Access assigned tasks, club memberships, and credits.
          </p>
          <Link
            href="/login"
            className="mt-2.5 w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold transition shadow-xs"
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Sign In</span>
          </Link>
        </div>
      ) : (
        <div className="mb-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/90 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <Link
              href="/settings"
              title="Change profile picture in Settings"
              className="relative group shrink-0"
            >
              <img
                src={currentUser.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser.name)}`}
                alt={currentUser.name}
                className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700 group-hover:ring-slate-900 dark:group-hover:ring-white transition"
              />
            </Link>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium">
                <span className="font-semibold text-slate-900 dark:text-white text-xs truncate">{currentUser.name}</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wide shrink-0">
                  {currentUser.role === 'club_lead'
                    ? 'Lead'
                    : currentUser.role === 'admin'
                    ? 'Dean'
                    : 'Student'}
                </span>
              </div>
              <p className="text-[10px] font-mono text-slate-600 dark:text-slate-400 font-medium truncate mt-0.5">
                {currentUser.registrationNumber}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex-1 space-y-5 overflow-y-auto pr-1">
        {/* Core Nav */}
        <div>
          <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
            Overview
          </p>
          <div className="space-y-0.5">
            <Link href="/dashboard" className={navItemClass('/dashboard')}>
              <div className="flex items-center gap-2.5">
                <LayoutDashboard className="w-4 h-4 opacity-80" />
                <span>Dashboard</span>
              </div>
            </Link>
          </div>
        </div>

        {/* Module 1: Clubs & Recruitment */}
        <div>
          <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
            Clubs & Discovery
          </p>
          <div className="space-y-0.5">
            <Link href="/clubs" className={navItemClass('/clubs')}>
              <div className="flex items-center gap-2.5">
                <Compass className="w-4 h-4 opacity-80" />
                <span>Discover Clubs</span>
              </div>
            </Link>

            <Link href="/my-clubs" className={navItemClass('/my-clubs')}>
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4 opacity-80" />
                <span>My Clubs</span>
              </div>
            </Link>

            {/* Recruitment: Strictly for Club Leads & Administrators */}
            {(currentUser.role === 'club_lead' || currentUser.role === 'admin') && (
              <Link href="/recruitment" className={navItemClass('/recruitment')}>
                <div className="flex items-center gap-2.5">
                  <Users className="w-4 h-4 opacity-80" />
                  <span>Recruitment</span>
                </div>
                {pendingAppsCount > 0 && (
                  <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold px-1.5 py-0.2 rounded-full">
                    {pendingAppsCount}
                  </span>
                )}
              </Link>
            )}

            {hasActiveClubMembership && (
              <Link href="/members" className={navItemClass('/members')}>
                <div className="flex items-center gap-2.5">
                  <UserCheck className="w-4 h-4 opacity-80" />
                  <span>Club Roster</span>
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* Module 2: Operations & Tasks */}
        <div>
          <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
            Operations & Tasks
          </p>
          <div className="space-y-0.5">
            {/* Task Board: For Club Leads, Admins, and Enrolled Members */}
            {hasActiveClubMembership && (
              <Link href="/tasks" className={navItemClass('/tasks')}>
                <div className="flex items-center gap-2.5">
                  <Kanban className="w-4 h-4 opacity-80" />
                  <span>Task Board</span>
                </div>
                {pendingTasksReviewCount > 0 && (
                  <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold px-1.5 py-0.2 rounded-full">
                    {pendingTasksReviewCount}
                  </span>
                )}
              </Link>
            )}

            <Link href="/my-tasks" className={navItemClass('/my-tasks')}>
              <div className="flex items-center gap-2.5">
                <CheckSquare className="w-4 h-4 opacity-80" />
                <span>My Tasks</span>
              </div>
              {myTasksCount > 0 && (
                <span className="text-[10px] bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold px-1.5 py-0.2 rounded-full">
                  {myTasksCount}
                </span>
              )}
            </Link>

            {/* Burnout Radar: Dedicated to Club Leadership */}
            {(currentUser.role === 'club_lead' || currentUser.role === 'admin') && (
              <Link href="/workload" className={navItemClass('/workload')}>
                <div className="flex items-center gap-2.5">
                  <Flame className="w-4 h-4 opacity-80" />
                  <span>Burnout Radar</span>
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* Module 3: Portfolio & Credits */}
        <div>
          <p className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
            Recognition & Health
          </p>
          <div className="space-y-0.5">
            <Link href="/contributions" className={navItemClass('/contributions')}>
              <div className="flex items-center gap-2.5">
                <Award className="w-4 h-4 opacity-80" />
                <span>Verified Credits</span>
              </div>
            </Link>

            {(currentUser.role === 'club_lead' || currentUser.role === 'admin') && (
              <Link href="/analytics" className={navItemClass('/analytics')}>
                <div className="flex items-center gap-2.5">
                  <BarChart3 className="w-4 h-4 opacity-80" />
                  <span>Analytics</span>
                </div>
              </Link>
            )}

            <Link href="/feedback" className={navItemClass('/feedback')}>
              <div className="flex items-center gap-2.5">
                <MessageSquareHeart className="w-4 h-4 opacity-80" />
                <span>Pulse Survey</span>
              </div>
            </Link>

            {(currentUser.role === 'admin' || currentUser.role === 'club_lead') && (
              <Link href="/reports" className={navItemClass('/reports')}>
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 opacity-80" />
                  <span>Governance Report</span>
                </div>
              </Link>
            )}
          </div>
        </div>

        {/* Appearance & Quick Links at Bottom */}
        <div className="pt-3 space-y-2 border-t border-slate-100 dark:border-slate-800">
          <div>
            <span className="px-3 text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-1.5">
              Theme
            </span>
            <ThemeToggle variant="expanded" className="w-full justify-between" />
          </div>

          {isAuthenticated ? (
            <Link
              href="/settings"
              className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 transition text-xs font-medium"
            >
              <span className="flex items-center gap-2">
                <Settings className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>Account & Security</span>
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          ) : (
            <Link
              href="/login"
              className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-700 transition text-xs font-medium"
            >
              <span className="flex items-center gap-2">
                <LogIn className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
                <span>Sign In with Reg No.</span>
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
}
