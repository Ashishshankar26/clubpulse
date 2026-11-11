'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import { useClubPulse } from '@/context/ClubPulseContext';
import { Task, TaskPriority, TaskStatus } from '@/types';
import { getManagedClubs, isTaskAssignedToUser, isUserLeadOfClub, getAvatarUrl } from '@/lib/permissions';
import {
  Kanban,
  List,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  AlertCircle,
  Award,
  Calendar,
  X,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Send,
  UserCheck,
  ShieldAlert,
  ArrowRight,
  Tag,
  CheckSquare,
  Layers,
  Sparkles,
  Info,
} from 'lucide-react';

interface ColumnConfig {
  id: TaskStatus;
  label: string;
  color: string;
  badgeBg: string;
  dotColor: string;
  description: string;
}

const COLUMNS: ColumnConfig[] = [
  {
    id: 'todo',
    label: 'To Do',
    color: 'text-slate-800',
    badgeBg: 'bg-slate-100 text-slate-800 border-slate-200',
    dotColor: 'bg-slate-400',
    description: 'Backlog items and tasks ready to be claimed or assigned',
  },
  {
    id: 'in_progress',
    label: 'In Progress',
    color: 'text-blue-900',
    badgeBg: 'bg-blue-50 text-blue-800 border-blue-200',
    dotColor: 'bg-blue-600',
    description: 'Active deliverables currently being worked on by members',
  },
  {
    id: 'under_review',
    label: 'Under Review',
    color: 'text-amber-900',
    badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
    dotColor: 'bg-amber-500',
    description: 'Deliverables submitted by assignees awaiting lead verification & XP approval',
  },
  {
    id: 'completed',
    label: 'Completed',
    color: 'text-emerald-900',
    badgeBg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    dotColor: 'bg-emerald-600',
    description: 'Verified deliverables with officially awarded student activity credits',
  },
  {
    id: 'blocked',
    label: 'Blocked',
    color: 'text-rose-900',
    badgeBg: 'bg-rose-50 text-rose-800 border-rose-200',
    dotColor: 'bg-rose-500',
    description: 'Tasks paused or stalled due to dependencies or administrative bottlenecks',
  },
];

