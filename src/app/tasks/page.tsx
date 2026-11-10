'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/layout/AppShell';
import { useClubPulse } from '@/context/ClubPulseContext';
import { Task, TaskPriority, TaskStatus } from '@/types';
import { getManagedClubs, isTaskAssignedToUser, getAvatarUrl } from '@/lib/permissions';
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
  Flame,
  Award,
  Calendar,
  X,
  ExternalLink,
  ChevronRight,
  Send,
  UserCheck,
} from 'lucide-react';

const COLUMNS: { id: TaskStatus; label: string; color: string; bg: string }[] = [
  { id: 'todo', label: 'To Do', color: 'text-slate-700', bg: 'bg-slate-100' },
  { id: 'in_progress', label: 'In Progress', color: 'text-slate-700', bg: 'bg-slate-50' },
  { id: 'under_review', label: 'Under Review', color: 'text-slate-900', bg: 'bg-slate-100' },
  { id: 'completed', label: 'Completed', color: 'text-slate-900', bg: 'bg-slate-100' },
  { id: 'blocked', label: 'Blocked', color: 'text-slate-600', bg: 'bg-slate-100' },
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

  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [selectedClubId, setSelectedClubId] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');
  const [selectedAssignee, setSelectedAssignee] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [taskError, setTaskError] = useState<string | null>(null);

  const myLeadClubs = getManagedClubs(currentUser, clubs);

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
    }
  };

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeTaskDetail, setActiveTaskDetail] = useState<Task | null>(null);
  const [showSubmitModal, setShowSubmitModal] = useState<Task | null>(null);
  const [submissionNote, setSubmissionNote] = useState('');
  const [submissionLink, setSubmissionLink] = useState('');

  // Create form state
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newClubId, setNewClubId] = useState(clubs[0]?.id || '');
  const [newAssigneeId, setNewAssigneeId] = useState(currentUser.id);
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium');
  const [newDueDate, setNewDueDate] = useState('2026-11-05');
  const [newEstHours, setNewEstHours] = useState(6);
  const [newXpReward, setNewXpReward] = useState(80);
  const [newTags, setNewTags] = useState('Frontend, Workshop');

  const today = '2026-10-27';

  // Filtering
  const filteredTasks = tasks.filter(t => {
    const matchesClub = selectedClubId === 'all' || t.clubId === selectedClubId;
    const matchesPriority = selectedPriority === 'all' || t.priority === selectedPriority;
    const matchesAssignee = selectedAssignee === 'all' || t.assigneeId === selectedAssignee;
    const matchesSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.assigneeName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesClub && matchesPriority && matchesAssignee && matchesSearch;
  });

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

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Module 2 • Task Management
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Interactive Club Task Board
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Track tasks, delegate workloads, submit work for review, and verify contributions to reward XP.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* View Switcher */}
            <div className="flex items-center bg-slate-200/80 p-1 rounded-xl text-xs">
              <button
                onClick={() => setViewMode('kanban')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition ${
                  viewMode === 'kanban'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Kanban className="w-3.5 h-3.5" />
                <span>Kanban</span>
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
            {(currentUser.role === 'club_lead' || currentUser.role === 'admin') && (
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
                placeholder="Search tasks..."
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
              <option value="all">All Clubs</option>
              {clubs.map(c => (
                <option key={c.id} value={c.id}>
                  {c.shortName}
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
                  {u.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* ====================================================================
            VIEW 1: KANBAN BOARD (5 COLUMNS)
        ==================================================================== */}
        {viewMode === 'kanban' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
            {COLUMNS.map(col => {
              const columnTasks = filteredTasks.filter(t => t.status === col.id);
              return (
                <div
                  key={col.id}
                  className="bg-slate-100/70 rounded-xl p-3 border border-slate-200/90 flex flex-col min-h-[550px]"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between px-2 py-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${
                        col.id === 'todo' ? 'bg-slate-400' :
                        col.id === 'in_progress' ? 'bg-slate-600' :
                        col.id === 'under_review' ? 'bg-slate-800' :
                        col.id === 'completed' ? 'bg-slate-900' : 'bg-slate-500'
                      }`} />
                      <h3 className={`font-bold text-xs uppercase tracking-wider ${col.color}`}>
                        {col.label}
                      </h3>
                    </div>
                    <span className="text-[11px] font-extrabold bg-white px-2 py-0.5 rounded-full text-slate-600 shadow-xs border border-slate-200">
                      {columnTasks.length}
                    </span>
                  </div>

                  {/* Tasks List in Column */}
                  <div className="space-y-3 flex-1 overflow-y-auto">
                    {columnTasks.map(task => {
                      const isOverdue = task.status !== 'completed' && task.dueDate < today;
                      const isMyTask = isTaskAssignedToUser(task, currentUser);

                      return (
                        <div
                          key={task.id}
                          className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-2xs hover:shadow-xs transition space-y-3 group"
                        >
                          {/* Priority & Overdue badges */}
                          <div className="flex items-center justify-between gap-1">
                            <span
                              className={`text-[9px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded ${
                                task.priority === 'urgent'
                                  ? 'bg-slate-900 text-white shadow-xs'
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
                              <span className="text-[9px] font-extrabold uppercase bg-rose-600 text-white px-1.5 py-0.5 rounded-md flex items-center gap-0.5 shadow-xs">
                                <AlertTriangle className="w-2.5 h-2.5" /> Overdue
                              </span>
                            )}

                            <span className="text-[10px] font-bold text-slate-900 ml-auto">
                              +{task.xpReward} XP
                            </span>
                          </div>

                          {/* Title & Description */}
                          <div>
                            <h4
                              onClick={() => setActiveTaskDetail(task)}
                              className="font-bold text-xs text-slate-900 group-hover:text-slate-700 cursor-pointer line-clamp-2 leading-snug"
                            >
                              {task.title}
                            </h4>
                            <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                              {task.description}
                            </p>
                          </div>

                          {/* Club tag */}
                          <p className="text-[10px] font-medium text-slate-400">
                            {task.clubName}
                          </p>

                          {/* Assignee & Due Date */}
                          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                            <div className="flex items-center gap-1.5" title={`Assigned to ${task.assigneeName}`}>
                              <img
                                src={getAvatarUrl(task.assigneeAvatar, task.assigneeName)}
                                alt={task.assigneeName}
                                className="w-5 h-5 rounded-full object-cover ring-1 ring-slate-200"
                              />
                              <span className="font-semibold text-slate-700 truncate max-w-[80px]">
                                {task.assigneeName.split(' ')[0]}
                              </span>
                            </div>

                            <span className="text-slate-400 text-[10px] flex items-center gap-1">
                              <Calendar className="w-2.5 h-2.5" />
                              {task.dueDate.substring(5)}
                            </span>
                          </div>

                          {/* Quick Interactive Status Action */}
                          <div className="pt-2 border-t border-slate-100/60 flex items-center justify-between gap-1 text-[10px]">
                            <button
                              onClick={() => setActiveTaskDetail(task)}
                              className="text-slate-500 hover:text-slate-900 font-medium"
                            >
                              Details
                            </button>

                            {task.status === 'todo' && isTaskAssignedToUser(task, currentUser) && (
                              <button
                                onClick={() => updateTaskStatus(task.id, 'in_progress')}
                                className="px-2 py-1 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-800 font-medium"
                              >
                                Start →
                              </button>
                            )}

                            {task.status === 'in_progress' && isTaskAssignedToUser(task, currentUser) && (
                              <button
                                onClick={() => handleOpenSubmit(task)}
                                className="px-2 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-medium shadow-xs"
                              >
                                Submit →
                              </button>
                            )}

                            {task.status === 'under_review' && (
                              isTaskAssignedToUser(task, currentUser) ? (
                                <span className="text-[10px] font-semibold text-slate-900 bg-slate-100 px-2 py-0.5 rounded border border-slate-300">
                                  Under Lead Review
                                </span>
                              ) : (currentUser.role === 'admin' || (currentUser.role === 'club_lead' && myLeadClubs.some(c => c.id === task.clubId))) ? (
                                <button
                                  onClick={() => handleReviewTask(task.id, 'approve', 'Approved from Kanban Board')}
                                  className="px-2 py-1 rounded-md bg-slate-900 hover:bg-slate-800 text-white font-medium shadow-xs"
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
                              <span className="text-emerald-700 font-medium flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Done
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {columnTasks.length === 0 && (
                      <div className="h-32 flex items-center justify-center border-2 border-dashed border-slate-200 rounded-xl text-[11px] text-slate-400">
                        No tasks
                      </div>
                    )}
                  </div>
                </div>
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
                            className="font-bold text-slate-900 hover:text-slate-700 text-left block"
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
                                ? 'bg-slate-100 text-slate-800 border border-slate-300'
                                : t.status === 'in_progress'
                                ? 'bg-slate-200 text-slate-900 font-semibold'
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
                        <td className="py-3 px-4 font-semibold text-slate-700">
                          {t.assigneeName}
                        </td>
                        <td className="py-3 px-4">
                          <span className={isOverdue ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                            {t.dueDate} {isOverdue && '(Overdue!)'}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900">+{t.xpReward} XP</td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => setActiveTaskDetail(t)}
                            className="text-slate-900 font-semibold hover:underline"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ====================================================================
            MODAL 1: CREATE TASK DIALOG
        ==================================================================== */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200/90 space-y-4 animate-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-bold text-base text-slate-900">Create New Club Task</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateTask} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Task Title:</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Design Hackathon Poster & Speaker Deck"
                    value={newTitle}
                    onChange={e => setNewTitle(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-900 bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Description:</label>
                  <textarea
                    rows={2}
                    placeholder="Detail the deliverables, acceptance criteria, and expected output..."
                    value={newDescription}
                    onChange={e => setNewDescription(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-900 bg-slate-50/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Club Organization:</label>
                    <select
                      value={newClubId}
                      onChange={e => setNewClubId(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 focus:outline-none focus:border-slate-900"
                    >
                      {(currentUser.role === 'admin' ? clubs : myLeadClubs).map(c => (
                        <option key={c.id} value={c.id}>
                          {c.shortName}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Assignee:</label>
                    <select
                      value={newAssigneeId}
                      onChange={e => setNewAssigneeId(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 focus:outline-none focus:border-slate-900"
                    >
                      {users.map(u => (
                        <option key={u.id} value={u.id}>
                          {u.name} ({u.role.replace('_', ' ')})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Priority:</label>
                    <select
                      value={newPriority}
                      onChange={e => setNewPriority(e.target.value as TaskPriority)}
                      className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 focus:outline-none focus:border-slate-900"
                    >
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Due Date:</label>
                    <input
                      type="date"
                      required
                      value={newDueDate}
                      onChange={e => setNewDueDate(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 focus:outline-none focus:border-slate-900"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">XP Reward:</label>
                    <input
                      type="number"
                      value={newXpReward}
                      onChange={e => setNewXpReward(Number(e.target.value))}
                      className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 focus:outline-none focus:border-slate-900"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Tags (comma separated):
                  </label>
                  <input
                    type="text"
                    value={newTags}
                    onChange={e => setNewTags(e.target.value)}
                    placeholder="Design, Figma, Operations"
                    className="w-full p-2.5 rounded-lg border border-slate-200 bg-slate-50/50 focus:outline-none focus:border-slate-900"
                  />
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium shadow-xs transition"
                  >
                    Create Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* ====================================================================
            MODAL 2: SUBMIT TASK FOR REVIEW
        ==================================================================== */}
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

              <form onSubmit={handleSubmitTask} className="space-y-3 text-xs">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">
                    Work Link / PR / Artifact (optional):
                  </label>
                  <input
                    type="url"
                    placeholder="https://github.com/... or Google Drive link"
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
                    placeholder="Describe what was built, testing performed, or deliverables ready for inspection..."
                    value={submissionNote}
                    onChange={e => setSubmissionNote(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-slate-200 focus:outline-none focus:border-slate-900 bg-slate-50/50"
                  />
                </div>

                <div className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 text-[11px] space-y-1">
                  <p className="font-semibold text-slate-900">Next Step: Verification</p>
                  <p className="text-slate-600">
                    Once submitted, your club lead will review your submission and award you <strong>+{showSubmitModal.xpReward} XP</strong> in the verified contribution ledger.
                  </p>
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

        {/* ====================================================================
            MODAL 3: TASK DETAIL & REVIEW DRAWER
        ==================================================================== */}
        {activeTaskDetail && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl border border-slate-200/90 space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      {activeTaskDetail.clubName}
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                      {activeTaskDetail.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h3 className="font-bold text-base text-slate-900">
                    {activeTaskDetail.title}
                  </h3>
                </div>
                <button
                  onClick={() => setActiveTaskDetail(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4 text-xs">
                <div>
                  <span className="font-semibold text-slate-500 uppercase text-[10px] block">
                    Description & Scope:
                  </span>
                  <p className="mt-1 text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                    {activeTaskDetail.description}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-semibold">Assignee:</span>
                    <div className="flex items-center gap-2 mt-1">
                      <img
                        src={getAvatarUrl(activeTaskDetail.assigneeAvatar, activeTaskDetail.assigneeName)}
                        alt={activeTaskDetail.assigneeName}
                        className="w-5 h-5 rounded-full object-cover"
                      />
                      <span className="font-semibold text-slate-800">{activeTaskDetail.assigneeName}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-500 text-[10px] uppercase font-semibold">Due Date:</span>
                    <p className="font-semibold text-slate-800 mt-1">{activeTaskDetail.dueDate}</p>
                  </div>
                </div>

                {/* Submission items if submitted */}
                {activeTaskDetail.submissionNote && (
                  <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                    <span className="font-semibold text-slate-900 block text-xs">
                      Member Submission Notes:
                    </span>
                    <p className="text-slate-700 italic">
                      "{activeTaskDetail.submissionNote}"
                    </p>
                    {activeTaskDetail.submissionLink && (
                      <a
                        href={activeTaskDetail.submissionLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 font-semibold text-slate-900 hover:underline pt-1"
                      >
                        <span>View Submitted Deliverable Link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                )}

                {/* Activity Timeline */}
                <div>
                  <span className="font-semibold text-slate-500 uppercase text-[10px] block mb-2">
                    Activity & Audit Trail:
                  </span>
                  <div className="space-y-2 max-h-36 overflow-y-auto">
                    {activeTaskDetail.activities.map(act => (
                      <div
                        key={act.id}
                        className="p-2 rounded-lg bg-slate-50 border border-slate-200/80 text-[11px]"
                      >
                        <div className="flex items-center justify-between text-slate-500">
                          <span className="font-semibold text-slate-700">{act.userName}</span>
                          <span className="text-[10px]">{act.timestamp}</span>
                        </div>
                        <p className="text-slate-600 mt-0.5">{act.action}</p>
                        {act.note && <p className="text-slate-500 italic mt-0.5">"{act.note}"</p>}
                      </div>
                    ))}
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
                  {activeTaskDetail.status === 'in_progress' && (
                    <button
                      onClick={() => handleOpenSubmit(activeTaskDetail)}
                      className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-medium shadow-xs"
                    >
                      Submit for Review
                    </button>
                  )}

                  {activeTaskDetail.status === 'under_review' && (
                    isTaskAssignedToUser(activeTaskDetail, currentUser) ? (
                      <span className="px-3 py-1.5 rounded-lg bg-slate-100 text-slate-900 border border-slate-300 text-xs font-semibold">
                        Your Submission • Awaiting Lead Verification
                      </span>
                    ) : (currentUser.role === 'admin' || (currentUser.role === 'club_lead' && myLeadClubs.some(c => c.id === activeTaskDetail.clubId))) ? (
                      <>
                        <button
                          onClick={async () => {
                            await handleReviewTask(activeTaskDetail.id, 'request_changes', 'Please refine deliverable');
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
                          Approve & Verify XP (+{activeTaskDetail.xpReward} XP)
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
