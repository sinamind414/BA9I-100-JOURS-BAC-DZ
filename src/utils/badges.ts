export type BadgeTier =
  | 'amber'
  | 'cyan'
  | 'emerald'
  | 'violet'
  | 'sky'
  | 'gold'
  | 'rose'
  | 'teal';

export type BadgeIconKey =
  | 'spark'
  | 'flame'
  | 'calendar'
  | 'headphones'
  | 'timer'
  | 'crown'
  | 'brain'
  | 'note';

export type BadgeCategory = 'consistency' | 'focus' | 'mastery';

export interface BadgeEvaluationInput {
  completedTasksCount: number;
  completedDaysCount: number;
  streakDays: number;
  focusSessionsCount: number;
  focusMinutesTotal: number;
  solvedChallengesCount: number;
  notesCount: number;
}

export interface BadgeDefinition {
  id: string;
  titleAr: string;
  descriptionAr: string;
  category: BadgeCategory;
  categoryLabelAr: string;
  tier: BadgeTier;
  iconKey: BadgeIconKey;
  targetValue: number;
  unitMode: 'tasks' | 'days' | 'sessions' | 'hours' | 'challenges' | 'notes';
  getCurrentValue: (input: BadgeEvaluationInput) => number;
}

export interface EvaluatedBadge {
  id: string;
  titleAr: string;
  descriptionAr: string;
  category: BadgeCategory;
  categoryLabelAr: string;
  tier: BadgeTier;
  iconKey: BadgeIconKey;
  unlocked: boolean;
  currentValue: number;
  targetValue: number;
  progressPercent: number;
  progressText: string;
  unitMode: BadgeDefinition['unitMode'];
}

export const BADGE_CATALOG: BadgeDefinition[] = [
  {
    id: 'first-spark',
    titleAr: 'شرارة البداية',
    descriptionAr: 'أكمل أول 5 مهام دراسية في خطة البكالوريا.',
    category: 'mastery',
    categoryLabelAr: 'الإنجاز اليومي',
    tier: 'amber',
    iconKey: 'spark',
    targetValue: 5,
    unitMode: 'tasks',
    getCurrentValue: (input) => input.completedTasksCount,
  },
  {
    id: 'streak-3',
    titleAr: 'انطلاقة منتظمة',
    descriptionAr: 'حافظ على سلسلة التزام لمدة 3 أيام متتالية.',
    category: 'consistency',
    categoryLabelAr: 'الاستمرارية',
    tier: 'cyan',
    iconKey: 'flame',
    targetValue: 3,
    unitMode: 'days',
    getCurrentValue: (input) => input.streakDays,
  },
  {
    id: 'full-week',
    titleAr: 'أسبوع كامل من الدراسة',
    descriptionAr: 'حقّق سلسلة 7 أيام متتالية أو أتمم 7 أيام دراسة كاملة.',
    category: 'consistency',
    categoryLabelAr: 'الاستمرارية',
    tier: 'emerald',
    iconKey: 'calendar',
    targetValue: 7,
    unitMode: 'days',
    getCurrentValue: (input) =>
      Math.max(input.streakDays, input.completedDaysCount),
  },
  {
    id: 'focus-5',
    titleAr: 'تركيز متواصل',
    descriptionAr: 'أنهِ 5 جلسات في مؤقت التركيز العميق.',
    category: 'focus',
    categoryLabelAr: 'التركيز العميق',
    tier: 'violet',
    iconKey: 'headphones',
    targetValue: 5,
    unitMode: 'sessions',
    getCurrentValue: (input) => input.focusSessionsCount,
  },
  {
    id: 'focus-10h',
    titleAr: 'ماراثون 10 ساعات',
    descriptionAr: 'اجمع 10 ساعات صافية من التركيز العميق.',
    category: 'focus',
    categoryLabelAr: 'التركيز العميق',
    tier: 'sky',
    iconKey: 'timer',
    targetValue: 10,
    unitMode: 'hours',
    getCurrentValue: (input) =>
      Math.round((Math.max(0, input.focusMinutesTotal) / 60) * 10) / 10,
  },
  {
    id: 'focus-50h',
    titleAr: 'الوصول إلى 50 ساعة تركيز',
    descriptionAr: 'بلوغ 50 ساعة تركيز عميق تحضيراً لامتحان البكالوريا.',
    category: 'focus',
    categoryLabelAr: 'التركيز العميق',
    tier: 'gold',
    iconKey: 'crown',
    targetValue: 50,
    unitMode: 'hours',
    getCurrentValue: (input) =>
      Math.round((Math.max(0, input.focusMinutesTotal) / 60) * 10) / 10,
  },
  {
    id: 'challenge-3',
    titleAr: 'صياد التحديات',
    descriptionAr: 'حل 3 تحديات يومية من المناهج الدراسية بنجاح.',
    category: 'mastery',
    categoryLabelAr: 'الإتقان المنهجي',
    tier: 'rose',
    iconKey: 'brain',
    targetValue: 3,
    unitMode: 'challenges',
    getCurrentValue: (input) => input.solvedChallengesCount,
  },
  {
    id: 'notes-scholar',
    titleAr: 'مدوّن الملاحظات',
    descriptionAr: 'سجّل 3 مذكرات مراجعة لتثبيت النقاط الصعبة.',
    category: 'mastery',
    categoryLabelAr: 'الإتقان المنهجي',
    tier: 'teal',
    iconKey: 'note',
    targetValue: 3,
    unitMode: 'notes',
    getCurrentValue: (input) => input.notesCount,
  },
];

