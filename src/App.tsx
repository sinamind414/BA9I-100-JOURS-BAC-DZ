import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  BRANCHES,
  getDayPlan,
} from './data/curriculum';
import { getDailyChallengeForDay } from './data/dailyChallenges';
import {
  ContestSubmission,
  ExamRef,
  QuickNote,
  QuickNoteCategory,
  StudyTask,
  SubjectId,
  TabId,
  TaskDifficulty,
  TaskNote,
  UserProfile,
} from './types/bac';
import { ambientAudio } from './utils/ambientAudio';
import {
  EvaluatedBadge,
  evaluateBadges,
  findNewlyUnlockedBadges,
  getSatisfiedBadgeIds,
} from './utils/badges';
import {
  collectOverdueTasksSummary,
  getLocalDateKey,
  shouldTriggerStartOfDayReminder,
} from './utils/overdueReminders';
import {
  calculateDayProgress,
  calculateUserStats,
  getAvatarStage,
  getDueReviewsForDay,
  getWeekRewardStatus,
  TOTAL_CHALLENGE_DAYS,
} from './utils/spacedRepetition';
import {
  addQuickNote,
  removeQuickNote,
  sanitizeQuickNotes,
  togglePinQuickNote,
} from './utils/quickNotes';
import { removeTaskNote, upsertTaskNote } from './utils/taskNotes';
import {
  generateWeeklyReviewSummaryFromStorage,
  WeeklyReviewSummaryReport,
} from './utils/weeklyReviewSummary';
import {
  extractErrorMetadata,
  readAndValidateStorageState,
  StorageLike,
  writeStorageState,
} from './utils/storageDiagnostics';
import { BadgeUnlockBanner } from './components/BadgeUnlockBanner';
import { CheatsheetsView } from './components/CheatsheetsView';
import { DashboardView } from './components/DashboardView';
import { FocusView } from './components/FocusView';
import { LeaderboardView } from './components/LeaderboardView';
import {
  DayMapModal,
  DouaaModal,
  ExamPreviewModal,
  ProfileModal,
  WeeklyMoviesModal,
} from './components/Modals';
import {
  DesktopSidebar,
  MobileBottomNav,
  TopHeader,
} from './components/NavigationShell';
import { OnboardingWizard } from './components/OnboardingWizard';
import {
  OverdueReminderToast,
  OverdueTasksModal,
} from './components/OverdueReminderSystem';

const STORAGE_KEY = 'ba9i_100_bac_state_v1';

interface PersistedState {
  profile: UserProfile;
  currentDay: number;
  highestDayReached?: number;
  completedTaskIds: string[];
  completedExtraIds: string[];
  solvedChallengeDays?: number[];
  taskNotes?: Record<string, TaskNote>;
  quickNotes?: QuickNote[];
  lastOverdueReminderDate?: string;
  focusSessionsCount: number;
  focusMinutesTotal?: number;
  unlockedBadgeIds?: string[];
  contestSubmission: ContestSubmission | null;
}

const DEFAULT_DEMO_STATE: PersistedState = {
  profile: {
    name: 'أمين',
    branch: 'sciences',
    targetAverage: 16,
    wilayaCode: 19,
    readiness: 'steady',
    onboarded: true,
  },
  currentDay: 6,
  highestDayReached: 6,
  // Seed Days 1..5 partially completed so spaced repetition & streaks come alive immediately
  completedTaskIds: [
    'd1-sci-1',
    'd1-sci-2',
    'd1-sci-3',
    'd1-fr-1',
    'd1-his-1',
    'd1-his-2',
    'd2-math-1',
    'd2-eng-1',
    'd2-isl-1',
    'd3-phy-1',
    'd3-phy-2',
    'd3-arb-1',
    'd3-phi-1',
    'd4-sci-1',
    'd4-sci-2',
    'd4-fr-2',
    'd4-his-1',
    'd4-his-2',
    'd5-math-1',
    'd5-math-2',
    'd5-eng-1',
    'd5-isl-1',
    'd5-isl-2',
    'd6-phy-1',
  ],
  completedExtraIds: [
    'morning-1',
    'evening-1',
    'morning-2',
    'evening-2',
    'morning-3',
    'evening-3',
    'morning-4',
    'evening-4',
    'morning-5',
    'evening-5',
    'morning-6',
  ],
  focusSessionsCount: 4,
  focusMinutesTotal: 180,
  solvedChallengeDays: [1, 3],
  taskNotes: {
    'd3-phy-1': {
      taskId: 'd3-phy-1',
      day: 3,
      subject: 'physics',
      taskTitle:
        'مراجعة المفاهيم الأساسية في الكيمياء (القوانين، عملية التمديد، تحضير محلول انطلاقاً من مادة صلبة)',
      difficulty: 'hard',
      text: 'ركزت على قانون التمديد C1·V1 = C2·V2 — أحتاج إعادة حل تمرين تحضير محلول صلب.',
      updatedAt: '2026-11-12T18:30:00.000Z',
    },
  },
  quickNotes: [
    {
      id: 'qn-demo-1',
      category: 'question',
      text: 'سؤال للأستاذ: متى نهمل المتفاعلات الثانوية في جدول التقدم عند معايرة حمض ضعيف؟',
      pinned: true,
      createdAt: '2026-11-14T10:15:00.000Z',
      updatedAt: '2026-11-14T10:15:00.000Z',
    },
    {
      id: 'qn-demo-2',
      category: 'idea',
      text: 'تحضير ورقة ملخصة بأهم تواريخ الثورة التحريرية لمراجعتها في الحافلة.',
      pinned: false,
      createdAt: '2026-11-14T16:40:00.000Z',
      updatedAt: '2026-11-14T16:40:00.000Z',
    },
  ],
  contestSubmission: null,
};

