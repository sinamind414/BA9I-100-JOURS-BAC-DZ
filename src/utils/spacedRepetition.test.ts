import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildDailyCompletionSeries,
  buildWeeklyCalendarData,
  buildWeeklyProgressBarSeries,
  calculateDayProgress,
  calculateUserStats,
  evaluateDailyChallengeAttempt,
  getCompletionHeatTone,
  getDueReviewsForDay,
  getWeekRewardStatus,
  summarizeCompletionSeries,
  summarizeWeeklyProgressSeries,
  validateContestForm,
} from './spacedRepetition';
import {
  BRANCHES,
  EXAM_DOUAA,
  EXAM_WEEK_PROTOCOL,
  getDayPlan,
  getWeeklyReward,
} from '../data/curriculum';
import {
  DAILY_CHALLENGES_BANK,
  getDailyChallengeForDay,
} from '../data/dailyChallenges';
import {
  computeSquareCropMetrics,
  MAX_AVATAR_FILE_BYTES,
  validateAvatarFile,
} from './avatarUpload';
import {
  countNotesByDifficulty,
  filterAndSortTaskNotes,
  removeTaskNote,
  upsertTaskNote,
} from './taskNotes';
import {
  addQuickNote,
  countQuickNotesByCategory,
  filterAndSortQuickNotes,
  removeQuickNote,
  sanitizeQuickNotes,
  togglePinQuickNote,
} from './quickNotes';
import {
  collectOverdueTasksSummary,
  getLocalDateKey,
  shouldTriggerStartOfDayReminder,
} from './overdueReminders';
import { buildWeeklyAchievements } from './weeklyAchievements';
import {
  getBreakRecommendation,
  resolveCompletedSessionMinutes,
} from './breakIntelligence';
import {
  evaluateBadges,
  findNewlyUnlockedBadges,
  formatFocusHoursLabel,
  getSatisfiedBadgeIds,
} from './badges';
import {
  COACH_BA9I_POSES,
  getCoachBa9iDashboardState,
  getCoachBa9iFocusState,
} from './coachBa9i';
import {
  buildWeeklyReviewSummary,
  generateWeeklyReviewSummaryFromStorage,
  resolvePriorityTier,
} from './weeklyReviewSummary';
import {
  classifyStorageError,
  readAndValidateStorageState,
  StorageLogger,
  writeStorageState,
} from './storageDiagnostics';

test('getDueReviewsForDay schedules J+1, J+3, J+7, J+15, J+30 for completed spaced candidates', () => {
  // Day 1 has spaced candidates like d1-his-1 and d1-sci-1
  const completed = new Set<string>(['d1-sci-1', 'd1-his-1']);

  const day2Reviews = getDueReviewsForDay(2, completed, 'sciences');
  assert.equal(day2Reviews.length, 2);
  assert.equal(day2Reviews[0].intervalDays, 1);

  const day4Reviews = getDueReviewsForDay(4, completed, 'sciences');
  assert.equal(day4Reviews.length, 2);
  assert.equal(day4Reviews[0].intervalDays, 3);

  const day8Reviews = getDueReviewsForDay(8, completed, 'sciences');
  assert.equal(day8Reviews.length, 2);
  assert.equal(day8Reviews[0].intervalDays, 7);

  const day16Reviews = getDueReviewsForDay(16, completed, 'sciences');
  assert.equal(day16Reviews.length, 2);
  assert.equal(day16Reviews[0].intervalDays, 15);

  const day31Reviews = getDueReviewsForDay(31, completed, 'sciences');
  assert.equal(day31Reviews.length, 2);
  assert.equal(day31Reviews[0].intervalDays, 30);

  // Day 5 has no offset match from Day 1 (5 - 1 = 4)
  const day5Reviews = getDueReviewsForDay(5, completed, 'sciences');
  assert.equal(day5Reviews.length, 0);
});

test('calculateDayProgress accurately computes percent and day completion', () => {
  const plan = getDayPlan(6, 'sciences');
  const completedTasks = new Set<string>(plan.tasks.map((t) => t.id));
  const completedExtra = new Set<string>(['morning-6', 'evening-6']);

  const progress = calculateDayProgress(6, plan, completedTasks, completedExtra, []);
  assert.equal(progress.percent, 100);
  assert.equal(progress.isDayComplete, true);
  assert.ok(progress.earnedXp > 0);
});

test('calculateUserStats tracks XP, streak, and raffle tickets', () => {
  const day5 = getDayPlan(5, 'sciences');
  const day6 = getDayPlan(6, 'sciences');
  const completedTasks = new Set<string>([
    ...day5.tasks.map((t) => t.id),
    ...day6.tasks.map((t) => t.id),
  ]);
  const day6Due = getDueReviewsForDay(6, completedTasks, 'sciences');
  assert.ok(day6Due.length > 0);
  const completedExtras = new Set<string>([
    'morning-5',
    'evening-5',
    'morning-6',
    'evening-6',
    ...day6Due.map((r) => r.reviewId),
  ]);

  const stats = calculateUserStats(completedTasks, completedExtras, 2, 'sciences', 6);
  assert.equal(stats.completedDaysCount, 2);
  assert.equal(stats.streakDays, 2);
  assert.equal(stats.daysRemaining, 94);
  assert.ok(stats.raffleTickets >= 2);
  assert.ok(stats.totalXp > 400);
});

