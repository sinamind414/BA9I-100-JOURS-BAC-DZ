import { getDayPlan } from '../data/curriculum';
import {
  DailyChallengeItem,
  getDailyChallengeForDay,
} from '../data/dailyChallenges';
import {
  BranchId,
  ContestSubmission,
  DayPlan,
  SpacedReviewItem,
} from '../types/bac';

export const SPACED_REPETITION_OFFSETS = [1, 3, 7, 15, 30] as const;
export const TOTAL_CHALLENGE_DAYS = 100;
export const WEEKLY_UNLOCK_THRESHOLD_PERCENT = 70;
export const REVIEW_XP = 20;
export const RECALL_XP = 15;
export const FOCUS_SESSION_XP = 25;

export interface DayProgress {
  completedCount: number;
  totalCount: number;
  percent: number;
  isDayComplete: boolean;
  earnedXp: number;
}

export interface UserStats {
  totalXp: number;
  level: number;
  nextLevelXp: number;
  levelProgressPercent: number;
  streakDays: number;
  raffleTickets: number;
  completedDaysCount: number;
  daysRemaining: number;
}

export interface WeekRewardStatus {
  week: number;
  startDay: number;
  endDay: number;
  completedItems: number;
  totalItems: number;
  percent: number;
  unlocked: boolean;
}

export interface AvatarStage {
  tier: number;
  titleAr: string;
  subtitleAr: string;
  badgeText: string;
}

export function getMorningRecallId(day: number): string {
  return `morning-${day}`;
}

export function getEveningReviewId(day: number): string {
  return `evening-${day}`;
}

export function getDueReviewsForDay(
  dayNumber: number,
  completedTaskIds: ReadonlySet<string>,
  branch: BranchId
): SpacedReviewItem[] {
  if (dayNumber <= 1) return [];
  const items: SpacedReviewItem[] = [];

  for (const offset of SPACED_REPETITION_OFFSETS) {
    const sourceDay = dayNumber - offset;
    if (sourceDay < 1) continue;
    const sourcePlan = getDayPlan(sourceDay, branch);
    for (const task of sourcePlan.tasks) {
      if (task.isSpacedCandidate && completedTaskIds.has(task.id)) {
        items.push({
          reviewId: `sr-d${dayNumber}-from-${task.id}-j${offset}`,
          sourceTaskId: task.id,
          sourceDay,
          dueDay: dayNumber,
          intervalDays: offset,
          subject: task.subject,
          title: task.title,
        });
      }
    }
  }

  return items;
}

export function calculateDayProgress(
  dayNumber: number,
  dayPlan: DayPlan,
  completedTaskIds: ReadonlySet<string>,
  completedExtraIds: ReadonlySet<string>,
  dueReviews: SpacedReviewItem[],
  challengeBonusXp: number = 0
): DayProgress {
  const morningId = getMorningRecallId(dayNumber);
  const eveningId = getEveningReviewId(dayNumber);

  let completedCount = 0;
  let earnedXp = Math.max(0, challengeBonusXp);

  if (completedExtraIds.has(morningId)) {
    completedCount += 1;
    earnedXp += RECALL_XP;
  }
  if (completedExtraIds.has(eveningId)) {
    completedCount += 1;
    earnedXp += RECALL_XP;
  }

  for (const task of dayPlan.tasks) {
    if (completedTaskIds.has(task.id)) {
      completedCount += 1;
      earnedXp += task.xp;
    }
  }

  for (const review of dueReviews) {
    if (completedExtraIds.has(review.reviewId)) {
      completedCount += 1;
      earnedXp += REVIEW_XP;
    }
  }

  const totalCount = 2 + dayPlan.tasks.length + dueReviews.length;
  const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return {
    completedCount,
    totalCount,
    percent,
    isDayComplete: totalCount > 0 && completedCount === totalCount,
    earnedXp,
  };
}

