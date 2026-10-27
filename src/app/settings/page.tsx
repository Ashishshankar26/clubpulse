'use client';

import React, { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { useClubPulse } from '@/context/ClubPulseContext';
import {
  Settings,
  RotateCcw,
  Shield,
  Database,
  Key,
  Server,
  Code2,
  CheckCircle2,
  Download,
  Award,
} from 'lucide-react';

export default function SettingsDemoConfigPage() {
  const { currentUser, resetToInitialData } = useClubPulse();
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all demo changes back to the initial dataset?')) {
      resetToInitialData();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    }
  };

  const handleExportStateJSON = () => {
    const state = localStorage.getItem('clubpulse_demo_state_v1');
    if (!state) return;

    const blob = new Blob([state], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `clubpulse_demo_backup_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
            Configuration & Architecture
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Demo Settings & Backend Integration Map
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 mt-1">
            Configure local demo simulation state and view integration points prepared for tomorrow's backend rollout.
          </p>
        </div>

        {/* Success toast */}
        {resetSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Demo state was reset to default! All mock clubs, tasks, and users restored.</span>
          </div>
        )}

        {/* Active Persona Card */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Current Simulated Persona
          </h2>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-4">
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-14 h-14 rounded-2xl object-cover ring-2 ring-indigo-200"
              />
              <div>
                <h3 className="font-extrabold text-base text-slate-900">{currentUser.name}</h3>
                <p className="text-xs text-slate-500">{currentUser.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] font-bold uppercase bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                    {currentUser.role.replace('_', ' ')}
                  </span>
                  <span className="text-xs text-slate-600 font-medium">
                    {currentUser.department}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Verified XP</span>
              <span className="text-xl font-black text-indigo-600">{currentUser.xpPoints} XP</span>
            </div>
          </div>
        </div>

        {/* Demo State Operations */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Demo Storage Controls (Browser Local Storage)
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            All changes made during today's demo (applications submitted, tasks approved, feedback logged) persist locally in your browser so you can switch roles seamlessly without resetting midway.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={handleReset}
              className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4 text-rose-600" />
              <span>Reset Demo State to Initial Data</span>
            </button>

            <button
              onClick={handleExportStateJSON}
              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span>Export State Snapshot (JSON)</span>
            </button>
          </div>
        </div>

        {/* Tomorrow's Backend Architecture Map */}
        <div className="bg-slate-900 text-slate-200 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">
              Tomorrow's Integration Blueprint
            </span>
            <h2 className="text-xl font-black text-white mt-1">
              Backend Service Contracts & Planned Endpoints
            </h2>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Today's UI strictly isolates client data calls via <code className="text-indigo-300">@/lib/api.ts</code> and <code className="text-indigo-300">ClubPulseContext</code>. Tomorrow, drop in the following REST/Postgres routes without refactoring any UI views:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 font-bold">
                <Key className="w-4 h-4" />
                <span>1. Auth & Session Service</span>
              </div>
              <p className="text-slate-300 text-[11px]">
                <code>POST /api/auth/login</code> • NextAuth.js or Supabase Auth with university email SSO verification.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 font-bold">
                <Database className="w-4 h-4" />
                <span>2. Clubs & Recruitment Database</span>
              </div>
              <p className="text-slate-300 text-[11px]">
                <code>GET /api/clubs</code> • <code>POST /api/applications/:id/approve</code> • Prisma ORM / PostgreSQL with relations.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 font-bold">
                <Server className="w-4 h-4" />
                <span>3. Tasks & Workload Telemetry</span>
              </div>
              <p className="text-slate-300 text-[11px]">
                <code>POST /api/tasks</code> • <code>PATCH /api/tasks/:id/status</code> • Real-time websockets for Kanban sync.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-2">
              <div className="flex items-center gap-2 text-indigo-400 font-bold">
                <Award className="w-4 h-4" />
                <span>4. Verified Ledger & Cryptography</span>
              </div>
              <p className="text-slate-300 text-[11px]">
                <code>GET /api/contributions</code> • SHA-256 certificate hashing for verifiable student activity transcripts.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
