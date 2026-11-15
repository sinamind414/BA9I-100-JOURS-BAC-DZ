import { BRANCHES, getDayPlan } from '../data/curriculum';
import { BranchId, SubjectId } from '../types/bac';
import { TOTAL_CHALLENGE_DAYS } from './spacedRepetition';
import { readAndValidateStorageState, StorageLike } from './storageDiagnostics';

export type FocusPriorityTier = 'high' | 'medium' | 'low';

export interface IncompleteTaskRef {
  taskId: string;
  day: number;
  title: string;
  xp: number;
}

export interface SubjectFocusNeed {
  subject: SubjectId;
  totalTasks: number;
  completedTasks: number;
  incompleteTasks: number;
  completionPercent: number;
  incompletePercent: number;
  incompleteXp: number;
  isCoreSubject: boolean;
  priorityTier: FocusPriorityTier;
  sampleIncompleteTasks: IncompleteTaskRef[];
}

export interface WeeklyReviewSummaryReport {
  windowStartDay: number;
  windowEndDay: number;
  daysCount: number;
  branch: BranchId;
  totalTasks: number;
  completedTasks: number;
  incompleteTasks: number;
  completionPercent: number;
  focusSubjects: SubjectFocusNeed[];
  masteredSubjects: SubjectId[];
  topFocusSubject: SubjectFocusNeed | null;
  coachRecommendationAr: string;
  dataSource: 'localStorage' | 'fallback';
  generatedAt: string;
}

export interface WeeklyReviewStateSnapshot {
  currentDay: number;
  highestDayReached?: number;
  profile: {
    branch: BranchId;
  };
  completedTaskIds: string[];
}

export function resolvePriorityTier(
  incompleteTasks: number,
  incompletePercent: number
): FocusPriorityTier {
  if (incompleteTasks >= 3 || incompletePercent >= 60) {
    return 'high';
  }
  if (incompleteTasks >= 2 || incompletePercent >= 30) {
    return 'medium';
  }
  return 'low';
}