function formatProgressText(
  clampedValue: number,
  targetValue: number,
  unitMode: BadgeDefinition['unitMode']
): string {
  const currentLabel =
    unitMode === 'hours'
      ? Number.isInteger(clampedValue)
        ? String(clampedValue)
        : clampedValue.toFixed(1)
      : String(Math.floor(clampedValue));

  switch (unitMode) {
    case 'tasks':
      return `${currentLabel} من ${targetValue} مهام`;
    case 'days':
      return `${currentLabel} من ${targetValue} أيام`;
    case 'sessions':
      return `${currentLabel} من ${targetValue} جلسات`;
    case 'hours':
      return `${currentLabel} من ${targetValue} ساعة`;
    case 'challenges':
      return `${currentLabel} من ${targetValue} تحديات`;
    case 'notes':
      return `${currentLabel} من ${targetValue} مذكرات`;
  }
}

export function evaluateBadges(
  input: BadgeEvaluationInput
): EvaluatedBadge[] {
  return BADGE_CATALOG.map((def) => {
    const rawCurrent = Math.max(0, def.getCurrentValue(input));
    const unlocked = rawCurrent >= def.targetValue;
    const clampedCurrent = Math.min(def.targetValue, rawCurrent);
    const progressPercent = unlocked
      ? 100
      : Math.min(
          99,
          Math.max(0, Math.round((clampedCurrent / def.targetValue) * 100))
        );

    return {
      id: def.id,
      titleAr: def.titleAr,
      descriptionAr: def.descriptionAr,
      category: def.category,
      categoryLabelAr: def.categoryLabelAr,
      tier: def.tier,
      iconKey: def.iconKey,
      unlocked,
      currentValue: clampedCurrent,
      targetValue: def.targetValue,
      progressPercent,
      progressText: formatProgressText(
        clampedCurrent,
        def.targetValue,
        def.unitMode
      ),
      unitMode: def.unitMode,
    };
  });
}

export function getSatisfiedBadgeIds(input: BadgeEvaluationInput): string[] {
  return evaluateBadges(input)
    .filter((badge) => badge.unlocked)
    .map((badge) => badge.id);
}

export function findNewlyUnlockedBadges(
  previouslyUnlockedIds: readonly string[],
  evaluatedBadges: readonly EvaluatedBadge[]
): EvaluatedBadge[] {
  const known = new Set(previouslyUnlockedIds);
  return evaluatedBadges.filter((badge) => badge.unlocked && !known.has(badge.id));
}

export function formatFocusHoursLabel(focusMinutesTotal: number): string {
  const safeMinutes = Math.max(0, focusMinutesTotal);
  const hours = safeMinutes / 60;
  if (hours < 1) {
    return `${Math.round(safeMinutes)} دقيقة`;
  }
  return `${hours.toFixed(1)} ساعة`;
}
