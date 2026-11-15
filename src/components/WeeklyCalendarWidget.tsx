import React, { useEffect, useMemo, useState } from 'react';
import {
  CalendarRange,
  Check,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CircleDashed,
} from 'lucide-react';
import { SUBJECT_META } from '../data/curriculum';
import { BranchId, SubjectId } from '../types/bac';
import {
  buildWeeklyCalendarData,
  CompletionHeatTone,
  WeeklyTaskEntry,
} from '../utils/spacedRepetition';

interface WeeklyCalendarWidgetProps {
  currentDay: number;
  branch: BranchId;
  completedTaskIds: ReadonlySet<string>;
  completedExtraIds: ReadonlySet<string>;
  onSelectDay: (day: number) => void;
  onToggleTask: (taskId: string) => void;
  onToggleExtra: (extraId: string) => void;
}

const TONE_STYLES: Record<
  CompletionHeatTone,
  { card: string; percent: string; bar: string; label: string }
> = {
  empty: {
    card: 'bg-[#1A113E] border-[#2D1F5E] text-slate-300 hover:border-cyan-400/50',
    percent: 'text-slate-400',
    bar: 'bg-slate-600',
    label: '0%',
  },
  low: {
    card: 'bg-pink-500/15 border-pink-400/40 text-pink-100 hover:border-pink-400/75',
    percent: 'text-pink-300',
    bar: 'bg-pink-400',
    label: '1-39%',
  },
  mid: {
    card: 'bg-orange-500/15 border-orange-400/45 text-orange-100 hover:border-orange-400/75',
    percent: 'text-orange-300',
    bar: 'bg-orange-400',
    label: '40-69%',
  },
  high: {
    card: 'bg-cyan-500/15 border-cyan-400/45 text-cyan-100 hover:border-cyan-400/75',
    percent: 'text-cyan-300',
    bar: 'bg-cyan-400',
    label: '70-99%',
  },
  complete: {
    card: 'bg-emerald-500/20 border-emerald-400/50 text-emerald-100 hover:border-emerald-400/80',
    percent: 'text-emerald-300',
    bar: 'bg-emerald-400',
    label: '100%',
  },
};

function getEntryCategoryLabel(entry: WeeklyTaskEntry): string {
  if (entry.categoryLabel in SUBJECT_META) {
    return SUBJECT_META[entry.categoryLabel as SubjectId].nameAr;
  }
  return entry.categoryLabel;
}

