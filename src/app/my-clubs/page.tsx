'use client';

import React from 'react';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import { useClubPulse } from '@/context/ClubPulseContext';
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

  const joinedClubs = clubs.filter(c => currentUser.clubsJoined.includes(c.id));
  const myApplications = applications.filter(a => a.userId === currentUser.id);

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
              Module 1 • My Organizations
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              My Clubs & Application Status
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Manage your memberships, track ongoing recruitment applications, and view your roles.
            </p>
          </div>

          <Link
            href="/clubs"
            className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-600/20 transition flex items-center gap-1.5"
          >
            <Compass className="w-4 h-4" />
            <span>Discover More Clubs</span>
          </Link>
        </div>

        {/* Section 1: Enrolled Clubs */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
              Active Memberships ({joinedClubs.length})
            </h2>
            <Link href="/onboarding" className="text-xs font-bold text-indigo-600 hover:underline">
              Member Onboarding Checklist →
            </Link>
          </div>

          {joinedClubs.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center space-y-3">
              <p className="text-slate-500 text-xs">You have not joined any campus clubs yet.</p>
              <Link
                href="/clubs"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
              >
                Explore Clubs & Apply
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {joinedClubs.map(club => {
                const memberData = club.members.find(m => m.userId === currentUser.id);
                return (
                  <div
                    key={club.id}
                    className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-lg transition space-y-4 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-3">
                        <img
                          src={club.logo}
                          alt={club.name}
                          className="w-12 h-12 rounded-2xl object-cover ring-2 ring-indigo-50"
                        />
                        <div>
                          <h3 className="font-bold text-base text-slate-900 leading-tight">
                            {club.name}
                          </h3>
                          <span className="text-[10px] font-bold uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full mt-1 inline-block">
                            {memberData?.clubRole || 'Member'}
                          </span>
                        </div>
                      </div>

                      <p className="text-xs text-slate-500 mt-3 line-clamp-2">
                        {club.tagline}
                      </p>

                      <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Tasks Completed</span>
                          <p className="font-bold text-slate-800">{memberData?.tasksCompleted || 0} tasks</p>
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Participation</span>
                          <p className="font-bold text-emerald-600">{memberData?.participationRate || 85}%</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 flex items-center justify-between border-t border-slate-100">
                      <Link
                        href={`/tasks?club=${club.id}`}
                        className="text-xs font-bold text-indigo-600 hover:underline"
                      >
                        Tasks Board →
                      </Link>
                      <Link
                        href={`/clubs/${club.id}`}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-800"
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
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Recruitment Applications & Trackers ({myApplications.length})
          </h2>

          {myApplications.length === 0 ? (
            <div className="bg-white rounded-3xl p-6 border border-slate-200 text-center text-xs text-slate-500">
              No active applications. Browse recruiting clubs to apply!
            </div>
          ) : (
            <div className="space-y-3">
              {myApplications.map(app => (
                <div
                  key={app.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-900">{app.clubName}</h3>
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          app.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-700'
                            : app.status === 'rejected'
                            ? 'bg-rose-100 text-rose-700'
                            : app.status === 'interview_scheduled'
                            ? 'bg-purple-100 text-purple-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {app.status.replace('_', ' ')}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">
                      Applying for: <strong>{app.appliedRole}</strong> • Submitted: {app.appliedDate}
                    </p>
                    <p className="text-xs text-slate-500 italic">
                      "{app.statementOfPurpose}"
                    </p>
                    {app.notes && (
                      <p className="text-[11px] text-indigo-700 font-medium bg-indigo-50 p-2 rounded-xl mt-1">
                        Feedback / Reviewer Note: {app.notes}
                      </p>
                    )}
                  </div>

                  <div className="shrink-0 flex items-center gap-2">
                    <Link
                      href={`/clubs/${app.clubId}`}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                    >
                      View Club
                    </Link>
                    {app.status === 'approved' && (
                      <Link
                        href="/onboarding"
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm"
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
