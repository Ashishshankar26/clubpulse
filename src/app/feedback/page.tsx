'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import { useClubPulse } from '@/context/ClubPulseContext';
import { ClubFeedback } from '@/types';
import { getManagedClubs } from '@/lib/permissions';
import {
  MessageSquareHeart,
  Star,
  Send,
  CheckCircle2,
  AlertTriangle,
  Users,
  ShieldCheck,
  ShieldAlert,
  MessageCircle,
  Sparkles,
  Reply,
  X,
  ArrowRight,
} from 'lucide-react';

export default function PulseFeedbackPage() {
  const {
    clubs,
    feedbacks,
    currentUser,
    submitFeedback,
    respondToFeedback,
  } = useClubPulse();

  const isStudent = currentUser.role === 'student';
  const isAdmin = currentUser.role === 'admin';
  const isLead = currentUser.role === 'club_lead';
  const myLeadClubs = getManagedClubs(currentUser, clubs);

  // User's joined clubs
  const myJoinedClubs = clubs.filter(c =>
    (currentUser.clubsJoined || []).includes(c.id) ||
    (c.members || []).some(m => m.userId === currentUser.id || m.userEmail?.toLowerCase() === currentUser.email?.toLowerCase())
  );

  // Available clubs for current user
  const availableClubs = isStudent
    ? myJoinedClubs
    : isLead
    ? (myLeadClubs.length > 0 ? myLeadClubs : clubs)
    : clubs;

  const [selectedClubId, setSelectedClubId] = useState<string>(
    availableClubs[0]?.id || clubs[0]?.id || ''
  );
  const [overallSatisfaction, setOverallSatisfaction] = useState(5);
  const [workloadFairness, setWorkloadFairness] = useState(4);
  const [leadershipSupport, setLeadershipSupport] = useState(5);
  const [eventFatigueScore, setEventFatigueScore] = useState(2);
  const [feedbackText, setFeedbackText] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // Response state for lead
  const [respondingTo, setRespondingTo] = useState<ClubFeedback | null>(null);
  const [responseNote, setResponseNote] = useState('');

  // Non-member guard for students
  if (isStudent && myJoinedClubs.length === 0) {
    return (
      <AppShell>
        <div className="max-w-xl mx-auto my-12 bg-white dark:bg-slate-900 rounded-xl p-8 border border-slate-200/90 dark:border-slate-800 shadow-xs text-center space-y-4 transition-colors">
          <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
              No Active Club Memberships
            </span>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mt-2">
              Join a Club to Submit Pulse Surveys
            </h2>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
              Pulse 360 sentiment surveys allow active club members to submit anonymous reviews regarding workload fairness, burnout risk, and leadership support. Join a campus club to participate in weekly pulse checks.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/clubs"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-semibold shadow-xs transition"
            >
              <span>Discover Clubs & Apply</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim() || !selectedClubId) return;

    submitFeedback({
      clubId: selectedClubId,
      overallSatisfaction,
      workloadFairness,
      leadershipSupport,
      eventFatigueScore,
      feedbackText,
      isAnonymous,
    });

    setSubmitSuccess(true);
    setFeedbackText('');
    setTimeout(() => setSubmitSuccess(false), 3000);
  };

  const handleSendResponse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!respondingTo || !responseNote.trim()) return;

    respondToFeedback(respondingTo.id, responseNote);
    setRespondingTo(null);
    setResponseNote('');
  };

  const filteredFeedbacks = feedbacks.filter(
    f => !selectedClubId || f.clubId === selectedClubId
  );

  const canRespondToItem = (item: ClubFeedback) => {
    if (isAdmin) return true;
    if (isLead && myLeadClubs.some(c => c.id === item.clubId)) return true;
    return false;
  };

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Module 3 • Member Pulse & Culture
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
              Pulse 360 Feedback & Sentiment
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Prevent silent disengagement. Anonymously rate workload fairness, event fatigue, and leadership support.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Club Filter:</span>
            <select
              value={selectedClubId}
              onChange={e => setSelectedClubId(e.target.value)}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white font-bold text-xs shadow-sm transition-colors"
            >
              {availableClubs.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Feedback Submission Toast */}
        {submitSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>Thank you! Your pulse feedback was recorded and added to the review console.</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form: Submit Pulse Feedback */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-4 transition-colors">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 flex items-center justify-center font-bold">
                <MessageSquareHeart className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Submit Weekly Pulse Check
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Takes 30 seconds • Directly shapes club decisions
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Select Club:</label>
                <select
                  value={selectedClubId}
                  onChange={e => setSelectedClubId(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50 text-slate-900 dark:text-white font-medium transition-colors"
                >
                  {availableClubs.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Overall Satisfaction */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Overall Satisfaction:</label>
                  <span className="font-bold text-slate-900 dark:text-white">{overallSatisfaction} / 5 Stars</span>
                </div>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setOverallSatisfaction(val)}
                      className={`p-1.5 rounded-lg transition ${
                        val <= overallSatisfaction ? 'text-slate-900 dark:text-white' : 'text-slate-200 dark:text-slate-700 hover:text-slate-400'
                      }`}
                    >
                      <Star className="w-6 h-6 fill-current" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Workload Fairness */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Workload Fairness:</label>
                  <span className="font-bold text-slate-900 dark:text-white">{workloadFairness} / 5 Rating</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={workloadFairness}
                  onChange={e => setWorkloadFairness(Number(e.target.value))}
                  className="w-full accent-slate-900 dark:accent-slate-100 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                  <span>Unequal / Overburdened</span>
                  <span>Balanced & Fair</span>
                </div>
              </div>

              {/* Leadership Support */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Leadership Support & Mentorship:</label>
                  <span className="font-bold text-slate-900 dark:text-white">{leadershipSupport} / 5 Rating</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={leadershipSupport}
                  onChange={e => setLeadershipSupport(Number(e.target.value))}
                  className="w-full accent-slate-900 dark:accent-slate-100 cursor-pointer"
                />
              </div>

              {/* Fatigue Score */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Event Fatigue / Stress Level:</label>
                  <span className="font-bold text-slate-900 dark:text-white">{eventFatigueScore} / 5 Stress</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={eventFatigueScore}
                  onChange={e => setEventFatigueScore(Number(e.target.value))}
                  className="w-full accent-slate-900 dark:accent-slate-100 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                  <span>Energized & Normal</span>
                  <span>High Burnout Risk</span>
                </div>
              </div>

              {/* Constructive Comments */}
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Constructive Comments or Suggestions:
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Share details regarding meetings, task clarity, or burnout concerns..."
                  value={feedbackText}
                  onChange={e => setFeedbackText(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-400 focus:border-slate-900 dark:focus:border-slate-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-colors"
                />
              </div>

              {/* Anonymous Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 transition-colors">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-semibold text-slate-700 dark:text-slate-300 text-[11px]">
                    Submit Anonymously
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={e => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 accent-slate-900 dark:accent-slate-100 cursor-pointer"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-medium text-xs transition shadow-xs flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Feedback</span>
              </button>
            </form>
          </div>

          {/* Feedback Review Console */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
                  Recent Pulse Reviews & Leadership Responses
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Aggregated insights from club members
                </p>
              </div>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2.5 py-0.5 rounded-md">
                {filteredFeedbacks.length} Reviews Logged
              </span>
            </div>

            <div className="space-y-3">
              {filteredFeedbacks.map(item => (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-900 rounded-xl p-5 border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3 transition-colors"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-xs text-slate-900 dark:text-white">
                        {item.isAnonymous ? 'Anonymous Student' : item.userName}
                      </span>
                      <span
                        className={`text-[9px] font-semibold uppercase px-2 py-0.5 rounded ${
                          item.sentiment === 'positive'
                            ? 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
                            : item.sentiment === 'concerning'
                            ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                        }`}
                      >
                        {item.sentiment}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-slate-900 dark:text-white">
                      {[...Array(item.overallSatisfaction)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed italic bg-slate-50 dark:bg-slate-800/60 p-3 rounded-lg border border-slate-200/80 dark:border-slate-700">
                    "{item.feedbackText}"
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400">
                    <span>Workload: {item.workloadFairness}/5</span>
                    <span>•</span>
                    <span>Leadership Support: {item.leadershipSupport}/5</span>
                    <span>•</span>
                    <span>Fatigue: {item.eventFatigueScore}/5</span>
                    <span>•</span>
                    <span>Date: {item.submittedDate}</span>
                  </div>

                  {/* Existing response if any */}
                  {item.responded && item.responseNote && (
                    <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-xs text-slate-900 dark:text-white space-y-1">
                      <span className="font-semibold flex items-center gap-1 text-[11px]">
                        <Reply className="w-3 h-3 rotate-180" />
                        Leadership Response:
                      </span>
                      <p className="text-[11px] text-slate-700 dark:text-slate-300">{item.responseNote}</p>
                    </div>
                  )}

                  {/* Lead reply action - strictly for club lead & admin */}
                  {!item.responded && canRespondToItem(item) && (
                    <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex justify-end">
                      <button
                        onClick={() => {
                          setRespondingTo(item);
                          setResponseNote('');
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold flex items-center gap-1 transition"
                      >
                        <Reply className="w-3 h-3" />
                        <span>Add Leadership Response</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}

              {filteredFeedbacks.length === 0 && (
                <div className="p-8 text-center text-xs text-slate-400 dark:text-slate-500 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800">
                  No pulse feedback submitted for this club yet.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Lead Response Modal */}
        {respondingTo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200/90 dark:border-slate-800 space-y-4 animate-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-bold text-base text-slate-900 dark:text-white">
                  Respond to Feedback
                </h3>
                <button
                  onClick={() => setRespondingTo(null)}
                  className="p-1 rounded-lg text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 italic">
                "{respondingTo.feedbackText}"
              </div>

              <form onSubmit={handleSendResponse} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Your Response to Club Members:
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Acknowledge suggestions, detail action plans, or provide context..."
                    value={responseNote}
                    onChange={e => setResponseNote(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-900 dark:focus:ring-slate-400 focus:border-slate-900 dark:focus:border-slate-400 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setRespondingTo(null)}
                    className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium text-xs transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 font-medium text-xs shadow-xs transition"
                  >
                    Post Response
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
