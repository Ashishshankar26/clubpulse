'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import { useClubPulse } from '@/context/ClubPulseContext';
import { ClubFeedback } from '@/types';
import {
  MessageSquareHeart,
  Star,
  Send,
  CheckCircle2,
  AlertTriangle,
  Users,
  ShieldCheck,
  MessageCircle,
  Sparkles,
  Reply,
  X,
} from 'lucide-react';

export default function PulseFeedbackPage() {
  const {
    clubs,
    feedbacks,
    currentUser,
    submitFeedback,
    respondToFeedback,
  } = useClubPulse();

  const [selectedClubId, setSelectedClubId] = useState<string>(clubs[0]?.id || '');
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;

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

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
              Module 3 • Member Pulse
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Pulse 360 Feedback & Sentiment
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Prevent silent disengagement. Anonymously rate workload fairness, event fatigue, and leadership support.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Club Filter:</span>
            <select
              value={selectedClubId}
              onChange={e => setSelectedClubId(e.target.value)}
              className="p-2 rounded-xl border border-slate-200 bg-white font-bold text-xs shadow-sm"
            >
              {clubs.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Feedback Submission Toast */}
        {submitSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Thank you! Your pulse feedback was recorded and added to the review console.</span>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Form: Submit Pulse Feedback */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center font-bold">
                <MessageSquareHeart className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">
                  Submit Weekly Pulse Check
                </h3>
                <p className="text-[11px] text-slate-500">
                  Takes 30 seconds • Directly shapes club decisions
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Overall Satisfaction */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">Overall Satisfaction:</label>
                  <span className="font-bold text-indigo-600">{overallSatisfaction} / 5 Stars</span>
                </div>
                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setOverallSatisfaction(val)}
                      className={`p-1.5 rounded-lg transition ${
                        val <= overallSatisfaction ? 'text-amber-400' : 'text-slate-200'
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
                  <label className="font-bold text-slate-700">Workload Fairness:</label>
                  <span className="font-bold text-slate-700">{workloadFairness} / 5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={workloadFairness}
                  onChange={e => setWorkloadFairness(Number(e.target.value))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Overburdened</span>
                  <span>Balanced</span>
                </div>
              </div>

              {/* Event Fatigue Score */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700">Event Fatigue / Stress:</label>
                  <span className="font-bold text-amber-600">{eventFatigueScore} / 5</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="5"
                  value={eventFatigueScore}
                  onChange={e => setEventFatigueScore(Number(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Relaxed</span>
                  <span>Exhausted</span>
                </div>
              </div>

              {/* Qualitative feedback text */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Constructive Comments or Suggestions:
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="Share details regarding meetings, task clarity, or burnout concerns..."
                  value={feedbackText}
                  onChange={e => setFeedbackText(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
                />
              </div>

              {/* Anonymous Toggle */}
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-slate-700 text-[11px]">
                    Submit Anonymously
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={e => setIsAnonymous(e.target.checked)}
                  className="w-4 h-4 accent-indigo-600 cursor-pointer"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold transition shadow-md shadow-indigo-600/20 flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Feedback</span>
              </button>
            </form>
          </div>

          {/* Feedback Review Console (for Leads and Members) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">
                  Recent Pulse Reviews & Leadership Responses
                </h3>
                <p className="text-xs text-slate-500">
                  Aggregated insights from club members
                </p>
              </div>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-full">
                {filteredFeedbacks.length} Reviews Logged
              </span>
            </div>

            <div className="space-y-3">
              {filteredFeedbacks.map(item => (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-3"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900">
                        {item.isAnonymous ? 'Anonymous Student' : item.userName}
                      </span>
                      <span
                        className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                          item.sentiment === 'positive'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.sentiment === 'concerning'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-slate-100 text-slate-800'
                        }`}
                      >
                        {item.sentiment}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-amber-400">
                      {[...Array(item.overallSatisfaction)].map((_, i) => (
                        <Star key={i} className="w-3.5 h-3.5 fill-current" />
                      ))}
                    </div>
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed italic bg-slate-50 p-3 rounded-2xl border border-slate-100">
                    "{item.feedbackText}"
                  </p>

                  <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500">
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
                    <div className="p-3 rounded-2xl bg-indigo-50 border border-indigo-100 text-xs text-indigo-900 space-y-1">
                      <span className="font-bold flex items-center gap-1 text-[11px]">
                        <Reply className="w-3 h-3 rotate-180" />
                        Leadership Response:
                      </span>
                      <p className="text-[11px] text-indigo-800">{item.responseNote}</p>
                    </div>
                  )}

                  {/* Lead reply action */}
                  {!item.responded && (
                    <div className="pt-2 border-t border-slate-100 flex justify-end">
                      <button
                        onClick={() => {
                          setRespondingTo(item);
                          setResponseNote('');
                        }}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition"
                      >
                        <Reply className="w-3 h-3" />
                        <span>Add Leadership Response</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Lead Response Modal */}
        {respondingTo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-extrabold text-base text-slate-900">
                  Respond to Feedback
                </h3>
                <button
                  onClick={() => setRespondingTo(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs text-slate-600 italic">
                "{respondingTo.feedbackText}"
              </div>

              <form onSubmit={handleSendResponse} className="space-y-3 text-xs">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">
                    Your Response to Club Members:
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Acknowledge suggestions, detail action plans, or provide context..."
                    value={responseNote}
                    onChange={e => setResponseNote(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-slate-50/50"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setRespondingTo(null)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-md shadow-indigo-600/20"
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