function computeBaselineBadgeIds(s: PersistedState): string[] {
  const taskSet = new Set(s.completedTaskIds);
  const extraSet = new Set(s.completedExtraIds);
  const challengeSet = new Set(s.solvedChallengeDays ?? []);
  const computedStats = calculateUserStats(
    taskSet,
    extraSet,
    s.focusSessionsCount,
    s.profile.branch,
    s.currentDay,
    challengeSet
  );
  return getSatisfiedBadgeIds({
    completedTasksCount: s.completedTaskIds.length,
    completedDaysCount: computedStats.completedDaysCount,
    streakDays: computedStats.streakDays,
    focusSessionsCount: s.focusSessionsCount,
    focusMinutesTotal: s.focusMinutesTotal ?? s.focusSessionsCount * 45,
    solvedChallengesCount: challengeSet.size,
    notesCount: Object.keys(s.taskNotes ?? {}).length,
  });
}

DEFAULT_DEMO_STATE.unlockedBadgeIds = computeBaselineBadgeIds(DEFAULT_DEMO_STATE);

const INITIAL_EMPTY_STATE: PersistedState = {
  profile: {
    name: '',
    branch: 'sciences',
    targetAverage: 16,
    wilayaCode: 19,
    readiness: 'steady',
    onboarded: false,
  },
  currentDay: 1,
  highestDayReached: 1,
  completedTaskIds: [],
  completedExtraIds: [],
  solvedChallengeDays: [],
  taskNotes: {},
  quickNotes: [],
  focusSessionsCount: 0,
  focusMinutesTotal: 0,
  unlockedBadgeIds: [],
  contestSubmission: null,
};

const VALID_BRANCH_IDS = new Set(BRANCHES.map((b) => b.id));

