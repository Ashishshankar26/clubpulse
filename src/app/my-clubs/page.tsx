'use client';

import React from 'react';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import { useClubPulse } from '@/context/ClubPulseContext';
import { isUserLeadOfClub, isApplicationOwnedByUser, findClubMemberData } from '@/lib/permissions';
import {
  Layers,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  Clock,
  Compass,
  Calendar,
  Award,
} from 'lucide-react';

export default function MyClubsPage() {
  const { currentUser, clubs, applications } = useClubPulse();

  const joinedClubs = clubs.filter(c => currentUser.clubsJoined.includes(c.id) || isUserLeadOfClub(currentUser, c));
  const myApplications = applications.filter(a => isApplicationOwnedByUser(a, currentUser));

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Module 1 • My Organizations
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
              My Clubs & Application Status
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Manage your memberships, track ongoing recruitment applications, and view your roles.
            </p>
          </div>

          <Link
            href="/clubs"
            className="self-start sm:self-auto px-4 py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-medium shadow-xs transition flex items-center gap-1.5"
          >
            <Compass className="w-4 h-4" />
            <span>Discover More Clubs</span>
          </Link>
        </div>

        {/* Section 1: Enrolled Clubs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Active Memberships ({joinedClubs.length})
            </h2>
            <Link href="/onboarding" className="text-xs font-medium text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:underline">
              Member Onboarding Checklist →
            </Link>
          </div>

          {joinedClubs.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-8 border border-slate-200/90 dark:border-slate-800 text-center space-y-3 transition-colors">
              <p className="text-slate-500 dark:text-slate-400 text-xs">You have not joined any campus clubs yet.</p>
              <Link
                href="/clubs"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-medium shadow-xs transition"
              >
                Explore Clubs & Apply
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {joinedClubs.map((club, idx) => {
                const memberData = findClubMemberData(club, currentUser);
                return (
                  <div
                    key={club.id || (club as any)._id || idx}
                    className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-sm transition space-y-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <img
                          src={club.logo}
                          alt={club.name}
                          className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                        />
                        <div>
                          <h3 className="font-bold text-base text-slate-900 dark:text-white leading-tight">
                            {club.name}
                          </h3>
                          <span className="text-[10px] font-semibold uppercase text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded mt-1 inline-block">
                            {memberData?.clubRole || 'Member'}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-3 line-clamp-2">
                        {club.tagline}
                      </p>

                      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase">Tasks Completed</span>
                          <p className="font-bold text-slate-800 dark:text-slate-200">{memberData?.tasksCompleted || 0} tasks</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase">Participation</span>
                          <p className="font-bold text-emerald-600 dark:text-emerald-400">{memberData?.participationRate || 85}%</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800">
                      <Link
                        href={`/tasks?club=${club.id}`}
                        className="text-xs font-semibold text-slate-900 dark:text-white hover:text-slate-700 dark:hover:text-slate-300"
                      >
                        Tasks Board →
                      </Link>
                      <Link
                        href={`/clubs/${club.id}`}
                        className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200"
                      >
                        Profile
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Section 2: Recruitment Applications */}
        <div className="space-y-4 pt-4">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Recruitment Applications & Trackers ({myApplications.length})
          </h2>

          {myApplications.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200/90 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors">
              No active applications. Browse recruiting clubs to apply!
            </div>
          ) : (
            <div className="space-y-3">
              {myApplications.map((app, idx) => (
                <div
                  key={app.id || (app as any)._id || `my_app_${idx}`}
                  className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors"
                >
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white truncate">{app.clubName}</h3>
                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider shrink-0 ${
                          app.status === 'approved'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                            : app.status === 'rejected'
                            ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                            : app.status === 'interview_scheduled'
                            ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-semibold'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700'
                        }`}
                      >
                        {app.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-300 truncate">
                      Applying for: <strong>{app.appliedRole}</strong> • Submitted: {app.appliedDate}
                    </p>
                    <p
                      className="text-xs text-slate-500 dark:text-slate-400 italic break-words break-all line-clamp-2"
                      title={app.statementOfPurpose}
                    >
                      "{app.statementOfPurpose}"
                    </p>
                    {app.notes && (
                      <p
                        className="text-[11px] text-slate-700 dark:text-slate-300 font-medium bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg mt-1 border border-slate-200/70 dark:border-slate-700 break-all"
                        title={app.notes}
                      >
                        Feedback / Reviewer Note: {app.notes}
                      </p>
                    )}
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <Link
                      href={`/clubs/${app.clubId}`}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition"
                    >
                      View Club
                    </Link>
                    {app.status === 'approved' && (
                      <Link
                        href="/onboarding"
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition"
                      >
                        Start Onboarding
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
