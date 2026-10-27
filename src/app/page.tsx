'use client';

import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import DemoBanner from '@/components/layout/DemoBanner';
import { useClubPulse } from '@/context/ClubPulseContext';
import {
  Activity,
  Flame,
  UserCheck,
  CheckCircle2,
  Award,
  ArrowRight,
  Shield,
  Zap,
  Users,
  BarChart3,
  Sparkles,
  ChevronRight,
  LayoutDashboard,
} from 'lucide-react';

export default function HomePage() {
  const { clubs, currentUser, switchRole } = useClubPulse();

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <DemoBanner />
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/60 via-slate-50 to-white"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-6">
            
            {/* Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold shadow-sm">
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-600"></span>
              </span>
              <span>P18 Live Demonstration • Client-Side Simulation</span>
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 leading-tight sm:leading-none">
              Solve the{' '}
              <span className="bg-gradient-to-r from-rose-600 via-amber-600 to-indigo-600 bg-clip-text text-transparent">
                Ghost Members & Burnout Leads
              </span>{' '}
              Problem in College Clubs.
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-slate-600 max-w-2xl leading-relaxed">
              Every semester, 80% of members vanish after recruitment, leaving 1 or 2 exhausted leads to do everything.
              <strong> Club.ing</strong> balances task velocity, visualizes workload burnout risk, and provides verified contribution portfolios.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-lg shadow-indigo-600/25 transition group"
              >
                <span>Launch Live Dashboard</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </Link>

              <Link
                href="/demo-select"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 font-semibold text-sm border border-slate-300 shadow-sm transition"
              >
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Switch Personas (3 Roles)</span>
              </Link>
            </div>

            {/* Quick stats ribbon */}
            <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-2xl">
              <div className="p-3 bg-white/80 rounded-2xl border border-slate-200/80 shadow-sm">
                <p className="text-2xl font-extrabold text-indigo-600">5</p>
                <p className="text-[11px] font-medium text-slate-500 uppercase">Active Campus Clubs</p>
              </div>
              <div className="p-3 bg-white/80 rounded-2xl border border-slate-200/80 shadow-sm">
                <p className="text-2xl font-extrabold text-emerald-600">100%</p>
                <p className="text-[11px] font-medium text-slate-500 uppercase">Frontend Interactive</p>
              </div>
              <div className="p-3 bg-white/80 rounded-2xl border border-slate-200/80 shadow-sm">
                <p className="text-2xl font-extrabold text-amber-600">Real-time</p>
                <p className="text-[11px] font-medium text-slate-500 uppercase">Burnout Detection</p>
              </div>
              <div className="p-3 bg-white/80 rounded-2xl border border-slate-200/80 shadow-sm">
                <p className="text-2xl font-extrabold text-purple-600">Zero DB</p>
                <p className="text-[11px] font-medium text-slate-500 uppercase">No Backend Needed Today</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Pillars: The 3 Modules */}
      <section className="py-16 bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-xs font-bold uppercase tracking-wider text-indigo-600 mb-2">
              Three Comprehensive Modules
            </h2>
            <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Engineered for Sustainable Campus Organizations
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Module 1 */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 hover:shadow-xl transition-all">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center mb-5 font-bold">
                <Users className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
                Module 1
              </span>
              <h4 className="text-xl font-bold text-slate-900 mt-1 mb-2">
                Clubs & Recruitment Service
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Club discovery with category filters, detailed profiles, dynamic application pipelines, 1-click lead approvals, and member directories with ghost activity tracking.
              </p>
              <div className="space-y-2 pt-2 border-t border-slate-200/60 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>5 Filterable clubs with live vacancies</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>1-Click applicant screening & onboarding</span>
                </div>
              </div>
              <Link
                href="/clubs"
                className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800"
              >
                <span>Explore Clubs</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Module 2 */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 hover:shadow-xl transition-all">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mb-5 font-bold">
                <Flame className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
                Module 2
              </span>
              <h4 className="text-xl font-bold text-slate-900 mt-1 mb-2">
                Tasks & Burnout Mitigation
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Interactive Kanban boards with 5 status columns, task delegation, submission reviews, verifiable contribution hashes, and lead burnout warning indicators.
              </p>
              <div className="space-y-2 pt-2 border-t border-slate-200/60 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>5-Column Kanban with real-time status</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Verified XP ledger & portfolio certificate</span>
                </div>
              </div>
              <Link
                href="/tasks"
                className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800"
              >
                <span>Open Kanban Board</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {/* Module 3 */}
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 hover:shadow-xl transition-all">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center mb-5 font-bold">
                <BarChart3 className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-purple-600">
                Module 3
              </span>
              <h4 className="text-xl font-bold text-slate-900 mt-1 mb-2">
                Feedback & Council Analytics
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed mb-4">
                Pulse surveys on workload fairness and event fatigue, sentiment analytics, CSV data exports, and print-ready quarterly council governance reports.
              </p>
              <div className="space-y-2 pt-2 border-t border-slate-200/60 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Interactive activity trends & satisfaction KPIs</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>Client-side CSV export & print report</span>
                </div>
              </div>
              <Link
                href="/analytics"
                className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800"
              >
                <span>View Analytics</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Live Interactive Showcase Preview */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
              <div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                  Live Snapshot
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-0.5">
                  Featured Club: Google Developer Student Club (GDSC)
                </h3>
                <p className="text-xs text-slate-500">
                  Lead: Priya Patel • 38 Members • Active Recruitment
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href="/clubs/club_gdsc"
                  className="px-3.5 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 transition"
                >
                  View Profile
                </Link>
                <Link
                  href="/tasks?club=club_gdsc"
                  className="px-3.5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-sm transition"
                >
                  View Tasks
                </Link>
              </div>
            </div>

            {/* Quick Alert Banner */}
            <div className="my-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3">
              <Flame className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1 text-xs">
                <strong className="text-amber-900 font-bold block">
                  Lead Burnout Risk Warning (Score: 68/100)
                </strong>
                <span className="text-amber-800 mt-0.5 block">
                  Priya is currently assigned 65% of all active GDSC tasks with 2 overdue items. Switch to Lead persona to reassign tasks to available core members like Aarav and Ananya.
                </span>
              </div>
            </div>

            {/* 3 Quick Action Links */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <Link
                href="/recruitment"
                className="p-4 rounded-2xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 transition flex items-center justify-between group"
              >
                <div>
                  <p className="font-bold text-slate-800">Recruitment Pipeline</p>
                  <p className="text-[11px] text-slate-500">Review pending applicants</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition" />
              </Link>
              <Link
                href="/workload"
                className="p-4 rounded-2xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 transition flex items-center justify-between group"
              >
                <div>
                  <p className="font-bold text-slate-800">Workload Balance</p>
                  <p className="text-[11px] text-slate-500">Detect ghost members</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition" />
              </Link>
              <Link
                href="/contributions"
                className="p-4 rounded-2xl bg-slate-50 hover:bg-indigo-50/50 border border-slate-200 transition flex items-center justify-between group"
              >
                <div>
                  <p className="font-bold text-slate-800">Verified Ledger</p>
                  <p className="text-[11px] text-slate-500">Portfolio proof of work</p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 group-hover:translate-x-1 transition" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 bg-slate-900 text-slate-400 text-xs border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
              <Activity className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-200">Club.ing</span>
            <span>• College Club Contribution & Management Platform</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <Link href="/dashboard" className="hover:text-white transition">Dashboard</Link>
            <Link href="/demo-select" className="hover:text-white transition">Role Selector</Link>
            <Link href="/reports" className="hover:text-white transition">Club Reports</Link>
            <span className="text-slate-600">|</span>
            <span className="text-emerald-400 font-semibold">Demo Mode Active</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
