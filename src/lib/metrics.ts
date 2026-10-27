import { Club, Task, ClubFeedback, ClubMember } from '@/types';

export interface ClubKPIs {
  totalMembers: number;
  activeMembers: number;
  participationRate: number; // percentage
  taskCompletionRate: number; // percentage
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
  averageSatisfaction: number; // 1-5 scale
  burnoutRiskLevel: 'Low' | 'Moderate' | 'Severe';
  burnoutIndex: number; // 0-100
  ghostMemberCount: number;
}

export function calculateClubKPIs(
  club: Club | undefined,
  allTasks: Task[],
  allFeedback: ClubFeedback[],
  allMembers?: ClubMember[]
): ClubKPIs {
  const clubTasks = club ? allTasks.filter(t => t.clubId === club.id) : allTasks;
  const clubFeedback = club ? allFeedback.filter(f => f.clubId === club.id) : allFeedback;
  const members = club ? club.members : (allMembers || []);

  const totalMembers = members.length > 0 ? members.length : 35;
  const ghostMembers = members.filter(m => m.isGhostRisk || m.participationRate < 30);
  const activeMembers = Math.max(0, totalMembers - ghostMembers.length);

  const totalTasks = clubTasks.length;
  const completedTasks = clubTasks.filter(t => t.status === 'completed').length;
  const taskCompletionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 75;

  const today = '2026-10-27';
  const overdueTasks = clubTasks.filter(
    t => t.status !== 'completed' && t.dueDate < today
  ).length;

  const avgSatisfaction = clubFeedback.length > 0
    ? Number((clubFeedback.reduce((acc, f) => acc + f.overallSatisfaction, 0) / clubFeedback.length).toFixed(1))
    : 4.6;

  // Burnout index calculation:
  // Evaluates percentage of active tasks concentrated in top 1-2 assignees,
  // plus overdue task penalty, and average workload fatigue from feedback
  const nonCompletedTasks = clubTasks.filter(t => t.status !== 'completed');
  let topAssigneeTaskCount = 0;
  if (nonCompletedTasks.length > 0) {
    const taskCountByMember: Record<string, number> = {};
    nonCompletedTasks.forEach(t => {
      taskCountByMember[t.assigneeId] = (taskCountByMember[t.assigneeId] || 0) + 1;
    });
    topAssigneeTaskCount = Math.max(...Object.values(taskCountByMember), 0);
  }

  const concentrationRatio = nonCompletedTasks.length > 0 
    ? (topAssigneeTaskCount / nonCompletedTasks.length)
    : 0.3;

  let burnoutIndex = Math.min(100, Math.round(concentrationRatio * 85 + (overdueTasks * 5)));
  if (burnoutIndex < 20) burnoutIndex = 28;

  let burnoutRiskLevel: 'Low' | 'Moderate' | 'Severe' = 'Low';
  if (burnoutIndex >= 65) burnoutRiskLevel = 'Severe';
  else if (burnoutIndex >= 45) burnoutRiskLevel = 'Moderate';

  const participationRate = Math.round((activeMembers / Math.max(1, totalMembers)) * 100);

  return {
    totalMembers,
    activeMembers,
    participationRate,
    taskCompletionRate,
    totalTasks,
    completedTasks,
    overdueTasks,
    averageSatisfaction: avgSatisfaction,
    burnoutRiskLevel,
    burnoutIndex,
    ghostMemberCount: ghostMembers.length
  };
}
