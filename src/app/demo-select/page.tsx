'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AppShell from '@/components/layout/AppShell';
import { useClubPulse } from '@/context/ClubPulseContext';
import {
  Sparkles,
  User,
  ShieldCheck,
  Flame,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
  Compass,
  FileCheck,
  Award,
} from 'lucide-react';

export default function DemoSelectPage() {
  const router = useRouter();
  const { currentUser, switchUser, resetToInitialData } = useClubPulse();

  const personas = [
    {
      id: 'usr_aarav',
      role: 'student',
      title: 'Student / Club Member',
      name: 'Aarav Sharma',
      badge: 'Active Member & Applicant',
      department: 'B.Tech Computer Science (3rd Year)',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80',
      description:
        'A dedicated member of GDSC and RoboCrafters who wants to join DesignHub. Experiencing how task assignments, XP rewards, and verified contribution portfolios solve ghost member ambiguity.',
      keyCapabilities: [
        'Explore clubs & apply with portfolio links',
        'View assigned tasks & submit work for review',
        'Earn verified contribution certificates & XP',
        'Submit anonymous workload & event fatigue pulse feedback'
      ],
      quickStartAction: 'Apply to DesignHub or Submit "Build Live Hackathon Registration Portal" task',
      recommendedDestination: '/dashboard'
    },
    {
      id: 'usr_priya',
      role: 'club_lead',
      title: 'Club Lead (GDSC)',
      name: 'Priya Patel',
      badge: 'Experiencing Burnout Alert',
      department: 'Information Technology (4th Year)',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
      description:
        'Lead of the Google Developer Student Club. Handling 65% of all active tasks alone. Demonstrates the Burnout Radar, applicant screening pipeline, task delegation, and submission verification.',
      keyCapabilities: [
        'Burnout Warning: See task concentration & delegate',
        'Recruitment Pipeline: 1-click Approve/Reject applicants',
        'Task Verification: Review submitted tasks & issue XP',
        'Ghost Member Radar: Identify inactive members (<30% activity)'
      ],
      quickStartAction: 'Approve Vikram Rathore\'s application or review Ananya\'s sponsorship deck',
      recommendedDestination: '/recruitment'
    },
    {
      id: 'usr_dean_rajesh',
      role: 'admin',
      title: 'Campus Administrator',
      name: 'Dr. Rajesh Kumar',
      badge: 'Dean of Student Affairs',
      department: 'Student Activity Council & Governance',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
      description:
        'Oversees campus-wide club compliance, budget health, and engagement. Analyzes university-level participation trends, inactive club risk, and generates print-ready council reports.',
      keyCapabilities: [
        'University-wide club health and participation index',
        'Campus-wide burnout radar and ghost member statistics',
        'Verified contribution ledger audit for college credits',
        'Print-ready Club Experience & Governance reports'
      ],
      quickStartAction: 'Audit campus participation trends & print quarterly health report',
      recommendedDestination: '/analytics'
    }
  ];

  const handleSelectPersona = (userId: string, destination: string) => {
    switchUser(userId);
    router.push(destination);
  };

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Interactive Demo Personas</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Select Your Demonstration Role
          </h1>
          <p className="text-slate-600 text-sm max-w-2xl mx-auto leading-relaxed">
            ClubPulse provides purpose-built workflows for members, leads, and administrators.
            Select a persona below to experience live interactive state, role-tailored dashboards, and the end-to-end lifecycle.
          </p>
        </div>

        {/* Personas Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {personas.map(persona => {
            const isSelected = currentUser.id === persona.id;
            return (
              <div
                key={persona.id}
                className={`relative rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between ${
                  isSelected
                    ? 'bg-white ring-2 ring-indigo-600 shadow-xl shadow-indigo-500/10'
                    : 'bg-white/80 hover:bg-white border border-slate-200 hover:shadow-lg'
                }`}
              >
                {isSelected && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white text-[11px] font-bold px-3 py-0.5 rounded-full shadow">
                    Active Identity
                  </span>
                )}

                <div>
                  {/* Top user card info */}
                  <div className="flex items-center gap-4 mb-4">
                    <img
                      src={persona.avatar}
                      alt={persona.name}
                      className="w-14 h-14 rounded-2xl object-cover ring-2 ring-indigo-100 shadow-sm"
                    />
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 block">
                        {persona.title}
                      </span>
                      <h3 className="text-base font-bold text-slate-900">{persona.name}</h3>
                      <p className="text-[11px] text-slate-500">{persona.department}</p>
                    </div>
                  </div>

                  {/* Badge */}
                  <div className="mb-4">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        persona.role === 'club_lead'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : persona.role === 'admin'
                          ? 'bg-purple-100 text-purple-800 border border-purple-200'
                          : 'bg-indigo-100 text-indigo-800 border border-indigo-200'
                      }`}
                    >
                      {persona.role === 'club_lead' && <Flame className="w-3.5 h-3.5 text-amber-600" />}
                      {persona.role === 'admin' && <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />}
                      {persona.role === 'student' && <User className="w-3.5 h-3.5 text-indigo-600" />}
                      {persona.badge}
                    </span>
                  </div>

                  {/* Description */}
                  <p className="text-xs text-slate-600 leading-relaxed mb-4">
                    {persona.description}
                  </p>

                  {/* Capabilities List */}
                  <div className="space-y-2 mb-6 border-t border-slate-100 pt-3">
                    <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
                      Demo Highlights:
                    </p>
                    {persona.keyCapabilities.map((cap, i) => (
                      <div key={i} className="flex items-start gap-2 text-xs text-slate-600">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{cap}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom Action Button */}
                <div className="pt-4 border-t border-slate-100">
                  <div className="text-[11px] text-slate-500 mb-2">
                    <strong className="text-slate-700">Quick Test:</strong> {persona.quickStartAction}
                  </div>
                  <button
                    onClick={() => handleSelectPersona(persona.id, persona.recommendedDestination)}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
                      isSelected
                        ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-600/20'
                        : 'bg-slate-900 text-white hover:bg-indigo-600'
                    }`}
                  >
                    <span>{isSelected ? 'Continue As ' + persona.name.split(' ')[0] : 'Simulate ' + persona.name.split(' ')[0]}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recommended Testing Flow Card */}
        <div className="bg-gradient-to-br from-indigo-900 via-indigo-950 to-slate-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-6 border-b border-indigo-800/60">
            <div>
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                Full Lifecycle Verification
              </span>
              <h2 className="text-xl font-bold text-white mt-1">
                Suggested 10-Step End-to-End Demo Journey
              </h2>
            </div>
            <button
              onClick={() => {
                if (confirm('Reset demo state to initial dataset?')) {
                  resetToInitialData();
                }
              }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-800/80 hover:bg-indigo-700 text-indigo-200 text-xs font-medium border border-indigo-700 transition self-start md:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Demo State</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 text-xs">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
              <span className="font-extrabold text-indigo-400">Step 1-2</span>
              <p className="font-semibold text-slate-100 mt-1">Apply to Club</p>
              <p className="text-slate-400 text-[11px] mt-0.5">As Aarav, apply to DesignHub with portfolio link.</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
              <span className="font-extrabold text-indigo-400">Step 3-4</span>
              <p className="font-semibold text-slate-100 mt-1">Approve Applicant</p>
              <p className="text-slate-400 text-[11px] mt-0.5">Switch to Lead (Priya). Approve Vikram to add him to GDSC.</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
              <span className="font-extrabold text-indigo-400">Step 5-6</span>
              <p className="font-semibold text-slate-100 mt-1">Submit Task</p>
              <p className="text-slate-400 text-[11px] mt-0.5">As Aarav, submit your hackathon portal task with demo note.</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
              <span className="font-extrabold text-indigo-400">Step 7-8</span>
              <p className="font-semibold text-slate-100 mt-1">Verify & Award XP</p>
              <p className="text-slate-400 text-[11px] mt-0.5">As Lead, approve submission. Watch verified ledger log XP!</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-3.5">
              <span className="font-extrabold text-indigo-400">Step 9-10</span>
              <p className="font-semibold text-slate-100 mt-1">Pulse & Report</p>
              <p className="text-slate-400 text-[11px] mt-0.5">Submit 360 feedback and export printable council report.</p>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
