'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import { useClubPulse } from '@/context/ClubPulseContext';
import { Contribution } from '@/types';
import { isContributionOwnedByUser } from '@/lib/permissions';
import {
  Award,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  ExternalLink,
  Download,
  Printer,
  Sparkles,
  Search,
  Filter,
  X,
} from 'lucide-react';

export default function ContributionsLedgerPage() {
  const { currentUser, contributions, clubs } = useClubPulse();

  const [selectedClubId, setSelectedClubId] = useState<string>('all');
  const [selectedUserFilter, setSelectedUserFilter] = useState<'me' | 'all'>('me');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCertificate, setSelectedCertificate] = useState<Contribution | null>(null);

  const displayedContribs = contributions.filter(c => {
    const matchesUser = selectedUserFilter === 'all' || isContributionOwnedByUser(c, currentUser);
    const matchesClub = selectedClubId === 'all' || c.clubId === selectedClubId;
    const matchesSearch =
      c.taskTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.category.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesUser && matchesClub && matchesSearch;
  });

  const myTotalXp = contributions
    .filter(c => isContributionOwnedByUser(c, currentUser))
    .reduce((acc, c) => acc + c.xpEarned, 0);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Module 2 • Proof-of-Work Ledger
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
              Verified Contribution Portfolio & Ledger
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Every verified task generates an immutable proof-of-work certificate signed by club leadership for campus credits and resumes.
            </p>
          </div>

          {/* XP Banner */}
          <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/60 px-4 py-2.5 rounded-xl border border-slate-200/90 dark:border-slate-700 shadow-2xs transition-colors">
            <div className="w-9 h-9 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">My Verified XP</p>
              <p className="text-lg font-bold text-slate-900 dark:text-white">{currentUser.xpPoints} XP</p>
            </div>
          </div>
        </div>

        {/* Toolbar & Filter */}
        <div className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by task title, category, or member..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-slate-900 dark:focus:border-slate-400 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors"
              />
            </div>

            {/* User Scope Filter */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs font-medium transition-colors">
              <button
                onClick={() => setSelectedUserFilter('me')}
                className={`px-3 py-1.5 rounded-md transition ${
                  selectedUserFilter === 'me'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                My Portfolio
              </button>
              <button
                onClick={() => setSelectedUserFilter('all')}
                className={`px-3 py-1.5 rounded-md transition ${
                  selectedUserFilter === 'all'
                    ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                All Campus Ledger
              </button>
            </div>

            {/* Club Selector */}
            <select
              value={selectedClubId}
              onChange={e => setSelectedClubId(e.target.value)}
              className="px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-slate-900 dark:focus:border-slate-400 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white font-medium transition-colors"
            >
              <option value="all">All Clubs</option>
              {clubs.map(c => (
                <option key={c.id} value={c.id}>
                  {c.shortName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Contributions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayedContribs.length === 0 ? (
            <div className="col-span-full bg-white dark:bg-slate-900 rounded-xl p-12 border border-slate-200/90 dark:border-slate-800 text-center space-y-3 transition-colors">
              <Award className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-slate-700 dark:text-slate-300 font-bold text-sm">No verified contributions found</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                When club leads review and approve your submitted tasks, verified entries with cryptographic hashes will appear here.
              </p>
            </div>
          ) : (
            displayedContribs.map(item => (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-sm transition space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 rounded">
                      {item.category}
                    </span>
                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      +{item.xpEarned} XP
                    </span>
                  </div>

                  <h3 className="font-extrabold text-sm text-slate-900 dark:text-white mt-2">
                    {item.taskTitle}
                  </h3>

                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Organization: <strong>{item.clubName}</strong>
                  </p>

                  <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-[11px] space-y-1">
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span>Contributor:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{item.userName}</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                      <span>Verified By:</span>
                      <strong className="text-slate-800 dark:text-slate-200">{item.verifiedBy}</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 dark:text-slate-400 font-mono text-[10px]">
                      <span>Audit Hash:</span>
                      <span className="text-slate-800 dark:text-slate-300 font-mono font-medium">{item.certificateHash}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400 dark:text-slate-500 text-[11px]">
                    Verified: {item.verifiedAt}
                  </span>

                  <button
                    onClick={() => setSelectedCertificate(item)}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-medium text-xs shadow-xs flex items-center gap-1 transition"
                  >
                    <span>View Certificate</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Certificate Modal */}
        {selectedCertificate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-xl max-w-xl w-full p-6 sm:p-8 shadow-xl border border-slate-200/90 dark:border-slate-800 space-y-6 animate-in zoom-in-95 relative printable-card transition-colors">
              <button
                onClick={() => setSelectedCertificate(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 no-print"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Certificate Border & Header */}
              <div className="text-center space-y-2 border-b border-slate-100 dark:border-slate-800 pb-4">
                <div className="w-12 h-12 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 flex items-center justify-center mx-auto shadow-xs">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400">
                  Club.ing Campus Contribution Certificate
                </h3>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                  Verified Contribution Credit
                </h2>
              </div>

              {/* Certificate Body */}
              <div className="text-center space-y-3 py-2 text-xs">
                <p className="text-slate-500 dark:text-slate-400 uppercase tracking-wider text-[10px]">
                  This certifies that
                </p>
                <p className="text-2xl font-black text-slate-900 dark:text-white font-serif">
                  {selectedCertificate.userName}
                </p>
                <p className="text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed">
                  has successfully performed and submitted verified work deliverables for{' '}
                  <strong className="text-slate-800 dark:text-slate-100">{selectedCertificate.taskTitle}</strong> under the registered organization{' '}
                  <strong className="text-slate-800 dark:text-slate-100">{selectedCertificate.clubName}</strong>.
                </p>

                <div className="py-4 my-2 grid grid-cols-2 gap-4 max-w-md mx-auto bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold block">
                      Activity Category
                    </span>
                    <strong className="text-slate-800 dark:text-slate-200 text-sm">{selectedCertificate.category}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-bold block">
                      Verified XP Awarded
                    </span>
                    <strong className="text-slate-900 dark:text-white text-sm">+{selectedCertificate.xpEarned} XP</strong>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between max-w-md mx-auto text-left text-[11px] text-slate-500 dark:text-slate-400">
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-200">{selectedCertificate.verifiedBy}</p>
                    <p className="text-[10px]">Authorized Lead Signature</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-800 dark:text-slate-200">{selectedCertificate.date}</p>
                    <p className="text-[10px]">Verification Date</p>
                  </div>
                </div>

                <div className="pt-2 font-mono text-[10px] text-slate-400 dark:text-slate-500">
                  Audit Hash: {selectedCertificate.certificateHash}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2 no-print">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-medium transition flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Certificate</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCertificate(null)}
                  className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-medium shadow-xs transition"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