export function buildWeeklyReviewSummary({
  snapshot,
  dataSource = 'fallback',
  generatedAt,
}: {
  snapshot: WeeklyReviewStateSnapshot;
  dataSource?: 'localStorage' | 'fallback';
  generatedAt?: string;
}): WeeklyReviewSummaryReport {
  const anchorRaw = Math.max(
    snapshot.currentDay || 1,
    snapshot.highestDayReached ?? snapshot.currentDay ?? 1
  );
  const windowEndDay = Math.max(1, Math.min(TOTAL_CHALLENGE_DAYS, Math.floor(anchorRaw)));
  const windowStartDay = Math.max(1, windowEndDay - 6);
  const daysCount = windowEndDay - windowStartDay + 1;
  const branch = snapshot.profile.branch;
  const completedSet = new Set(snapshot.completedTaskIds);
  const branchInfo = BRANCHES.find((b) => b.id === branch);
  const coreSubjectsSet = new Set<SubjectId>(
    (branchInfo?.coreSubjects ?? []).slice(0, 3)
  );

  const bySubject = new Map<
    SubjectId,
    {
      totalTasks: number;
      completedTasks: number;
      incompleteTasksList: IncompleteTaskRef[];
      incompleteXp: number;
      firstOrder: number;
    }
  >();
  let orderCounter = 0;

  let totalTasks = 0;
  let completedTasks = 0;

  for (let day = windowStartDay; day <= windowEndDay; day++) {
    const plan = getDayPlan(day, branch);
    for (const task of plan.tasks) {
      totalTasks += 1;
      const entry = bySubject.get(task.subject) ?? {
        totalTasks: 0,
        completedTasks: 0,
        incompleteTasksList: [],
        incompleteXp: 0,
        firstOrder: orderCounter++,
      };
      entry.totalTasks += 1;

      if (completedSet.has(task.id)) {
        completedTasks += 1;
        entry.completedTasks += 1;
      } else {
        entry.incompleteXp += task.xp;
        entry.incompleteTasksList.push({
          taskId: task.id,
          day,
          title: task.title,
          xp: task.xp,
        });
      }

      bySubject.set(task.subject, entry);
    }
  }

  const focusSubjects: SubjectFocusNeed[] = [];
  const masteredSubjects: SubjectId[] = [];

  for (const [subject, data] of bySubject.entries()) {
    const incompleteCount = data.incompleteTasksList.length;
    if (incompleteCount === 0) {
      if (data.totalTasks > 0) {
        masteredSubjects.push(subject);
      }
      continue;
    }

    const completionPercent =
      data.totalTasks > 0
        ? Math.round((data.completedTasks / data.totalTasks) * 100)
        : 0;
    const incompletePercent = 100 - completionPercent;

    focusSubjects.push({
      subject,
      totalTasks: data.totalTasks,
      completedTasks: data.completedTasks,
      incompleteTasks: incompleteCount,
      completionPercent,
      incompletePercent,
      incompleteXp: data.incompleteXp,
      isCoreSubject: coreSubjectsSet.has(subject),
      priorityTier: resolvePriorityTier(incompleteCount, incompletePercent),
      sampleIncompleteTasks: data.incompleteTasksList,
    });
  }

  focusSubjects.sort((a, b) => {
    if (b.incompleteTasks !== a.incompleteTasks) {
      return b.incompleteTasks - a.incompleteTasks;
    }
    if (b.incompletePercent !== a.incompletePercent) {
      return b.incompletePercent - a.incompletePercent;
    }
    if (b.isCoreSubject !== a.isCoreSubject) {
      return Number(b.isCoreSubject) - Number(a.isCoreSubject);
    }
    if (b.incompleteXp !== a.incompleteXp) {
      return b.incompleteXp - a.incompleteXp;
    }
    return a.subject.localeCompare(b.subject);
  });

  const incompleteTasks = Math.max(0, totalTasks - completedTasks);
  const completionPercent =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const topFocusSubject = focusSubjects[0] ?? null;

  let coachRecommendationAr = '';
  if (!topFocusSubject) {
    coachRecommendationAr = `عمل ممتاز! أتممت جميع مهام الأيام ${String(windowStartDay).padStart(2, '0')} إلى ${String(windowEndDay).padStart(2, '0')} بدون أي تراكمات.`;
  } else if (focusSubjects.length === 1) {
    coachRecommendationAr = `تركيزك الأسبوعي القادم ينصبّ على مادة واحدة فقط (${topFocusSubject.incompleteTasks} مهام متبقية من الأيام السبعة الماضية).`;
  } else {
    coachRecommendationAr = `الأولوية في المراجعة للأيام السبعة الماضية: تقليص التراكمات في أول ${Math.min(2, focusSubjects.length)} مواد (${incompleteTasks} مهمة غير مكتملة إجمالاً).`;
  }

  return {
    windowStartDay,
    windowEndDay,
    daysCount,
    branch,
    totalTasks,
    completedTasks,
    incompleteTasks,
    completionPercent,
    focusSubjects,
    masteredSubjects,
    topFocusSubject,
    coachRecommendationAr,
    dataSource,
    generatedAt: generatedAt ?? new Date().toISOString(),
  };
}

export function generateWeeklyReviewSummaryFromStorage<T extends WeeklyReviewStateSnapshot>({
  storage,
  storageKey,
  sanitize,
  fallbackSnapshot,
  generatedAt,
}: {
  storage: StorageLike | null | undefined;
  storageKey: string;
  sanitize: (parsed: unknown) => T | null;
  fallbackSnapshot: WeeklyReviewStateSnapshot;
  generatedAt?: string;
}): WeeklyReviewSummaryReport {
  const result = readAndValidateStorageState<T>({
    storage,
    key: storageKey,
    sanitize,
  });

  if (result.status === 'ok' && result.state) {
    return buildWeeklyReviewSummary({
      snapshot: result.state,
      dataSource: 'localStorage',
      generatedAt,
    });
  }

  return buildWeeklyReviewSummary({
    snapshot: fallbackSnapshot,
    dataSource: 'fallback',
    generatedAt,
  });
}
