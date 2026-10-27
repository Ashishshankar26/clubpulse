'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import { useClubPulse } from '@/context/ClubPulseContext';
import {
  Sparkles,
  CheckCircle2,
  Circle,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  Users,
  Compass,
  FileText,
  Award,
} from 'lucide-react';

interface ChecklistStep {
  id: string;
  title: string;
  category: string;
  description: string;
  completed: boolean;
  actionText?: string;
  actionHref?: string;
  xpReward: number;
}

export default function MemberOnboardingPage() {
  const { currentUser } = useClubPulse();

  const [steps, setSteps] = useState<ChecklistStep[]>([
    {
      id: 'step_1',
      title: 'Complete Profile & Select Technical Skills',
      category: 'Profile Setup',
      description: 'Add your portfolio links, graduation year, and primary development skills to help leads assign matching tasks.',
      completed: true,
      actionText: 'View Profile Settings',
      actionHref: '/settings',
      xpReward: 20,
    },
    {
      id: 'step_2',
      title: 'Join Club Discord & WhatsApp Community Channels',
      category: 'Communication',
      description: 'Connect with other students in technical discussion threads, sprint standups, and general campus chatter.',
      completed: true,
      actionText: 'Open Discord Invite',
      actionHref: 'https://discord.gg',
      xpReward: 30,
    },
    {
      id: 'step_3',
      title: 'Review the Club Code of Conduct & Academic Balance Guidelines',
      category: 'Governance',
      description: 'Understand expectations around workload limits, exam quiet periods, and zero burnout policies.',
      completed: false,
      actionText: 'Read Guidelines',
      actionHref: '/reports',
      xpReward: 25,
    },
    {
      id: 'step_4',
      title: 'Claim Your First Starter Task on the Kanban Board',
      category: 'Task Service',
      description: 'Pick an open beginner-friendly task or event setup checklist to initiate your verified contribution ledger.',
      completed: false,
      actionText: 'Browse Open Tasks',
      actionHref: '/tasks',
      xpReward: 50,
    },
    {
      id: 'step_5',
      title: 'Submit Your First Week Pulse Sentiment Survey',
      category: 'Feedback',
      description: 'Let club leads know how welcoming the onboarding was and if your study-life workload feels balanced.',
      completed: false,
      actionText: 'Give Pulse Feedback',
      actionHref: '/feedback',
      xpReward: 35,
    },
  ]);

  const toggleStep = (id: string) => {
    setSteps(prev =>
      prev.map(s => (s.id === id ? { ...s, completed: !s.completed } : s))
    );
  };

  const completedCount = steps.filter(s => s.completed).length;
  const progressPercent = Math.round((completedCount / steps.length) * 100);

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-700 via-purple-700 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold uppercase tracking-wider backdrop-blur-md">
              Module 1 • Member Onboarding
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Welcome to Campus Club Life, {currentUser.name.split(' ')[0]}!
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100 mt-2 max-w-2xl leading-relaxed">
            The onboarding path is engineered to integrate you smoothly into projects and ensure you never become a ghost member. Complete the 5 milestones below to claim starter badges and XP.
          </p>

          {/* Progress bar */}
          <div className="mt-6 p-4 rounded-2xl bg-black/20 border border-white/10 space-y-2">
            <div className="flex items-center justify-between text-xs font-bold">
              <span>Onboarding Progress: {completedCount} of {steps.length} Milestones</span>
              <span className="text-amber-300">{progressPercent}% Completed</span>
            </div>
            <div className="w-full bg-white/20 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-400 to-teal-300 h-full rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Checklist */}
        <div className="space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700">
            Interactive Onboarding Milestones
          </h2>

          <div className="space-y-3">
            {steps.map((step, idx) => (
              <div
                key={step.id}
                className={`rounded-3xl p-5 border transition-all duration-200 flex items-start gap-4 ${
                  step.completed
                    ? 'bg-emerald-50/40 border-emerald-200'
                    : 'bg-white border-slate-200 shadow-sm hover:shadow-md'
                }`}
              >
                <button
                  onClick={() => toggleStep(step.id)}
                  className="mt-0.5 text-slate-400 hover:text-indigo-600 focus:outline-none transition shrink-0"
                >
                  {step.completed ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 fill-emerald-100" />
                  ) : (
                    <Circle className="w-6 h-6 text-slate-300 hover:text-slate-400" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                      {step.category}
                    </span>
                    <h3
                      className={`text-sm font-bold ${
                        step.completed ? 'line-through text-slate-500' : 'text-slate-900'
                      }`}
                    >
                      {step.title}
                    </h3>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {step.description}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100/80">
                    <span className="text-[11px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200 flex items-center gap-1">
                      <Award className="w-3 h-3" />
                      +{step.xpReward} XP Reward
                    </span>

                    {step.actionText && step.actionHref && (
                      <Link
                        href={step.actionHref}
                        className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                      >
                        <span>{step.actionText}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
