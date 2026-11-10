'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DemoSelectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard');
  }, [router]);

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="p-6 bg-white rounded-xl border border-slate-200 text-center">
        <p className="text-xs text-slate-500">Redirecting to campus dashboard...</p>
      </div>
    </div>
  );
}