test('getWeekRewardStatus unlocks at >= 70% completion of weekly tasks', () => {
  const allWeek1TaskIds: string[] = [];
  for (let d = 1; d <= 7; d++) {
    const plan = getDayPlan(d, 'sciences');
    allWeek1TaskIds.push(...plan.tasks.map((t) => t.id));
  }

  const emptyStatus = getWeekRewardStatus(1, new Set(), 'sciences');
  assert.equal(emptyStatus.unlocked, false);
  assert.equal(emptyStatus.percent, 0);

  const partialCount = Math.ceil(allWeek1TaskIds.length * 0.75);
  const completed = new Set(allWeek1TaskIds.slice(0, partialCount));
  const unlockedStatus = getWeekRewardStatus(1, completed, 'sciences');
  assert.equal(unlockedStatus.unlocked, true);
  assert.ok(unlockedStatus.percent >= 70);
});

test('validateContestForm enforces Algerian phone and 10-20 Bac average', () => {
  const invalid = validateContestForm({
    fullName: 'A',
    phone: '123',
    address: 'Al',
    bacAverage: '8.5',
    registrationNumber: '12',
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.fullName);
  assert.ok(invalid.errors.phone);
  assert.ok(invalid.errors.bacAverage);

  const valid = validateContestForm({
    fullName: 'أمين بن علي',
    phone: '0550123456',
    address: 'سطيف - حي الهضاب',
    bacAverage: '16.85',
    registrationNumber: '38192045',
  });
  assert.equal(valid.valid, true);
});

test('all 100 challenge days return branch-tailored tasks, all 13 book movies exist, and Exam Week Protocol has 6 days', () => {
  for (const branch of BRANCHES) {
    const allowed = new Set(branch.coreSubjects);
    for (let day = 1; day <= 100; day++) {
      const plan = getDayPlan(day, branch.id);
      assert.ok(plan.tasks.length > 0, `Day ${day} empty for ${branch.id}`);
      for (const task of plan.tasks) {
        assert.ok(
          allowed.has(task.subject),
          `Unexpected subject ${task.subject} on Day ${day} for ${branch.id}`
        );
      }
      if (day <= 98) {
        assert.equal(plan.isFromBook, true);
      }
    }
  }

  assert.equal(getWeeklyReward(1).title, 'SPIDER-MAN: ACROSS THE SPIDER-VERSE');
  assert.equal(getWeeklyReward(2).title, 'SUZUME (すずめの戸締まり)');
  assert.equal(getWeeklyReward(3).title, 'THE WILD ROBOT');
  assert.equal(getWeeklyReward(8).title, 'JUJUTSU KAISEN 0');
  assert.equal(getWeeklyReward(11).title, 'INSIDE OUT 2');
  assert.equal(getWeeklyReward(13).title, 'TRANSFORMERS ONE');
  for (let w = 1; w <= 14; w++) {
    const rw = getWeeklyReward(w);
    assert.ok(rw.posterUrl.length > 0, `Week ${w} missing posterUrl`);
    assert.ok(rw.genreAr.length > 0, `Week ${w} missing genreAr`);
    assert.ok(rw.releaseYear >= 2014, `Week ${w} invalid releaseYear`);
  }

  assert.equal(EXAM_WEEK_PROTOCOL.length, 6);
  assert.equal(EXAM_WEEK_PROTOCOL[0].dayName, 'يوم السبت');
  assert.equal(EXAM_WEEK_PROTOCOL[5].dayName, 'يوم الخميس');
  assert.ok(EXAM_DOUAA.text.includes('اللهم يا معلم موسى'));
});

test('buildDailyCompletionSeries & summarizeCompletionSeries compute accurate range windows and KPIs', () => {
  const day1 = getDayPlan(1, 'sciences');
  const completedTasks = new Set<string>(day1.tasks.map((t) => t.id));
  const completedExtras = new Set<string>(['morning-1', 'evening-1']);

  const series7 = buildDailyCompletionSeries(completedTasks, completedExtras, 'sciences', 4, '7d');
  assert.equal(series7.length, 7);
  assert.equal(series7[0].day, 1);
  assert.equal(series7[0].percent, 100);
  assert.equal(series7[3].isCurrent, true);

  const series14Late = buildDailyCompletionSeries(completedTasks, completedExtras, 'sciences', 20, '14d');
  assert.equal(series14Late.length, 14);
  assert.equal(series14Late[0].day, 7);
  assert.equal(series14Late[13].day, 20);

  const seriesAll = buildDailyCompletionSeries(completedTasks, completedExtras, 'sciences', 4, 'all');
  assert.equal(seriesAll.length, 100);

  const summary = summarizeCompletionSeries(series7, 4);
  assert.equal(summary.bestDay, 1);
  assert.equal(summary.bestPercent, 100);
  assert.equal(summary.perfectDaysCount, 1);
  assert.equal(summary.hasAnyActivity, true);
  assert.ok(summary.totalEarnedXp > 0);
});

test('buildWeeklyCalendarData splits completed/remaining items and assigns color heat tones accurately', () => {
  assert.equal(getCompletionHeatTone(0), 'empty');
  assert.equal(getCompletionHeatTone(25), 'low');
  assert.equal(getCompletionHeatTone(55), 'mid');
  assert.equal(getCompletionHeatTone(80), 'high');
  assert.equal(getCompletionHeatTone(100), 'complete');

  const day1 = getDayPlan(1, 'sciences');
  const completedTasks = new Set<string>(day1.tasks.map((t) => t.id));
  const completedExtras = new Set<string>(['morning-1', 'evening-1']);

  const week1 = buildWeeklyCalendarData(1, completedTasks, completedExtras, 'sciences', 1);
  assert.equal(week1.week, 1);
  assert.equal(week1.days.length, 7);
  assert.equal(week1.days[0].percent, 100);
  assert.equal(week1.days[0].tone, 'complete');
  assert.equal(week1.days[0].remainingCount, 0);
  assert.equal(week1.days[0].completedItems.length, week1.days[0].totalCount);

  // Day 2 has spaced reviews generated from Day 1, all remaining
  assert.ok(week1.days[1].remainingCount > 0);
  assert.equal(
    week1.days[1].completedItems.length + week1.days[1].remainingItems.length,
    week1.days[1].totalCount
  );

  // Final partial week 15 covers days 99..100
  const week15 = buildWeeklyCalendarData(15, completedTasks, completedExtras, 'sciences', 99);
  assert.equal(week15.startDay, 99);
  assert.equal(week15.endDay, 100);
  assert.equal(week15.days.length, 2);
});

test('daily challenges match user branch, validate answers, and add bonus XP without breaking 100% task completion', () => {
  assert.ok(DAILY_CHALLENGES_BANK.length >= 20);
  for (const item of DAILY_CHALLENGES_BANK) {
    assert.equal(item.options.length, 4);
    assert.ok(item.correctIndex >= 0 && item.correctIndex <= 3);
    assert.ok(item.bonusXp > 0);
  }

  for (const branch of BRANCHES) {
    const allowed = new Set(branch.coreSubjects);
    for (let day = 1; day <= 15; day++) {
      const challenge = getDailyChallengeForDay(day, branch.id);
      assert.ok(
        allowed.has(challenge.subject),
        `Challenge subject ${challenge.subject} not in branch ${branch.id}`
      );
    }
  }

  const day6Challenge = getDailyChallengeForDay(6, 'sciences');
  const wrongIdx = (day6Challenge.correctIndex + 1) % 4;
  const wrongEval = evaluateDailyChallengeAttempt(day6Challenge, wrongIdx, false);
  assert.equal(wrongEval.isCorrect, false);
  assert.equal(wrongEval.awardedXp, 0);

  const rightEval = evaluateDailyChallengeAttempt(
    day6Challenge,
    day6Challenge.correctIndex,
    false
  );
  assert.equal(rightEval.isCorrect, true);
  assert.equal(rightEval.awardedXp, day6Challenge.bonusXp);

  const duplicateEval = evaluateDailyChallengeAttempt(
    day6Challenge,
    day6Challenge.correctIndex,
    true
  );
  assert.equal(duplicateEval.isCorrect, true);
  assert.equal(duplicateEval.awardedXp, 0);

  const baseStats = calculateUserStats(new Set(), new Set(), 0, 'sciences', 6, new Set());
  const boostedStats = calculateUserStats(
    new Set(),
    new Set(),
    0,
    'sciences',
    6,
    new Set([6])
  );
  assert.equal(boostedStats.totalXp - baseStats.totalXp, day6Challenge.bonusXp);
});

test('validateAvatarFile and computeSquareCropMetrics enforce valid image uploads and centered crops', () => {
  assert.equal(validateAvatarFile({ type: 'image/png', size: 1024 }).valid, true);
  assert.equal(validateAvatarFile({ type: 'image/jpeg', size: 200_000 }).valid, true);
  assert.equal(validateAvatarFile({ type: 'application/pdf', size: 1024 }).valid, false);
  assert.equal(validateAvatarFile({ type: 'image/png', size: 0 }).valid, false);
  assert.equal(
    validateAvatarFile({ type: 'image/png', size: MAX_AVATAR_FILE_BYTES + 1 }).valid,
    false
  );

  assert.deepEqual(computeSquareCropMetrics(800, 600), {
    sx: 100,
    sy: 0,
    size: 600,
  });
  assert.deepEqual(computeSquareCropMetrics(500, 900), {
    sx: 0,
    sy: 200,
    size: 500,
  });
});

test('taskNotes helpers create, update, reject blank text, filter, sort, count, and delete notes', () => {
  const empty = {};
  const ignoredBlank = upsertTaskNote(empty, {
    taskId: 'd6-phy-1',
    day: 6,
    subject: 'physics',
    taskTitle: 'حفظ القوانين',
    difficulty: 'hard',
    text: '   ',
    updatedAt: '2026-11-14T10:00:00.000Z',
  });
  assert.deepEqual(ignoredBlank, {});

  let notes = upsertTaskNote(empty, {
    taskId: 'd3-phy-1',
    day: 3,
    subject: 'physics',
    taskTitle: 'المعايرة',
    difficulty: 'hard',
    text: '  صعوبة في حساب التكافؤ  ',
    updatedAt: '2026-11-12T10:00:00.000Z',
  });
  notes = upsertTaskNote(notes, {
    taskId: 'd6-math-1',
    day: 6,
    subject: 'math',
    taskTitle: 'المشتقات',
    difficulty: 'easy',
    text: 'تم الحل بسرعة',
    updatedAt: '2026-11-14T11:00:00.000Z',
  });

  assert.equal(notes['d3-phy-1'].text, 'صعوبة في حساب التكافؤ');
  assert.deepEqual(countNotesByDifficulty(notes), {
    total: 2,
    hard: 1,
    medium: 0,
    easy: 1,
  });

  const allSorted = filterAndSortTaskNotes(notes, 'all');
  assert.equal(allSorted.length, 2);
  assert.equal(allSorted[0].taskId, 'd6-math-1');

  const onlyHard = filterAndSortTaskNotes(notes, 'hard');
  assert.equal(onlyHard.length, 1);
  assert.equal(onlyHard[0].taskId, 'd3-phy-1');

  // Update existing note difficulty and text
  notes = upsertTaskNote(notes, {
    taskId: 'd3-phy-1',
    day: 3,
    subject: 'physics',
    taskTitle: 'المعايرة',
    difficulty: 'medium',
    text: 'تحسن بعد إعادة التمرين',
    updatedAt: '2026-11-14T12:00:00.000Z',
  });
  assert.equal(countNotesByDifficulty(notes).medium, 1);
  assert.equal(countNotesByDifficulty(notes).hard, 0);

  const afterDelete = removeTaskNote(notes, 'd3-phy-1');
  assert.equal(countNotesByDifficulty(afterDelete).total, 1);
  assert.equal(removeTaskNote(afterDelete, 'missing-id'), afterDelete);
});

test('overdueReminders collects past uncompleted tasks and triggers start-of-day reminder once per day', () => {
  const day1Empty = collectOverdueTasksSummary(1, new Set(), 'sciences');
  assert.equal(day1Empty.totalOverdueCount, 0);
  assert.equal(day1Empty.firstOverdueTarget, null);

  const day1Plan = getDayPlan(1, 'sciences');
  const day2Plan = getDayPlan(2, 'sciences');
  const completed = new Set<string>(day1Plan.tasks.map((t) => t.id));

  // On Day 3, Day 1 is 100% done while Day 2 is overdue
  const summaryDay3 = collectOverdueTasksSummary(3, completed, 'sciences');
  assert.equal(summaryDay3.overdueDaysCount, 1);
  assert.equal(summaryDay3.totalOverdueCount, day2Plan.tasks.length);
  assert.equal(summaryDay3.firstOverdueTarget?.day, 2);
  assert.equal(summaryDay3.firstOverdueTarget?.taskId, day2Plan.tasks[0].id);

  const todayKey = getLocalDateKey(new Date(2026, 10, 14));
  assert.equal(todayKey, '2026-11-14');

  assert.equal(
    shouldTriggerStartOfDayReminder({
      onboarded: true,
      currentDay: 3,
      totalOverdueCount: summaryDay3.totalOverdueCount,
      lastReminderDate: undefined,
      todayDateKey: todayKey,
    }),
    true
  );

  // Already shown today -> suppressed
  assert.equal(
    shouldTriggerStartOfDayReminder({
      onboarded: true,
      currentDay: 3,
      totalOverdueCount: summaryDay3.totalOverdueCount,
      lastReminderDate: '2026-11-14',
      todayDateKey: todayKey,
    }),
    false
  );

  // Next calendar day -> triggers again
  assert.equal(
    shouldTriggerStartOfDayReminder({
      onboarded: true,
      currentDay: 3,
      totalOverdueCount: summaryDay3.totalOverdueCount,
      lastReminderDate: '2026-11-13',
      todayDateKey: todayKey,
    }),
    true
  );
});

test('buildWeeklyAchievements computes top subject, best productivity day, weekly XP, and empty/partial weeks', () => {
  const day1 = getDayPlan(1, 'sciences');
  const day2 = getDayPlan(2, 'sciences');
  const completedTasks = new Set<string>([
    ...day1.tasks.map((t) => t.id),
    day2.tasks[0].id,
  ]);
  const completedExtras = new Set<string>(['morning-1', 'evening-1']);
  const solvedChallenges = new Set<number>([1]);

  const week1 = buildWeeklyAchievements(
    1,
    completedTasks,
    completedExtras,
    solvedChallenges,
    'sciences'
  );

  assert.equal(week1.week, 1);
  assert.equal(week1.startDay, 1);
  assert.equal(week1.endDay, 7);
  assert.equal(week1.hasAnyActivity, true);
  assert.equal(week1.bestDay?.day, 1);
  assert.equal(week1.bestDay?.percent, 100);
  assert.ok(week1.topSubject !== null);
  assert.ok((week1.topSubject?.completedCount ?? 0) >= 1);
  assert.equal(week1.activeDaysCount, 2);
  assert.equal(week1.solvedChallengesCount, 1);
  assert.ok(week1.weeklyXp > 0);
  assert.equal(week1.rewardMovieTitle, getWeeklyReward(1).title);

  // Week 2 has zero activity -> clean empty metrics
  const week2 = buildWeeklyAchievements(
    2,
    completedTasks,
    completedExtras,
    solvedChallenges,
    'sciences'
  );
  assert.equal(week2.hasAnyActivity, false);
  assert.equal(week2.topSubject, null);
  assert.equal(week2.bestDay, null);
  assert.equal(week2.weeklyXp, 0);
  assert.equal(week2.activeDaysCount, 0);

  // Week 15 partial week (days 99..100) clamps safely and maps reward week 14
  const week15 = buildWeeklyAchievements(
    15,
    completedTasks,
    completedExtras,
    solvedChallenges,
    'sciences'
  );
  assert.equal(week15.startDay, 99);
  assert.equal(week15.endDay, 100);
  assert.equal(week15.daysInWeek, 2);
  assert.equal(week15.rewardMovieTitle, getWeeklyReward(14).title);
});

test('breakIntelligence suggests targeted stretch/exercise tiers based on completed focus session duration', () => {
  const sprint = getBreakRecommendation(25);
  assert.equal(sprint.tier, 'sprint');
  assert.equal(sprint.breakMinutes, 5);
  assert.equal(sprint.steps.length, 3);

  const balanced = getBreakRecommendation(45);
  assert.equal(balanced.tier, 'balanced');
  assert.equal(balanced.breakMinutes, 10);
  assert.equal(balanced.steps.length, 3);

  const deep = getBreakRecommendation(60);
  assert.equal(deep.tier, 'deep');
  assert.equal(deep.breakMinutes, 12);
  assert.equal(deep.steps.length, 3);

  const marathon = getBreakRecommendation(90);
  assert.equal(marathon.tier, 'marathon');
  assert.equal(marathon.breakMinutes, 15);
  assert.equal(marathon.steps.length, 4);

  // Elapsed resolution: natural finish or quick-log uses selected block; partial >=60s uses elapsed minutes
  assert.equal(resolveCompletedSessionMinutes(60, 0), 60);
  assert.equal(resolveCompletedSessionMinutes(45, 45 * 60), 45);
  assert.equal(resolveCompletedSessionMinutes(90, 90 * 60 - 25 * 60), 25);
});

test('badges evaluator tracks full week streak, 50h focus milestone, progress percentages, and new unlock diffs', () => {
  const emptyBadges = evaluateBadges({
    completedTasksCount: 0,
    completedDaysCount: 0,
    streakDays: 0,
    focusSessionsCount: 0,
    focusMinutesTotal: 0,
    solvedChallengesCount: 0,
    notesCount: 0,
  });
  assert.equal(emptyBadges.every((b) => !b.unlocked), true);

  const partialBadges = evaluateBadges({
    completedTasksCount: 24,
    completedDaysCount: 1,
    streakDays: 5,
    focusSessionsCount: 4,
    focusMinutesTotal: 1500, // 25 hours
    solvedChallengesCount: 2,
    notesCount: 1,
  });

  const firstSpark = partialBadges.find((b) => b.id === 'first-spark');
  const fullWeek = partialBadges.find((b) => b.id === 'full-week');
  const focus5 = partialBadges.find((b) => b.id === 'focus-5');
  const focus50h = partialBadges.find((b) => b.id === 'focus-50h');

  assert.equal(firstSpark?.unlocked, true);
  assert.equal(fullWeek?.unlocked, false);
  assert.equal(fullWeek?.currentValue, 5);
  assert.equal(focus5?.unlocked, false);
  assert.equal(focus5?.progressPercent, 80);
  assert.equal(focus50h?.unlocked, false);
  assert.equal(focus50h?.progressPercent, 50);

  // Unlocking 7-day study week and 50 hours (3000 min) focus
  const masterInput = {
    completedTasksCount: 40,
    completedDaysCount: 7,
    streakDays: 7,
    focusSessionsCount: 45,
    focusMinutesTotal: 3000,
    solvedChallengesCount: 3,
    notesCount: 3,
  };
  const masterBadges = evaluateBadges(masterInput);
  assert.equal(masterBadges.every((b) => b.unlocked), true);
  assert.equal(
    masterBadges.find((b) => b.id === 'full-week')?.titleAr,
    'أسبوع كامل من الدراسة'
  );
  assert.equal(
    masterBadges.find((b) => b.id === 'focus-50h')?.titleAr,
    'الوصول إلى 50 ساعة تركيز'
  );

  // Diff only surfaces newly earned badges without repeating previously known ones
  const previousIds = getSatisfiedBadgeIds({
    completedTasksCount: 24,
    completedDaysCount: 1,
    streakDays: 5,
    focusSessionsCount: 4,
    focusMinutesTotal: 180,
    solvedChallengesCount: 2,
    notesCount: 1,
  });
  const newlyUnlocked = findNewlyUnlockedBadges(previousIds, masterBadges);
  assert.equal(newlyUnlocked.some((b) => b.id === 'first-spark'), false);
  assert.equal(newlyUnlocked.some((b) => b.id === 'full-week'), true);
  assert.equal(newlyUnlocked.some((b) => b.id === 'focus-50h'), true);
  assert.equal(formatFocusHoursLabel(45), '45 دقيقة');
  assert.equal(formatFocusHoursLabel(3000), '50.0 ساعة');
});

test('coachBa9i selects appropriate mascot mood and action for dashboard and focus states', () => {
  assert.equal(Object.keys(COACH_BA9I_POSES).length, 8);

  const victory = getCoachBa9iDashboardState({
    studentName: 'أمين',
    currentDay: 6,
    daysRemaining: 94,
    dayPercent: 100,
    streakDays: 3,
    overdueCount: 4,
    completedTasksToday: 5,
    totalTasksToday: 5,
    challengeSolved: false,
  });
  assert.equal(victory.mood, 'victory');
  assert.equal(victory.actionType, 'challenge');

  const overwhelmed = getCoachBa9iDashboardState({
    studentName: 'أمين',
    currentDay: 6,
    daysRemaining: 94,
    dayPercent: 10,
    streakDays: 1,
    overdueCount: 7,
    completedTasksToday: 0,
    totalTasksToday: 5,
    challengeSolved: false,
  });
  assert.equal(overwhelmed.mood, 'overwhelmed');
  assert.equal(overwhelmed.actionType, 'overdue');

  const clockRush = getCoachBa9iDashboardState({
    studentName: 'أمين',
    currentDay: 3,
    daysRemaining: 97,
    dayPercent: 15,
    streakDays: 1,
    overdueCount: 2,
    completedTasksToday: 0,
    totalTasksToday: 4,
    challengeSolved: false,
  });
  assert.equal(clockRush.mood, 'clock-rush');
  assert.equal(clockRush.actionType, 'overdue');

  const saha = getCoachBa9iDashboardState({
    studentName: 'أمين',
    currentDay: 6,
    daysRemaining: 94,
    dayPercent: 60,
    streakDays: 4,
    overdueCount: 0,
    completedTasksToday: 3,
    totalTasksToday: 5,
    challengeSolved: true,
  });
  assert.equal(saha.mood, 'saha');
  assert.equal(saha.actionType, 'focus');

  const defaultFire = getCoachBa9iDashboardState({
    studentName: 'أمين',
    currentDay: 6,
    daysRemaining: 94,
    dayPercent: 20,
    streakDays: 0,
    overdueCount: 0,
    completedTasksToday: 1,
    totalTasksToday: 5,
    challengeSolved: false,
  });
  assert.equal(defaultFire.mood, 'focus-fire');

  const teaBreak = getCoachBa9iFocusState({
    running: false,
    onBreak: true,
    durationMin: 45,
    completedSessionMin: 45,
  });
  assert.equal(teaBreak.mood, 'tea-break');

  const nightStudyRunning = getCoachBa9iFocusState({
    running: true,
    onBreak: false,
    durationMin: 60,
    completedSessionMin: null,
  });
  assert.equal(nightStudyRunning.mood, 'night-study');

  const sprintRunning = getCoachBa9iFocusState({
    running: true,
    onBreak: false,
    durationMin: 25,
    completedSessionMin: null,
  });
  assert.equal(sprintRunning.mood, 'focus-fire');
});

test('storageDiagnostics classifies corrupted JSON, storage access errors, invalid schema, hydration errors, and quota limits', () => {
  const makeLogger = () => {
    const warnings: Array<{ message: string; details?: Record<string, unknown> }> = [];
    const errors: Array<{ message: string; details?: Record<string, unknown> }> = [];
    const logger: StorageLogger = {
      warn: (message, details) => warnings.push({ message, details }),
      error: (message, details) => errors.push({ message, details }),
    };
    return { warnings, errors, logger };
  };

  // 1. Storage access error (e.g. SecurityError in restricted iframe)
  const secErr = Object.assign(new Error('Access is denied for this document'), {
    name: 'SecurityError',
  });
  assert.equal(classifyStorageError(secErr), 'storage_access_denied');
  const log1 = makeLogger();
  const res1 = readAndValidateStorageState({
    storage: {
      getItem: () => {
        throw secErr;
      },
      setItem: () => {},
    },
    key: 'test_key',
    sanitize: (x) => x as Record<string, unknown>,
    logger: log1.logger,
  });
  assert.equal(res1.status, 'error');
  assert.equal(res1.category, 'storage_access_denied');
  assert.equal(log1.errors.length, 1);
  assert.equal(log1.errors[0].details?.category, 'storage_access_denied');

  // 2. Corrupted JSON payload
  const log2 = makeLogger();
  const res2 = readAndValidateStorageState({
    storage: {
      getItem: () => '{"profile":{"name":',
      setItem: () => {},
    },
    key: 'test_key',
    sanitize: (x) => x as Record<string, unknown>,
    logger: log2.logger,
  });
  assert.equal(res2.status, 'error');
  assert.equal(res2.category, 'corrupted_json');
  assert.equal(log2.errors.length, 1);
  assert.equal(log2.errors[0].details?.category, 'corrupted_json');

  // 3. Invalid schema (valid JSON, fails sanitizer)
  const log3 = makeLogger();
  const res3 = readAndValidateStorageState({
    storage: {
      getItem: () => JSON.stringify({ legacy: true }),
      setItem: () => {},
    },
    key: 'test_key',
    sanitize: () => null,
    logger: log3.logger,
  });
  assert.equal(res3.status, 'error');
  assert.equal(res3.category, 'invalid_schema');
  assert.equal(log3.warnings.length, 1);
  assert.equal(log3.warnings[0].details?.category, 'invalid_schema');

  // 4. Hydration exception
  const log4 = makeLogger();
  const res4 = readAndValidateStorageState({
    storage: {
      getItem: () => JSON.stringify({ profile: { name: 'أمين' } }),
      setItem: () => {},
    },
    key: 'test_key',
    sanitize: () => {
      throw new Error('Unexpected badge compute crash');
    },
    logger: log4.logger,
  });
  assert.equal(res4.status, 'error');
  assert.equal(res4.category, 'hydration_exception');
  assert.equal(log4.errors.length, 1);

  // 5. QuotaExceededError on write
  const quotaErr = Object.assign(new Error('QuotaExceededError: storage limit reached'), {
    name: 'QuotaExceededError',
    code: 22,
  });
  assert.equal(classifyStorageError(quotaErr), 'quota_exceeded');
  const log5 = makeLogger();
  const writeRes = writeStorageState({
    storage: {
      getItem: () => null,
      setItem: () => {
        throw quotaErr;
      },
    },
    key: 'test_key',
    state: { profile: { name: 'أمين' } },
    logger: log5.logger,
  });
  assert.equal(writeRes.ok, false);
  assert.equal(writeRes.category, 'quota_exceeded');
  assert.equal(log5.errors.length, 1);
  assert.equal(log5.errors[0].details?.category, 'quota_exceeded');
  assert.equal(typeof log5.errors[0].details?.payloadChars, 'number');
});

test('buildWeeklyProgressBarSeries & summarizeWeeklyProgressSeries compute all 15 weeks over 100 days', () => {
  const emptySeries = buildWeeklyProgressBarSeries(
    new Set(),
    new Set(),
    'sciences',
    1
  );
  assert.equal(emptySeries.length, 15);
  assert.equal(emptySeries[0].startDay, 1);
  assert.equal(emptySeries[0].endDay, 7);
  assert.equal(emptySeries[0].isCurrentWeek, true);
  assert.equal(emptySeries[14].startDay, 99);
  assert.equal(emptySeries[14].endDay, 100);

  const emptySummary = summarizeWeeklyProgressSeries(emptySeries);
  assert.equal(emptySummary.totalCompletedTasks, 0);
  assert.equal(emptySummary.activeWeeksCount, 0);
  assert.equal(emptySummary.bestWeek, null);

  // Complete Day 1 tasks + morning/evening and Day 8 (Week 2) tasks
  const d1 = getDayPlan(1, 'sciences');
  const d8 = getDayPlan(8, 'sciences');
  const completedTasks = new Set<string>([
    ...d1.tasks.map((t) => t.id),
    d8.tasks[0].id,
  ]);
  const completedExtras = new Set<string>(['morning-1', 'evening-1']);

  const series = buildWeeklyProgressBarSeries(
    completedTasks,
    completedExtras,
    'sciences',
    8
  );
  assert.equal(series[0].completedTasks, d1.tasks.length + 2);
  assert.equal(series[0].coreCompletedTasks, d1.tasks.length);
  assert.equal(series[0].isCurrentWeek, false);
  assert.equal(series[1].completedTasks, 1);
  assert.equal(series[1].isCurrentWeek, true);

  const summary = summarizeWeeklyProgressSeries(series);
  assert.equal(summary.totalCompletedTasks, d1.tasks.length + 3);
  assert.equal(summary.activeWeeksCount, 2);
  assert.equal(summary.bestWeek, 1);
  assert.equal(summary.bestWeekCount, d1.tasks.length + 2);
});

test('quickNotes helpers add, reject blank text, pin, filter/sort, count, delete, and sanitize', () => {
  // Reject blank input without mutation
  const initial = addQuickNote([], { text: '   \n  ', category: 'idea' });
  assert.equal(initial.length, 0);

  // Add ideas, questions, reminders
  const step1 = addQuickNote([], {
    id: 'q1',
    text: '  تحضير خريطة ذهنية للأدب العربي  ',
    category: 'idea',
    now: '2026-11-15T08:00:00.000Z',
  });
  const step2 = addQuickNote(step1, {
    id: 'q2',
    text: 'كيف أميز بين القيمة المطلقة ونهاية دالة مركبة؟',
    category: 'question',
    now: '2026-11-15T09:00:00.000Z',
  });
  const step3 = addQuickNote(step2, {
    id: 'q3',
    text: 'طباعة حوليات بكالوريا 2023 غداً صباحاً',
    category: 'reminder',
    now: '2026-11-15T10:00:00.000Z',
  });
  assert.equal(step3.length, 3);
  assert.equal(step3.find((n) => n.id === 'q1')?.text, 'تحضير خريطة ذهنية للأدب العربي');

  // Counts by category
  const counts = countQuickNotesByCategory(step3);
  assert.deepEqual(counts, { total: 3, idea: 1, question: 1, reminder: 1 });

  // Pinning puts older note q1 ahead of newer notes q3 & q2
  const pinnedList = togglePinQuickNote(step3, 'q1');
  const sortedAll = filterAndSortQuickNotes(pinnedList, 'all');
  assert.deepEqual(
    sortedAll.map((n) => n.id),
    ['q1', 'q3', 'q2']
  );

  // Category filter
  const questionsOnly = filterAndSortQuickNotes(pinnedList, 'question');
  assert.equal(questionsOnly.length, 1);
  assert.equal(questionsOnly[0].id, 'q2');

  // Remove
  const afterDelete = removeQuickNote(pinnedList, 'q3');
  assert.equal(afterDelete.length, 2);
  assert.equal(afterDelete.some((n) => n.id === 'q3'), false);

  // Sanitize malformed persistence payload
  const sanitized = sanitizeQuickNotes([
    null,
    { id: '', text: 'ignored' },
    { id: 'dup', text: '   ', category: 'idea' },
    { id: 'valid-1', text: 'فكرة صالحة', category: 'unknown-cat', pinned: 1 },
    { id: 'valid-1', text: 'مكررة', category: 'idea' },
  ]);
  assert.equal(sanitized.length, 1);
  assert.equal(sanitized[0].id, 'valid-1');
  assert.equal(sanitized[0].category, 'idea');
  assert.equal(sanitized[0].pinned, true);
});

test('weeklyReviewSummary ranks subjects needing greater focus from past 7 days in localStorage', () => {
  assert.equal(resolvePriorityTier(3, 40), 'high');
  assert.equal(resolvePriorityTier(1, 65), 'high');
  assert.equal(resolvePriorityTier(2, 35), 'medium');
  assert.equal(resolvePriorityTier(1, 20), 'low');

  // Window for day 10 covers days 4..10 (7 days)
  const d4 = getDayPlan(4, 'sciences');
  const d5 = getDayPlan(5, 'sciences');
  const d6 = getDayPlan(6, 'sciences');
  const d7 = getDayPlan(7, 'sciences');
  const d8 = getDayPlan(8, 'sciences');
  const d9 = getDayPlan(9, 'sciences');
  const d10 = getDayPlan(10, 'sciences');

  const allWindowTasks = [
    ...d4.tasks,
    ...d5.tasks,
    ...d6.tasks,
    ...d7.tasks,
    ...d8.tasks,
    ...d9.tasks,
    ...d10.tasks,
  ];
  // Complete everything EXCEPT physics tasks in the 7-day window
  const completedWithoutPhysics = allWindowTasks
    .filter((t) => t.subject !== 'physics')
    .map((t) => t.id);

  const reportFromStorage = generateWeeklyReviewSummaryFromStorage({
    storage: {
      getItem: (k) =>
        k === 'ba9i_key'
          ? JSON.stringify({
              currentDay: 10,
              highestDayReached: 10,
              profile: { branch: 'sciences' },
              completedTaskIds: completedWithoutPhysics,
            })
          : null,
      setItem: () => {},
    },
    storageKey: 'ba9i_key',
    sanitize: (x) =>
      x as {
        currentDay: number;
        highestDayReached?: number;
        profile: { branch: 'sciences' };
        completedTaskIds: string[];
      },
    fallbackSnapshot: {
      currentDay: 1,
      profile: { branch: 'sciences' },
      completedTaskIds: [],
    },
  });

  assert.equal(reportFromStorage.dataSource, 'localStorage');
  assert.equal(reportFromStorage.windowStartDay, 4);
  assert.equal(reportFromStorage.windowEndDay, 10);
  assert.equal(reportFromStorage.daysCount, 7);
  assert.equal(reportFromStorage.focusSubjects.length, 1);
  assert.equal(reportFromStorage.topFocusSubject?.subject, 'physics');
  assert.equal(reportFromStorage.masteredSubjects.length > 0, true);

  // When all tasks in the 7-day window are completed, focusSubjects is empty
  const allCompleteReport = buildWeeklyReviewSummary({
    snapshot: {
      currentDay: 10,
      profile: { branch: 'sciences' },
      completedTaskIds: allWindowTasks.map((t) => t.id),
    },
    dataSource: 'localStorage',
  });
  assert.equal(allCompleteReport.incompleteTasks, 0);
  assert.equal(allCompleteReport.completionPercent, 100);
  assert.equal(allCompleteReport.focusSubjects.length, 0);
  assert.equal(allCompleteReport.topFocusSubject, null);
});