export default function TasksKanbanPage() {
  const {
    tasks,
    clubs,
    users,
    currentUser,
    createTask,
    updateTaskStatus,
    submitTaskForReview,
    reviewTask,
  } = useClubPulse();

  const [viewMode, setViewMode] = useState<'horizontal' | 'list'>('horizontal');
  const [selectedClubId, setSelectedClubId] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [taskError, setTaskError] = useState<string | null>(null);

  // Role derivations
  const isStudent = currentUser.role === 'student';
  const isAdmin = currentUser.role === 'admin';
  const isLead = currentUser.role === 'club_lead';
  const myLeadClubs = getManagedClubs(currentUser, clubs);

  // Clubs joined by current user
  const myJoinedClubs = clubs.filter(c =>
    (currentUser.clubsJoined || []).includes(c.id) ||
    (c.members || []).some(m => m.userId === currentUser.id || m.userEmail?.toLowerCase() === currentUser.email?.toLowerCase())
  );

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTaskDetail, setActiveTaskDetail] = useState<Task | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState<Task | null>(null);
  const [submissionNote, setSubmissionNote] = useState('');
  const [submissionLink, setSubmissionLink] = useState('');

  // Lead review state inside details modal
  const [reviewFeedbackNote, setReviewFeedbackNote] = useState('');

  // Create form state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newClubId, setNewClubId] = useState(myLeadClubs[0]?.id || clubs[0]?.id || '');
  const [newAssigneeId, setNewAssigneeId] = useState(currentUser.id);
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium');
  const [newDueDate, setNewDueDate] = useState('2026-11-15');
  const [newEstHours, setNewEstHours] = useState(6);
  const [newXpReward, setNewXpReward] = useState(80);
  const [newTags, setNewTags] = useState('Frontend, Workshop');

  const today = '2026-10-27';

  // Guard: New users who have not joined any groups should not see internal club tasks
  if (isStudent && myJoinedClubs.length === 0) {
    return (
      <AppShell>
        <div className="max-w-xl mx-auto my-12 bg-white rounded-xl p-8 border border-slate-200/90 shadow-xs text-center space-y-4">
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded border border-slate-200">
              No Active Club Memberships
            </span>
            <h2 className="text-xl font-bold text-slate-900 mt-2">
              Join a Club to Access Task Boards
            </h2>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Task boards contain internal club deliverables, sprint milestones, and contribution trackers. Explore active campus clubs, submit an application, and once approved you will be able to claim tasks and earn verified activity credits.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/clubs"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition"
            >
              <span>Explore Clubs & Apply</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </AppShell>
    );
  }

  // Permitted clubs for dropdown
  const visibleClubOptions = isStudent
    ? myJoinedClubs
    : isLead
    ? (myLeadClubs.length > 0 ? myLeadClubs : clubs)
    : clubs;

  // Filtering
  const filteredTasks = tasks.filter(t => {
    // If student, only show tasks from clubs they belong to
    if (isStudent && !myJoinedClubs.some(c => c.id === t.clubId)) {
      return false;
    }

    const matchesClub = selectedClubId === 'all' || t.clubId === selectedClubId;
    const matchesPriority = selectedPriority === 'all' || t.priority === selectedPriority;
    const matchesAssignee = selectedAssignee === 'all' || t.assigneeId === selectedAssignee;
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.assigneeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (t.tags || []).some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesClub && matchesPriority && matchesAssignee && matchesSearch;
  });

  const handleReviewTask = async (
    taskId: string,
    action: 'approve' | 'request_changes',
    reviewNote?: string
  ) => {
    setTaskError(null);
    const res = await reviewTask(taskId, action, reviewNote);
    if (!res.success) {
      setTaskError(res.error || 'Verification failed');
      setTimeout(() => setTaskError(null), 4000);
    } else {
      // Update active modal task if opened
      if (activeTaskDetail?.id === taskId) {
        const updated = tasks.find(t => t.id === taskId);
        if (updated) {
          setActiveTaskDetail(updated);
        } else {
          setActiveTaskDetail(null);
        }
      }
    }
  };

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    createTask({
      clubId: newClubId,
      title: newTitle,
      description: newDescription,
      assigneeId: newAssigneeId,
      priority: newPriority,
      dueDate: newDueDate,
      estimatedHours: Number(newEstHours),
      tags: newTags.split(',').map(tag => tag.trim()).filter(Boolean),
      xpReward: Number(newXpReward),
    });

    setShowCreateModal(false);
    setNewTitle('');
    setNewDescription('');
  };

  const handleOpenSubmit = (task: Task) => {
    setShowSubmitModal(task);
    setSubmissionNote('');
    setSubmissionLink('');
  };

  const handleSubmitTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showSubmitModal) return;

    submitTaskForReview(
      showSubmitModal.id,
      submissionNote || 'Completed task items according to specifications.',
      submissionLink.trim() || undefined
    );

    setShowSubmitModal(null);
    if (activeTaskDetail?.id === showSubmitModal.id) {
      setActiveTaskDetail(null);
    }
  };

  // Helper to check if current user can lead/manage a task
  const canManageTask = (task: Task) => {
    if (isAdmin) return true;
    if (isLead && myLeadClubs.some(c => c.id === task.clubId)) return true;
    return false;
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Module 2 • Task Management & Workload
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Interactive Club Task Board
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Horizontal status swimlanes with card slider navigation, deliverable verification, and activity credits.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Switcher */}
            <div className="flex items-center bg-slate-200/80 p-1 rounded-xl text-xs">
              <button
                onClick={() => setViewMode('horizontal')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                  viewMode === 'horizontal'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Kanban className="w-3.5 h-3.5" />
                <span>Swimlanes</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                  viewMode === 'list'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                <span>List</span>
              </button>
            </div>

            {/* Create Task Button - Only for club leads & admins */}
            {(isLead || isAdmin) && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Create Task</span>
              </button>
            )}
          </div>
        </div>

        {/* Task Error Banner */}
        {taskError && (
          <div className="p-4 rounded-lg bg-rose-50 border border-rose-300 text-rose-800 text-xs font-semibold flex items-center gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{taskError}</span>
          </div>
        )}

        {/* Toolbar & Filters */}
        <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/90 shadow-xs space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search tasks, tags, assignees..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-900 bg-slate-50/50"
              />
            </div>

            {/* Club Filter */}
            <select
              value={selectedClubId}
              onChange={e => setSelectedClubId(e.target.value)}
              className="p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-900 bg-slate-50/50 font-medium"
            >
              <option value="all">
                {isStudent ? 'All My Clubs' : 'All Clubs'}
              </option>
              {visibleClubOptions.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>

            {/* Priority Filter */}
            <select
              value={selectedPriority}
              onChange={e => setSelectedPriority(e.target.value)}
              className="p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-900 bg-slate-50/50 font-medium"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            {/* Assignee Filter */}
            <select
              value={selectedAssignee}
              onChange={e => setSelectedAssignee(e.target.value)}
              className="p-2 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-900 bg-slate-50/50 font-medium"
            >
              <option value="all">All Assignees</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.role === 'club_lead' ? 'Lead' : u.role === 'admin' ? 'Admin' : 'Student'})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ====================================================================
            VIEW 1: HORIZONTAL SWIMLANES WITH CARD SLIDERS
        ==================================================================== */}
        {viewMode === 'horizontal' && (
          <div className="space-y-6">
            {COLUMNS.map(col => {
              const columnTasks = filteredTasks.filter(t => t.status === col.id);
              return (
                <HorizontalTaskSwimlane
                  key={col.id}
                  column={col}
                  tasks={columnTasks}
                  currentUser={currentUser}
                  myLeadClubs={myLeadClubs}
                  canManageTask={canManageTask}
                  onSelectTask={task => setActiveTaskDetail(task)}
                  onOpenSubmit={task => handleOpenSubmit(task)}
                  onUpdateStatus={(taskId, status) => updateTaskStatus(taskId, status)}
                  onReviewTask={handleReviewTask}
                  onCreateInLane={() => {
                    setShowCreateModal(true);
                  }}
                  isLeadOrAdmin={isLead || isAdmin}
                />
              );
            })}
          </div>
        )}

        {/* ====================================================================
            VIEW 2: TABLE / LIST VIEW
        ==================================================================== */}
        {viewMode === 'list' && (
          <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-500 uppercase font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Task</th>
                    <th className="py-3 px-4">Club</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Priority</th>
                    <th className="py-3 px-4">Assignee</th>
                    <th className="py-3 px-4">Due Date</th>
                    <th className="py-3 px-4">Reward</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTasks.map(t => {
                    const isOverdue = t.status !== 'completed' && t.dueDate < today;
                    return (
                      <tr key={t.id} className="hover:bg-slate-50/80 transition">
                        <td className="py-3 px-4">
                          <button
                            onClick={() => setActiveTaskDetail(t)}
                            className="font-bold text-slate-900 hover:text-blue-600 text-left block"
                          >
                            {t.title}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-slate-600">{t.clubName}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              t.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : t.status === 'under_review'
                                ? 'bg-amber-100 text-amber-800 border border-amber-300'
                                : t.status === 'in_progress'
                                ? 'bg-blue-100 text-blue-900 font-semibold'
                                : t.status === 'blocked'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-100 text-slate-800'
                            }`}
                          >
                            {t.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded font-bold uppercase text-[10px] ${
                              t.priority === 'urgent'
                                ? 'bg-slate-900 text-white shadow-xs'
                                : t.priority === 'high'
                                ? 'bg-slate-200 text-slate-900 font-bold border border-slate-300'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {t.priority}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <img
                              src={getAvatarUrl(t.assigneeAvatar, t.assigneeName)}
                              alt={t.assigneeName}
                              className="w-5 h-5 rounded-full object-cover"
                            />
                            <span className="font-semibold text-slate-800">{t.assigneeName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <span className={isOverdue ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                            {t.dueDate}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">+{t.xpReward} XP</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setActiveTaskDetail(t)}
                            className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-xs transition"
                          >
                            Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {filteredTasks.length === 0 && (
                <div className="p-8 text-center text-xs text-slate-500">
                  No tasks matching selected filter criteria.
                </div>
              )}
            </div>
          </div>
        )}

        {/* ====================================================================
            CREATE TASK MODAL (Leads & Admins)
        ==================================================================== */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200/90 space-y-4 animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center font-bold">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900">Create Club Task</h3>
                    <p className="text-[11px] text-slate-500">
                      Delegate workload and set XP bounty for verification
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-3.5 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Design Event Banner for Techfest 2026"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-900 bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Description & Specifications *
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Provide clear deliverables, links, requirements, and completion criteria..."
                    value={newDescription}
                    onChange={e => setNewDescription(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-900 bg-slate-50/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Club *</label>
                    <select
                      value={newClubId}
                      onChange={e => setNewClubId(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-900 bg-slate-50/50"
                    >
                      {visibleClubOptions.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Assignee *</label>
                    <select
                      value={newAssigneeId}
                      onChange={e => setNewAssigneeId(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-900 bg-slate-50/50"
                    >
                      {users.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.role})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Priority</label>
                    <select
                      value={newPriority}
                      onChange={e => setNewPriority(e.target.value as TaskPriority)}
                      className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-900 bg-slate-50/50"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Due Date</label>
                    <input
                      type="date"
                      value={newDueDate}
                      onChange={e => setNewDueDate(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-900 bg-slate-50/50"
                    >
                    </input>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">XP Reward</label>
                    <input
                      type="number"
                      min={10}
                      max={500}
                      step={10}
                      value={newXpReward}
                      onChange={e => setNewXpReward(Number(e.target.value))}
                      className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-900 bg-slate-50/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Tags (Comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Frontend, Documentation, Workshop"
                    value={newTags}
                    onChange={e => setNewTags(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-900 bg-slate-50/50"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition"
                  >
                    Create & Assign Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ====================================================================
            SUBMIT DELIVERABLE MODAL (Assignee)
        ==================================================================== */}
        {showSubmitModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl border border-slate-200/90 space-y-4 animate-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-800 flex items-center justify-center font-bold">
                    <Send className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900">
                      Submit Deliverable
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Send your completed work for lead verification (+{showSubmitModal.xpReward} XP)
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSubmitModal(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
                <p className="font-semibold text-slate-900">{showSubmitModal.title}</p>
                <p className="text-slate-500 text-[11px] line-clamp-2">{showSubmitModal.description}</p>
              </div>

              <form onSubmit={handleSubmitTask} className="space-y-3.5 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Proof-of-Work Link (GitHub PR, Figma, Drive, or Doc URL)
                  </label>
                  <input
                    type="url"
                    placeholder="https://github.com/... or https://figma.com/..."
                    value={submissionLink}
                    onChange={e => setSubmissionLink(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-900 bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Submission Notes & Summary of Work
                  </label>
                  <textarea
                    rows={3}
                    required
                    placeholder="Briefly describe what you built, tested, and accomplished..."
                    value={submissionNote}
                    onChange={e => setSubmissionNote(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-900 bg-slate-50/50"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(null)}
                    className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition"
                  >
                    Submit for Lead Verification
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ====================================================================
            TASK DETAILS & LEAD WORKFLOW DRAWER / MODAL
        ==================================================================== */}
        {activeTaskDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
              {/* Header */}
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div className="space-y-1.5 flex-1 pr-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded border border-slate-200">
                      {activeTaskDetail.clubName}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                        activeTaskDetail.status === 'completed'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                          : activeTaskDetail.status === 'under_review'
                          ? 'bg-amber-100 text-amber-800 border-amber-300'
                          : activeTaskDetail.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-900 border-blue-200 font-semibold'
                          : activeTaskDetail.status === 'blocked'
                          ? 'bg-rose-100 text-rose-800 border-rose-300'
                          : 'bg-slate-100 text-slate-800 border-slate-200'
                      }`}
                    >
                      {activeTaskDetail.status.replace('_', ' ')}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        activeTaskDetail.priority === 'urgent'
                          ? 'bg-slate-900 text-white'
                          : activeTaskDetail.priority === 'high'
                          ? 'bg-slate-200 text-slate-900 font-bold border border-slate-300'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {activeTaskDetail.priority}
                    </span>
                    <span className="text-[11px] font-extrabold text-slate-900 ml-auto">
                      +{activeTaskDetail.xpReward} XP Reward
                    </span>
                  </div>
                  <h3 className="font-extrabold text-lg text-slate-900 leading-snug">
                    {activeTaskDetail.title}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveTaskDetail(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body */}
              <div className="space-y-4 text-xs">
                {/* Description */}
                <div>
                  <span className="font-bold text-slate-500 uppercase text-[10px] tracking-wider block">
                    Description & Specifications
                  </span>
                  <div className="mt-1 text-slate-700 leading-relaxed bg-slate-50/80 p-3.5 rounded-xl border border-slate-200 whitespace-pre-wrap">
                    {activeTaskDetail.description}
                  </div>
                </div>

                {/* Metadata Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-semibold block">Assignee</span>
                    <div className="flex items-center gap-2 mt-1">
                      <img
                        src={getAvatarUrl(activeTaskDetail.assigneeAvatar, activeTaskDetail.assigneeName)}
                        alt={activeTaskDetail.assigneeName}
                        className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-200"
                      />
                      <span className="font-bold text-slate-800 truncate">{activeTaskDetail.assigneeName}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-semibold block">Due Date</span>
                    <p className="font-bold text-slate-800 mt-1 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      {activeTaskDetail.dueDate}
                    </p>
                  </div>

                  <div>
                    <span className="text-slate-400 text-[10px] uppercase font-semibold block">Estimated Hours</span>
                    <p className="font-bold text-slate-800 mt-1 flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {activeTaskDetail.estimatedHours || 6} hrs
                    </p>
                  </div>
                </div>

                {/* Tags */}
                {(activeTaskDetail.tags || []).length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-slate-400 text-[10px] uppercase font-semibold mr-1">Tags:</span>
                    {(activeTaskDetail.tags || []).map(t => (
                      <span
                        key={t}
                        className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-medium border border-slate-200/80"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}

                {/* Submission Deliverables (if submitted) */}
                {activeTaskDetail.submissionNote && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        Member Submission Deliverable
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500">
                        Awaiting Verification
                      </span>
                    </div>

                    <p className="text-slate-700 italic bg-white p-2.5 rounded-lg border border-slate-200">
                      "{activeTaskDetail.submissionNote}"
                    </p>

                    {activeTaskDetail.submissionLink && (
                      <a
                        href={activeTaskDetail.submissionLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 font-bold text-xs text-blue-600 hover:text-blue-800 hover:underline pt-1"
                      >
                        <span>Inspect External Deliverable Link</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                )}

                {/* Lead Management Console: Change Status directly */}
                {canManageTask(activeTaskDetail) && (
                  <div className="p-4 rounded-xl bg-slate-100/70 border border-slate-200 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-slate-700" />
                        Leadership Status Control
                      </span>
                      <span className="text-[10px] font-semibold text-slate-500">
                        Admin / Club Lead Privileges
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          updateTaskStatus(activeTaskDetail.id, 'todo');
                          setActiveTaskDetail(prev => prev ? { ...prev, status: 'todo' } : null);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                          activeTaskDetail.status === 'todo'
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white hover:bg-slate-200 text-slate-700 border-slate-300'
                        }`}
                      >
                        To Do
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          updateTaskStatus(activeTaskDetail.id, 'in_progress');
                          setActiveTaskDetail(prev => prev ? { ...prev, status: 'in_progress' } : null);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                          activeTaskDetail.status === 'in_progress'
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'bg-white hover:bg-slate-200 text-slate-700 border-slate-300'
                        }`}
                      >
                        In Progress
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          updateTaskStatus(activeTaskDetail.id, 'under_review');
                          setActiveTaskDetail(prev => prev ? { ...prev, status: 'under_review' } : null);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                          activeTaskDetail.status === 'under_review'
                            ? 'bg-amber-600 text-white border-amber-600'
                            : 'bg-white hover:bg-slate-200 text-slate-700 border-slate-300'
                        }`}
                      >
                        Under Review
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          updateTaskStatus(activeTaskDetail.id, 'completed');
                          setActiveTaskDetail(prev => prev ? { ...prev, status: 'completed' } : null);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                          activeTaskDetail.status === 'completed'
                            ? 'bg-emerald-600 text-white border-emerald-600'
                            : 'bg-white hover:bg-slate-200 text-slate-700 border-slate-300'
                        }`}
                      >
                        Completed
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          updateTaskStatus(activeTaskDetail.id, 'blocked');
                          setActiveTaskDetail(prev => prev ? { ...prev, status: 'blocked' } : null);
                        }}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition border ${
                          activeTaskDetail.status === 'blocked'
                            ? 'bg-rose-600 text-white border-rose-600'
                            : 'bg-white hover:bg-slate-200 text-slate-700 border-slate-300'
                        }`}
                      >
                        Blocked
                      </button>
                    </div>
                  </div>
                )}

                {/* Activity & Audit Trail (Safe handling) */}
                <div>
                  <span className="font-bold text-slate-500 uppercase text-[10px] tracking-wider block mb-2">
                    Activity & Audit Trail
                  </span>
                  <div className="space-y-2 max-h-36 overflow-y-auto pr-1">
                    {(activeTaskDetail.activities || []).length > 0 ? (
                      (activeTaskDetail.activities || []).map(act => (
                        <div
                          key={act.id || Math.random().toString()}
                          className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px]"
                        >
                          <div className="flex items-center justify-between text-slate-500">
                            <span className="font-bold text-slate-800">{act.userName || 'Member'}</span>
                            <span className="text-[10px]">{act.timestamp || 'Recent'}</span>
                          </div>
                          <p className="text-slate-700 mt-0.5">{act.action}</p>
                          {act.note && <p className="text-slate-500 italic mt-0.5">"{act.note}"</p>}
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-center text-slate-400 bg-slate-50 rounded-lg border border-slate-200/80 text-[11px]">
                        Initial task record created by club leadership. No additional audit events.
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Drawer Bottom Actions */}
              <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                <button
                  onClick={() => setActiveTaskDetail(null)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 text-xs font-medium"
                >
                  Close
                </button>

                <div className="flex items-center gap-2">
                  {/* If user is assignee and task is in_progress */}
                  {activeTaskDetail.status === 'in_progress' && isTaskAssignedToUser(activeTaskDetail, currentUser) && (
                    <button
                      onClick={() => handleOpenSubmit(activeTaskDetail)}
                      className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium shadow-xs"
                    >
                      Submit Deliverable
                    </button>
                  )}

                  {/* If under_review */}
                  {activeTaskDetail.status === 'under_review' && (
                    isTaskAssignedToUser(activeTaskDetail, currentUser) ? (
                      <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-900 border border-slate-300 text-xs font-semibold">
                        Your Submission • Awaiting Lead Verification
                      </span>
                    ) : canManageTask(activeTaskDetail) ? (
                      <>
                        <button
                          onClick={async () => {
                            await handleReviewTask(activeTaskDetail.id, 'request_changes', reviewFeedbackNote || 'Please refine deliverable');
                            setActiveTaskDetail(null);
                          }}
                          className="px-3 py-2 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-medium border border-rose-200"
                        >
                          Request Changes
                        </button>
                        <button
                          onClick={async () => {
                            await handleReviewTask(activeTaskDetail.id, 'approve', 'Approved deliverable');
                            setActiveTaskDetail(null);
                          }}
                          className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs"
                        >
                          Approve & Verify (+{activeTaskDetail.xpReward} XP)
                        </button>
                      </>
                    ) : (
                      <span className="text-xs text-slate-500 font-medium">
                        Under Lead Review
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

// ============================================================================
// HORIZONTAL SWIMLANE COMPONENT WITH SMOOTH SLIDER CONTROLS
// ============================================================================
interface HorizontalTaskSwimlaneProps {
  column: ColumnConfig;
  tasks: Task[];
  currentUser: any;
  myLeadClubs: any[];
  canManageTask: (task: Task) => boolean;
  onSelectTask: (task: Task) => void;
  onOpenSubmit: (task: Task) => void;
  onUpdateStatus: (taskId: string, status: TaskStatus) => void;
  onReviewTask: (taskId: string, action: 'approve' | 'request_changes', note?: string) => Promise<void>;
  onCreateInLane: () => void;
  isLeadOrAdmin: boolean;
}

function HorizontalTaskSwimlane({
  column,
  tasks,
  currentUser,
  myLeadClubs,
  canManageTask,
  onSelectTask,
  onOpenSubmit,
  onUpdateStatus,
  onReviewTask,
  onCreateInLane,
  isLeadOrAdmin,
}: HorizontalTaskSwimlaneProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const today = '2026-10-27';

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 360;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="bg-slate-50/80 rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs space-y-3">
      {/* Swimlane Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200/70">
        <div className="flex items-center gap-3">
          <span className={`w-3 h-3 rounded-full ${column.dotColor}`} />
          <div className="flex items-center gap-2">
            <h2 className={`font-extrabold text-sm sm:text-base ${column.color}`}>
              {column.label}
            </h2>
            <span className="text-[11px] font-extrabold bg-white px-2.5 py-0.5 rounded-full text-slate-700 shadow-2xs border border-slate-200">
              {tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}
            </span>
          </div>
          <span className="hidden md:inline-block text-xs text-slate-500 border-l border-slate-200 pl-3">
            {column.description}
          </span>
        </div>

        {/* Slider Navigation Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {isLeadOrAdmin && (
            <button
              onClick={onCreateInLane}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold shadow-2xs flex items-center gap-1 transition"
              title="Add task"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add Task</span>
            </button>
          )}

          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
            <button
              onClick={() => handleScroll('left')}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 active:scale-95 transition"
              title="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleScroll('right')}
              className="p-1 rounded-lg hover:bg-slate-100 text-slate-600 active:scale-95 transition"
              title="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Horizontally Scrollable Cards Track */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto pb-2 pt-1 px-0.5 scroll-smooth [scrollbar-width:thin] [scrollbar-color:#cbd5e1_transparent]"
      >
        {tasks.map(task => {
          const isOverdue = task.status !== 'completed' && task.dueDate < today;
          const isMyTask = isTaskAssignedToUser(task, currentUser);

          return (
            <div
              key={task.id}
              className="w-[310px] sm:w-[340px] shrink-0 bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs hover:shadow-xs transition flex flex-col justify-between h-[235px] group"
            >
              {/* Top Row: Priority, Overdue, XP */}
              <div className="flex items-center justify-between gap-1.5">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      task.priority === 'urgent'
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : task.priority === 'high'
                        ? 'bg-slate-200 text-slate-900 font-bold border border-slate-300'
                        : task.priority === 'medium'
                        ? 'bg-slate-100 text-slate-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {task.priority}
                  </span>

                  {isOverdue && (
                    <span className="text-[9px] font-extrabold uppercase bg-rose-600 text-white px-1.5 py-0.5 rounded flex items-center gap-0.5 shadow-2xs">
                      <AlertTriangle className="w-2.5 h-2.5" /> Overdue
                    </span>
                  )}
                </div>

                <span className="text-[11px] font-extrabold text-slate-900 shrink-0">
                  +{task.xpReward} XP
                </span>
              </div>

              {/* Title & Description */}
              <div className="my-1.5">
                <h3
                  onClick={() => onSelectTask(task)}
                  className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-blue-600 cursor-pointer line-clamp-2 leading-snug transition"
                  title={task.title}
                >
                  {task.title}
                </h3>
                <p
                  className="text-[11px] text-slate-500 line-clamp-2 mt-1 leading-relaxed"
                  title={task.description}
                >
                  {task.description}
                </p>
                <div className="flex items-center gap-1.5 mt-1.5 overflow-hidden">
                  <span className="text-[10px] font-semibold text-slate-500 truncate max-w-[140px]">
                    {task.clubName}
                  </span>
                  {(task.tags || []).slice(0, 2).map(tag => (
                    <span
                      key={tag}
                      className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 font-medium truncate"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>

              {/* Assignee & Due Date Row */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-1.5 min-w-0" title={`Assigned to ${task.assigneeName}`}>
                  <img
                    src={getAvatarUrl(task.assigneeAvatar, task.assigneeName)}
                    alt={task.assigneeName}
                    className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                  />
                  <span className="font-semibold text-slate-700 truncate max-w-[100px]">
                    {task.assigneeName}
                  </span>
                </div>

                <span className={`text-[10px] flex items-center gap-1 shrink-0 ${isOverdue ? 'text-rose-600 font-bold' : 'text-slate-400'}`}>
                  <Calendar className="w-2.5 h-2.5" />
                  {task.dueDate}
                </span>
              </div>

              {/* Action Buttons Bar */}
              <div className="pt-2 border-t border-slate-100/70 flex items-center justify-between gap-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => onSelectTask(task)}
                  className="text-slate-600 hover:text-slate-900 font-semibold px-2 py-0.5 rounded hover:bg-slate-100 transition"
                >
                  Details
                </button>

                {/* Contextual Action */}
                {task.status === 'todo' && isMyTask && (
                  <button
                    type="button"
                    onClick={() => onUpdateStatus(task.id, 'in_progress')}
                    className="px-2.5 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold transition"
                  >
                    Start →
                  </button>
                )}

                {task.status === 'in_progress' && isMyTask && (
                  <button
                    type="button"
                    onClick={() => onOpenSubmit(task)}
                    className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-2xs transition"
                  >
                    Submit →
                  </button>
                )}

                {task.status === 'under_review' && (
                  isMyTask ? (
                    <span className="text-[10px] font-semibold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Under Review
                    </span>
                  ) : canManageTask(task) ? (
                    <button
                      type="button"
                      onClick={() => onReviewTask(task.id, 'approve', 'Approved from Kanban Board')}
                      className="px-2.5 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-semibold shadow-2xs transition"
                    >
                      Approve ✓
                    </button>
                  ) : (
                    <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      Under Review
                    </span>
                  )
                )}

                {task.status === 'completed' && (
                  <span className="text-emerald-700 font-bold text-[10px] flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Verified
                  </span>
                )}

                {task.status === 'blocked' && (
                  canManageTask(task) ? (
                    <button
                      type="button"
                      onClick={() => onUpdateStatus(task.id, 'in_progress')}
                      className="px-2 py-0.5 rounded-md bg-rose-50 hover:bg-rose-100 text-rose-700 text-[10px] font-semibold border border-rose-200 transition"
                    >
                      Unblock →
                    </button>
                  ) : (
                    <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                      Blocked
                    </span>
                  )
                )}
              </div>
            </div>
          );
        })}

        {tasks.length === 0 && (
          <div className="w-full py-8 px-6 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl text-center space-y-1 bg-white/60">
            <CheckSquare className="w-6 h-6 text-slate-300" />
            <p className="text-xs font-semibold text-slate-600">
              No tasks currently in {column.label}
            </p>
            <p className="text-[11px] text-slate-400">
              {column.description}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
