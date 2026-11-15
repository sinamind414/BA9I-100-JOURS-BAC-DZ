import React, { useEffect, useMemo, useState } from 'react';
import {
  Award,
  BookOpenCheck,
  ChevronLeft,
  ChevronRight,
  Film,
  Flame,
  Zap,
} from 'lucide-react';
import { SUBJECT_META } from '../data/curriculum';
import { BranchId } from '../types/bac';
import { buildWeeklyAchievements } from '../utils/weeklyAchievements';

interface WeeklyAchievementsWidgetProps {
  currentDay: number;
  branch: BranchId;
  completedTaskIds: ReadonlySet<string>;
  completedExtraIds: ReadonlySet<string>;
  solvedChallengeDays: ReadonlySet<number>;
  onSelectDay: (day: number) => void;
  onOpenWeeklyMovies: () => void;
}

export function WeeklyAchievementsWidget({
  currentDay,
  branch,
  completedTaskIds,
  completedExtraIds,
  solvedChallengeDays,
  onSelectDay,
  onOpenWeeklyMovies,
}: WeeklyAchievementsWidgetProps) {
  const currentWeek = Math.ceil(currentDay / 7);
  const [viewedWeek, setViewedWeek] = useState<number>(currentWeek);

  useEffect(() => {
    setViewedWeek(currentWeek);
  }, [currentWeek]);

  const summary = useMemo(
    () =>
      buildWeeklyAchievements(
        viewedWeek,
        completedTaskIds,
        completedExtraIds,
        solvedChallengeDays,
        branch
      ),
    [
      viewedWeek,
      completedTaskIds,
      completedExtraIds,
      solvedChallengeDays,
      branch,
    ]
  );

  const topSubjectMeta = summary.topSubject
    ? SUBJECT_META[summary.topSubject.subject]
    : null;
  const runnerUpMeta = summary.runnerUpSubject
    ? SUBJECT_META[summary.runnerUpSubject.subject]
    : null;

  return (
    <section
      aria-label="إنجازات الأسبوع"
      data-testid="weekly-achievements-widget"
      className="bg-[#110B29] border border-[#2D1F5E] rounded-3xl p-4 sm:p-5 space-y-4"
    >
      {/* Header & Week Switcher */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Award size={18} className="text-pink-400 shrink-0" aria-hidden="true" />
            <h2 className="text-sm sm:text-base font-extrabold text-white">
              إنجازات الأسبوع
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            الأسبوع{' '}
            <span className="font-mono-num text-slate-200 font-bold">
              {String(summary.week).padStart(2, '0')}
            </span>{' '}
            <span aria-hidden="true">·</span> الأيام{' '}
            <span className="font-mono-num text-slate-200 font-bold">
              {String(summary.startDay).padStart(2, '0')} -{' '}
              {String(summary.endDay).padStart(2, '0')}
            </span>
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setViewedWeek((w) => Math.max(1, w - 1))}
            disabled={summary.week <= 1}
            aria-label="إنجازات الأسبوع السابق"
            className="min-h-[40px] min-w-[40px] rounded-xl bg-[#1A113E] hover:bg-[#251854] disabled:opacity-40 border border-[#2D1F5E] text-slate-200 flex items-center justify-center transition-colors"
          >
            <ChevronRight size={16} />
          </button>
          <span className="px-3 py-2 rounded-xl bg-[#1A113E] border border-[#2D1F5E] text-xs font-bold text-slate-200 whitespace-nowrap">
            الأسبوع{' '}
            <span className="font-mono-num text-cyan-300">
              {String(summary.week).padStart(2, '0')} /{' '}
              {String(summary.totalWeeks).padStart(2, '0')}
            </span>
          </span>
          <button
            type="button"
            onClick={() =>
              setViewedWeek((w) => Math.min(summary.totalWeeks, w + 1))
            }
            disabled={summary.week >= summary.totalWeeks}
            aria-label="إنجازات الأسبوع التالي"
            className="min-h-[40px] min-w-[40px] rounded-xl bg-[#1A113E] hover:bg-[#251854] disabled:opacity-40 border border-[#2D1F5E] text-slate-200 flex items-center justify-center transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
        </div>
      </div>

      {/* 4 Colorful Achievement Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3.5 items-stretch">
        {/* Card 1: Most Focused Subject (Cyan / Blue) */}
        <article
          data-testid="achievement-card-top-subject"
          className="rounded-2xl p-4 bg-gradient-to-br from-cyan-500/20 via-sky-500/10 to-[#1A113E] border border-cyan-400/40 flex flex-col justify-between gap-3"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <div className="text-xs font-bold text-cyan-300">
                أكثر المواد تركيزاً
              </div>
              <div className="text-base sm:text-lg font-extrabold text-white leading-snug">
                {topSubjectMeta ? topSubjectMeta.nameAr : 'لم يُسجّل تركيز بعد'}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-cyan-400/20 border border-cyan-300/30 text-cyan-200 flex items-center justify-center shrink-0">
              <BookOpenCheck size={19} aria-hidden="true" />
            </div>
          </div>

          {summary.topSubject ? (
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-200">
                <span className="font-bold text-cyan-200">
                  <span className="font-mono-num">
                    {summary.topSubject.completedCount}
                  </span>{' '}
                  من{' '}
                  <span className="font-mono-num">
                    {summary.topSubject.totalCount}
                  </span>{' '}
                  مهمة
                </span>
                <span className="text-slate-400" aria-hidden="true">
                  ·
                </span>
                <span
                  dir="ltr"
                  className="inline-block font-mono-num text-cyan-300 font-bold"
                >
                  +{summary.topSubject.earnedXp} XP
                </span>
              </div>
              {runnerUpMeta && (
                <p className="text-[11px] text-slate-300">
                  تليها: {runnerUpMeta.nameAr} (
                  <span className="font-mono-num">
                    {summary.runnerUpSubject?.completedCount}
                  </span>
                  )
                </p>
              )}
            </div>
          ) : (
            <p className="text-xs text-slate-300 leading-relaxed">
              أكمل مهام هذا الأسبوع لإظهار المادة المتصدرة.
            </p>
          )}
        </article>

        {/* Card 2: Best Productivity Day (Emerald / Teal, clickable jump) */}
        <button
          type="button"
          data-testid="achievement-card-best-day"
          onClick={() => {
            onSelectDay(summary.bestDay ? summary.bestDay.day : summary.startDay);
          }}
          className="text-right rounded-2xl p-4 bg-gradient-to-br from-emerald-500/20 via-teal-500/10 to-[#1A113E] border border-emerald-400/40 hover:border-emerald-300/80 flex flex-col justify-between gap-3 transition-colors min-h-[124px]"
        >
          <div className="w-full flex items-start justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <div className="text-xs font-bold text-emerald-300">
                أفضل يوم إنتاجية
              </div>
              <div className="text-base sm:text-lg font-extrabold text-white leading-snug">
                {summary.bestDay ? (
                  <>
                    اليوم{' '}
                    <span className="font-mono-num">
                      {String(summary.bestDay.day).padStart(2, '0')}
                    </span>{' '}
                    <span aria-hidden="true">·</span>{' '}
                    <span dir="ltr" className="inline-block font-mono-num">
                      {summary.bestDay.percent}%
                    </span>
                  </>
                ) : (
                  'بانتظار الانطلاقة'
                )}
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-400/20 border border-emerald-300/30 text-emerald-200 flex items-center justify-center shrink-0">
              <Flame size={19} aria-hidden="true" />
            </div>
          </div>

          {summary.bestDay ? (
            <div className="w-full space-y-1.5">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-200">
                <span className="font-bold text-emerald-200">
                  <span dir="ltr" className="inline-block font-mono-num">
                    {summary.bestDay.completedCount} / {summary.bestDay.totalCount}
                  </span>{' '}
                  مهمة
                </span>
                <span className="text-slate-400" aria-hidden="true">
                  ·
                </span>
                <span
                  dir="ltr"
                  className="inline-block font-mono-num text-emerald-300 font-bold"
                >
                  +{summary.bestDay.earnedXp} XP
                </span>
              </div>
              <p className="text-[11px] font-bold text-emerald-300">
                اضغط للانتقال إلى اليوم{' '}
                <span className="font-mono-num">
                  {String(summary.bestDay.day).padStart(2, '0')}
                </span>
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-300 leading-relaxed">
              اضغط لفتح اليوم{' '}
              <span className="font-mono-num">
                {String(summary.startDay).padStart(2, '0')}
              </span>{' '}
              وبدء الإنجاز.
            </p>
          )}
        </button>

        {/* Card 3: Weekly XP & Active Streak (Neon Pink / Orange) */}
        <article
          data-testid="achievement-card-weekly-xp"
          className="rounded-2xl p-4 bg-gradient-to-br from-pink-500/20 via-orange-500/10 to-[#1A113E] border border-pink-400/45 flex flex-col justify-between gap-3"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <div className="text-xs font-bold text-pink-300">
                حصاد الأسبوع
              </div>
              <div
                dir="ltr"
                className="text-base sm:text-lg font-extrabold text-white leading-snug font-mono-num inline-block self-start"
              >
                +{summary.weeklyXp} XP
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-pink-500/20 border border-pink-400/35 text-pink-200 flex items-center justify-center shrink-0">
              <Zap size={19} aria-hidden="true" />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-200">
              <span className="font-bold text-orange-200">
                <span dir="ltr" className="inline-block font-mono-num">
                  {summary.activeDaysCount} / {summary.daysInWeek}
                </span>{' '}
                أيام نشطة
              </span>
              <span className="text-slate-400" aria-hidden="true">
                ·
              </span>
              <span className="text-pink-300 font-bold">
                <span className="font-mono-num">
                  {summary.solvedChallengesCount}
                </span>{' '}
                تحدٍ
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              {summary.completedTasksCount > 0 ? (
                <>
                  أنهيت{' '}
                  <span className="font-mono-num font-bold">
                    {summary.completedTasksCount}
                  </span>{' '}
                  مهمة أساسية هذا الأسبوع
                </>
              ) : (
                'كل نقطة XP تقرّبك من المستوى التالي'
              )}
            </p>
          </div>
        </article>

        {/* Card 4: Weekly Movie Unlock Pace (Violet / Fuchsia, clickable gallery) */}
        <button
          type="button"
          data-testid="achievement-card-weekly-reward"
          onClick={onOpenWeeklyMovies}
          className="text-right rounded-2xl p-4 bg-gradient-to-br from-violet-500/20 via-fuchsia-500/10 to-[#1A113E] border border-violet-400/40 hover:border-violet-300/80 flex flex-col justify-between gap-3 transition-colors min-h-[124px]"
        >
          <div className="w-full flex items-start justify-between gap-3">
            <div className="space-y-1 min-w-0">
              <div className="text-xs font-bold text-violet-300">
                هدف سهرة الأسبوع
              </div>
              <div
                dir="ltr"
                className="text-base sm:text-lg font-extrabold text-white leading-snug font-mono-num inline-block"
              >
                {summary.weeklyPercent}% / 70%
              </div>
            </div>
            <div className="w-10 h-10 rounded-xl bg-violet-400/20 border border-violet-300/30 text-violet-200 flex items-center justify-center shrink-0">
              <Film size={19} aria-hidden="true" />
            </div>
          </div>

          <div className="w-full space-y-2">
            <div className="w-full h-1.5 bg-[#090617]/90 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  summary.rewardUnlocked ? 'bg-emerald-400' : 'bg-fuchsia-400'
                }`}
                style={{ width: `${Math.min(100, summary.weeklyPercent)}%` }}
              />
            </div>
            <p className="text-[11px] text-slate-200 leading-snug">
              {summary.rewardUnlocked
                ? `مفتوح: ${summary.rewardMovieTitle}`
                : `متبقي ${summary.tasksRemainingToUnlock} مهام لفتح ${summary.rewardMovieTitle}`}
            </p>
          </div>
        </button>
      </div>
    </section>
  );
}
