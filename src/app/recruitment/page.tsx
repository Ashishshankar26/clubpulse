'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import { useClubPulse } from '@/context/ClubPulseContext';
import { ApplicationStatus } from '@/types';
import { getManagedClubs, isApplicationOwnedByUser } from '@/lib/permissions';
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
  const [actionError, setActionError] = useState<string | null>(null);

  const isStudent = currentUser.role === 'student';
  const isAdmin = currentUser.role === 'admin';
  const myLeadClubs = getManagedClubs(currentUser, clubs);

  // If ordinary student, render restricted access notice directing to their my-clubs application tracking
  if (isStudent) {
    return (
      <AppShell>
        <div className="max-w-xl mx-auto my-12 bg-white rounded-xl p-8 border border-slate-200/90 shadow-xs text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
              Role Access Restricted
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-2">
              Recruitment Screening Pipeline
            </h2>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Applicant review, candidate screening, and membership admissions are strictly reserved for official Club Leads and Council Administrators. As a student applicant, you can track the status of your applications on your personal club dashboard.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/my-clubs"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition"
            >
              <span>Track My Applications</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  // Accessible clubs depending on role: Leads only see their own clubs, Admin sees all
  const accessibleClubs = isAdmin ? clubs : myLeadClubs;

  // Pipeline scoped to managed clubs
  const leadClubApps = isAdmin
    ? applications
    : applications.filter(app => myLeadClubs.some(c => c.id === app.clubId));

  const filteredApps = leadClubApps.filter(app => {
    const matchesClub =
      selectedClubId === 'all' || app.clubId === selectedClubId;
    const matchesStatus =
      selectedStatus === 'all' || app.status === selectedStatus;
    const matchesSearch =
      !searchQuery ||
      app.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.appliedRole.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.clubName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesClub && matchesStatus && matchesSearch;
  });

  const handleReview = async (status: 'approved' | 'rejected') => {
    if (!activeReviewApp) return;

    setActionError(null);
    const result = await reviewApplication(activeReviewApp.id, status, reviewNote);
    if (result.success) {
      setActionSuccess(`Application for ${activeReviewApp.userName} was marked ${status.toUpperCase()}!`);
      setTimeout(() => {
        setActionSuccess(null);
        setActiveReviewApp(null);
        setReviewNote('');
      }, 1800);
    } else {
      setActionError(result.error || 'Failed to review application.');
    }
  };

  const handleQuickReview = async (appId: string, status: 'approved' | 'rejected', notes: string) => {
    setActionError(null);
    const result = await reviewApplication(appId, status, notes);
    if (result.success) {
      setActionSuccess(`Application successfully marked ${status.toUpperCase()}!`);
      setTimeout(() => setActionSuccess(null), 2500);
    } else {
      setActionError(result.error || 'Failed to process application review.');
      setTimeout(() => setActionError(null), 4000);
    }
  };

  const getStatusBadge = (status: ApplicationStatus) => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'rejected':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'interview_scheduled':
        return 'bg-slate-100 text-slate-800 border-slate-200';
      case 'under_review':
        return 'bg-slate-100 text-slate-800 border-slate-300';
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
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
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
            <span className="text-xs font-medium text-slate-500">
              Total In Pipeline: <strong className="text-slate-900 font-semibold">{leadClubApps.length}</strong>
            </span>
          </div>
        </div>

        {/* Action feedback toasts */}
        {actionSuccess && (
          <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionSuccess} Newly approved candidates are automatically enrolled into the member directory.</span>
          </div>
        )}

        {actionError && (
          <div className="p-4 rounded-lg bg-rose-50 border border-rose-300 text-rose-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{actionError}</span>
          </div>
        )}

        {/* Filters & Search Toolbar */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search candidates by name, applied role, or club..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-slate-900 bg-slate-50/50"
              />
            </div>

            {/* Club Selector */}
            <select
              value={selectedClubId}
              onChange={e => setSelectedClubId(e.target.value)}
              className="px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 focus:outline-none focus:border-slate-900 bg-slate-50/50 font-medium"
            >
              <option value="all">
                {isAdmin ? 'All Campus Clubs' : 'All My Managed Clubs'}
              </option>
              {accessibleClubs.map(c => (
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
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition ${
                  selectedStatus === st
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200/90'
                }`}
              >
                {st.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Applicants Table / List */}
        <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
          {filteredApps.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400 space-y-2">
              <Users className="w-8 h-8 text-slate-300 mx-auto" />
              <p>No candidates match the selected filters.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredApps.map((app, idx) => (
                <div
                  key={app.id || (app as any)._id || `recruit_app_${idx}`}
                  className="p-5 hover:bg-slate-50/80 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4 min-w-0 flex-1">
                    <img
                      src={
                        app.userAvatar ||
                        `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                          app.userName
                        )}&backgroundColor=0f172a,1e293b,334155&textColor=ffffff`
                      }
                      alt={app.userName}
                      className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200 shrink-0"
                    />
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-sm text-slate-900 truncate">{app.userName}</h3>
                        <span className="text-xs text-slate-500 shrink-0">({app.department})</span>
                        <span
                          className={`px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border shrink-0 ${getStatusBadge(
                            app.status
                          )}`}
                        >
                          {app.status.replace('_', ' ')}
                        </span>
                      </div>

                      <p className="text-xs font-semibold text-slate-800 truncate">
                        {app.clubName} • Applied for: <strong>{app.appliedRole}</strong>
                      </p>

                      <p
                        className="text-xs text-slate-600 truncate break-all italic max-w-xl"
                        title={app.statementOfPurpose}
                      >
                        "{app.statementOfPurpose}"
                      </p>

                      {/* Skills Chips */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {app.skills.map((s, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium"
                          >
                            {s}
                          </span>
                        ))}
                        {app.portfolioUrl && (
                          <a
                            href={app.portfolioUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[10px] text-slate-900 font-semibold hover:underline flex items-center gap-1 ml-1"
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
                    {isApplicationOwnedByUser(app, currentUser) ? (
                      <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-800 border border-slate-300 text-xs font-semibold">
                        Your Application • Self-Approval Prohibited
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setActiveReviewApp(app);
                            setReviewNote(app.notes || '');
                          }}
                          className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium transition"
                        >
                          Inspect & Review
                        </button>

                        {app.status !== 'approved' && (
                          <button
                            onClick={() => handleQuickReview(app.id, 'approved', 'Quick approved by lead')}
                            className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium shadow-xs transition"
                            title="1-Click Approve (instantly adds to club)"
                          >
                            Approve
                          </button>
                        )}

                        {app.status !== 'rejected' && app.status !== 'approved' && (
                          <button
                            onClick={() => handleQuickReview(app.id, 'rejected', 'Position filled')}
                            className="px-3 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-medium border border-rose-200 transition"
                          >
                            Reject
                          </button>
                        )}
                      </>
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
            <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200/90 space-y-5 animate-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <img
                    src={
                      activeReviewApp.userAvatar ||
                      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(
                        activeReviewApp.userName
                      )}&backgroundColor=0f172a,1e293b,334155&textColor=ffffff`
                    }
                    alt={activeReviewApp.userName}
                    className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200"
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
                  <p className="mt-1 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-slate-700 leading-relaxed break-words break-all">
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
                        className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 font-medium border border-slate-200"
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
                      className="mt-1 text-slate-900 font-semibold hover:underline flex items-center gap-1.5 break-all"
                    >
                      <span className="truncate">{activeReviewApp.portfolioUrl}</span>
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
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
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-slate-900 focus:border-slate-900 bg-white text-slate-900"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                {isApplicationOwnedByUser(activeReviewApp, currentUser) ? (
                  <span className="text-xs text-slate-800 font-semibold bg-slate-100 border border-slate-300 px-3 py-1.5 rounded-lg">
                    Self-Review Prohibited (Integrity Policy)
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleReview('rejected')}
                    className="px-4 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200 transition"
                  >
                    Reject Candidate
                  </button>
                )}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveReviewApp(null)}
                    className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 text-xs font-semibold"
                  >
                    Close
                  </button>
                  {!isApplicationOwnedByUser(activeReviewApp, currentUser) && (
                    <button
                      type="button"
                      onClick={() => handleReview('approved')}
                      className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition"
                    >
                      Approve & Add to Club
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
