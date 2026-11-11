'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import { useClubPulse } from '@/context/ClubPulseContext';
import { ShieldAlert, LogIn, UserPlus, Loader2 } from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const { isAuthenticated, authLoading } = useClubPulse();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
    }
  }, [authLoading, isAuthenticated, pathname, router]);

  // While checking auth state
  if (authLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-150">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-slate-700 dark:text-slate-300" />
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Verifying campus session...</p>
          </div>
        </div>
      </div>
    );
  }

  // If unauthenticated (before or during redirect)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-150">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6">
          <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-xs text-center space-y-4">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-800 dark:text-slate-200 mx-auto">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">College Authentication Required</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                Access to this module is restricted to registered students, club leads, and college faculty administrators.
              </p>
            </div>
            <div className="pt-2 flex flex-col gap-2">
              <Link
                href={`/login?redirect=${encodeURIComponent(pathname)}`}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 rounded-lg text-xs font-semibold shadow-xs transition"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In with College Reg No.</span>
              </Link>
              <Link
                href="/login?tab=register"
                className="w-full inline-flex items-center justify-center gap-2 py-2 px-4 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200/90 dark:border-slate-700 rounded-lg text-xs font-medium transition"
              >
                <UserPlus className="w-3.5 h-3.5" />
                <span>Register New Student Account</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 transition-colors duration-150">
      <Navbar />
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        <Sidebar />
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
