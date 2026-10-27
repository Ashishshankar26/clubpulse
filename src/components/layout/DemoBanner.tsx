'use client';

import React from 'react';
import { useClubPulse } from '@/context/ClubPulseContext';
import { Sparkles, RotateCcw, ShieldCheck, Zap } from 'lucide-react';

export default function DemoBanner() {
  const { currentUser, switchRole, resetToInitialData } = useClubPulse();

  return (
    <div className="demo-banner bg-gradient-to-r from-indigo-900 via-indigo-950 to-purple-950 text-white px-4 py-2 text-xs border-b border-indigo-800/60 shadow-inner">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="font-semibold tracking-wide text-indigo-200 uppercase text-[10px] bg-indigo-800/80 px-2 py-0.5 rounded border border-indigo-700">
            Frontend Demo
          </span>
          <span className="text-slate-300 hidden sm:inline">
            Solving the <strong>Ghost Members & Burnout Leads</strong> problem. Active as:
          </span>
          <span className="font-bold text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
            {currentUser.name} ({currentUser.role === 'club_lead' ? 'Club Lead' : currentUser.role === 'admin' ? 'Campus Admin' : 'Student Member'})
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center bg-indigo-950/80 rounded-lg p-0.5 border border-indigo-800 text-[11px]">
            <button
              onClick={() => switchRole('student')}
              className={`px-2 py-1 rounded transition font-medium ${
                currentUser.role === 'student'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Member
            </button>
            <button
              onClick={() => switchRole('club_lead')}
              className={`px-2 py-1 rounded transition font-medium ${
                currentUser.role === 'club_lead'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Lead (Priya)
            </button>
            <button
              onClick={() => switchRole('admin')}
              className={`px-2 py-1 rounded transition font-medium ${
                currentUser.role === 'admin'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Dean/Admin
            </button>
          </div>

          <button
            onClick={() => {
              if (confirm('Reset all demo data back to initial state?')) {
                resetToInitialData();
              }
            }}
            title="Reset demo data"
            className="flex items-center gap-1 px-2 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded border border-slate-700 transition"
          >
            <RotateCcw className="w-3 h-3 text-slate-400" />
            <span className="hidden md:inline">Reset Demo</span>
          </button>
        </div>
      </div>
    </div>
  );
}