function sanitizePersistedState(rawParsed: unknown): PersistedState | null {
  if (!rawParsed || typeof rawParsed !== 'object') return null;
  const parsed = rawParsed as Partial<PersistedState>;
  if (!parsed.profile || typeof parsed.profile !== 'object') return null;

  const rawProfile = parsed.profile as Partial<UserProfile>;
  const safeBranch = VALID_BRANCH_IDS.has(rawProfile.branch as UserProfile['branch'])
    ? (rawProfile.branch as UserProfile['branch'])
    : 'sciences';
  const safeReadiness: UserProfile['readiness'] =
    rawProfile.readiness === 'panic' ||
    rawProfile.readiness === 'steady' ||
    rawProfile.readiness === 'advanced'
      ? rawProfile.readiness
      : 'steady';
  const rawDay = Number(parsed.currentDay);
  const safeDay =
    Number.isFinite(rawDay) && rawDay >= 1
      ? Math.min(TOTAL_CHALLENGE_DAYS, Math.floor(rawDay))
      : 1;
  const rawHighest = Number(parsed.highestDayReached);
  const safeHighest = Number.isFinite(rawHighest)
    ? Math.max(safeDay, Math.min(TOTAL_CHALLENGE_DAYS, Math.floor(rawHighest)))
    : safeDay;

  const safeCompletedTasks = Array.isArray(parsed.completedTaskIds)
    ? parsed.completedTaskIds.filter((x): x is string => typeof x === 'string')
    : [];
  const safeCompletedExtras = Array.isArray(parsed.completedExtraIds)
    ? parsed.completedExtraIds.filter((x): x is string => typeof x === 'string')
    : [];
  const safeSolvedChallenges = Array.isArray(parsed.solvedChallengeDays)
    ? parsed.solvedChallengeDays.filter(
        (x): x is number => typeof x === 'number' && Number.isFinite(x)
      )
    : [];
  const rawFocusCount = Number(parsed.focusSessionsCount);
  const safeFocusCount =
    Number.isFinite(rawFocusCount) && rawFocusCount >= 0
      ? Math.floor(rawFocusCount)
      : 0;
  const rawFocusMinutes = Number(parsed.focusMinutesTotal);
  const safeFocusMinutes =
    Number.isFinite(rawFocusMinutes) && rawFocusMinutes >= 0
      ? Math.floor(rawFocusMinutes)
      : safeFocusCount * 45;

  const safeTargetAvg = Number(rawProfile.targetAverage);
  const safeWilaya = Number(rawProfile.wilayaCode);

  const hydrated: PersistedState = {
    profile: {
      name: typeof rawProfile.name === 'string' ? rawProfile.name : '',
      branch: safeBranch,
      targetAverage:
        Number.isFinite(safeTargetAvg) && safeTargetAvg >= 10 && safeTargetAvg <= 20
          ? safeTargetAvg
          : 16,
      wilayaCode:
        Number.isFinite(safeWilaya) && safeWilaya >= 1 && safeWilaya <= 58
          ? safeWilaya
          : 19,
      readiness: safeReadiness,
      onboarded: Boolean(rawProfile.onboarded),
      avatarUrl:
        typeof rawProfile.avatarUrl === 'string' ? rawProfile.avatarUrl : undefined,
    },
    currentDay: safeDay,
    highestDayReached: safeHighest,
    completedTaskIds: safeCompletedTasks,
    completedExtraIds: safeCompletedExtras,
    solvedChallengeDays: safeSolvedChallenges,
    taskNotes:
      parsed.taskNotes && typeof parsed.taskNotes === 'object' && !Array.isArray(parsed.taskNotes)
        ? parsed.taskNotes
        : {},
    quickNotes: sanitizeQuickNotes(parsed.quickNotes),
    lastOverdueReminderDate:
      typeof parsed.lastOverdueReminderDate === 'string'
        ? parsed.lastOverdueReminderDate
        : undefined,
    focusSessionsCount: safeFocusCount,
    focusMinutesTotal: safeFocusMinutes,
    contestSubmission: parsed.contestSubmission ?? null,
  };

  return {
    ...hydrated,
    unlockedBadgeIds: Array.isArray(parsed.unlockedBadgeIds)
      ? parsed.unlockedBadgeIds.filter((x): x is string => typeof x === 'string')
      : computeBaselineBadgeIds(hydrated),
  };
}

function getSafeLocalStorage(): StorageLike | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage;
  } catch (err) {
    const meta = extractErrorMetadata(err);
    console.error('[BA9I Storage:Access] Accessing window.localStorage threw an exception.', {
      category: 'storage_access_denied',
      errorName: meta.name,
      errorCode: meta.code,
      errorMessage: meta.message,
    });
    return null;
  }
}

function loadInitialState(): PersistedState {
  if (typeof window === 'undefined') {
    return INITIAL_EMPTY_STATE;
  }

  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('autostart') === '1') {
      return DEFAULT_DEMO_STATE;
    }
  } catch (err) {
    const meta = extractErrorMetadata(err);
    console.warn('[BA9I Init:URL] Failed to parse URLSearchParams during startup.', {
      errorName: meta.name,
      errorMessage: meta.message,
    });
  }

  const storage = getSafeLocalStorage();
  const result = readAndValidateStorageState<PersistedState>({
    storage,
    key: STORAGE_KEY,
    sanitize: sanitizePersistedState,
  });

  if (result.status === 'ok' && result.state) {
    return result.state;
  }

  return INITIAL_EMPTY_STATE;
}

