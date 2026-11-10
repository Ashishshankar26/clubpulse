'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import { useClubPulse } from '@/context/ClubPulseContext';
import { Task, TaskStatus } from '@/types';
import { isTaskAssignedToUser } from '@/lib/permissions';
import {
  CheckSquare,
  Clock,
  AlertTriangle,
  Award,
  Calendar,
  Send,
  ExternalLink,
  CheckCircle2,
  X,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export default function MyTasksDashboardPage() {
  const {
    currentUser,
    tasks,
    updateTaskStatus,
    submitTaskForReview,
  } = useClubPulse();

  const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');
  const [showSubmitModal, setShowSubmitModal] = useState<Task | null>(null);
  const [submissionNote, setSubmissionNote] = useState('');
  const [submissionLink, setSubmissionLink] = useState('');

  const today = '2026-10-27';

  const myTasks = tasks.filter(t => isTaskAssignedToUser(t, currentUser));
  const pendingTasks = myTasks.filter(t => t.status !== 'completed');
  const completedTasks = myTasks.filter(t => t.status === 'completed');

  const displayedTasks = activeTab === 'pending' ? pendingTasks : completedTasks;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showSubmitModal) return;

    submitTaskForReview(
      showSubmitModal.id,
      submissionNote || 'Task completed according to requirements.',
      submissionLink.trim() || undefined
    );

    setShowSubmitModal(null);
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Module 2 • Personal Workload
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              My Assigned Tasks & Submissions
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Deliver on commitments, track upcoming deadlines, and submit completed work for lead verification.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/tasks"
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-medium transition"
            >
              All Club Kanban Board
            </Link>
            <Link
              href="/contributions"
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium shadow-xs transition flex items-center gap-1.5"
            >
              <Award className="w-4 h-4" />
              <span>Verified Portfolio</span>
            </Link>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition flex items-center gap-2 ${
              activeTab === 'pending'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Active & In-Progress ({pendingTasks.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition flex items-center gap-2 ${
              activeTab === 'completed'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Completed & Verified ({completedTasks.length})</span>
          </button>
        </div>

        {/* Task Cards List */}
        <div className="space-y-4">
          {displayedTasks.length === 0 ? (
            <div className="bg-white rounded-xl p-12 border border-slate-200/90 text-center space-y-3">
              <CheckSquare className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-slate-700 font-bold text-sm">
                {activeTab === 'pending' ? 'No pending tasks assigned to you!' : 'No completed tasks yet.'}
              </p>
              <p className="text-xs text-slate-400">
                {activeTab === 'pending'
                  ? 'Explore the Kanban board to pick up starter tasks or check in with your club lead.'
                  : 'Submit active tasks to have your contributions reviewed and verified.'}
              </p>
            </div>
          ) : (
            displayedTasks.map(task => {
              const isOverdue = task.status !== 'completed' && task.dueDate < today;
              return (
                <div
                  key={task.id}
                  className="bg-white rounded-xl p-6 border border-slate-200/90 shadow-xs hover:shadow-sm transition space-y-4"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-slate-800 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
                          {task.clubName}
                        </span>
                        <span
                          className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${
                            task.priority === 'urgent'
                              ? 'bg-slate-900 text-white shadow-xs'
                              : task.priority === 'high'
                              ? 'bg-slate-200 text-slate-900 font-bold border border-slate-300'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {task.priority} Priority
                        </span>
                        <span
                          className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${
                            task.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : task.status === 'under_review'
                              ? 'bg-slate-100 text-slate-800 border border-slate-300'
                              : task.status === 'in_progress'
                              ? 'bg-slate-100 text-slate-800'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {task.status.replace('_', ' ')}
                        </span>
                        {isOverdue && (
                          <span className="text-[10px] font-semibold uppercase tracking-wider bg-rose-600 text-white px-2 py-0.5 rounded flex items-center gap-1 shadow-xs">
                            <AlertTriangle className="w-3 h-3" /> Overdue
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-bold text-slate-900 mt-1">
                        {task.title}
                      </h3>

                      <p className="text-xs text-slate-600 leading-relaxed max-w-2xl">
                        {task.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-2">
                        <span className="flex items-center gap-1 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          Due: <strong className={isOverdue ? 'text-rose-600' : 'text-slate-700'}>{task.dueDate}</strong>
                        </span>
                        <span>•</span>
                        <span>Est: {task.estimatedHours} Hours</span>
                        <span>•</span>
                        <span className="font-semibold text-slate-900">Reward: +{task.xpReward} XP</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 shrink-0">
                      {task.status === 'todo' && (
                        <button
                          onClick={() => updateTaskStatus(task.id, 'in_progress', 'Started task work')}
                          className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium shadow-xs transition"
                        >
                          Start Working
                        </button>
                      )}

                      {task.status === 'in_progress' && (
                        <button
                          onClick={() => {
                            setShowSubmitModal(task);
                            setSubmissionNote('');
                            setSubmissionLink('');
                          }}
                          className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium shadow-xs transition flex items-center justify-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit for Review</span>
                        </button>
                      )}

                      {task.status === 'under_review' && (
                        <div className="p-2.5 rounded-lg bg-slate-100 border border-slate-300 text-slate-800 text-xs text-center font-medium">
                          ⏳ Under Lead Review
                        </div>
                      )}

                      {task.status === 'completed' && (
                        <span className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                          Verified (+{task.xpReward} XP)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Submission note preview if exists */}
                  {task.submissionNote && (
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                      <span className="font-semibold text-slate-700 text-[11px] uppercase tracking-wider block">
                        Submission Note:
                      </span>
                      <p className="text-slate-600 italic">"{task.submissionNote}"</p>
                      {task.submissionLink && (
                        <a
                          href={task.submissionLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-900 font-semibold hover:underline flex items-center gap-1 pt-1"
                        >
                          <span>Deliverable Link</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Submission Modal */}
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200/90 space-y-4 animate-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-base text-slate-900">Submit Work for Review</h3>
                  <p className="text-xs text-slate-500">{showSubmitModal.title}</p>
                </div>
                <button
                  onClick={() => setShowSubmitModal(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Deliverable URL (GitHub / Google Drive / Figma / Demo):
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={submissionLink}
                    onChange={e => setSubmissionLink(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-900 bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Completion Notes for Lead:
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe how the requirements were met..."
                    value={submissionNote}
                    onChange={e => setSubmissionNote(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-900 bg-slate-50/50"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(null)}
                    className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium shadow-xs transition"
                  >
                    Submit for Review
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
