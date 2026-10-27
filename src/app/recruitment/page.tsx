'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import { useClubPulse } from '@/context/ClubPulseContext';
import { ApplicationStatus } from '@/types';
import {
  Users,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  ExternalLink,
  MessageSquare,
  X,
  FileCheck,
  Calendar,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';

const STATUS_FILTERS: ('all' | ApplicationStatus)[] = [
  'all',
  'pending',
  'under_review',
  'interview_scheduled',
  'approved',
  'rejected',
];

export default function RecruitmentManagementPage() {
  const {
    currentUser,
    clubs,
    applications,
    reviewApplication,
  } = useClubPulse();

  const [selectedClubId, setSelectedClubId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<'all' | ApplicationStatus>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeReviewApp, setActiveReviewApp] = useState<any | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Accessible clubs depending on role
  const filteredApps = applications.filter(app => {
    const matchesClub =
      selectedClubId === 'all' || app.clubId === selectedClubId;
    const matchesStatus =
      selectedStatus === 'all' || app.status === selectedStatus;
    const matchesSearch =
      app.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.appliedRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.clubName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesClub && matchesStatus && matchesSearch;
  });

  const handleReview = (status: 'approved' | 'rejected') => {
    if (!activeReviewApp) return;

    reviewApplication(activeReviewApp.id, status, reviewNote);
    setActionSuccess(`Application for ${activeReviewApp.userName} was marked ${status.toUpperCase()}!`);
    setTimeout(() => {
      setActionSuccess(null);
      setActiveReviewApp(null);
      setReviewNote('');
    }, 1800);
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'rejected':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'interview_scheduled':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'under_review':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
              Module 1 • Recruitment Management
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Applicant Review & Screening Pipeline
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Review candidate statements, inspect portfolios, schedule interviews, and approve candidates with 1-click.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">
              Total In Pipeline: <strong>{applications.length}</strong>
            </span>
          </div>
        </div>

        {/* Action feedback toast */}
        {actionSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccess} Newly approved candidates are automatically enrolled into the member directory.</span>
          </div>
        )}

        {/* Filters & Search Toolbar */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search candidates by name, applied role, or club..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
              />
            </div>

            {/* Club Selector */}
            <select
              value={selectedClubId}
              onChange={e => setSelectedClubId(e.target.value)}
              className="px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50 font-medium"
            >
              <option value="all">All Campus Clubs</option>
              {clubs.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
              Status:
            </span>
            {STATUS_FILTERS.map(st => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold capitalize transition ${
                  selectedStatus === st
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Applicants Table / List */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          {filteredApps.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400 space-y-2">
              <Users className="w-8 h-8 text-slate-300 mx-auto" />
              <p>No candidates match the selected filters.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredApps.map(app => (
                <div
                  key={app.id}
                  className="p-5 hover:bg-slate-50/80 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={app.userAvatar}
                      alt={app.userName}
                      className="w-12 h-12 rounded-2xl object-cover ring-2 ring-indigo-50 shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-sm text-slate-900">{app.userName}</h3>
                        <span className="text-xs text-slate-500">({app.department})</span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusBadge(
                            app.status
                          )}`}
                        >
                          {app.status.replace('_', ' ')}
                        </span>
                      </div>

                      <p className="text-xs font-semibold text-indigo-700">
                        {app.clubName} • Applied for: <strong>{app.appliedRole}</strong>
                      </p>

                      <p className="text-xs text-slate-600 line-clamp-1 italic max-w-xl">
                        "{app.statementOfPurpose}"
                      </p>

                      {/* Skills Chips */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {app.skills.map((s, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md font-medium"
                          >
                            {s}
                          </span>
                        ))}
                        {app.portfolioUrl && (
                          <a
                            href={app.portfolioUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-indigo-600 font-semibold hover:underline flex items-center gap-1 ml-1"
                          >
                            <span>Portfolio Link</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    <button
                      onClick={() => {
                        setActiveReviewApp(app);
                        setReviewNote(app.notes || '');
                      }}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition"
                    >
                      Inspect & Review
                    </button>

                    {app.status !== 'approved' && (
                      <button
                        onClick={() => reviewApplication(app.id, 'approved', 'Quick approved by lead')}
                        className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition"
                        title="1-Click Approve (instantly adds to club)"
                      >
                        Approve
                      </button>
                    )}

                    {app.status !== 'rejected' && app.status !== 'approved' && (
                      <button
                        onClick={() => reviewApplication(app.id, 'rejected', 'Position filled')}
                        className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition"
                      >
                        Reject
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detailed Review Dialog */}
        {activeReviewApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <img
                    src={activeReviewApp.userAvatar}
                    alt={activeReviewApp.userName}
                    className="w-12 h-12 rounded-2xl object-cover ring-2 ring-indigo-100"
                  />
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">
                      {activeReviewApp.userName}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Applying for <strong>{activeReviewApp.appliedRole}</strong> in {activeReviewApp.clubName}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveReviewApp(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <span className="font-bold text-slate-400 uppercase text-[10px] block">
                    Statement of Purpose:
                  </span>
                  <p className="mt-1 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-slate-700 leading-relaxed">
                    {activeReviewApp.statementOfPurpose}
                  </p>
                </div>

                <div>
                  <span className="font-bold text-slate-400 uppercase text-[10px] block">
                    Candidate Skills:
                  </span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {activeReviewApp.skills.map((s: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-semibold border border-indigo-200"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>

                {activeReviewApp.portfolioUrl && (
                  <div>
                    <span className="font-bold text-slate-400 uppercase text-[10px] block">
                      Portfolio / Samples:
                    </span>
                    <a
                      href={activeReviewApp.portfolioUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 text-indigo-600 font-bold hover:underline flex items-center gap-1.5"
                    >
                      <span>{activeReviewApp.portfolioUrl}</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}

                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Reviewer Notes / Feedback:
                  </label>
                  <textarea
                    rows={2}
                    value={reviewNote}
                    onChange={e => setReviewNote(e.target.value)}
                    placeholder="Add interview assessment notes or feedback..."
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => handleReview('rejected')}
                  className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition"
                >
                  Reject Candidate
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveReviewApp(null)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-semibold"
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReview('approved')}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition"
                  >
                    Approve & Add to Club
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
