'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import { useClubPulse } from '@/context/ClubPulseContext';
import {
  Activity,
  Flame,
  CheckCircle2,
  Award,
  ArrowRight,
  Shield,
  Users,
  BarChart3,
  ChevronRight,
  Building,
  KeyRound,
  IdCard,
} from 'lucide-react';

export default function HomePage() {
  const { clubs } = useClubPulse();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-6">
            
            {/* Pill */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-slate-900"></span>
              <span>College Campus Organization System</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
              Solve Ghost Members & Burnout in College Clubs.
            </h1>

            {/* Subheading */}
            <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
              A structured operating system for college campus societies. Balances task workloads, detects member inactivity before dropouts occur, and records verified contribution credentials.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium shadow-xs transition"
              >
                <span>Student & Lead Sign In</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              <Link
                href="/login?tab=register"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-white hover:bg-slate-50 text-slate-800 font-medium border border-slate-200/90 shadow-xs transition"
              >
                <span>Register New Student</span>
              </Link>
            </div>

            {/* Metrics Ribbon */}
            <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 w-full max-w-2xl text-left">
              <div className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-xs">
                <p className="text-xl font-bold text-slate-900">5</p>
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mt-0.5">Active Campus Clubs</p>
              </div>
              <div className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-xs">
                <p className="text-xl font-bold text-slate-900">100%</p>
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mt-0.5">Interactive Client</p>
              </div>
              <div className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-xs">
                <p className="text-xl font-bold text-slate-900">Real-time</p>
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mt-0.5">Burnout Radar</p>
              </div>
              <div className="p-3.5 bg-white rounded-xl border border-slate-200/90 shadow-xs">
                <p className="text-xl font-bold text-slate-900">Atlas Ready</p>
                <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider mt-0.5">MongoDB Connected</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars: The 3 Modules */}
      <section className="py-16 bg-white border-y border-slate-200/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5 block">
              Core Architecture
            </span>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Engineered for Sustainable Campus Student Organizations
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Module 1 */}
            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center mb-4">
                  <Users className="w-5 h-5 text-slate-700" />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Module 1
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1 mb-2">
                  Clubs & Recruitment Service
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Club directories with category filtering, dynamic application pipelines, 1-click lead approvals, and member rosters with inactivity detection.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-200/70">
                <Link
                  href="/clubs"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 hover:text-slate-700"
                >
                  <span>Explore Clubs</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Module 2 */}
            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center mb-4">
                  <Flame className="w-5 h-5 text-slate-700" />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Module 2
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1 mb-2">
                  Task Boards & Burnout Radar
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Kanban workflow with 5 task states, automated task delegation recommendations, submission verification, and lead concentration alerts.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-200/70">
                <Link
                  href="/tasks"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 hover:text-slate-700"
                >
                  <span>Open Task Board</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Module 3 */}
            <div className="p-6 rounded-xl bg-slate-50 border border-slate-200/90 flex flex-col justify-between">
              <div>
                <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 text-slate-700 flex items-center justify-center mb-4">
                  <BarChart3 className="w-5 h-5 text-slate-700" />
                </div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Module 3
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1 mb-2">
                  Activity Credits & Council Reports
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mb-4">
                  Pulse surveys measuring workload fairness, sentiment tracking, CSV exports, and printable quarterly council governance reports.
                </p>
              </div>
              <div className="pt-3 border-t border-slate-200/70">
                <Link
                  href="/analytics"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 hover:text-slate-700"
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
      <section className="py-14 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-xl p-5 sm:p-6 border border-slate-200/90 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                  Campus Organization
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-1">
                  Google Developer Student Club (GDSC)
                </h3>
                <p className="text-xs text-slate-500">
                  Lead: Priya Patel • 38 Active Members • Active Recruitment
                </p>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <Link
                  href="/clubs/club_gdsc"
                  className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition"
                >
                  View Profile
                </Link>
                <Link
                  href="/tasks?club=club_gdsc"
                  className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium transition shadow-xs"
                >
                  View Tasks
                </Link>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <Link
                href="/recruitment"
                className="p-3.5 rounded-lg bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 transition flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-slate-900">Recruitment</p>
                  <p className="text-[11px] text-slate-500">Review applicants</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <Link
                href="/workload"
                className="p-3.5 rounded-lg bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 transition flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-slate-900">Burnout Radar</p>
                  <p className="text-[11px] text-slate-500">Workload balance</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
              <Link
                href="/contributions"
                className="p-3.5 rounded-lg bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 transition flex items-center justify-between"
              >
                <div>
                  <p className="font-semibold text-slate-900">Verified Ledger</p>
                  <p className="text-[11px] text-slate-500">Activity credits</p>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-6 bg-white text-slate-500 text-xs border-t border-slate-200/90">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-slate-900 flex items-center justify-center text-white">
              <Activity className="w-3 h-3" />
            </div>
            <span className="font-semibold text-slate-800">Club.ing</span>
            <span className="text-slate-400">• College Club Management Platform</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <Link href="/dashboard" className="hover:text-slate-900 transition">Dashboard</Link>
            <Link href="/login" className="hover:text-slate-900 transition">Portal Login</Link>
            <Link href="/reports" className="hover:text-slate-900 transition">Governance</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
