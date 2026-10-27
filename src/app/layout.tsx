import type { Metadata } from 'next';
import './globals.css';
import { ClubPulseProvider } from '@/context/ClubPulseContext';

export const metadata: Metadata = {
  title: 'Club.ing | College Club Contribution & Management Platform',
  description: 'Solving the Ghost Members and Burnout Leads problem with transparent workload analytics, task velocity, verifiable contributions, and pulse feedback.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <ClubPulseProvider>
          {children}
        </ClubPulseProvider>
      </body>
    </html>
  );
}
