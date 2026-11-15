import { getDayPlan } from '../data/curriculum';
import { BranchId, StudyTask } from '../types/bac';

export interface OverdueDayGroup {
  day: number;
  dayTitle: string;
  overdueTasks: StudyTask[];
  count: number;
}

export interface OverdueTarget {
  day: number;
  taskId: string;
  taskTitle: string;
}

export interface OverdueTasksSummary {
  totalOverdueCount: number;
  overdueDaysCount: number;
  days: OverdueDayGroup[];
  firstOverdueTarget: OverdueTarget | null;
}

export function getLocalDateKey(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function collectOverdueTasksSummary(
  currentDay: number,
  completedTaskIds: ReadonlySet<string>,
  branch: BranchId
): OverdueTasksSummary {
  if (currentDay <= 1) {
    return {
      totalOverdueCount: 0,
      overdueDaysCount: 0,
      days: [],
      firstOverdueTarget: null,
    };
  }

  const days: OverdueDayGroup[] = [];
  let totalOverdueCount = 0;

  for (let d = 1; d < currentDay; d++) {
    const plan = getDayPlan(d, branch);
    const overdueTasks = plan.tasks.filter(
      (task) => !completedTaskIds.has(task.id)
    );
    if (overdueTasks.length > 0) {
      totalOverdueCount += overdueTasks.length;
      days.push({
        day: d,
        dayTitle: plan.title,
        overdueTasks,
        count: overdueTasks.length,
      });
    }
  }

  const firstDay = days[0];
  const firstTask = firstDay?.overdueTasks[0];

  return {
    totalOverdueCount,
    overdueDaysCount: days.length,
    days,
    firstOverdueTarget:
      firstDay && firstTask
        ? {
            day: firstDay.day,
            taskId: firstTask.id,
            taskTitle: firstTask.title,
          }
        : null,
  };
}

export function shouldTriggerStartOfDayReminder(params: {
  onboarded: boolean;
  currentDay: number;
  totalOverdueCount: number;
  lastReminderDate?: string;
  todayDateKey: string;
}): boolean {
  if (!params.onboarded) return false;
  if (params.currentDay <= 1) return false;
  if (params.totalOverdueCount <= 0) return false;
  return params.lastReminderDate !== params.todayDateKey;
}
