import { SubjectId } from '../types/bac';

export type CoachMoodId =
  | 'saha'
  | 'victory'
  | 'night-study'
  | 'focus-fire'
  | 'tea-break'
  | 'clock-rush'
  | 'overwhelmed'
  | 'sleepy';

export interface CoachPoseMeta {
  id: CoachMoodId;
  src: string;
  alt: string;
  badgeText: string;
  accentBorderClass: string;
  accentTextClass: string;
  bubbleBgClass: string;
}

export const COACH_BA9I_POSES: Record<CoachMoodId, CoachPoseMeta> = {
  saha: {
    id: 'saha',
    src: '/assets/coach/ba9i-saha.png',
    alt: 'الكوتش باقي يرفع إشارة صحّة للتشجيع',
    badgeText: 'Saha ! كفو عليك',
    accentBorderClass: 'border-cyan-400/50',
    accentTextClass: 'text-cyan-300',
    bubbleBgClass: 'bg-[#1A113E] border-cyan-400/45',
  },
  victory: {
    id: 'victory',
    src: '/assets/coach/ba9i-victory.png',
    alt: 'الكوتش باقي يحتفل بإنجاز رائع وسط النجوم',
    badgeText: 'Victory ! عالمي',
    accentBorderClass: 'border-emerald-400/60',
    accentTextClass: 'text-emerald-300',
    bubbleBgClass: 'bg-[#1A113E] border-emerald-400/50',
  },
  'night-study': {
    id: 'night-study',
    src: '/assets/coach/ba9i-night-study.png',
    alt: 'الكوتش باقي يراجع بتركيز في مكتبه مع كوب شاي بالنعناع',
    badgeText: 'تركيز عميق 🎧',
    accentBorderClass: 'border-fuchsia-400/50',
    accentTextClass: 'text-fuchsia-300',
    bubbleBgClass: 'bg-[#1A113E] border-fuchsia-400/45',
  },
  'focus-fire': {
    id: 'focus-fire',
    src: '/assets/coach/ba9i-focus-fire.png',
    alt: 'الكوتش باقي في وضع التركيز الأسطوري بطاقة نارية',
    badgeText: 'MODE FOCUS 🔥',
    accentBorderClass: 'border-pink-500/60',
    accentTextClass: 'text-pink-300',
    bubbleBgClass: 'bg-[#1A113E] border-pink-500/50',
  },
  'tea-break': {
    id: 'tea-break',
    src: '/assets/coach/ba9i-tea-break.png',
    alt: 'الكوتش باقي يستمتع باستراحة شاي بالنعناع',
    badgeText: 'وقت الاستراحة 🍵',
    accentBorderClass: 'border-teal-400/55',
    accentTextClass: 'text-teal-300',
    bubbleBgClass: 'bg-[#1A113E] border-teal-400/45',
  },
  'clock-rush': {
    id: 'clock-rush',
    src: '/assets/coach/ba9i-clock-rush.png',
    alt: 'الكوتش باقي ينبّه للوقت والمهام المتأخرة',
    badgeText: 'تذكير عاجل ⏰',
    accentBorderClass: 'border-orange-400/60',
    accentTextClass: 'text-orange-300',
    bubbleBgClass: 'bg-[#1A113E] border-orange-400/50',
  },
  overwhelmed: {
    id: 'overwhelmed',
    src: '/assets/coach/ba9i-overwhelmed.png',
    alt: 'الكوتش باقي وسط كومة كتب كبيرة',
    badgeText: 'خطوة بخطوة 📚',
    accentBorderClass: 'border-rose-400/55',
    accentTextClass: 'text-rose-300',
    bubbleBgClass: 'bg-[#1A113E] border-rose-400/45',
  },
  sleepy: {
    id: 'sleepy',
    src: '/assets/coach/ba9i-sleepy.png',
    alt: 'الكوتش باقي يرتاح على دفتر الملاحظات',
    badgeText: 'لا تنسَ النوم 🌙',
    accentBorderClass: 'border-indigo-400/50',
    accentTextClass: 'text-indigo-300',
    bubbleBgClass: 'bg-[#1A113E] border-indigo-400/45',
  },
};

export interface CoachDashboardContext {
  studentName: string;
  currentDay: number;
  daysRemaining: number;
  dayPercent: number;
  streakDays: number;
  overdueCount: number;
  completedTasksToday: number;
  totalTasksToday: number;
  challengeSolved: boolean;
}

export interface CoachState {
  mood: CoachMoodId;
  pose: CoachPoseMeta;
  headline: string;
  message: string;
  actionType: 'focus' | 'overdue' | 'challenge' | 'next-day';
  actionLabel: string;
}

