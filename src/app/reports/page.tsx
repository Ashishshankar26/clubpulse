'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import { useClubPulse } from '@/context/ClubPulseContext';
import { calculateClubKPIs } from '@/lib/metrics';
import {
  FileText,
  Printer,
  Download,
  Calendar,
  Building,
  CheckCircle2,
  AlertTriangle,
  Award,
  Users,
} from 'lucide-react';

export default function ClubReportsPage() {
  const { clubs, tasks, feedbacks, contributions } = useClubPulse();

  const [selectedClubId, setSelectedClubId] = useState<string>('all');
  const [reportTerm, setReportTerm] = useState('Fall Semester 2026');

  const targetClubs =
    selectedClubId === 'all'
      ? clubs
      : clubs.filter(c => c.id === selectedClubId);

  const totalTasksDelivered = tasks.filter(t => t.status === 'completed').length;
  const totalVerifiedXP = contributions.reduce((acc, c) => acc + c.xpEarned, 0);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header Controls (Hidden on print) */}
        <div className="no-print flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
              Module 3 • Executive Governance
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Print-Friendly Club Experience & Audit Report
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Official campus activity council quarterly summary ready for PDF export and institutional review.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedClubId}
              onChange={e => setSelectedClubId(e.target.value)}
              className="p-2 rounded-xl border border-slate-200 bg-white font-bold text-xs shadow-sm"
            >
              <option value="all">All 5 Campus Clubs</option>
              {clubs.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save as PDF</span>
            </button>
          </div>
        </div>

        {/* Printable Report Document Card */}
        <div className="printable-card bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-lg space-y-8 max-w-4xl mx-auto">
          {/* Institutional Letterhead */}
          <div className="border-b-2 border-slate-900 pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-indigo-800">
                CAMPUS STUDENT ACTIVITIES & COUNCIL GOVERNANCE
              </p>
              <h2 className="text-2xl font-black text-slate-900 mt-1">
                Student Organizations Performance & Health Audit
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Evaluation Period: <strong>{reportTerm}</strong> • Published via Club.ing OS
              </p>
            </div>

            <div className="text-right text-xs text-slate-500 shrink-0">
              <p>Generated: <strong>October 27, 2026</strong></p>
              <p className="font-mono text-[10px]">Report ID: CP-REP-2026-Q4</p>
            </div>
          </div>

          {/* Executive Summary Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Total Enrolled</span>
              <p className="text-xl font-black text-slate-900 mt-0.5">150+ Students</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Tasks Verified</span>
              <p className="text-xl font-black text-emerald-600 mt-0.5">{totalTasksDelivered} Delivered</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Verified Credits</span>
              <p className="text-xl font-black text-indigo-600 mt-0.5">{totalVerifiedXP} XP</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400">Compliance Rate</span>
              <p className="text-xl font-black text-purple-600 mt-0.5">98.2%</p>
            </div>
          </div>

          {/* Club Detailed Performance Tables */}
          <div className="space-y-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-200">
              Individual Club Audits & Burnout Risk Matrix
            </h3>

            {targetClubs.map(c => {
              const kpi = calculateClubKPIs(c, tasks, feedbacks);
              return (
                <div
                  key={c.id}
                  className="p-5 rounded-2xl border border-slate-200 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-base text-slate-900">{c.name}</h4>
                      <p className="text-xs text-slate-500">
                        Lead: <strong>{c.leadName}</strong> ({c.leadEmail}) • Founded: {c.foundedYear}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          c.burnoutScore >= 60
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        Burnout: {c.burnoutScore}/100 ({kpi.burnoutRiskLevel})
                      </span>
                      <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                        Health: {c.healthScore}/100
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {c.description}
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Participation:</span>
                      <p className="font-bold text-slate-800">{kpi.participationRate}%</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Task Velocity:</span>
                      <p className="font-bold text-slate-800">{kpi.taskCompletionRate}% ({kpi.completedTasks}/{kpi.totalTasks})</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Ghost Member Risk:</span>
                      <p className="font-bold text-rose-600">{kpi.ghostMemberCount} Flagged</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">Satisfaction (CSAT):</span>
                      <p className="font-bold text-purple-600">{kpi.averageSatisfaction}/5.0</p>
                    </div>
                  </div>

                  {/* Achievements */}
                  <div className="pt-2 text-[11px] text-slate-600">
                    <strong className="text-slate-800">Recent Milestones:</strong>{' '}
                    {c.achievements.join(' • ')}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Institutional Sign-off Footer */}
          <div className="pt-8 border-t-2 border-slate-200 grid grid-cols-2 gap-8 text-xs text-slate-600">
            <div>
              <p className="font-bold text-slate-900 text-sm">Dr. Rajesh Kumar</p>
              <p className="text-slate-500">Dean of Student Affairs & Activity Council</p>
              <p className="text-[10px] text-slate-400 mt-2 font-mono">Digital Signature Stamp: 0x8F91A23D9E</p>
            </div>
            <div className="text-right">
              <p className="font-bold text-slate-900 text-sm">Official Council Verification</p>
              <p className="text-slate-500">All metrics calculated via Club.ing telemetry</p>
              <p className="text-[10px] text-slate-400 mt-2">Certified for Academic Year 2026</p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
