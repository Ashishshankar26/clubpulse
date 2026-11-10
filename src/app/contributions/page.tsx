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
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Module 2 • Proof-of-Work Ledger
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Verified Contribution Portfolio & Ledger
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Every verified task generates an immutable proof-of-work certificate signed by club leadership for campus credits and resumes.
            </p>
          </div>

          {/* XP Banner */}
          <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200/90 shadow-2xs">
            <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500">My Verified XP</p>
              <p className="text-lg font-bold text-slate-900">{currentUser.xpPoints} XP</p>
            </div>
          </div>
        </div>

        {/* Toolbar & Filter */}
        <div className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by task title, category, or member..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-slate-900 bg-slate-50/50"
              />
            </div>

            {/* User Scope Filter */}
            <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-medium">
              <button
                onClick={() => setSelectedUserFilter('me')}
                className={`px-3 py-1.5 rounded-md transition ${
                  selectedUserFilter === 'me'
                    ? 'bg-white text-slate-900 font-semibold shadow-xs'
                    : 'text-slate-600'
                }`}
              >
                My Portfolio
              </button>
              <button
                onClick={() => setSelectedUserFilter('all')}
                className={`px-3 py-1.5 rounded-md transition ${
                  selectedUserFilter === 'all'
                    ? 'bg-white text-slate-900 font-semibold shadow-xs'
                    : 'text-slate-600'
                }`}
              >
                All Campus Ledger
              </button>
            </div>

            {/* Club Selector */}
            <select
              value={selectedClubId}
              onChange={e => setSelectedClubId(e.target.value)}
              className="px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-slate-900 bg-slate-50/50 font-medium"
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
            <div className="col-span-full bg-white rounded-xl p-12 border border-slate-200/90 text-center space-y-3">
              <Award className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-slate-700 font-bold text-sm">No verified contributions found</p>
              <p className="text-xs text-slate-400">
                When club leads review and approve your submitted tasks, verified entries with cryptographic hashes will appear here.
              </p>
            </div>
          ) : (
            displayedContribs.map(item => (
              <div
                key={item.id}
                className="bg-white rounded-xl p-5 border border-slate-200/90 shadow-xs hover:shadow-sm transition space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded">
                      {item.category}
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      +{item.xpEarned} XP
                    </span>
                  </div>

                  <h3 className="font-extrabold text-sm text-slate-900 mt-2">
                    {item.taskTitle}
                  </h3>

                  <p className="text-xs text-slate-500 mt-0.5">
                    Organization: <strong>{item.clubName}</strong>
                  </p>

                  <div className="mt-3 p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] space-y-1">
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Contributor:</span>
                      <strong className="text-slate-800">{item.userName}</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span>Verified By:</span>
                      <strong className="text-slate-800">{item.verifiedBy}</strong>
                    </div>
                    <div className="flex items-center justify-between text-slate-600 font-mono text-[10px]">
                      <span>Audit Hash:</span>
                      <span className="text-slate-800 font-mono font-medium">{item.certificateHash}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px]">
                    Verified: {item.verifiedAt}
                  </span>

                  <button
                    onClick={() => setSelectedCertificate(item)}
                    className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs shadow-xs flex items-center gap-1 transition"
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
            <div className="bg-white rounded-xl max-w-xl w-full p-6 sm:p-8 shadow-xl border border-slate-200/90 space-y-6 animate-in zoom-in-95 relative printable-card">
              <button
                onClick={() => setSelectedCertificate(null)}
                className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 no-print"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Certificate Border & Header */}
              <div className="text-center space-y-2 border-b border-slate-100 pb-4">
                <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center mx-auto shadow-xs">
                  <Award className="w-6 h-6" />
                </div>
                <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-500">
                  Club.ing Campus Contribution Certificate
                </h3>
                <h2 className="text-xl font-bold text-slate-900">
                  Verified Contribution Credit
                </h2>
              </div>

              {/* Certificate Body */}
              <div className="text-center space-y-3 py-2 text-xs">
                <p className="text-slate-500 uppercase tracking-wider text-[10px]">
                  This certifies that
                </p>
                <p className="text-2xl font-black text-slate-900 font-serif">
                  {selectedCertificate.userName}
                </p>
                <p className="text-slate-600 max-w-md mx-auto leading-relaxed">
                  has successfully performed and submitted verified work deliverables for{' '}
                  <strong>{selectedCertificate.taskTitle}</strong> under the registered organization{' '}
                  <strong>{selectedCertificate.clubName}</strong>.
                </p>

                <div className="py-4 my-2 grid grid-cols-2 gap-4 max-w-md mx-auto bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">
                      Activity Category
                    </span>
                    <strong className="text-slate-800 text-sm">{selectedCertificate.category}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-bold block">
                      Verified XP Awarded
                    </span>
                    <strong className="text-slate-900 text-sm">+{selectedCertificate.xpEarned} XP</strong>
                  </div>
                </div>

                <div className="pt-2 flex items-center justify-between max-w-md mx-auto text-left text-[11px] text-slate-500">
                  <div>
                    <p className="font-bold text-slate-800">{selectedCertificate.verifiedBy}</p>
                    <p className="text-[10px]">Authorized Lead Signature</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-800">{selectedCertificate.date}</p>
                    <p className="text-[10px]">Verification Date</p>
                  </div>
                </div>

                <div className="pt-2 font-mono text-[10px] text-slate-400">
                  Audit Hash: {selectedCertificate.certificateHash}
                </div>
              </div>

              {/* Modal Actions */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 no-print">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-medium transition flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Certificate</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedCertificate(null)}
                  className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium shadow-xs transition"
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
