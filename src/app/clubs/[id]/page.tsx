'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import { useClubPulse } from '@/context/ClubPulseContext';
import {
  Users,
  Calendar,
  MapPin,
  Sparkles,
  Award,
  Globe,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldCheck,
  Flame,
  X,
  Send,
} from 'lucide-react';

import { Suspense } from 'react';

function ClubDetailContent() {
  const params = useParams();
  const router = useRouter();
  const { clubs, currentUser, applications, applyToClub } = useClubPulse();

  const clubId = params.id as string;
  const club = clubs.find(c => c.id === clubId);

  const [showApplyModal, setShowApplyModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(club?.recruitmentRoles[0] || 'Member');
  const [statement, setStatement] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['React', 'UI/UX']);
  const [skillInput, setSkillInput] = useState('');
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  if (!club) {
    return (
      <AppShell>
        <div className="py-20 text-center space-y-4">
          <h2 className="text-xl font-bold text-slate-800">Club Not Found</h2>
          <p className="text-xs text-slate-500">The requested club profile does not exist.</p>
          <Link
            href="/clubs"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold"
          >
            Back to Club Discovery
          </Link>
        </div>
      </AppShell>
    );
  }

  const isMember = currentUser.clubsJoined.includes(club.id);
  const userApp = applications.find(
    a => a.clubId === club.id && a.userId === currentUser.id
  );

  const handleAddSkill = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      if (!selectedSkills.includes(skillInput.trim())) {
        setSelectedSkills([...selectedSkills, skillInput.trim()]);
      }
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSelectedSkills(selectedSkills.filter(s => s !== skill));
  };

  const handleSubmitApplication = (e: React.FormEvent) => {
    e.preventDefault();
    if (!statement.trim()) {
      alert('Please fill in your statement of purpose.');
      return;
    }

    applyToClub({
      clubId: club.id,
      role: selectedRole,
      statement,
      skills: selectedSkills,
      portfolioUrl: portfolioUrl.trim() || undefined,
    });

    setAppliedSuccess(true);
    setTimeout(() => {
      setShowApplyModal(false);
      setAppliedSuccess(false);
    }, 2000);
  };

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Banner & Header */}
        <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
          <div className="relative h-48 sm:h-64 w-full">
            <img
              src={club.banner}
              alt={club.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

            <span className="absolute top-4 left-4 text-xs font-bold uppercase tracking-wider bg-white/90 backdrop-blur-md text-slate-900 px-3 py-1 rounded-full shadow-sm">
              {club.category}
            </span>

            {/* Title & Logo Overlay */}
            <div className="absolute -bottom-2 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div className="flex items-end gap-4">
                <img
                  src={club.logo}
                  alt={club.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover ring-4 ring-white shadow-xl bg-white shrink-0"
                />
                <div className="text-white pb-2">
                  <h1 className="text-xl sm:text-3xl font-black tracking-tight">{club.name}</h1>
                  <p className="text-xs sm:text-sm text-slate-200 mt-0.5 max-w-xl line-clamp-1">
                    {club.tagline}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pb-2 flex items-center gap-2">
                {isMember ? (
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-2 rounded-xl bg-emerald-500/90 text-white text-xs font-bold flex items-center gap-1.5 shadow">
                      <CheckCircle2 className="w-4 h-4" />
                      Active Member
                    </span>
                    <Link
                      href={`/tasks?club=${club.id}`}
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow transition"
                    >
                      View Club Tasks
                    </Link>
                  </div>
                ) : userApp ? (
                  <div className="bg-white/95 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-200 text-xs shadow-md">
                    <span className="text-slate-500 font-medium">Application Status: </span>
                    <span className="font-bold text-indigo-700 uppercase tracking-wider">
                      {userApp.status.replace('_', ' ')}
                    </span>
                  </div>
                ) : club.activeRecruitment ? (
                  <button
                    onClick={() => setShowApplyModal(true)}
                    className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Apply to Join</span>
                  </button>
                ) : (
                  <span className="px-4 py-2 rounded-xl bg-slate-800/80 text-slate-300 text-xs font-medium backdrop-blur-md">
                    Recruitment Closed
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Quick Info Bar */}
          <div className="mt-8 pt-4 px-6 pb-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px]">Club Lead</span>
              <div className="flex items-center gap-2 mt-1">
                <img
                  src={club.leadAvatar}
                  alt={club.leadName}
                  className="w-5 h-5 rounded-full object-cover"
                />
                <span className="font-bold text-slate-800">{club.leadName}</span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px]">Meetings</span>
              <p className="font-bold text-slate-800 mt-1">{club.meetingSchedule}</p>
            </div>

            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px]">Community Size</span>
              <p className="font-bold text-slate-800 mt-1">{club.memberCount} Verified Members</p>
            </div>

            <div>
              <span className="text-slate-400 font-bold uppercase text-[10px]">Council Health</span>
              <p className="font-bold text-indigo-600 mt-1">{club.healthScore}/100 Rating</p>
            </div>
          </div>
        </div>

        {/* Two-Column Details */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* About */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
              <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-600">
                About the Organization
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                {club.description}
              </p>
            </div>

            {/* Achievements */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-600">
                Verified Achievements & Milestones
              </h2>
              <div className="space-y-2.5">
                {club.achievements.map((ach, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100 text-xs"
                  >
                    <Award className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                    <span className="font-semibold text-slate-800">{ach}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-indigo-600">
                Upcoming Sessions & Events
              </h2>
              <div className="space-y-3">
                {club.upcomingEvents.map(ev => (
                  <div
                    key={ev.id}
                    className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <span className="font-bold text-sm text-slate-900 block">{ev.title}</span>
                      <p className="text-slate-500 text-[11px] mt-0.5">{ev.description}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className="font-bold text-indigo-700 block">{ev.date}</span>
                      <span className="text-[11px] text-slate-400">{ev.location}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            {/* Recruitment Box */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-900">Recruitment Status</h3>
              {club.activeRecruitment ? (
                <div className="space-y-3">
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800">
                    <p className="font-bold">Applications are currently open!</p>
                    {club.recruitmentDeadline && (
                      <p className="text-[11px] mt-0.5">Deadline: {club.recruitmentDeadline}</p>
                    )}
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400">
                      Open Positions:
                    </span>
                    <div className="space-y-1.5 mt-2">
                      {club.recruitmentRoles.map((role, idx) => (
                        <div
                          key={idx}
                          className="p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs font-semibold text-slate-800 flex items-center justify-between"
                        >
                          <span>{role}</span>
                          <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                            Open
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {!isMember && !userApp && (
                    <button
                      onClick={() => setShowApplyModal(true)}
                      className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition shadow-md shadow-indigo-600/20"
                    >
                      Apply Now
                    </button>
                  )}
                </div>
              ) : (
                <p className="text-xs text-slate-500">
                  Recruitment is currently closed for this cycle. Check back next semester!
                </p>
              )}
            </div>

            {/* Core Team Roster */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
              <h3 className="font-bold text-sm text-slate-900">Club Leadership & Members</h3>
              <div className="space-y-3">
                {club.members.slice(0, 4).map(m => (
                  <div key={m.userId} className="flex items-center gap-3">
                    <img
                      src={m.avatar}
                      alt={m.userName}
                      className="w-9 h-9 rounded-xl object-cover ring-2 ring-slate-100"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{m.userName}</p>
                      <p className="text-[10px] text-slate-400">{m.clubRole}</p>
                    </div>
                    <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                      {m.xpEarned} XP
                    </span>
                  </div>
                ))}
              </div>
              <Link
                href={`/members?club=${club.id}`}
                className="block text-center text-xs font-bold text-indigo-600 hover:underline pt-2 border-t border-slate-100"
              >
                View full member directory →
              </Link>
            </div>
          </div>
        </div>

        {/* Application Modal */}
        {showApplyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5 animate-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    Apply to {club.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Applying as: <strong>{currentUser.name}</strong> ({currentUser.department})
                  </p>
                </div>
                <button
                  onClick={() => setShowApplyModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {appliedSuccess ? (
                <div className="py-8 text-center space-y-2">
                  <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-base text-slate-900">Application Submitted!</h4>
                  <p className="text-xs text-slate-600 max-w-xs mx-auto">
                    Your application has been received by {club.leadName}. You can track its status in your dashboard.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmitApplication} className="space-y-4 text-xs">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Select Role to Apply For:
                    </label>
                    <select
                      value={selectedRole}
                      onChange={e => setSelectedRole(e.target.value)}
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
                    >
                      {club.recruitmentRoles.map(role => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Why do you want to join and what will you contribute? (SOP)
                    </label>
                    <textarea
                      rows={3}
                      value={statement}
                      onChange={e => setStatement(e.target.value)}
                      placeholder="Share your background, excitement for this club, and past relevant projects..."
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
                      required
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Portfolio / GitHub / Work Sample Link:
                    </label>
                    <input
                      type="url"
                      value={portfolioUrl}
                      onChange={e => setPortfolioUrl(e.target.value)}
                      placeholder="https://github.com/your-username or portfolio URL"
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">
                      Relevant Skills (Press Enter to add):
                    </label>
                    <input
                      type="text"
                      value={skillInput}
                      onChange={e => setSkillInput(e.target.value)}
                      onKeyDown={handleAddSkill}
                      placeholder="Type skill and press Enter (e.g. Next.js, Figma, Robotics)"
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
                    />
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {selectedSkills.map(skill => (
                        <span
                          key={skill}
                          className="px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 text-[11px] font-semibold flex items-center gap-1 border border-indigo-200"
                        >
                          {skill}
                          <button
                            type="button"
                            onClick={() => handleRemoveSkill(skill)}
                            className="hover:text-rose-600"
                          >
                            ×
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowApplyModal(false)}
                      className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/20"
                    >
                      Submit Application
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default function ClubDetailPage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-xs text-slate-400">Loading club details...</div>}>
      <ClubDetailContent />
    </Suspense>
  );
}
