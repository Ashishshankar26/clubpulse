'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useClubPulse } from '@/context/ClubPulseContext';
import ThemeToggle from './ThemeToggle';
import {
  Bell,
  Activity,
  Flame,
  Users,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  Layers,
  Sparkles,
  Menu,
  X,
  LogIn,
  LogOut,
  Settings,
  Compass,
  CheckSquare,
  BarChart2,
  Camera,
} from 'lucide-react';
import ProfilePictureModal from '@/components/profile/ProfilePictureModal';

export default function Navbar() {
  const pathname = usePathname();
  const {
    currentUser,
    isAuthenticated,
    notifications,
    unreadNotificationCount,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    logout,
  } = useClubPulse();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);

  // Dynamic role-authorized navigation links: Only show options authorized for this role
  const allNavLinks = [
    { href: '/dashboard', label: 'Dashboard', roles: ['student', 'club_lead', 'admin'] },
    { href: '/clubs', label: 'Discover Clubs', roles: ['student', 'club_lead', 'admin'] },
    { href: '/my-clubs', label: 'My Clubs', roles: ['student'] },
    { href: '/my-tasks', label: 'My Tasks', roles: ['student'] },
    { href: '/contributions', label: 'Verified Credits', roles: ['student'] },
    { href: '/recruitment', label: 'Recruitment', roles: ['club_lead', 'admin'] },
    { href: '/tasks', label: 'Task Board', roles: ['club_lead', 'admin'] },
    { href: '/workload', label: 'Burnout Radar', roles: ['club_lead', 'admin'] },
    { href: '/analytics', label: 'Analytics', roles: ['club_lead', 'admin'] },
    { href: '/reports', label: 'Governance', roles: ['admin'] },
  ];

  const navLinks = allNavLinks.filter(item => item.roles.includes(currentUser.role));

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800 transition-colors duration-150">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-8 h-8 rounded-lg bg-slate-900 dark:bg-white flex items-center justify-center text-white dark:text-black shadow-xs group-hover:bg-slate-800 dark:group-hover:bg-slate-200 transition">
                <Activity className="w-4 h-4 text-white dark:text-black" />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base tracking-tight text-slate-900 dark:text-white leading-tight">
                  Club.ing
                </span>
                <span className="text-[10px] tracking-wider text-slate-400 dark:text-slate-500 font-medium uppercase -mt-0.5">
                  Campus Org OS
                </span>
              </div>
            </Link>

            {/* Top Navigation Links - Only visible when authenticated */}
            {isAuthenticated && (
              <nav className="hidden md:flex items-center space-x-1 pl-4 border-l border-slate-200 dark:border-slate-800">
                {navLinks.map(item => {
                  const isActive =
                    item.href === '/dashboard'
                      ? pathname === '/dashboard'
                      : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                        isActive
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-semibold'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800/60'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            )}
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            {/* Dark Mode Theme Toggle */}
            <ThemeToggle />

            {!isAuthenticated ? (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold transition shadow-xs"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </Link>
                <Link
                  href="/login?tab=register"
                  className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-medium transition"
                >
                  <span>Register</span>
                </Link>
              </div>
            ) : (
              <>
                {/* Notifications Popover */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition focus:outline-none"
                    aria-label="Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadNotificationCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 flex h-2 w-2 rounded-full bg-slate-900 dark:bg-white ring-2 ring-white dark:ring-slate-900" />
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 py-3 z-50 animate-in fade-in slide-in-from-top-1">
                      <div className="px-4 pb-2 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-white text-xs">Notifications</h3>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">Alerts for {currentUser.name}</p>
                        </div>
                        {unreadNotificationCount > 0 && (
                          <button
                            onClick={markAllNotificationsAsRead}
                            className="text-xs text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white font-medium"
                          >
                            Mark all read
                          </button>
                        )}
                      </div>

                      <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                        {notifications.length === 0 ? (
                          <div className="py-8 text-center text-slate-400 text-xs">
                            No notifications yet.
                          </div>
                        ) : (
                          notifications.map(n => (
                            <div
                              key={n.id}
                              onClick={() => markNotificationAsRead(n.id)}
                              className={`p-3 hover:bg-slate-50 dark:hover:bg-slate-800/60 cursor-pointer transition flex items-start gap-3 ${
                                !n.read ? 'bg-slate-50/70 dark:bg-slate-800/40' : ''
                              }`}
                            >
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-slate-900 dark:text-white">{n.title}</p>
                                <p className="text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">{n.message}</p>
                                <span className="text-[10px] text-slate-400 mt-1 block">
                                  {n.createdAt}
                                </span>
                              </div>
                              {!n.read && (
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-900 dark:bg-white mt-1.5 shrink-0" />
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition border border-transparent hover:border-slate-200 dark:hover:border-slate-700 text-left"
                  >
                    <img
                      src={currentUser.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(currentUser.name)}`}
                      alt={currentUser.name}
                      className="w-7 h-7 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                    />
                    <div className="hidden sm:flex flex-col">
                      <span className="text-xs font-semibold text-slate-900 dark:text-white leading-tight">
                        {currentUser.name}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 capitalize">
                        {currentUser.role === 'club_lead'
                          ? 'Club Lead'
                          : currentUser.role === 'admin'
                          ? 'College Admin'
                          : 'Member'}
                      </span>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-64 rounded-xl bg-white dark:bg-slate-900 shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-1 text-xs">
                      <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                        <p className="font-semibold text-slate-900 dark:text-white">{currentUser.name}</p>
                        <p className="text-slate-500 dark:text-slate-400 font-mono text-[11px] truncate">
                          {currentUser.registrationNumber}
                        </p>
                        <p className="text-slate-400 text-[11px] truncate">{currentUser.email}</p>
                      </div>

                      <div className="px-3 py-2 space-y-1 bg-slate-50/50 dark:bg-slate-800/40">
                        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                          <span>Department:</span>
                          <span className="font-medium text-slate-700 dark:text-slate-300">{currentUser.department || 'General'}</span>
                        </div>
                        <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                          <span>Activity Credits:</span>
                          <span className="font-bold text-slate-900 dark:text-white">{currentUser.xpPoints || 0} XP</span>
                        </div>
                      </div>

                      <div className="border-t border-slate-100 dark:border-slate-800 px-2 pt-1 mt-1 space-y-0.5">
                        <button
                          type="button"
                          onClick={() => {
                            setShowUserMenu(false);
                            setIsAvatarModalOpen(true);
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-left"
                        >
                          <Camera className="w-3.5 h-3.5 text-slate-500" />
                          <span>Change Avatar</span>
                        </button>
                        <Link
                          href="/settings"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg"
                        >
                          <Settings className="w-3.5 h-3.5 text-slate-500" />
                          <span>Account Settings</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => {
                            logout();
                            setShowUserMenu(false);
                          }}
                          className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg text-left"
                        >
                          <LogOut className="w-3.5 h-3.5 text-rose-500" />
                          <span>Log Out Session</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Mobile menu trigger */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 pt-3 pb-4 space-y-2 animate-in slide-in-from-top-2">
          {isAuthenticated && (
            <div className="space-y-1 pb-3 border-b border-slate-100 dark:border-slate-800">
              {navLinks.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`block px-3 py-2 rounded-lg text-xs font-semibold ${
                    pathname === item.href
                      ? 'bg-slate-900 text-white dark:bg-white dark:text-black'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          )}

          <div className="pt-2 flex items-center justify-between text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Appearance</span>
            <ThemeToggle variant="expanded" />
          </div>
        </div>
      )}

      {/* Profile Picture Modal */}
      <ProfilePictureModal
        isOpen={isAvatarModalOpen}
        onClose={() => setIsAvatarModalOpen(false)}
      />
    </header>
  );
}
