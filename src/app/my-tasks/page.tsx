'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import { useClubPulse } from '@/context/ClubPulseContext';
import { Task, TaskStatus } from '@/types';
import { isTaskAssignedToUser, getAvatarUrl } from '@/lib/permissions';
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
  Info,
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
  const [activeDetailTask, setActiveDetailTask] = useState<Task | null>(null);
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
    if (activeDetailTask?.id === showSubmitModal.id) {
      setActiveDetailTask(null);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Module 2 • Personal Workload
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight mt-1">
              My Assigned Tasks & Submissions
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1">
              Deliver on commitments, track upcoming deadlines, and submit completed work for lead verification.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/tasks"
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition"
            >
              Task Board Swimlanes
            </Link>
            <Link
              href="/contributions"
              className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-black text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
            >
              <Award className="w-4 h-4" />
              <span>Verified Portfolio</span>
            </Link>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition flex items-center gap-2 ${
              activeTab === 'pending'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-black shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Active & In-Progress ({pendingTasks.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`px-4 py-2 rounded-lg text-xs font-medium transition flex items-center gap-2 ${
              activeTab === 'completed'
                ? 'bg-slate-900 dark:bg-white text-white dark:text-black shadow-xs font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Completed & Verified ({completedTasks.length})</span>
          </button>
        </div>

        {/* Task Cards List */}
        <div className="space-y-4">
          {displayedTasks.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 rounded-xl p-12 border border-slate-200/90 dark:border-slate-800 text-center space-y-3">
              <CheckSquare className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-slate-700 dark:text-slate-300 font-bold text-sm">
                {activeTab === 'pending' ? 'No pending tasks assigned to you!' : 'No completed tasks yet.'}
              </p>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                {activeTab === 'pending'
                  ? 'Explore the Task Board to pick up starter tasks or check in with your club lead.'
                  : 'Submit active tasks to have your contributions reviewed and verified.'}
              </p>
            </div>
          ) : (
            displayedTasks.map(task => {
              const isOverdue = task.status !== 'completed' && task.dueDate < today;
              return (
                <div
                  key={task.id}
                  className="bg-white dark:bg-slate-900 rounded-xl p-5 sm:p-6 border border-slate-200/90 dark:border-slate-800 shadow-2xs hover:shadow-xs transition space-y-4"
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                          {task.clubName}
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                            task.priority === 'urgent'
                              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                              : task.priority === 'high'
                              ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white font-bold border border-slate-300 dark:border-slate-600'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                          }`}
                        >
                          {task.priority} Priority
                        </span>
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                            task.status === 'completed'
                              ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50'
                              : task.status === 'under_review'
                              ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-900/50'
                              : task.status === 'in_progress'
                              ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-900 dark:text-blue-300 border-blue-200 dark:border-blue-900/50'
                              : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                          }`}
                        >
                          {task.status.replace('_', ' ')}
                        </span>
                        {isOverdue && (
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-rose-600 text-white px-2 py-0.5 rounded flex items-center gap-1 shadow-xs">
                            <AlertTriangle className="w-3 h-3" /> Overdue
                          </span>
                        )}
                      </div>

                      <h3
                        onClick={() => setActiveDetailTask(task)}
                        className="text-base font-bold text-slate-900 dark:text-white hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer transition"
                      >
                        {task.title}
                      </h3>

                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
                        {task.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400 pt-1">
                        <span className="flex items-center gap-1 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          Due: <strong className={isOverdue ? 'text-rose-600 dark:text-rose-400' : 'text-slate-700 dark:text-slate-300'}>{task.dueDate}</strong>
                        </span>
                        <span>•</span>
                        <span>Est: {task.estimatedHours || 6} Hours</span>
                        <span>•</span>
                        <span className="font-bold text-slate-900 dark:text-white">Reward: +{task.xpReward} XP</span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => setActiveDetailTask(task)}
                        className="px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-semibold transition"
                      >
                        Details
                      </button>

                      {task.status === 'todo' && (
                        <button
                          onClick={() => updateTaskStatus(task.id, 'in_progress', 'Started task work')}
                          className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-black text-xs font-semibold shadow-xs transition"
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
                          className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-black text-xs font-semibold shadow-xs transition flex items-center justify-center gap-1.5"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit Deliverable</span>
                        </button>
                      )}

                      {task.status === 'under_review' && (
                        <div className="px-3 py-2 rounded-lg bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-900/50 text-amber-900 dark:text-amber-300 text-xs text-center font-semibold">
                          ⏳ Under Lead Review
                        </div>
                      )}

                      {task.status === 'completed' && (
                        <span className="px-3 py-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900/50 text-xs font-bold flex items-center justify-center gap-1">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                          Verified (+{task.xpReward} XP)
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Submission note preview if exists */}
                  {task.submissionNote && (
                    <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                      <span className="font-bold text-slate-700 dark:text-slate-300 text-[10px] uppercase tracking-wider block">
                        Submission Note:
                      </span>
                      <p className="text-slate-600 dark:text-slate-400 italic">"{task.submissionNote}"</p>
                      {task.submissionLink && (
                        <a
                          href={task.submissionLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-slate-900 dark:text-white font-semibold hover:underline flex items-center gap-1 pt-1"
                        >
                          <span>View Submitted Deliverable Link</span>
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

        {/* Task Detail Modal */}
        {activeDetailTask && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
              <div className="flex items-start justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded">
                      {activeDetailTask.clubName}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-0.5 rounded">
                      {activeDetailTask.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                    {activeDetailTask.title}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveDetailTask(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3.5 text-xs">
                <div>
                  <span className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider block">
                    Scope & Description:
                  </span>
                  <p className="mt-1 text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200 dark:border-slate-700 whitespace-pre-wrap">
                    {activeDetailTask.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-semibold">Due Date:</span>
                    <p className="font-bold text-slate-800 dark:text-slate-200 mt-0.5">{activeDetailTask.dueDate}</p>
                  </div>
                  <div>
                    <span className="text-slate-400 dark:text-slate-500 text-[10px] uppercase font-semibold">Reward Bounty:</span>
                    <p className="font-bold text-slate-900 dark:text-white mt-0.5">+{activeDetailTask.xpReward} XP</p>
                  </div>
                </div>

                {/* Audit Trail */}
                <div>
                  <span className="font-bold text-slate-500 dark:text-slate-400 uppercase text-[10px] tracking-wider block mb-1">
                    Activity & Audit Trail:
                  </span>
                  <div className="space-y-1.5 max-h-32 overflow-y-auto">
                    {(activeDetailTask.activities || []).length > 0 ? (
                      (activeDetailTask.activities || []).map(act => (
                        <div
                          key={act.id || Math.random().toString()}
                          className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 text-[11px]"
                        >
                          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                            <span className="font-bold text-slate-700 dark:text-slate-200">{act.userName || 'Member'}</span>
                            <span className="text-[10px]">{act.timestamp || 'Recent'}</span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-400 mt-0.5">{act.action}</p>
                          {act.note && <p className="text-slate-500 dark:text-slate-400 italic mt-0.5">"{act.note}"</p>}
                        </div>
                      ))
                    ) : (
                      <div className="p-2 text-center text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/40 rounded-lg text-[11px]">
                        No additional activity recorded yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setActiveDetailTask(null)}
                  className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold"
                >
                  Close
                </button>
                {activeDetailTask.status === 'in_progress' && (
                  <button
                    onClick={() => {
                      setShowSubmitModal(activeDetailTask);
                      setActiveDetailTask(null);
                    }}
                    className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-black text-xs font-semibold shadow-xs"
                  >
                    Submit Deliverable
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Submission Modal */}
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 dark:bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white dark:bg-slate-900 rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200/90 dark:border-slate-800 space-y-4 animate-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">Submit Work for Review</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">{showSubmitModal.title}</p>
                </div>
                <button
                  onClick={() => setShowSubmitModal(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Deliverable URL (GitHub / Google Drive / Figma / Demo):
                  </label>
                  <input
                    type="url"
                    placeholder="https://..."
                    value={submissionLink}
                    onChange={e => setSubmissionLink(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-slate-900 dark:focus:border-white bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Completion Notes for Lead:
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Describe how the requirements were met..."
                    value={submissionNote}
                    onChange={e => setSubmissionNote(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 focus:outline-none focus:border-slate-900 dark:focus:border-white bg-slate-50/50 dark:bg-slate-800/60 text-slate-900 dark:text-white"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(null)}
                    className="px-4 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-200 text-white dark:text-black font-semibold shadow-xs transition"
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