export function getCoachBa9iDashboardState(
  ctx: CoachDashboardContext
): CoachState {
  const safeName = ctx.studentName.trim() || 'بطل الباك';

  if (ctx.dayPercent === 100) {
    return {
      mood: 'victory',
      pose: COACH_BA9I_POSES.victory,
      headline: `صحّة يا ${safeName}! اليوم ${String(ctx.currentDay).padStart(2, '0')} في الجيب 🏆`,
      message:
        ctx.currentDay < 100
          ? 'أنهيت كل مهام اليوم 100%! باقي خطوة أقرب للـ 18+، تقدر تكمل التحدي أو تجهّز لليوم الجاي.'
          : 'أسطورة رسمياً! أنهيت برنامج الـ 100 يوم كامل، البكالوريا بين يديك!',
      actionType: ctx.challengeSolved ? 'next-day' : 'challenge',
      actionLabel: ctx.challengeSolved ? 'الانتقال لليوم التالي' : 'حل تحدي اليوم',
    };
  }

  if (ctx.overdueCount >= 5 && ctx.dayPercent < 25) {
    return {
      mood: 'overwhelmed',
      pose: COACH_BA9I_POSES.overwhelmed,
      headline: `ما تتقلقش يا ${safeName} — نقسّموها مع بعض!`,
      message: `كاين ${ctx.overdueCount} مهام متأخرة من قبل، بصح باقي معاك: نبدو بأخف مهمة في وضع التركيز 25 دقيقة برك وتنقص الضغطة.`,
      actionType: 'overdue',
      actionLabel: 'مراجعة المتأخرات',
    };
  }

  if (ctx.overdueCount > 0 && ctx.completedTasksToday === 0) {
    return {
      mood: 'clock-rush',
      pose: COACH_BA9I_POSES['clock-rush'],
      headline: `الوقت يجري يا ${safeName} — باقي ${ctx.daysRemaining} يوم!`,
      message: `عندك ${ctx.overdueCount} مهام متأخرة تستنّى لمسة سريعة. صفّي وحدة درك ولا شعل مؤقت التركيز!`,
      actionType: 'overdue',
      actionLabel: 'انتقال للمهام المتأخرة',
    };
  }

  if (ctx.dayPercent >= 50) {
    return {
      mood: 'saha',
      pose: COACH_BA9I_POSES.saha,
      headline: `Saha ! راك غادي بقوة يا ${safeName} ✨`,
      message: `أنجزت ${ctx.completedTasksToday} من ${ctx.totalTasksToday} اليوم${
        ctx.streakDays >= 3 ? ` وعندك سلسلة ${ctx.streakDays} أيام متواصلة` : ''
      }. كمل بنفس الرتم!`,
      actionType: 'focus',
      actionLabel: 'وضع التركيز · MODE FOCUS',
    };
  }

  return {
    mood: 'focus-fire',
    pose: COACH_BA9I_POSES['focus-fire'],
    headline: `يلا نشعلو اليوم ${String(ctx.currentDay).padStart(2, '0')} يا ${safeName} 🔥`,
    message:
      'خلّي التشتت بعيد وابدأ جلسة تركيز مع الكوتش باقي — كل 25 دقيقة تقرّبك من معدلك المستهدف.',
    actionType: 'focus',
    actionLabel: 'ابدأ وضع التركيز الآن',
  };
}

export interface CoachFocusContext {
  running: boolean;
  onBreak: boolean;
  durationMin: number;
  activeSubject?: SubjectId;
  completedSessionMin: number | null;
}

export function getCoachBa9iFocusState(ctx: CoachFocusContext): {
  mood: CoachMoodId;
  pose: CoachPoseMeta;
  title: string;
  tip: string;
} {
  if (ctx.onBreak || ctx.completedSessionMin !== null) {
    return {
      mood: 'tea-break',
      pose: COACH_BA9I_POSES['tea-break'],
      title: 'استراحة الأبطال مع باقي',
      tip: 'بصحتك الجلسة! اشرب ماء أو شاي بالنعناع، حرك كتافك، وريح عينيك شوية قبل الانطلاقة الجاية.',
    };
  }

  if (ctx.running && ctx.durationMin >= 60) {
    return {
      mood: 'night-study',
      pose: COACH_BA9I_POSES['night-study'],
      title: 'وضع المذاكرة العميقة (Deep Work)',
      tip: 'حط السماعات، ركز في الفكرة الأساسية، وباقي ساهر معاك حتى تكمل الجلسة بنجاح.',
    };
  }

  if (ctx.running) {
    return {
      mood: 'focus-fire',
      pose: COACH_BA9I_POSES['focus-fire'],
      title: 'MODE FOCUS مفعّل!',
      tip: 'الهاتف بعيد، الإشعارات صامتة — هذه الدقائق تصنع الفارق يوم إعلان النتائج.',
    };
  }

  return {
    mood: 'night-study',
    pose: COACH_BA9I_POSES['night-study'],
    title: 'الكوتش باقي جاهز معاك',
    tip: 'اختر مهمتك والمدة المناسبة (25 أو 45 دقيقة)، ثم اضغط ابدأ المؤقت للدخول في التركيز.',
  };
}
