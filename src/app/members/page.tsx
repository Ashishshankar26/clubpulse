'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import { useClubPulse } from '@/context/ClubPulseContext';
import {
  Users,
  Search,
  Filter,
  ShieldAlert,
  Send,
  Award,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Flame,
  ArrowRight,
} from 'lucide-react';

export default function MembersDirectoryPage() {
  const { clubs, currentUser } = useClubPulse();

  const [selectedClubId, setSelectedClubId] = useState<string>(clubs[0]?.id || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyGhostRisk, setOnlyGhostRisk] = useState(false);
  const [nudgedUser, setNudgedUser] = useState<string | null>(null);

  // Flatten all members across selected clubs
  const targetClubs =
    selectedClubId === 'all'
      ? clubs
      : clubs.filter(c => c.id === selectedClubId);

  const allMembersWithClub = targetClubs.flatMap(c =>
    c.members.map(m => ({ ...m, clubName: c.name, clubId: c.id }))
  );

  const filteredMembers = allMembersWithClub.filter(m => {
    const matchesSearch =
      m.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.clubRole.toLowerCase().includes(searchQuery.toLowerCase());

    const isGhost = m.isGhostRisk || m.participationRate < 30;
    const matchesGhost = !onlyGhostRisk || isGhost;

    return matchesSearch && matchesGhost;
  });

  const handleNudge = (userName: string) => {
    setNudgedUser(userName);
    setTimeout(() => setNudgedUser(null), 3000);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
              Module 1 • Member Directory
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Campus Member Directory & Ghost Radar
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Monitor active participation, task contributions, verified XP, and identify disengaged ghost members early.
            </p>
          </div>

          <Link
            href="/workload"
            className="self-start md:self-auto px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200 transition flex items-center gap-1.5"
          >
            <Flame className="w-4 h-4 text-amber-600" />
            <span>Workload Rebalancer</span>
          </Link>
        </div>

        {/* Nudge Confirmation Banner */}
        {nudgedUser && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Re-engagement pulse reminder successfully sent to {nudgedUser}!</span>
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
                placeholder="Search member by name, email, or role..."
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
              <option value="all">All Clubs</option>
              {clubs.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Ghost Risk Filter Toggle */}
            <button
              onClick={() => setOnlyGhostRisk(!onlyGhostRisk)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
                onlyGhostRisk
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Flagged Ghost Members Only</span>
            </button>
          </div>
        </div>

        {/* Member Directory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member, idx) => {
            const isGhost = member.isGhostRisk || member.participationRate < 30;
            return (
              <div
                key={`${member.userId}_${member.clubId}_${idx}`}
                className={`rounded-3xl p-5 border transition-all duration-300 flex flex-col justify-between ${
                  isGhost
                    ? 'bg-rose-50/30 border-rose-200 shadow-sm'
                    : 'bg-white border-slate-200 shadow-sm hover:shadow-md'
                }`}
              >
                <div>
                  {/* Top info */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={member.avatar}
                        alt={member.userName}
                        className={`w-12 h-12 rounded-2xl object-cover ring-2 ${
                          isGhost ? 'ring-rose-200 grayscale' : 'ring-indigo-50'
                        }`}
                      />
                      <div>
                        <h3 className="font-bold text-sm text-slate-900">{member.userName}</h3>
                        <p className="text-[11px] text-slate-500 truncate max-w-[160px]">
                          {member.userEmail}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        member.clubRole === 'Lead'
                          ? 'bg-purple-100 text-purple-700'
                          : member.clubRole === 'Core Member'
                          ? 'bg-indigo-100 text-indigo-700'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {member.clubRole}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-700 mb-3">
                    {member.clubName}
                  </p>

                  {/* Ghost alert banner if flagged */}
                  {isGhost && (
                    <div className="mb-3 p-2.5 rounded-xl bg-rose-100/70 border border-rose-300/80 text-[11px] text-rose-800 flex items-start gap-1.5 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                      <span>Inactive &gt;30 days. High dropout / ghost risk.</span>
                    </div>
                  )}

                  {/* Participation stats */}
                  <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Participation Rate:</span>
                      <span
                        className={`font-bold ${
                          isGhost ? 'text-rose-600' : 'text-emerald-600'
                        }`}
                      >
                        {member.participationRate}%
                      </span>
                    </div>
                    {/* Progress bar */}
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isGhost ? 'bg-rose-500' : 'bg-emerald-500'
                        }`}
                        style={{ width: `${member.participationRate}%` }}
                      ></div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] pt-1">
                      <span className="text-slate-500">Tasks Completed:</span>
                      <span className="font-bold text-slate-800">
                        {member.tasksCompleted} tasks
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500">Verified XP:</span>
                      <span className="font-extrabold text-indigo-600">
                        {member.xpEarned} XP
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom actions */}
                <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    Joined: {member.joinedDate}
                  </span>

                  {isGhost ? (
                    <button
                      onClick={() => handleNudge(member.userName)}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition flex items-center gap-1 shadow-sm"
                    >
                      <Send className="w-3 h-3" />
                      <span>Re-engage Nudge</span>
                    </button>
                  ) : (
                    <Link
                      href={`/tasks?assignee=${member.userId}`}
                      className="text-xs font-bold text-indigo-600 hover:underline"
                    >
                      View Tasks →
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
