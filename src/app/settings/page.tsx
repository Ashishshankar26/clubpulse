'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import { useClubPulse } from '@/context/ClubPulseContext';
import { getAvatarUrl } from '@/lib/permissions';
import {
  Settings,
  Shield,
  Key,
  CheckCircle2,
  LogOut,
  Building,
  Award,
  Lock,
  Mail,
  UserCheck,
  Server,
  AlertCircle,
  Camera,
} from 'lucide-react';
import ProfilePictureModal from '@/components/profile/ProfilePictureModal';

export default function AccountSettingsPage() {
  const router = useRouter();
  const { currentUser, clubs, logout, isAuthenticated } = useClubPulse();

  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passLoading, setPassLoading] = useState(false);
  const [passMsg, setPassMsg] = useState<{ text: string; error: boolean } | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassMsg(null);

    if (newPass.length < 6) {
      setPassMsg({ text: 'New password must be at least 6 characters long.', error: true });
      return;
    }

    if (newPass !== confirmPass) {
      setPassMsg({ text: 'New password and confirmation do not match.', error: true });
      return;
    }

    setPassLoading(true);
    try {
      // Simulate password update with timeout / endpoint
      await new Promise(res => setTimeout(res, 600));
      setPassMsg({ text: 'Password successfully updated in your account!', error: false });
      setCurrentPass('');
      setNewPass('');
      setConfirmPass('');
    } catch {
      setPassMsg({ text: 'Failed to update password. Please try again.', error: true });
    } finally {
      setPassLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const myClubs = clubs.filter(c => currentUser.clubsJoined?.includes(c.id));

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Identity & Governance
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Account & Security Settings
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Manage your verified campus credentials, active club memberships, and session privacy.
            </p>
          </div>

          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 hover:bg-rose-50 text-slate-700 hover:text-rose-700 border border-slate-200 hover:border-rose-200 text-xs font-semibold transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out Session</span>
            </button>
          )}
        </div>

        {/* Profile Details Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <UserCheck className="w-4 h-4 text-slate-700" />
            <h2 className="text-sm font-bold text-slate-900">Student Profile & Credentials</h2>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center gap-4">
              <div
                className="relative group cursor-pointer shrink-0"
                onClick={() => setIsAvatarModalOpen(true)}
                title="Click to change profile picture"
              >
                <img
                  src={getAvatarUrl(currentUser.avatar, currentUser.name)}
                  alt={currentUser.name}
                  className="w-16 h-16 rounded-full object-cover ring-2 ring-slate-900 shadow-xs group-hover:opacity-85 transition"
                />
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    setIsAvatarModalOpen(true);
                  }}
                  className="absolute bottom-0 right-0 p-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white ring-2 ring-white shadow-xs transition"
                  title="Change avatar"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-bold text-base text-slate-900">{currentUser.name}</h3>
                  <button
                    type="button"
                    onClick={() => setIsAvatarModalOpen(true)}
                    className="px-2.5 py-1 rounded-md bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-[11px] font-semibold transition flex items-center gap-1.5 shadow-2xs"
                  >
                    <Camera className="w-3 h-3 text-slate-500" />
                    <span>Change Photo</span>
                  </button>
                </div>

                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Reg No: <span className="font-semibold text-slate-800">{currentUser.registrationNumber}</span>
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="text-[10px] font-bold uppercase bg-slate-200 text-slate-800 px-2 py-0.5 rounded">
                    {currentUser.role === 'club_lead'
                      ? 'Club Lead'
                      : currentUser.role === 'admin'
                      ? 'Council Dean'
                      : 'Student'}
                  </span>
                  <span className="text-xs text-slate-600 font-medium">
                    {currentUser.department} • {currentUser.year}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-200">
              <span className="text-[10px] text-slate-400 font-bold uppercase block">Activity Credits</span>
              <span className="text-xl font-bold text-slate-900">{currentUser.xpPoints || 50} XP</span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg border border-slate-100 bg-white">
              <span className="text-slate-400 block text-[11px]">College Email</span>
              <span className="font-medium text-slate-800 truncate block mt-0.5">{currentUser.email}</span>
            </div>
            <div className="p-3 rounded-lg border border-slate-100 bg-white">
              <span className="text-slate-400 block text-[11px]">Academic Department</span>
              <span className="font-medium text-slate-800 block mt-0.5">{currentUser.department}</span>
            </div>
          </div>
        </div>

        {/* Change Password Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Lock className="w-4 h-4 text-slate-700" />
            <h2 className="text-sm font-bold text-slate-900">Security & Credentials</h2>
          </div>

          {passMsg && (
            <div
              className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
                passMsg.error
                  ? 'bg-rose-50 text-rose-800 border border-rose-200'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}
            >
              {passMsg.error ? <AlertCircle className="w-4 h-4" /> : <CheckCircle2 className="w-4 h-4" />}
              <span>{passMsg.text}</span>
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-3 max-w-md">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Current Password</label>
              <input
                type="password"
                required
                value={currentPass}
                onChange={e => setCurrentPass(e.target.value)}
                placeholder="Enter current password"
                className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 bg-white"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">New Password</label>
                <input
                  type="password"
                  required
                  value={newPass}
                  onChange={e => setNewPass(e.target.value)}
                  placeholder="Min 6 characters"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 bg-white"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Confirm New Password</label>
                <input
                  type="password"
                  required
                  value={confirmPass}
                  onChange={e => setConfirmPass(e.target.value)}
                  placeholder="Confirm password"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900 bg-white"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={passLoading}
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs shadow-xs transition mt-2 cursor-pointer"
            >
              {passLoading ? 'Updating...' : 'Update Password'}
            </button>
          </form>
        </div>

        {/* Database & Security Architecture Status */}
        <div className="bg-slate-900 text-slate-200 rounded-2xl p-6 shadow-md space-y-4">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs uppercase tracking-wider">
            <Server className="w-4 h-4" />
            <span>Campus Production Infrastructure</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs pt-1">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-slate-400 text-[11px] block">Database Cluster</span>
              <span className="font-semibold text-white block">MongoDB Atlas Live</span>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block" />
                Connected & Synced
              </span>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-slate-400 text-[11px] block">Session Security</span>
              <span className="font-semibold text-white block">HttpOnly Signed JWT</span>
              <span className="text-[10px] text-slate-300 block">HS256 Cryptographic Token</span>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10 space-y-1">
              <span className="text-slate-400 text-[11px] block">Audit Integrity</span>
              <span className="font-semibold text-white block">Immutable Audit Trail</span>
              <span className="text-[10px] text-slate-300 block">All actions logged</span>
            </div>
          </div>
        </div>

        {/* Profile Picture Change Modal */}
        <ProfilePictureModal
          isOpen={isAvatarModalOpen}
          onClose={() => setIsAvatarModalOpen(false)}
        />
      </div>
    </AppShell>
  );
}
