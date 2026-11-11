import type { Metadata } from 'next';
import './globals.css';
import { ClubPulseProvider } from '@/context/ClubPulseContext';
import { ThemeProvider } from '@/context/ThemeContext';

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
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('clubpulse-theme');
                  var systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                  if (saved === 'dark' || (!saved && systemDark) || (saved === 'system' && systemDark)) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.style.colorScheme = 'dark';
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.style.colorScheme = 'light';
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-150">
        <ThemeProvider>
          <ClubPulseProvider>
            {children}
          </ClubPulseProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
