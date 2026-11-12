'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import {
  Activity,
  Flame,
  ArrowRight,
  Users,
  BarChart3,
  ChevronRight,
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-black text-slate-900 dark:text-white transition-colors">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-6">
            
            {/* Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-900 dark:bg-white"></span>
              <span>College Campus Organization System</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
              Solve Ghost Members & Burnout in College Clubs.
            </h1>

            {/* Subheading */}
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-2xl leading-relaxed">
              A structured operating system for college campus societies. Balances task workloads, detects member inactivity before dropouts occur, and records verified contribution credentials.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-black font-semibold shadow-xs transition"
              >
                <span>Student & Lead Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <Link
                href="/login?tab=register"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white hover:bg-slate-50 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-medium border border-slate-200/90 dark:border-slate-700 shadow-xs transition"
              >
                <span>Register New Student</span>
              </Link>
            </div>

            {/* Metrics Ribbon */}
            <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl text-left">
              <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
                <p className="text-xl font-bold text-slate-900 dark:text-white">5</p>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">Active Campus Clubs</p>
              </div>
              <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
                <p className="text-xl font-bold text-slate-900 dark:text-white">100%</p>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">Interactive Client</p>
              </div>
              <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
                <p className="text-xl font-bold text-slate-900 dark:text-white">Real-time</p>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">Burnout Radar</p>
              </div>
              <div className="p-3.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 shadow-xs">
                <p className="text-xl font-bold text-slate-900 dark:text-white">Atlas Ready</p>
                <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-0.5">MongoDB Connected</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars: The 3 Modules */}
      <section className="py-16 bg-white dark:bg-slate-950 border-y border-slate-200/90 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5 block">
              Core Architecture
            </span>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Engineered for Sustainable Campus Student Organizations
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Module 1 */}
            <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center mb-4">
                  <Users className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Module 1
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1 mb-2">
                  Clubs & Recruitment Service
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  Club directories with category filtering, dynamic application pipelines, 1-click lead approvals, and member rosters with inactivity detection.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-200/70 dark:border-slate-800">
                <Link
                  href="/clubs"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white hover:text-slate-700 dark:hover:text-slate-300"
                >
                  <span>Explore Clubs</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Module 2 */}
            <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center mb-4">
                  <Flame className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Module 2
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1 mb-2">
                  Task Boards & Burnout Radar
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  Kanban workflow with 5 task states, automated task delegation recommendations, submission verification, and lead concentration alerts.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-200/70 dark:border-slate-800">
                <Link
                  href="/tasks"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white hover:text-slate-700 dark:hover:text-slate-300"
                >
                  <span>Open Task Board</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Module 3 */}
            <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center mb-4">
                  <BarChart3 className="w-5 h-5 text-slate-700 dark:text-slate-300" />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Module 3
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1 mb-2">
                  Activity Credits & Council Reports
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                  Pulse surveys measuring workload fairness, sentiment tracking, CSV exports, and printable quarterly council governance reports.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-200/70 dark:border-slate-800">
                <Link
                  href="/analytics"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white hover:text-slate-700 dark:hover:text-slate-300"
                >
                  <span>View Analytics</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Club Snapshot */}
      <section className="py-14 bg-slate-50 dark:bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-slate-900 rounded-xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded">
                  Campus Organization
                </span>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-1">
                  Google Developer Student Club (GDSC)
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Lead: Priya Patel • 38 Active Members • Active Recruitment
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Link
                  href="/clubs/club_gdsc"
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium transition"
                >
                  View Profile
                </Link>
                <Link
                  href="/tasks?club=club_gdsc"
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-black font-semibold transition shadow-xs"
                >
                  View Tasks
                </Link>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <Link
                href="/recruitment"
                className="p-3.5 rounded-lg bg-slate-50 hover:bg-slate-100/80 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 transition flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Recruitment</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Review applicants</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <Link
                href="/workload"
                className="p-3.5 rounded-lg bg-slate-50 hover:bg-slate-100/80 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 transition flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Burnout Radar</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Workload balance</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <Link
                href="/contributions"
                className="p-3.5 rounded-lg bg-slate-50 hover:bg-slate-100/80 dark:bg-slate-800/60 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700 transition flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-slate-900 dark:text-white">Verified Ledger</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Activity credits</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-6 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-xs border-t border-slate-200/90 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-black">
              <Activity className="w-3 h-3 text-white dark:text-black" />
            </div>
            <span className="font-semibold text-slate-800 dark:text-slate-200">Club.ing</span>
            <span className="text-slate-400 dark:text-slate-500">• College Club Management Platform</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400">
            <Link href="/dashboard" className="hover:text-slate-900 dark:hover:text-white transition">Dashboard</Link>
            <Link href="/login" className="hover:text-slate-900 dark:hover:text-white transition">Portal Login</Link>
            <Link href="/reports" className="hover:text-slate-900 dark:hover:text-white transition">Governance</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