export function WeeklyCalendarWidget({
  currentDay,
  branch,
  completedTaskIds,
  completedExtraIds,
  onSelectDay,
  onToggleTask,
  onToggleExtra,
}: WeeklyCalendarWidgetProps) {
  const currentWeek = Math.ceil(currentDay / 7);
  const [viewedWeek, setViewedWeek] = useState<number>(currentWeek);

  useEffect(() => {
    setViewedWeek(currentWeek);
  }, [currentWeek]);

  const weekData = useMemo(
    () =>
      buildWeeklyCalendarData(
        viewedWeek,
        completedTaskIds,
        completedExtraIds,
        branch,
        currentDay
      ),
    [viewedWeek, completedTaskIds, completedExtraIds, branch, currentDay]
  );

  // Pick the active day in this week (currentDay if in viewedWeek, else first day of viewedWeek)
  const inspectedDay =
    weekData.days.find((d) => d.day === currentDay) ?? weekData.days[0];

  const handleToggleEntry = (entry: WeeklyTaskEntry) => {
    if (entry.kind === 'task') {
      onToggleTask(entry.id);
    } else {
      onToggleExtra(entry.id);
    }
  };

  return (
    <section
      aria-label="التقويم الأسبوعي للتقدم والمهام"
      data-testid="weekly-calendar-widget"
      className="bg-[#110B29] border border-[#2D1F5E] rounded-3xl p-4 sm:p-5 space-y-4"
    >
      {/* Top Header & Week Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <CalendarRange size={17} className="text-pink-400 shrink-0" aria-hidden="true" />
            <h2 className="text-sm sm:text-base font-extrabold text-white">
              التقويم الأسبوعي للإنجاز
            </h2>
          </div>
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
            <span>
              الأيام{' '}
              <strong className="font-mono-num text-slate-200">
                {String(weekData.startDay).padStart(2, '0')} -{' '}
                {String(weekData.endDay).padStart(2, '0')}
              </strong>
            </span>
            <span>
              منجز:{' '}
              <strong className="font-mono-num text-emerald-300">
                {weekData.totalCompleted}
              </strong>
            </span>
            <span>
              متبقي:{' '}
              <strong className="font-mono-num text-orange-300">
                {weekData.totalRemaining}
              </strong>
            </span>
            <span>
              متوسط الأسبوع:{' '}
              <strong className="font-mono-num text-cyan-300">
                {weekData.avgPercent}%
              </strong>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setViewedWeek((w) => Math.max(1, w - 1))}
            disabled={weekData.week <= 1}
            aria-label="الأسبوع السابق"
            className="min-h-[40px] min-w-[40px] rounded-xl bg-[#1A113E] hover:bg-[#251854] disabled:opacity-40 border border-[#2D1F5E] text-slate-200 flex items-center justify-center transition-colors"
          >
            <ChevronRight size={16} />
          </button>
          <span className="px-3 py-2 text-xs font-extrabold text-white whitespace-nowrap">
            الأسبوع{' '}
            <span className="font-mono-num">
              {String(weekData.week).padStart(2, '0')} / {weekData.totalWeeks}
            </span>
          </span>
          <button
            type="button"
            onClick={() =>
              setViewedWeek((w) => Math.min(weekData.totalWeeks, w + 1))
            }
            disabled={weekData.week >= weekData.totalWeeks}
            aria-label="الأسبوع التالي"
            className="min-h-[40px] min-w-[40px] rounded-xl bg-[#1A113E] hover:bg-[#251854] disabled:opacity-40 border border-[#2D1F5E] text-slate-200 flex items-center justify-center transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
        </div>
      </div>

      {/* 7-Day Color-Coded Calendar Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2.5">
        {weekData.days.map((dayInfo) => {
          const style = TONE_STYLES[dayInfo.tone];
          const isInspected = inspectedDay?.day === dayInfo.day;
          return (
            <button
              key={dayInfo.day}
              type="button"
              onClick={() => onSelectDay(dayInfo.day)}
              aria-label={`اليوم ${dayInfo.day}: نسبة الإنجاز ${dayInfo.percent}%، منجز ${dayInfo.completedCount}، متبقي ${dayInfo.remainingCount}`}
              aria-pressed={isInspected}
              className={`min-h-[92px] p-2.5 rounded-2xl border text-right flex flex-col justify-between gap-2 transition-colors ${
                style.card
              } ${
                isInspected
                  ? 'ring-2 ring-cyan-400 ring-offset-2 ring-offset-[#110B29]'
                  : ''
              }`}
            >
              <div className="flex items-center justify-between gap-1 w-full min-w-0">
                <span
                  className={`text-xs font-bold whitespace-nowrap ${
                    dayInfo.isCurrent ? 'text-cyan-300' : ''
                  }`}
                >
                  اليوم{' '}
                  <span className="font-mono-num">
                    {String(dayInfo.day).padStart(2, '0')}
                  </span>
                  {dayInfo.isCurrent && (
                    <span className="sr-only"> (اليوم المحدد)</span>
                  )}
                </span>
              </div>

              <div className={`font-mono-num text-xl font-extrabold leading-none ${style.percent}`}>
                {dayInfo.percent}%
              </div>

              <div className="space-y-1.5 w-full">
                <div className="flex items-center justify-between text-[11px] font-mono-num opacity-90">
                  <span>✓ {dayInfo.completedCount}</span>
                  <span>○ {dayInfo.remainingCount}</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-[#090617]/80 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-300 ${style.bar}`}
                    style={{ width: `${dayInfo.percent}%` }}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Heat Color Legend */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          {(['empty', 'low', 'mid', 'high', 'complete'] as CompletionHeatTone[]).map(
            (tone) => (
              <span key={tone} className="flex items-center gap-1.5">
                <span
                  className={`inline-block w-2.5 h-2.5 rounded-sm ${TONE_STYLES[tone].bar}`}
                  aria-hidden="true"
                />
                <span className="font-mono-num">{TONE_STYLES[tone].label}</span>
              </span>
            )
          )}
        </div>
        <span>✓ المهام المنجزة · ○ المهام المتبقية</span>
      </div>

      {/* Inspected Day Completed vs Remaining Task Breakdown */}
      {inspectedDay && (
        <div className="pt-4 border-t border-[#2D1F5E] space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="text-xs sm:text-sm font-extrabold text-white">
              تفاصيل اليوم{' '}
              <span className="font-mono-num">
                {String(inspectedDay.day).padStart(2, '0')}
              </span>{' '}
              — المنجز والمتبقي
            </h3>
            <span className="text-xs text-slate-400">
              <strong className="font-mono-num text-emerald-300">
                {inspectedDay.completedCount}
              </strong>{' '}
              منجز ·{' '}
              <strong className="font-mono-num text-orange-300">
                {inspectedDay.remainingCount}
              </strong>{' '}
              متبقي
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Completed Column */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-300">
                <CheckCircle2 size={14} aria-hidden="true" />
                <span>المهام المنجزة ({inspectedDay.completedItems.length})</span>
              </div>

              {inspectedDay.completedItems.length === 0 ? (
                <p className="text-xs text-slate-400 py-2">
                  لم يتم إكمال أي مهمة في هذا اليوم بعد.
                </p>
              ) : (
                <ul className="divide-y divide-[#2D1F5E]/70">
                  {inspectedDay.completedItems.map((entry) => (
                    <li key={entry.id} className="py-1.5 first:pt-0 last:pb-0">
                      <button
                        type="button"
                        onClick={() => handleToggleEntry(entry)}
                        className="w-full text-right flex items-start gap-2.5 min-h-[38px] py-1 hover:bg-[#1A113E]/80 rounded-xl px-2 transition-colors"
                      >
                        <span
                          className="w-4 h-4 mt-0.5 rounded-full bg-emerald-400 text-slate-950 flex items-center justify-center shrink-0"
                          aria-hidden="true"
                        >
                          <Check size={11} strokeWidth={3} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <span className="block text-xs text-slate-400 line-through leading-snug">
                            {entry.title}
                          </span>
                          <span className="block text-[11px] text-emerald-300/80">
                            {getEntryCategoryLabel(entry)}
                          </span>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Remaining Column */}
            <div className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-orange-300">
                <CircleDashed size={14} aria-hidden="true" />
                <span>المهام المتبقية ({inspectedDay.remainingItems.length})</span>
              </div>

              {inspectedDay.remainingItems.length === 0 ? (
                <p className="text-xs text-emerald-300 font-semibold py-2">
                  كل مهام هذا اليوم مكتملة بنسبة 100%!
                </p>
              ) : (
                <ul className="divide-y divide-[#2D1F5E]/70">
                  {inspectedDay.remainingItems.map((entry) => (
                    <li key={entry.id} className="py-1.5 first:pt-0 last:pb-0">
                      <button
                        type="button"
                        onClick={() => handleToggleEntry(entry)}
                        className="w-full text-right flex items-start gap-2.5 min-h-[38px] py-1 hover:bg-[#1A113E]/80 rounded-xl px-2 transition-colors"
                      >
                        <span
                          className="w-4 h-4 mt-0.5 rounded-full border border-slate-500 shrink-0"
                          aria-hidden="true"
                        />
                        <div className="min-w-0 flex-1">
                          <span className="block text-xs text-slate-100 leading-snug">
                            {entry.title}
                          </span>
                          <span className="block text-[11px] text-orange-300/90">
                            {getEntryCategoryLabel(entry)}
                          </span>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
