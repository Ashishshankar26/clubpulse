'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import { useClubPulse } from '@/context/ClubPulseContext';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Users,
  Flame,
  Check,
  ArrowRight,
  Filter,
} from 'lucide-react';

export default function NotificationsPage() {
  const {
    currentUser,
    notifications,
    unreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
  } = useClubPulse();

  const [selectedType, setSelectedType] = useState<string>('all');

  const filteredNotifs = notifications.filter(
    n => selectedType === 'all' || n.type === selectedType
  );

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
              System • Telemetry & Alerts
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Notifications & Activity Feed
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Real-time activity alerts for {currentUser.name} ({currentUser.role.replace('_', ' ')}).
            </p>
          </div>

          {unreadNotificationCount > 0 && (
            <button
              onClick={markAllNotificationsAsRead}
              className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-bold border border-indigo-200 transition flex items-center gap-1.5 self-start sm:self-auto"
            >
              <Check className="w-4 h-4" />
              <span>Mark All as Read ({unreadNotificationCount})</span>
            </button>
          )}
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-2">
          {['all', 'task', 'recruitment', 'burnout_alert', 'feedback', 'system'].map(t => (
            <button
              key={t}
              onClick={() => setSelectedType(t)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold capitalize transition ${
                selectedType === t
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {t.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden divide-y divide-slate-100">
          {filteredNotifs.length === 0 ? (
            <div className="py-16 text-center text-xs text-slate-400 space-y-2">
              <Bell className="w-8 h-8 text-slate-300 mx-auto" />
              <p>No notifications match this filter.</p>
            </div>
          ) : (
            filteredNotifs.map(n => (
              <div
                key={n.id}
                onClick={() => markNotificationAsRead(n.id)}
                className={`p-5 transition flex items-start gap-4 cursor-pointer hover:bg-slate-50 ${
                  !n.read ? 'bg-indigo-50/40' : ''
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {n.type === 'burnout_alert' ? (
                    <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                  ) : n.type === 'task' ? (
                    <div className="w-9 h-9 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  ) : n.type === 'recruitment' ? (
                    <div className="w-9 h-9 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center">
                      <Bell className="w-5 h-5" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-bold text-slate-900 leading-snug">
                      {n.title}
                    </h3>
                    <span className="text-[11px] text-slate-400 shrink-0">
                      {n.createdAt}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {n.message}
                  </p>

                  {n.link && (
                    <Link
                      href={n.link}
                      className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                    >
                      <span>Take Action</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>

                {!n.read && (
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 mt-2 shrink-0 shadow-sm" />
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </AppShell>
  );
}