export function calculateUserStats(
  completedTaskIds: ReadonlySet<string>,
  completedExtraIds: ReadonlySet<string>,
  focusSessionsCount: number,
  branch: BranchId,
  currentDay: number,
  solvedChallengeDays: ReadonlySet<number> = new Set()
): UserStats {
  let totalXp = focusSessionsCount * FOCUS_SESSION_XP;
  let completedDaysCount = 0;
  const completedDayFlags: boolean[] = [];

  for (let d = 1; d <= TOTAL_CHALLENGE_DAYS; d++) {
    const plan = getDayPlan(d, branch);
    const due = getDueReviewsForDay(d, completedTaskIds, branch);
    const challengeBonus = solvedChallengeDays.has(d)
      ? getDailyChallengeForDay(d, branch).bonusXp
      : 0;
    const progress = calculateDayProgress(
      d,
      plan,
      completedTaskIds,
      completedExtraIds,
      due,
      challengeBonus
    );
    totalXp += progress.earnedXp;
    const hasMeaningfulProgress = progress.percent >= 50;
    completedDayFlags.push(hasMeaningfulProgress);
    if (progress.isDayComplete) {
      completedDaysCount += 1;
    }
  }

  // Compute current streak ending at currentDay (or currentDay - 1 if today isn't 50% yet)
  let streakDays = 0;
  const idx = Math.max(0, Math.min(TOTAL_CHALLENGE_DAYS - 1, currentDay - 1));
  let cursor = completedDayFlags[idx] ? idx : idx - 1;
  while (cursor >= 0 && completedDayFlags[cursor]) {
    streakDays += 1;
    cursor -= 1;
  }

  const xpPerLevel = 250;
  const level = Math.floor(totalXp / xpPerLevel) + 1;
  const currentLevelXp = totalXp % xpPerLevel;
  const levelProgressPercent = Math.round((currentLevelXp / xpPerLevel) * 100);

  // 1 raffle ticket per 100% completed day + 1 starter ticket
  const raffleTickets = Math.max(1, completedDaysCount + Math.floor(focusSessionsCount / 3));

  return {
    totalXp,
    level,
    nextLevelXp: level * xpPerLevel,
    levelProgressPercent,
    streakDays,
    raffleTickets,
    completedDaysCount,
    daysRemaining: Math.max(0, TOTAL_CHALLENGE_DAYS - currentDay),
  };
}

export function getWeekRewardStatus(
  weekNumber: number,
  completedTaskIds: ReadonlySet<string>,
  branch: BranchId
): WeekRewardStatus {
  const startDay = (weekNumber - 1) * 7 + 1;
  const endDay = Math.min(TOTAL_CHALLENGE_DAYS, weekNumber * 7);

  let completedItems = 0;
  let totalItems = 0;

  for (let d = startDay; d <= endDay; d++) {
    const plan = getDayPlan(d, branch);
    for (const t of plan.tasks) {
      totalItems += 1;
      if (completedTaskIds.has(t.id)) {
        completedItems += 1;
      }
    }
  }

  const percent = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;

  return {
    week: weekNumber,
    startDay,
    endDay,
    completedItems,
    totalItems,
    percent,
    unlocked: percent >= WEEKLY_UNLOCK_THRESHOLD_PERCENT,
  };
}

export function getAvatarStage(level: number): AvatarStage {
  if (level >= 15) {
    return {
      tier: 4,
      titleAr: 'أسطورة البكالوريا',
      subtitleAr: 'انضباط يومي وتركيز عالٍ',
      badgeText: 'المستوى الذهبي',
    };
  }
  if (level >= 8) {
    return {
      tier: 3,
      titleAr: 'منافس جدي',
      subtitleAr: 'إيقاع ثابت نحو الامتياز',
      badgeText: 'المستوى المتقدم',
    };
  }
  if (level >= 3) {
    return {
      tier: 2,
      titleAr: 'في المسار الصحيح',
      subtitleAr: 'بداية بناء عادة المراجعة',
      badgeText: 'المستوى النشط',
    };
  }
  return {
    tier: 1,
    titleAr: 'بداية التحدي',
    subtitleAr: 'خطوة واحدة كل يوم تصنع الفارق',
    badgeText: 'المستوى التأسيسي',
  };
}

