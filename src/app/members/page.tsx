'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import { useClubPulse } from '@/context/ClubPulseContext';
import { getAvatarUrl, getManagedClubs } from '@/lib/permissions';
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
  UserCheck,
} from 'lucide-react';

export default function MembersDirectoryPage() {
  const { clubs, currentUser, sendNudge } = useClubPulse();

  const isStudent = currentUser.role === 'student';
  const isLead = currentUser.role === 'club_lead';
  const isAdmin = currentUser.role === 'admin';

  // Find clubs that the student is enrolled in
  const myJoinedClubs = clubs.filter(
    c =>
      (currentUser.clubsJoined || []).includes(c.id) ||
      (c.members || []).some(
        m =>
          m.userId === currentUser.id ||
          (m.userEmail && currentUser.email && m.userEmail.toLowerCase() === currentUser.email.toLowerCase())
      )
  );

  const myLeadClubs = getManagedClubs(currentUser, clubs);

  // Accessible clubs depending on role:
  // Admin: All clubs
  // Lead: Managed clubs (or all if none specified)
  // Student: ONLY clubs they are an enrolled member of
  const accessibleClubs = isAdmin
    ? clubs
    : isLead
    ? (myLeadClubs.length > 0 ? myLeadClubs : clubs)
    : myJoinedClubs;

  const [selectedClubId, setSelectedClubId] = useState<string>(accessibleClubs[0]?.id || 'all');
  const [searchQuery, setSearchQuery] = useState('');
  const [onlyGhostRisk, setOnlyGhostRisk] = useState(false);
  const [nudgedMemberIds, setNudgedMemberIds] = useState<Set<string>>(new Set());
  const [nudgeMessage, setNudgeMessage] = useState<string | null>(null);

  // If student has no clubs joined, display restricted / prompt screen
  if (isStudent && myJoinedClubs.length === 0) {
    return (
      <AppShell>
        <div className="max-w-xl mx-auto my-12 bg-white rounded-xl p-8 border border-slate-200/90 shadow-xs text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center mx-auto">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
              No Active Club Memberships
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-2">
              Campus Member Directory & Roster
            </h2>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              You have not joined any campus clubs yet. Internal member rosters, peer directories, and activity tracking become available once you are an enrolled member of a club. Explore our student organizations and submit an application to get started!
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/clubs"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition"
            >
              <span>Discover Clubs & Apply</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  // Flatten all members across accessible selected clubs
  const targetClubs =
    selectedClubId === 'all'
      ? accessibleClubs
      : accessibleClubs.filter(c => c.id === selectedClubId);

  const allMembersWithClub = targetClubs.flatMap(c =>
    c.members.map(m => ({ ...m, clubName: c.name, clubId: c.id }))
  );

  const filteredMembers = allMembersWithClub.filter(m => {
    const matchesSearch =
      m.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.clubRole.toLowerCase().includes(searchQuery.toLowerCase());

    const isGhost = m.isGhostRisk || m.participationRate < 30;
    const matchesGhost = (!isAdmin && !isLead) ? true : (!onlyGhostRisk || isGhost);

    return matchesSearch && matchesGhost;
  });

  const handleNudge = (userId: string, userName: string, clubName: string) => {
    const res = sendNudge(userId, userName, clubName);
    if (res.success) {
      setNudgedMemberIds(prev => new Set(prev).add(userId));
      setNudgeMessage(res.message);
      setTimeout(() => setNudgeMessage(null), 4000);
    } else {
      setNudgeMessage(res.message);
      setTimeout(() => setNudgeMessage(null), 4000);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {isAdmin || isLead ? 'Module 1 • Member Directory & Governance' : 'Module 1 • Club Roster'}
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              {isAdmin || isLead ? 'Campus Member Directory & Ghost Radar' : 'Club Member Directory'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              {isAdmin || isLead
                ? 'Monitor active participation, task contributions, verified XP, and identify disengaged ghost members early.'
                : 'Connect with your club teammates, view roles, active projects, and verified activity credits.'}
            </p>
          </div>

          {(isAdmin || isLead) && (
            <Link
              href="/workload"
              className="self-start md:self-auto px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium shadow-xs transition flex items-center gap-1.5"
            >
              <Flame className="w-4 h-4 text-slate-300" />
              <span>Workload Rebalancer</span>
            </Link>
          )}
        </div>

        {/* Nudge Confirmation Banner */}
        {nudgeMessage && (
          <div className="p-3.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{nudgeMessage}</span>
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
                placeholder="Search member by name, email, or role..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-slate-900 bg-slate-50/50"
              />
            </div>

            {/* Club Selector */}
            <select
              value={selectedClubId}
              onChange={e => setSelectedClubId(e.target.value)}
              className="px-3 py-2 text-xs rounded-lg border border-slate-200 focus:outline-none focus:border-slate-900 bg-slate-50/50 font-medium"
            >
              {accessibleClubs.length > 1 && <option value="all">All My Clubs</option>}
              {accessibleClubs.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Ghost Risk Filter Toggle (Leads and Admins Only) */}
            {(isAdmin || isLead) && (
              <button
                onClick={() => setOnlyGhostRisk(!onlyGhostRisk)}
                className={`px-4 py-2 rounded-lg text-xs font-medium transition flex items-center gap-1.5 shrink-0 ${
                  onlyGhostRisk
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Flagged Ghost Members Only</span>
              </button>
            )}
          </div>
        </div>

        {/* Member Directory Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member, idx) => {
            const isGhost = (isAdmin || isLead) && (member.isGhostRisk || member.participationRate < 30);
            return (
              <div
                key={`${member.userId}_${member.clubId}_${idx}`}
                className={`rounded-xl p-5 border transition-all duration-200 flex flex-col justify-between ${
                  isGhost
                    ? 'bg-rose-50/30 border-rose-200 shadow-xs'
                    : 'bg-white border-slate-200/90 shadow-xs hover:shadow-sm'
                }`}
              >
                <div>
                  {/* Top info */}
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <img
                        src={getAvatarUrl(member.avatar, member.userName)}
                        alt={member.userName}
                        className={`w-12 h-12 rounded-lg object-cover ring-1 shrink-0 ${
                          isGhost ? 'ring-rose-200 grayscale' : 'ring-slate-200'
                        }`}
                      />
                      <div className="min-w-0 flex-1">
                        <h3 className="font-bold text-sm text-slate-900 truncate">{member.userName}</h3>
                        <p className="text-[11px] text-slate-500 truncate" title={member.userEmail}>
                          {member.userEmail}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded shrink-0 ${
                        member.clubRole === 'Lead'
                          ? 'bg-slate-900 text-white'
                          : member.clubRole === 'Core Member'
                          ? 'bg-slate-100 text-slate-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {member.clubRole}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-700 mb-3 truncate">
                    {member.clubName}
                  </p>

                  {/* Ghost alert banner if flagged (Leads/Admins only) */}
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
                      <span className="font-bold text-slate-900">
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

                  {(isAdmin || isLead) && isGhost ? (
                    <button
                      onClick={() => handleNudge(member.userId, member.userName, member.clubName)}
                      disabled={nudgedMemberIds.has(member.userId)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 shadow-xs ${
                        nudgedMemberIds.has(member.userId)
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      }`}
                    >
                      {nudgedMemberIds.has(member.userId) ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Nudged ✓</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3 h-3 text-slate-300" />
                          <span>Re-engage Nudge</span>
                        </>
                      )}
                    </button>
                  ) : (
                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                      <span>Active Member</span>
                    </span>
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
