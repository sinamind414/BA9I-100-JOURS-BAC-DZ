import { getDayPlan, getWeeklyReward } from '../data/curriculum';
import { getDailyChallengeForDay } from '../data/dailyChallenges';
import { BranchId, SubjectId } from '../types/bac';
import {
  calculateDayProgress,
  getDueReviewsForDay,
  REVIEW_XP,
  TOTAL_CHALLENGE_DAYS,
  WEEKLY_UNLOCK_THRESHOLD_PERCENT,
} from './spacedRepetition';

export interface WeeklySubjectFocus {
  subject: SubjectId;
  completedCount: number;
  totalCount: number;
  earnedXp: number;
  percent: number;
}

export interface WeeklyBestDay {
  day: number;
  percent: number;
  completedCount: number;
  totalCount: number;
  earnedXp: number;
}

export interface WeeklyAchievementsSummary {
  week: number;
  totalWeeks: number;
  startDay: number;
  endDay: number;
  daysInWeek: number;
  hasAnyActivity: boolean;
  topSubject: WeeklySubjectFocus | null;
  runnerUpSubject: WeeklySubjectFocus | null;
  bestDay: WeeklyBestDay | null;
  weeklyXp: number;
  activeDaysCount: number;
  solvedChallengesCount: number;
  completedTasksCount: number;
  totalTasksCount: number;
  weeklyPercent: number;
  rewardUnlocked: boolean;
  tasksRemainingToUnlock: number;
  rewardMovieTitle: string;
}

export function buildWeeklyAchievements(
  weekNumber: number,
  completedTaskIds: ReadonlySet<string>,
  completedExtraIds: ReadonlySet<string>,
  solvedChallengeDays: ReadonlySet<number>,
  branch: BranchId
): WeeklyAchievementsSummary {
  const totalWeeks = Math.ceil(TOTAL_CHALLENGE_DAYS / 7);
  const clampedWeek = Math.max(1, Math.min(totalWeeks, weekNumber));
  const startDay = (clampedWeek - 1) * 7 + 1;
  const endDay = Math.min(TOTAL_CHALLENGE_DAYS, clampedWeek * 7);
  const daysInWeek = endDay - startDay + 1;

  const subjectMap = new Map<
    SubjectId,
    { completedCount: number; totalCount: number; earnedXp: number; firstIndex: number }
  >();
  let subjectOrderCounter = 0;

  let bestDay: WeeklyBestDay | null = null;
  let weeklyXp = 0;
  let activeDaysCount = 0;
  let solvedChallengesCount = 0;
  let completedTasksCount = 0;
  let totalTasksCount = 0;

  for (let d = startDay; d <= endDay; d++) {
    const plan = getDayPlan(d, branch);
    const due = getDueReviewsForDay(d, completedTaskIds, branch);
    const isChallengeSolved = solvedChallengeDays.has(d);
    const challengeBonus = isChallengeSolved
      ? getDailyChallengeForDay(d, branch).bonusXp
      : 0;

    if (isChallengeSolved) {
      solvedChallengesCount += 1;
    }

    const progress = calculateDayProgress(
      d,
      plan,
      completedTaskIds,
      completedExtraIds,
      due,
      challengeBonus
    );

    weeklyXp += progress.earnedXp;
    if (progress.completedCount > 0 || isChallengeSolved) {
      activeDaysCount += 1;
    }

    if (progress.completedCount > 0) {
      if (
        !bestDay ||
        progress.percent > bestDay.percent ||
        (progress.percent === bestDay.percent &&
          (progress.completedCount > bestDay.completedCount ||
            (progress.completedCount === bestDay.completedCount &&
              progress.earnedXp > bestDay.earnedXp)))
      ) {
        bestDay = {
          day: d,
          percent: progress.percent,
          completedCount: progress.completedCount,
          totalCount: progress.totalCount,
          earnedXp: progress.earnedXp,
        };
      }
    }

    for (const task of plan.tasks) {
      totalTasksCount += 1;
      const entry = subjectMap.get(task.subject) ?? {
        completedCount: 0,
        totalCount: 0,
        earnedXp: 0,
        firstIndex: subjectOrderCounter++,
      };
      entry.totalCount += 1;
      if (completedTaskIds.has(task.id)) {
        completedTasksCount += 1;
        entry.completedCount += 1;
        entry.earnedXp += task.xp;
      }
      subjectMap.set(task.subject, entry);
    }

    for (const review of due) {
      const entry = subjectMap.get(review.subject) ?? {
        completedCount: 0,
        totalCount: 0,
        earnedXp: 0,
        firstIndex: subjectOrderCounter++,
      };
      entry.totalCount += 1;
      if (completedExtraIds.has(review.reviewId)) {
        entry.completedCount += 1;
        entry.earnedXp += REVIEW_XP;
      }
      subjectMap.set(review.subject, entry);
    }
  }

  const rankedSubjects: WeeklySubjectFocus[] = Array.from(subjectMap.entries())
    .filter(([, stats]) => stats.completedCount > 0)
    .sort((a, b) => {
      if (b[1].completedCount !== a[1].completedCount) {
        return b[1].completedCount - a[1].completedCount;
      }
      if (b[1].earnedXp !== a[1].earnedXp) {
        return b[1].earnedXp - a[1].earnedXp;
      }
      return a[1].firstIndex - b[1].firstIndex;
    })
    .map(([subject, stats]) => ({
      subject,
      completedCount: stats.completedCount,
      totalCount: stats.totalCount,
      earnedXp: stats.earnedXp,
      percent:
        stats.totalCount > 0
          ? Math.round((stats.completedCount / stats.totalCount) * 100)
          : 0,
    }));

  const weeklyPercent =
    totalTasksCount > 0
      ? Math.round((completedTasksCount / totalTasksCount) * 100)
      : 0;
  const rewardUnlocked = weeklyPercent >= WEEKLY_UNLOCK_THRESHOLD_PERCENT;
  const targetCompletedTasks = Math.ceil(
    totalTasksCount * (WEEKLY_UNLOCK_THRESHOLD_PERCENT / 100)
  );
  const tasksRemainingToUnlock = rewardUnlocked
    ? 0
    : Math.max(0, targetCompletedTasks - completedTasksCount);

  const rewardWeek = Math.min(14, clampedWeek);
  const rewardMovieTitle = getWeeklyReward(rewardWeek).title;

  return {
    week: clampedWeek,
    totalWeeks,
    startDay,
    endDay,
    daysInWeek,
    hasAnyActivity: weeklyXp > 0 || completedTasksCount > 0 || bestDay !== null,
    topSubject: rankedSubjects[0] ?? null,
    runnerUpSubject: rankedSubjects[1] ?? null,
    bestDay,
    weeklyXp,
    activeDaysCount,
    solvedChallengesCount,
    completedTasksCount,
    totalTasksCount,
    weeklyPercent,
    rewardUnlocked,
    tasksRemainingToUnlock,
    rewardMovieTitle,
  };
}