export function validateContestForm(
  form: Omit<ContestSubmission, 'submittedAt'>
): { valid: boolean; errors: Partial<Record<keyof ContestSubmission, string>> } {
  const errors: Partial<Record<keyof ContestSubmission, string>> = {};

  if (!form.fullName.trim() || form.fullName.trim().length < 4) {
    errors.fullName = 'يرجى إدخال الاسم واللقب الكامل.';
  }
  const cleanPhone = form.phone.replace(/\s+/g, '');
  if (!/^(05|06|07|\+213)[0-9]{8,9}$/.test(cleanPhone)) {
    errors.phone = 'أدخل رقم هاتف جزائري صحيح (مثال: 0550123456).';
  }
  if (!form.address.trim() || form.address.trim().length < 5) {
    errors.address = 'يرجى إدخال الولاية والعنوان.';
  }
  const avg = Number(form.bacAverage.replace(',', '.'));
  if (Number.isNaN(avg) || avg < 10 || avg > 20) {
    errors.bacAverage = 'معدل البكالوريا يجب أن يكون بين 10.00 و 20.00.';
  }
  if (!form.registrationNumber.trim() || form.registrationNumber.trim().length < 5) {
    errors.registrationNumber = 'أدخل رقم التسجيل الصحيح في شهادة البكالوريا.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export type TrendRange = '7d' | '14d' | '30d' | 'all';

export interface DailyTrendPoint {
  day: number;
  dayLabel: string;
  percent: number;
  target: number;
  completedCount: number;
  totalCount: number;
  earnedXp: number;
  isCurrent: boolean;
}

export interface TrendSummary {
  avgPercent: number;
  bestDay: number | null;
  bestPercent: number;
  perfectDaysCount: number;
  totalEarnedXp: number;
  hasAnyActivity: boolean;
}

export function buildDailyCompletionSeries(
  completedTaskIds: ReadonlySet<string>,
  completedExtraIds: ReadonlySet<string>,
  branch: BranchId,
  currentDay: number,
  range: TrendRange
): DailyTrendPoint[] {
  const clampedCurrent = Math.max(1, Math.min(TOTAL_CHALLENGE_DAYS, currentDay));
  let startDay = 1;
  let endDay = TOTAL_CHALLENGE_DAYS;

  if (range !== 'all') {
    const windowSize = range === '7d' ? 7 : range === '14d' ? 14 : 30;
    endDay = Math.min(TOTAL_CHALLENGE_DAYS, Math.max(windowSize, clampedCurrent));
    startDay = Math.max(1, endDay - windowSize + 1);
  }

  const points: DailyTrendPoint[] = [];
  for (let d = startDay; d <= endDay; d++) {
    const plan = getDayPlan(d, branch);
    const due = getDueReviewsForDay(d, completedTaskIds, branch);
    const progress = calculateDayProgress(
      d,
      plan,
      completedTaskIds,
      completedExtraIds,
      due
    );

    points.push({
      day: d,
      dayLabel: `ي${String(d).padStart(2, '0')}`,
      percent: progress.percent,
      target: WEEKLY_UNLOCK_THRESHOLD_PERCENT,
      completedCount: progress.completedCount,
      totalCount: progress.totalCount,
      earnedXp: progress.earnedXp,
      isCurrent: d === clampedCurrent,
    });
  }

  return points;
}

export function summarizeCompletionSeries(
  series: DailyTrendPoint[],
  currentDay: number
): TrendSummary {
  const activeSlice = series.filter((pt) => pt.day <= currentDay || pt.percent > 0);
  const sample = activeSlice.length > 0 ? activeSlice : series;

  let sumPercent = 0;
  let bestDay: number | null = null;
  let bestPercent = 0;
  let perfectDaysCount = 0;
  let totalEarnedXp = 0;
  let hasAnyActivity = false;

  for (const pt of sample) {
    sumPercent += pt.percent;
    totalEarnedXp += pt.earnedXp;
    if (pt.percent > 0) hasAnyActivity = true;
    if (pt.percent === 100) perfectDaysCount += 1;
    if (pt.percent > bestPercent) {
      bestPercent = pt.percent;
      bestDay = pt.day;
    }
  }

  const avgPercent = sample.length > 0 ? Math.round(sumPercent / sample.length) : 0;

  return {
    avgPercent,
    bestDay,
    bestPercent,
    perfectDaysCount,
    totalEarnedXp,
    hasAnyActivity,
  };
}

export type CompletionHeatTone = 'empty' | 'low' | 'mid' | 'high' | 'complete';

export interface WeeklyTaskEntry {
  id: string;
  kind: 'task' | 'extra';
  title: string;
  categoryLabel: string;
  completed: boolean;
}

export interface WeeklyCalendarDay {
  day: number;
  dayInWeek: number;
  percent: number;
  completedCount: number;
  remainingCount: number;
  totalCount: number;
  earnedXp: number;
  tone: CompletionHeatTone;
  isCurrent: boolean;
  completedItems: WeeklyTaskEntry[];
  remainingItems: WeeklyTaskEntry[];
}

export interface WeeklyCalendarData {
  week: number;
  totalWeeks: number;
  startDay: number;
  endDay: number;
  avgPercent: number;
  totalCompleted: number;
  totalRemaining: number;
  days: WeeklyCalendarDay[];
}

export function getCompletionHeatTone(percent: number): CompletionHeatTone {
  if (percent >= 100) return 'complete';
  if (percent >= 70) return 'high';
  if (percent >= 40) return 'mid';
  if (percent > 0) return 'low';
  return 'empty';
}

export function buildWeeklyCalendarData(
  weekNumber: number,
  completedTaskIds: ReadonlySet<string>,
  completedExtraIds: ReadonlySet<string>,
  branch: BranchId,
  currentDay: number
): WeeklyCalendarData {
  const totalWeeks = Math.ceil(TOTAL_CHALLENGE_DAYS / 7);
  const clampedWeek = Math.max(1, Math.min(totalWeeks, weekNumber));
  const startDay = (clampedWeek - 1) * 7 + 1;
  const endDay = Math.min(TOTAL_CHALLENGE_DAYS, clampedWeek * 7);

  const days: WeeklyCalendarDay[] = [];
  let sumPercent = 0;
  let totalCompleted = 0;
  let totalRemaining = 0;

  for (let d = startDay; d <= endDay; d++) {
    const plan = getDayPlan(d, branch);
    const due = getDueReviewsForDay(d, completedTaskIds, branch);
    const progress = calculateDayProgress(
      d,
      plan,
      completedTaskIds,
      completedExtraIds,
      due
    );

    const morningId = getMorningRecallId(d);
    const eveningId = getEveningReviewId(d);

    const allEntries: WeeklyTaskEntry[] = [
      {
        id: morningId,
        kind: 'extra',
        title: 'مراجعة الصباح (Active Recall)',
        categoryLabel: 'صباحاً',
        completed: completedExtraIds.has(morningId),
      },
      ...plan.tasks.map((t) => ({
        id: t.id,
        kind: 'task' as const,
        title: t.title,
        categoryLabel: t.subject,
        completed: completedTaskIds.has(t.id),
      })),
      ...due.map((r) => ({
        id: r.reviewId,
        kind: 'extra' as const,
        title: `مراجعة J+${r.intervalDays}: ${r.title}`,
        categoryLabel: r.subject,
        completed: completedExtraIds.has(r.reviewId),
      })),
      {
        id: eveningId,
        kind: 'extra',
        title: 'مراجعة آخر اليوم (قبل النوم)',
        categoryLabel: 'مساءً',
        completed: completedExtraIds.has(eveningId),
      },
    ];

    const completedItems = allEntries.filter((e) => e.completed);
    const remainingItems = allEntries.filter((e) => !e.completed);
    const remainingCount = Math.max(0, progress.totalCount - progress.completedCount);

    sumPercent += progress.percent;
    totalCompleted += progress.completedCount;
    totalRemaining += remainingCount;

    days.push({
      day: d,
      dayInWeek: d - startDay + 1,
      percent: progress.percent,
      completedCount: progress.completedCount,
      remainingCount,
      totalCount: progress.totalCount,
      earnedXp: progress.earnedXp,
      tone: getCompletionHeatTone(progress.percent),
      isCurrent: d === currentDay,
      completedItems,
      remainingItems,
    });
  }

  return {
    week: clampedWeek,
    totalWeeks,
    startDay,
    endDay,
    avgPercent: days.length > 0 ? Math.round(sumPercent / days.length) : 0,
    totalCompleted,
    totalRemaining,
    days,
  };
}

export interface ChallengeAttemptResult {
  isCorrect: boolean;
  awardedXp: number;
}

export function evaluateDailyChallengeAttempt(
  challenge: DailyChallengeItem,
  selectedIndex: number,
  alreadySolved: boolean
): ChallengeAttemptResult {
  const isCorrect = selectedIndex === challenge.correctIndex;
  return {
    isCorrect,
    awardedXp: isCorrect && !alreadySolved ? challenge.bonusXp : 0,
  };
}

export interface WeeklyTasksBarPoint {
  week: number;
  weekLabel: string;
  startDay: number;
  endDay: number;
  completedTasks: number;
  totalTasks: number;
  coreCompletedTasks: number;
  coreTotalTasks: number;
  percent: number;
  earnedXp: number;
  isCurrentWeek: boolean;
}

export interface WeeklyProgressSummary {
  totalCompletedTasks: number;
  totalPossibleTasks: number;
  overallPercent: number;
  activeWeeksCount: number;
  bestWeek: number | null;
  bestWeekCount: number;
}

export function buildWeeklyProgressBarSeries(
  completedTaskIds: ReadonlySet<string>,
  completedExtraIds: ReadonlySet<string>,
  branch: BranchId,
  currentDay: number
): WeeklyTasksBarPoint[] {
  const safeCurrentDay = Number.isFinite(currentDay)
    ? Math.max(1, Math.min(TOTAL_CHALLENGE_DAYS, Math.floor(currentDay)))
    : 1;
  const currentWeek = Math.ceil(safeCurrentDay / 7);
  const totalWeeks = Math.ceil(TOTAL_CHALLENGE_DAYS / 7);
  const points: WeeklyTasksBarPoint[] = [];

  for (let week = 1; week <= totalWeeks; week++) {
    const startDay = (week - 1) * 7 + 1;
    const endDay = Math.min(TOTAL_CHALLENGE_DAYS, week * 7);

    let completedTasks = 0;
    let totalTasks = 0;
    let coreCompletedTasks = 0;
    let coreTotalTasks = 0;
    let earnedXp = 0;

    for (let d = startDay; d <= endDay; d++) {
      const plan = getDayPlan(d, branch);
      const due = getDueReviewsForDay(d, completedTaskIds, branch);
      const progress = calculateDayProgress(
        d,
        plan,
        completedTaskIds,
        completedExtraIds,
        due
      );

      completedTasks += progress.completedCount;
      totalTasks += progress.totalCount;
      earnedXp += progress.earnedXp;

      for (const task of plan.tasks) {
        coreTotalTasks += 1;
        if (completedTaskIds.has(task.id)) {
          coreCompletedTasks += 1;
        }
      }
    }

    const percent =
      totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    points.push({
      week,
      weekLabel: `W${week}`,
      startDay,
      endDay,
      completedTasks,
      totalTasks,
      coreCompletedTasks,
      coreTotalTasks,
      percent,
      earnedXp,
      isCurrentWeek: week === currentWeek,
    });
  }

  return points;
}

export function summarizeWeeklyProgressSeries(
  series: WeeklyTasksBarPoint[]
): WeeklyProgressSummary {
  let totalCompletedTasks = 0;
  let totalPossibleTasks = 0;
  let activeWeeksCount = 0;
  let bestWeek: number | null = null;
  let bestWeekCount = 0;

  for (const pt of series) {
    totalCompletedTasks += pt.completedTasks;
    totalPossibleTasks += pt.totalTasks;
    if (pt.completedTasks > 0) {
      activeWeeksCount += 1;
    }
    if (pt.completedTasks > bestWeekCount) {
      bestWeekCount = pt.completedTasks;
      bestWeek = pt.week;
    }
  }

  const overallPercent =
    totalPossibleTasks > 0
      ? Math.round((totalCompletedTasks / totalPossibleTasks) * 100)
      : 0;

  return {
    totalCompletedTasks,
    totalPossibleTasks,
    overallPercent,
    activeWeeksCount,
    bestWeek,
    bestWeekCount,
  };
}