export default function App() {
  const [state, setState] = useState<PersistedState>(loadInitialState);
  const [activeTab, setActiveTab] = useState<TabId>('quests');
  const [focusTask, setFocusTask] = useState<StudyTask | null>(null);
  const [guideSubject, setGuideSubject] = useState<SubjectId | null>(null);

  const [douaaOpen, setDouaaOpen] = useState(false);
  const [douaaMode, setDouaaMode] = useState<'study' | 'exam'>('study');
  const [dayMapOpen, setDayMapOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileFocusNotesSignal, setProfileFocusNotesSignal] = useState(0);
  const [activeExam, setActiveExam] = useState<ExamRef | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [overdueModalOpen, setOverdueModalOpen] = useState(false);
  const [overdueToastOpen, setOverdueToastOpen] = useState(false);
  const [weeklyMoviesOpen, setWeeklyMoviesOpen] = useState(false);
  const [highlightedTaskId, setHighlightedTaskId] = useState<string | null>(
    null
  );
  const [highlightedBadgeId, setHighlightedBadgeId] = useState<string | null>(
    null
  );
  const [badgeCelebrationQueue, setBadgeCelebrationQueue] = useState<
    EvaluatedBadge[]
  >([]);
  const checkedStartOfDayRef = useRef(false);
  const [weeklyReviewReport, setWeeklyReviewReport] =
    useState<WeeklyReviewSummaryReport>(() =>
      generateWeeklyReviewSummaryFromStorage({
        storage: getSafeLocalStorage(),
        storageKey: STORAGE_KEY,
        sanitize: sanitizePersistedState,
        fallbackSnapshot: state,
      })
    );

  useEffect(() => {
    const storage = getSafeLocalStorage();
    writeStorageState({
      storage,
      key: STORAGE_KEY,
      state,
    });
    setWeeklyReviewReport(
      generateWeeklyReviewSummaryFromStorage({
        storage,
        storageKey: STORAGE_KEY,
        sanitize: sanitizePersistedState,
        fallbackSnapshot: state,
      })
    );
  }, [state]);

  useEffect(() => {
    if (!toastMessage) return;
    const timer = window.setTimeout(() => setToastMessage(null), 2600);
    return () => window.clearTimeout(timer);
  }, [toastMessage]);

  useEffect(() => {
    if (!overdueToastOpen) return;
    const timer = window.setTimeout(() => setOverdueToastOpen(false), 10000);
    return () => window.clearTimeout(timer);
  }, [overdueToastOpen]);

  useEffect(() => {
    if (!highlightedTaskId) return;
    const timer = window.setTimeout(() => setHighlightedTaskId(null), 3600);
    return () => window.clearTimeout(timer);
  }, [highlightedTaskId]);

  useEffect(() => {
    if (!highlightedBadgeId) return;
    const timer = window.setTimeout(() => setHighlightedBadgeId(null), 3800);
    return () => window.clearTimeout(timer);
  }, [highlightedBadgeId]);

  const completedTaskSet = useMemo(
    () => new Set(state.completedTaskIds),
    [state.completedTaskIds]
  );
  const completedExtraSet = useMemo(
    () => new Set(state.completedExtraIds),
    [state.completedExtraIds]
  );
  const solvedChallengeSet = useMemo(
    () => new Set(state.solvedChallengeDays ?? []),
    [state.solvedChallengeDays]
  );

  const dayPlan = useMemo(
    () => getDayPlan(state.currentDay, state.profile.branch),
    [state.currentDay, state.profile.branch]
  );

  const dueReviews = useMemo(
    () =>
      getDueReviewsForDay(
        state.currentDay,
        completedTaskSet,
        state.profile.branch
      ),
    [state.currentDay, completedTaskSet, state.profile.branch]
  );

  const currentChallengeBonusXp = useMemo(
    () =>
      solvedChallengeSet.has(state.currentDay)
        ? getDailyChallengeForDay(state.currentDay, state.profile.branch).bonusXp
        : 0,
    [solvedChallengeSet, state.currentDay, state.profile.branch]
  );

  const dayProgress = useMemo(
    () =>
      calculateDayProgress(
        state.currentDay,
        dayPlan,
        completedTaskSet,
        completedExtraSet,
        dueReviews,
        currentChallengeBonusXp
      ),
    [
      state.currentDay,
      dayPlan,
      completedTaskSet,
      completedExtraSet,
      dueReviews,
      currentChallengeBonusXp,
    ]
  );

  const stats = useMemo(
    () =>
      calculateUserStats(
        completedTaskSet,
        completedExtraSet,
        state.focusSessionsCount,
        state.profile.branch,
        state.currentDay,
        solvedChallengeSet
      ),
    [
      completedTaskSet,
      completedExtraSet,
      state.focusSessionsCount,
      state.profile.branch,
      state.currentDay,
      solvedChallengeSet,
    ]
  );

  const avatarStage = useMemo(
    () => getAvatarStage(stats.level),
    [stats.level]
  );

  const focusMinutesTotal =
    state.focusMinutesTotal ?? state.focusSessionsCount * 45;

  const evaluatedBadges = useMemo(
    () =>
      evaluateBadges({
        completedTasksCount: state.completedTaskIds.length,
        completedDaysCount: stats.completedDaysCount,
        streakDays: stats.streakDays,
        focusSessionsCount: state.focusSessionsCount,
        focusMinutesTotal,
        solvedChallengesCount: solvedChallengeSet.size,
        notesCount: Object.keys(state.taskNotes ?? {}).length,
      }),
    [
      state.completedTaskIds.length,
      stats.completedDaysCount,
      stats.streakDays,
      state.focusSessionsCount,
      focusMinutesTotal,
      solvedChallengeSet.size,
      state.taskNotes,
    ]
  );

  useEffect(() => {
    if (!state.profile.onboarded) return;
    const newlyUnlocked = findNewlyUnlockedBadges(
      state.unlockedBadgeIds ?? [],
      evaluatedBadges
    );
    if (newlyUnlocked.length === 0) return;

    const newIds = newlyUnlocked.map((b) => b.id);
    setState((prev) => ({
      ...prev,
      unlockedBadgeIds: Array.from(
        new Set([...(prev.unlockedBadgeIds ?? []), ...newIds])
      ),
    }));
    setBadgeCelebrationQueue((prev) => {
      const existingIds = new Set(prev.map((b) => b.id));
      const toAppend = newlyUnlocked.filter((b) => !existingIds.has(b.id));
      return toAppend.length > 0 ? [...prev, ...toAppend] : prev;
    });
    ambientAudio.playCompletionChime();
  }, [state.profile.onboarded, state.unlockedBadgeIds, evaluatedBadges]);

  const currentWeek = Math.ceil(state.currentDay / 7);
  const weekStatus = useMemo(
    () =>
      getWeekRewardStatus(currentWeek, completedTaskSet, state.profile.branch),
    [currentWeek, completedTaskSet, state.profile.branch]
  );

  const dayCompletionMap = useMemo(() => {
    const map: Record<number, number> = {};
    if (!dayMapOpen) return map;
    for (let d = 1; d <= TOTAL_CHALLENGE_DAYS; d++) {
      const plan = getDayPlan(d, state.profile.branch);
      const due = getDueReviewsForDay(d, completedTaskSet, state.profile.branch);
      map[d] = calculateDayProgress(
        d,
        plan,
        completedTaskSet,
        completedExtraSet,
        due
      ).percent;
    }
    return map;
  }, [dayMapOpen, state.profile.branch, completedTaskSet, completedExtraSet]);

  const referenceDay = Math.max(
    state.currentDay,
    state.highestDayReached ?? state.currentDay
  );

  const overdueSummary = useMemo(
    () =>
      collectOverdueTasksSummary(
        referenceDay,
        completedTaskSet,
        state.profile.branch
      ),
    [referenceDay, completedTaskSet, state.profile.branch]
  );

  useEffect(() => {
    if (!state.profile.onboarded) {
      checkedStartOfDayRef.current = false;
      return;
    }
    if (checkedStartOfDayRef.current) return;
    checkedStartOfDayRef.current = true;

    const todayKey = getLocalDateKey();
    if (
      shouldTriggerStartOfDayReminder({
        onboarded: state.profile.onboarded,
        currentDay: referenceDay,
        totalOverdueCount: overdueSummary.totalOverdueCount,
        lastReminderDate: state.lastOverdueReminderDate,
        todayDateKey: todayKey,
      })
    ) {
      setOverdueModalOpen(true);
    }
  }, [
    state.profile.onboarded,
    referenceDay,
    state.lastOverdueReminderDate,
    overdueSummary.totalOverdueCount,
  ]);

  if (!state.profile.onboarded) {
    return (
      <OnboardingWizard
        onComplete={(profile) => {
          setState({
            ...INITIAL_EMPTY_STATE,
            profile,
            currentDay: 1,
          });
        }}
        onQuickDemo={() => {
          setState(DEFAULT_DEMO_STATE);
        }}
      />
    );
  }

  const notifyFeedback = (
    nextCompletedTasks: string[],
    nextCompletedExtras: string[]
  ) => {
    const nextProgress = calculateDayProgress(
      state.currentDay,
      dayPlan,
      new Set(nextCompletedTasks),
      new Set(nextCompletedExtras),
      dueReviews
    );
    if (nextProgress.isDayComplete && !dayProgress.isDayComplete) {
      ambientAudio.playCompletionChime();
      setToastMessage(
        `برافو! أتممت اليوم ${String(state.currentDay).padStart(2, '0')} بنسبة 100% + تذكرة سحب جديدة`
      );
    } else {
      ambientAudio.playCheckTick();
      setToastMessage('كفو! تم تسجيل المهمة وتحديث النقاط');
    }
  };

  const toggleTask = (taskId: string) => {
    const exists = state.completedTaskIds.includes(taskId);
    const nextTasks = exists
      ? state.completedTaskIds.filter((id) => id !== taskId)
      : [...state.completedTaskIds, taskId];
    setState((prev) => ({
      ...prev,
      completedTaskIds: nextTasks,
    }));
    if (!exists) {
      notifyFeedback(nextTasks, state.completedExtraIds);
    }
  };

  const toggleExtra = (extraId: string) => {
    const exists = state.completedExtraIds.includes(extraId);
    const nextExtras = exists
      ? state.completedExtraIds.filter((id) => id !== extraId)
      : [...state.completedExtraIds, extraId];
    setState((prev) => ({
      ...prev,
      completedExtraIds: nextExtras,
    }));
    if (!exists) {
      notifyFeedback(state.completedTaskIds, nextExtras);
    }
  };

  const handleStartFocusWithTask = (task: StudyTask) => {
    setFocusTask(task);
    setActiveTab('focus');
  };

  const handleCompleteFocusSession = (
    completedTaskId?: string,
    sessionMinutes: number = 45
  ) => {
    const safeMinutes = Math.max(1, Math.round(sessionMinutes));
    setState((prev) => {
      const nextTasks =
        completedTaskId && !prev.completedTaskIds.includes(completedTaskId)
          ? [...prev.completedTaskIds, completedTaskId]
          : prev.completedTaskIds;
      const currentTotalMinutes =
        prev.focusMinutesTotal ?? prev.focusSessionsCount * 45;
      return {
        ...prev,
        focusSessionsCount: prev.focusSessionsCount + 1,
        focusMinutesTotal: currentTotalMinutes + safeMinutes,
        completedTaskIds: nextTasks,
      };
    });
  };

  const handleOpenSubjectGuide = (subject: SubjectId) => {
    setGuideSubject(subject);
    setActiveTab('thunder');
  };

  const handleSolveChallenge = (day: number, bonusXp: number) => {
    setState((prev) => {
      const existing = prev.solvedChallengeDays ?? [];
      if (existing.includes(day)) return prev;
      return {
        ...prev,
        solvedChallengeDays: [...existing, day],
      };
    });
    ambientAudio.playCompletionChime();
    setToastMessage(`كفو! حلّيت تحدي اليوم وحصلت على +${bonusXp} XP إضافية`);
  };

  const handleSaveTaskNote = (payload: {
    task: StudyTask;
    difficulty: TaskDifficulty;
    text: string;
  }) => {
    setState((prev) => ({
      ...prev,
      taskNotes: upsertTaskNote(prev.taskNotes ?? {}, {
        taskId: payload.task.id,
        day: payload.task.day,
        subject: payload.task.subject,
        taskTitle: payload.task.title,
        difficulty: payload.difficulty,
        text: payload.text,
      }),
    }));
    ambientAudio.playCheckTick();
    setToastMessage('تم حفظ مذكرة المهمة لمراجعتها لاحقاً');
  };

  const handleDeleteTaskNote = (taskId: string) => {
    setState((prev) => ({
      ...prev,
      taskNotes: removeTaskNote(prev.taskNotes ?? {}, taskId),
    }));
    setToastMessage('تم حذف المذكرة');
  };

  const handleAddQuickNote = (payload: {
    text: string;
    category: QuickNoteCategory;
  }) => {
    setState((prev) => ({
      ...prev,
      quickNotes: addQuickNote(prev.quickNotes ?? [], payload),
    }));
    ambientAudio.playCheckTick();
    setToastMessage('تم حفظ الملاحظة السريعة في لوحة القيادة وملفك الشخصي');
  };

  const handleTogglePinQuickNote = (id: string) => {
    setState((prev) => ({
      ...prev,
      quickNotes: togglePinQuickNote(prev.quickNotes ?? [], id),
    }));
  };

  const handleDeleteQuickNote = (id: string) => {
    setState((prev) => ({
      ...prev,
      quickNotes: removeQuickNote(prev.quickNotes ?? [], id),
    }));
    setToastMessage('تم حذف الملاحظة السريعة');
  };

  const handleOpenQuickNotesInProfile = () => {
    setProfileFocusNotesSignal((n) => n + 1);
    setProfileOpen(true);
  };

  const handleRegenerateWeeklyReview = () => {
    const storage = getSafeLocalStorage();
    const fresh = generateWeeklyReviewSummaryFromStorage({
      storage,
      storageKey: STORAGE_KEY,
      sanitize: sanitizePersistedState,
      fallbackSnapshot: state,
    });
    setWeeklyReviewReport(fresh);
    ambientAudio.playCheckTick();
    setToastMessage('تم توليد ملخص المراجعة الأسبوعي من بياناتك المحفوظة');
  };

  const handleJumpToTaskFromReview = (day: number, taskId: string) => {
    setState((prev) => ({
      ...prev,
      currentDay: day,
      highestDayReached: Math.max(
        prev.highestDayReached ?? prev.currentDay,
        day
      ),
    }));
    setActiveTab('quests');
    setHighlightedTaskId(taskId);
    setToastMessage(
      `تم الانتقال إلى اليوم ${String(day).padStart(2, '0')} لاستدراك المهمة`
    );
  };

  const handleDismissOverdueForToday = () => {
    const todayKey = getLocalDateKey();
    setState((prev) => ({
      ...prev,
      lastOverdueReminderDate: todayKey,
    }));
    setOverdueModalOpen(false);
    if (overdueSummary.totalOverdueCount > 0) {
      setOverdueToastOpen(true);
    }
  };

  const handleJumpToOverdueTask = (day: number, taskId: string) => {
    const todayKey = getLocalDateKey();
    setState((prev) => ({
      ...prev,
      currentDay: day,
      highestDayReached: Math.max(
        prev.highestDayReached ?? prev.currentDay,
        prev.currentDay
      ),
      lastOverdueReminderDate: todayKey,
    }));
    setActiveTab('quests');
    setOverdueModalOpen(false);
    setOverdueToastOpen(false);
    setHighlightedTaskId(taskId);
    setToastMessage(
      `تم الانتقال إلى مهام اليوم ${String(day).padStart(2, '0')} المتأخرة`
    );
  };

  const branchLabel =
    BRANCHES.find((b) => b.id === state.profile.branch)?.nameAr ?? '';

  return (
    <div
      className="min-h-screen bg-[#090617] text-slate-100 flex flex-col lg:flex-row"
      data-branch={branchLabel}
    >
      <DesktopSidebar
        activeTab={activeTab}
        onChangeTab={(tab) => {
          if (tab !== 'thunder') setGuideSubject(null);
          setActiveTab(tab);
        }}
        profile={state.profile}
        stats={stats}
        avatarStage={avatarStage}
        onOpenDouaa={() => {
          setDouaaMode('study');
          setDouaaOpen(true);
        }}
        onOpenProfile={() => setProfileOpen(true)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <TopHeader
          profile={state.profile}
          stats={stats}
          overdueCount={overdueSummary.totalOverdueCount}
          onOpenDouaa={() => {
            setDouaaMode('study');
            setDouaaOpen(true);
          }}
          onOpenProfile={() => setProfileOpen(true)}
          onOpenOverdue={() => setOverdueModalOpen(true)}
        />

        <main className="flex-1 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-10">
          {activeTab === 'quests' && (
            <DashboardView
              currentDay={state.currentDay}
              branch={state.profile.branch}
              studentName={state.profile.name}
              avatarUrl={state.profile.avatarUrl}
              dayPlan={dayPlan}
              dayProgress={dayProgress}
              dueReviews={dueReviews}
              completedTaskIds={completedTaskSet}
              completedExtraIds={completedExtraSet}
              solvedChallengeDays={solvedChallengeSet}
              taskNotes={state.taskNotes ?? {}}
              quickNotes={state.quickNotes ?? []}
              weeklyReviewReport={weeklyReviewReport}
              highlightedTaskId={highlightedTaskId}
              stats={stats}
              avatarStage={avatarStage}
              weekStatus={weekStatus}
              badges={evaluatedBadges}
              focusMinutesTotal={focusMinutesTotal}
              highlightedBadgeId={highlightedBadgeId}
              overdueCount={overdueSummary.totalOverdueCount}
              onChangeDay={(day) =>
                setState((prev) => ({
                  ...prev,
                  currentDay: day,
                  highestDayReached: Math.max(
                    prev.highestDayReached ?? prev.currentDay,
                    day
                  ),
                }))
              }
              onJumpToTask={handleJumpToTaskFromReview}
              onRegenerateWeeklyReview={handleRegenerateWeeklyReview}
              onOpenDayMap={() => setDayMapOpen(true)}
              onOpenProfile={() => setProfileOpen(true)}
              onOpenQuickNotesInProfile={handleOpenQuickNotesInProfile}
              onOpenWeeklyMovies={() => setWeeklyMoviesOpen(true)}
              onOpenOverdue={() => setOverdueModalOpen(true)}
              onStartFocusNow={() => {
                const nextTask =
                  dayPlan.tasks.find((t) => !completedTaskSet.has(t.id)) ??
                  dayPlan.tasks[0];
                if (nextTask) {
                  handleStartFocusWithTask(nextTask);
                } else {
                  setActiveTab('focus');
                }
              }}
              onToggleTask={toggleTask}
              onToggleExtra={toggleExtra}
              onSolveChallenge={handleSolveChallenge}
              onSaveTaskNote={handleSaveTaskNote}
              onDeleteTaskNote={handleDeleteTaskNote}
              onAddQuickNote={handleAddQuickNote}
              onTogglePinQuickNote={handleTogglePinQuickNote}
              onDeleteQuickNote={handleDeleteQuickNote}
              onStartFocusWithTask={handleStartFocusWithTask}
              onOpenExam={(exam) => setActiveExam(exam)}
              onOpenSubjectGuide={handleOpenSubjectGuide}
            />
          )}

          {activeTab === 'focus' && (
            <FocusView
              activeTask={focusTask ?? dayPlan.tasks[0] ?? null}
              availableTasks={dayPlan.tasks}
              onSelectTask={(t) => setFocusTask(t)}
              onCompleteSession={handleCompleteFocusSession}
            />
          )}

          {activeTab === 'thunder' && (
            <CheatsheetsView
              initialSubject={guideSubject}
              onOpenExamDouaa={() => {
                setDouaaMode('exam');
                setDouaaOpen(true);
              }}
            />
          )}

          {activeTab === 'ranking' && (
            <LeaderboardView
              profile={state.profile}
              stats={stats}
              submission={state.contestSubmission}
              onSubmitContest={(sub) =>
                setState((prev) => ({ ...prev, contestSubmission: sub }))
              }
            />
          )}
        </main>
      </div>

      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-20 lg:bottom-6 left-1/2 -translate-x-1/2 z-40 px-4 py-2.5 rounded-2xl bg-gradient-to-l from-cyan-400 to-teal-300 text-slate-950 font-extrabold text-xs sm:text-sm shadow-lg whitespace-nowrap"
        >
          {toastMessage}
        </div>
      )}

      <MobileBottomNav
        activeTab={activeTab}
        onChangeTab={(tab) => {
          if (tab !== 'thunder') setGuideSubject(null);
          setActiveTab(tab);
        }}
      />

      <DouaaModal
        open={douaaOpen}
        initialMode={douaaMode}
        onClose={() => setDouaaOpen(false)}
      />
      <ExamPreviewModal
        exam={activeExam}
        onClose={() => setActiveExam(null)}
      />
      <DayMapModal
        open={dayMapOpen}
        currentDay={state.currentDay}
        dayCompletionMap={dayCompletionMap}
        onSelectDay={(day) =>
          setState((prev) => ({
            ...prev,
            currentDay: day,
            highestDayReached: Math.max(
              prev.highestDayReached ?? prev.currentDay,
              day
            ),
          }))
        }
        onClose={() => setDayMapOpen(false)}
      />
      <ProfileModal
        open={profileOpen}
        profile={state.profile}
        avatarStage={avatarStage}
        quickNotes={state.quickNotes ?? []}
        focusQuickNotesSignal={profileFocusNotesSignal}
        onAddQuickNote={handleAddQuickNote}
        onTogglePinQuickNote={handleTogglePinQuickNote}
        onDeleteQuickNote={handleDeleteQuickNote}
        onSave={(nextProfile) =>
          setState((prev) => ({ ...prev, profile: nextProfile }))
        }
        onResetProgress={() => {
          setState(INITIAL_EMPTY_STATE);
          setActiveTab('quests');
        }}
        onClose={() => setProfileOpen(false)}
      />
      <WeeklyMoviesModal
        open={weeklyMoviesOpen}
        currentWeek={currentWeek}
        onSelectWeekDay={(day) =>
          setState((prev) => ({
            ...prev,
            currentDay: day,
            highestDayReached: Math.max(
              prev.highestDayReached ?? prev.currentDay,
              day
            ),
          }))
        }
        onClose={() => setWeeklyMoviesOpen(false)}
      />
      <OverdueTasksModal
        open={overdueModalOpen}
        summary={overdueSummary}
        onJumpToTask={handleJumpToOverdueTask}
        onDismissForToday={handleDismissOverdueForToday}
      />
      <OverdueReminderToast
        visible={overdueToastOpen && !overdueModalOpen}
        summary={overdueSummary}
        onJumpToFirstOverdue={() => {
          if (overdueSummary.firstOverdueTarget) {
            handleJumpToOverdueTask(
              overdueSummary.firstOverdueTarget.day,
              overdueSummary.firstOverdueTarget.taskId
            );
          }
        }}
        onOpenModal={() => {
          setOverdueToastOpen(false);
          setOverdueModalOpen(true);
        }}
        onClose={() => setOverdueToastOpen(false)}
      />
      <BadgeUnlockBanner
        badge={badgeCelebrationQueue[0] ?? null}
        queueCount={badgeCelebrationQueue.length}
        onViewBadges={(badgeId) => {
          setBadgeCelebrationQueue((prev) => prev.slice(1));
          setActiveTab('quests');
          setHighlightedBadgeId(badgeId);
        }}
        onDismiss={() => setBadgeCelebrationQueue((prev) => prev.slice(1))}
      />
    </div>
  );
}
