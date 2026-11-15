import React from 'react';
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Flame,
  Headphones,
  Sparkles,
  Zap,
} from 'lucide-react';
import { CoachState } from '../utils/coachBa9i';
import { TOTAL_CHALLENGE_DAYS } from '../utils/spacedRepetition';

interface CoachBa9iHeroProps {
  currentDay: number;
  dayTitle: string;
  daysRemaining: number;
  dayPercent: number;
  streakDays: number;
  coach: CoachState;
  onChangeDay: (day: number) => void;
  onOpenDayMap: () => void;
  onCoachAction: (action: CoachState['actionType']) => void;
  onStartFocusNow: () => void;
}

export function CoachBa9iHero({
  currentDay,
  dayTitle,
  daysRemaining,
  dayPercent,
  streakDays,
  coach,
  onChangeDay,
  onOpenDayMap,
  onCoachAction,
  onStartFocusNow,
}: CoachBa9iHeroProps) {
  const challengePercent = Math.min(
    100,
    Math.max(1, Math.round((currentDay / TOTAL_CHALLENGE_DAYS) * 100))
  );

  return (
    <section
      aria-label="الكوتش باقي وعداد الـ 100 يوم"
      data-testid="coach-ba9i-hero"
      className="relative overflow-hidden rounded-3xl bg-[#110B29] border border-[#2D1F5E] p-4 sm:p-6 space-y-5"
    >
      {/* Subtle Neon Ambient Top Glow Line (1px accent) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-l from-cyan-400 via-pink-500 to-orange-400"
      />

      {/* Row 1: Mockup-Inspired "Ba9i X Jours" Countdown + Day Stepper */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-[#2D1F5E]">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => onChangeDay(Math.max(1, currentDay - 1))}
            disabled={currentDay <= 1}
            aria-label="اليوم السابق"
            className="min-h-[44px] min-w-[44px] rounded-xl bg-[#1A113E] hover:bg-[#251854] disabled:opacity-40 border border-[#2D1F5E] text-slate-100 flex items-center justify-center transition-colors shrink-0"
          >
            <ChevronRight size={18} />
          </button>

          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
              <span className="font-extrabold text-lg sm:text-2xl text-white tracking-tight flex items-center gap-1.5">
                <span className="text-pink-400">BA9I</span>
                <span className="font-mono-num text-cyan-300">
                  {daysRemaining}
                </span>
                <span className="text-orange-300">يوم للباك</span>
              </span>
              <span className="text-slate-500" aria-hidden="true">
                ·
              </span>
              <span className="text-xs font-bold text-slate-300 font-mono-num">
                اليوم {String(currentDay).padStart(2, '0')} / {TOTAL_CHALLENGE_DAYS}
              </span>
            </div>
            <h1 className="text-sm sm:text-base font-bold text-slate-200 leading-snug">
              {dayTitle}
            </h1>
          </div>

          <button
            type="button"
            onClick={() =>
              onChangeDay(Math.min(TOTAL_CHALLENGE_DAYS, currentDay + 1))
            }
            disabled={currentDay >= TOTAL_CHALLENGE_DAYS}
            aria-label="اليوم التالي"
            className="min-h-[44px] min-w-[44px] rounded-xl bg-[#1A113E] hover:bg-[#251854] disabled:opacity-40 border border-[#2D1F5E] text-slate-100 flex items-center justify-center transition-colors shrink-0"
          >
            <ChevronLeft size={18} />
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#1A113E] border border-[#2D1F5E] text-xs font-bold">
            <Flame size={15} className="text-orange-400 shrink-0" aria-hidden="true" />
            <span className="text-slate-300">سلسلة:</span>
            <span className="font-mono-num text-orange-300">
              {streakDays} {streakDays === 1 ? 'يوم' : 'أيام'}
            </span>
          </div>

          <button
            type="button"
            onClick={onOpenDayMap}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-[#1A113E] hover:bg-[#251854] border border-cyan-400/35 text-cyan-200 text-xs font-bold flex items-center justify-center gap-2 transition-colors whitespace-nowrap shrink-0"
          >
            <CalendarDays size={16} className="text-cyan-400" aria-hidden="true" />
            <span>خريطة الـ 100 يوم</span>
          </button>
        </div>
      </div>

      {/* Dual Progress Meter (Mockup "Ba9i X Jours" neon bar) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-semibold">
              تقدّم رحلة الـ 100 يوم
            </span>
            <span dir="ltr" className="font-mono-num font-bold text-cyan-300">
              {challengePercent}%
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-[#090617] border border-[#2D1F5E] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-l from-cyan-400 via-pink-500 to-orange-400 transition-all duration-300"
              style={{ width: `${challengePercent}%` }}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-semibold">
              إنجاز مهام اليوم {String(currentDay).padStart(2, '0')}
            </span>
            <span dir="ltr" className="font-mono-num font-bold text-emerald-300">
              {dayPercent}%
            </span>
          </div>
          <div className="w-full h-2.5 rounded-full bg-[#090617] border border-[#2D1F5E] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-l from-emerald-400 to-cyan-400 transition-all duration-300"
              style={{ width: `${dayPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Row 2: Coach BA9I Mascot + Speech Bubble + MODE FOCUS CTA */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
        {/* Coach BA9I Mascot + Speech Bubble */}
        <div className="md:col-span-8 flex flex-col sm:flex-row items-center sm:items-stretch gap-4">
          <div
            className={`relative w-28 h-28 sm:w-32 sm:h-32 rounded-3xl bg-[#090617] border-2 ${coach.pose.accentBorderClass} p-2 flex items-center justify-center shrink-0`}
          >
            <img
              src={coach.pose.src}
              alt={coach.pose.alt}
              className="w-full h-full object-contain drop-shadow-[0_6px_14px_rgba(34,211,238,0.18)]"
              referrerPolicy="no-referrer"
            />
          </div>

          <div
            className={`flex-1 w-full rounded-2xl border p-4 flex flex-col justify-between gap-2 ${coach.pose.bubbleBgClass}`}
          >
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2 text-xs font-extrabold">
                <span className="text-pink-400 flex items-center gap-1">
                  <Sparkles size={13} aria-hidden="true" />
                  <span>الكوتش BA9I</span>
                </span>
                <span className="text-slate-500" aria-hidden="true">
                  ·
                </span>
                <span className={coach.pose.accentTextClass}>
                  {coach.pose.badgeText}
                </span>
              </div>
              <h2 className="text-sm sm:text-base font-extrabold text-white leading-snug">
                {coach.headline}
              </h2>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {coach.message}
              </p>
            </div>
          </div>
        </div>

        {/* Mockup Primary Action Stack: MODE FOCUS + Contextual Coach Action */}
        <div className="md:col-span-4 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={onStartFocusNow}
            data-testid="hero-mode-focus-btn"
            className="w-full min-h-[52px] px-5 py-3 rounded-2xl bg-gradient-to-l from-cyan-400 to-teal-300 hover:from-cyan-300 hover:to-teal-200 text-slate-950 font-extrabold text-sm flex items-center justify-center gap-2.5 transition-all shadow-[0_8px_24px_rgba(34,211,238,0.22)] whitespace-nowrap"
          >
            <Headphones size={18} aria-hidden="true" />
            <span>وضع التركيز · MODE FOCUS</span>
          </button>

          {coach.actionType !== 'focus' && (
            <button
              type="button"
              onClick={() => onCoachAction(coach.actionType)}
              className="w-full min-h-[44px] px-4 py-2 rounded-2xl bg-[#1A113E] hover:bg-[#251854] border border-pink-500/45 text-pink-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
            >
              <Zap size={15} aria-hidden="true" />
              <span>{coach.actionLabel}</span>
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
