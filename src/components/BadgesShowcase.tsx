import React, { useState } from 'react';
import { Award, CheckCircle2, Lock } from 'lucide-react';
import { EvaluatedBadge, formatFocusHoursLabel } from '../utils/badges';
import { BADGE_TIER_PALETTES, BadgeEmblem } from './BadgeEmblem';

type BadgeFilter = 'all' | 'unlocked' | 'locked';

interface BadgesShowcaseProps {
  badges: EvaluatedBadge[];
  focusMinutesTotal: number;
  highlightedBadgeId?: string | null;
}

export function BadgesShowcase({
  badges,
  focusMinutesTotal,
  highlightedBadgeId,
}: BadgesShowcaseProps) {
  const [filter, setFilter] = useState<BadgeFilter>('all');

  const unlockedCount = badges.filter((b) => b.unlocked).length;
  const lockedCount = badges.length - unlockedCount;
  const nextLockedBadge =
    badges
      .filter((b) => !b.unlocked)
      .sort((a, b) => b.progressPercent - a.progressPercent)[0] ?? null;

  const visibleBadges = badges.filter((badge) => {
    if (filter === 'unlocked') return badge.unlocked;
    if (filter === 'locked') return !badge.unlocked;
    return true;
  });

  return (
    <section
      id="badges-showcase"
      aria-label="شارات الإنجاز"
      data-testid="badges-showcase"
      className="bg-[#110B29] border border-[#2D1F5E] rounded-3xl p-4 sm:p-5 space-y-4"
    >
      {/* Header & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <Award size={18} className="text-pink-400 shrink-0" aria-hidden="true" />
            <h2 className="text-sm sm:text-base font-extrabold text-white">
              شارات الإنجاز · مع الكوتش BA9I
            </h2>
          </div>
          <p className="text-xs text-slate-400">
            <span className="font-mono-num text-cyan-300 font-bold">
              {unlockedCount}
            </span>{' '}
            من{' '}
            <span className="font-mono-num text-cyan-300 font-bold">
              {badges.length}
            </span>{' '}
            شارات مكتسبة <span aria-hidden="true">·</span> رصيد التركيز:{' '}
            <span className="font-semibold text-slate-200">
              {formatFocusHoursLabel(focusMinutesTotal)}
            </span>
          </p>
        </div>

        <div
          className="flex items-center gap-1 p-1 bg-[#1A113E] border border-[#2D1F5E] rounded-xl"
          role="tablist"
          aria-label="تصفية الشارات"
        >
          <button
            type="button"
            role="tab"
            aria-selected={filter === 'all'}
            onClick={() => setFilter('all')}
            className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
              filter === 'all'
                ? 'bg-cyan-400 text-slate-950'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            الكل (<span className="font-mono-num">{badges.length}</span>)
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={filter === 'unlocked'}
            onClick={() => setFilter('unlocked')}
            className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
              filter === 'unlocked'
                ? 'bg-cyan-400 text-slate-950'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            المفتوحة (<span className="font-mono-num">{unlockedCount}</span>)
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={filter === 'locked'}
            onClick={() => setFilter('locked')}
            className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
              filter === 'locked'
                ? 'bg-cyan-400 text-slate-950'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            قيد التقدم (<span className="font-mono-num">{lockedCount}</span>)
          </button>
        </div>
      </div>

      {/* Coach BA9I Next Badge Spotlight Strip (Mockup: "Prochain Badge") */}
      <div className="rounded-2xl bg-[#1A113E] border border-pink-500/35 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <img
            src={
              nextLockedBadge
                ? '/assets/coach/ba9i-saha.png'
                : '/assets/coach/ba9i-victory.png'
            }
            alt="الكوتش باقي يتابع شاراتك"
            className="w-12 h-12 object-contain shrink-0"
            referrerPolicy="no-referrer"
          />
          <div className="min-w-0 space-y-0.5">
            <div className="text-[11px] font-extrabold text-pink-300">
              {nextLockedBadge ? 'الشارة القادمة · Prochain Badge' : 'كل الشارات مفتوحة 🏆'}
            </div>
            <p className="text-xs sm:text-sm font-bold text-white truncate">
              {nextLockedBadge
                ? `${nextLockedBadge.titleAr} — ${nextLockedBadge.progressText}`
                : 'أسطورة رسمية! فتحت جميع شارات تحدي البكالوريا.'}
            </p>
          </div>
        </div>
        {nextLockedBadge && (
          <div className="flex items-center gap-2 shrink-0 sm:w-44">
            <div className="flex-1 h-2 bg-[#090617] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-l from-cyan-400 to-pink-500 rounded-full transition-all duration-300"
                style={{ width: `${nextLockedBadge.progressPercent}%` }}
              />
            </div>
            <span dir="ltr" className="font-mono-num text-xs font-bold text-cyan-300">
              {nextLockedBadge.progressPercent}%
            </span>
          </div>
        )}
      </div>

      {/* Badges Grid */}
      {visibleBadges.length === 0 ? (
        <div className="rounded-2xl bg-[#1A113E] border border-[#2D1F5E] p-5 text-center space-y-2.5">
          <p className="text-xs sm:text-sm text-slate-300">
            {filter === 'unlocked'
              ? 'لم تفتح أي شارة بعد — أنجز مهامك اليومية أو جلسة تركيز لفتح أول شارة.'
              : 'مذهل! فتحت جميع الشارات المتاحة في التحدي.'}
          </p>
          <button
            type="button"
            onClick={() => setFilter('all')}
            className="min-h-[40px] px-4 py-2 rounded-xl bg-cyan-400 text-slate-950 text-xs font-extrabold whitespace-nowrap"
          >
            عرض جميع الشارات
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 items-stretch">
          {visibleBadges.map((badge) => {
            const palette = BADGE_TIER_PALETTES[badge.tier];
            const isHighlighted = highlightedBadgeId === badge.id;
            return (
              <article
                key={badge.id}
                data-testid={`badge-card-${badge.id}`}
                data-unlocked={badge.unlocked ? 'true' : 'false'}
                className={`rounded-2xl p-4 border flex flex-col justify-between gap-3 transition-transform duration-200 ${
                  badge.unlocked
                    ? `${palette.surfaceClass} ${palette.borderClass} hover:-translate-y-0.5`
                    : 'bg-[#1A113E]/70 border-[#2D1F5E] opacity-90'
                } ${
                  isHighlighted
                    ? 'ring-2 ring-cyan-400 animate-badge-pop'
                    : ''
                }`}
              >
                <div className="flex items-start gap-3">
                  <BadgeEmblem
                    iconKey={badge.iconKey}
                    tier={badge.tier}
                    unlocked={badge.unlocked}
                    progressPercent={badge.progressPercent}
                    celebrate={isHighlighted}
                  />
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold">
                      <span
                        className={
                          badge.unlocked ? palette.labelTextClass : 'text-slate-400'
                        }
                      >
                        {badge.categoryLabelAr}
                      </span>
                      <span className="text-slate-600" aria-hidden="true">
                        ·
                      </span>
                      {badge.unlocked ? (
                        <span className="text-teal-300 flex items-center gap-1 whitespace-nowrap">
                          <CheckCircle2 size={12} aria-hidden="true" />
                          <span>مكتسبة</span>
                        </span>
                      ) : (
                        <span className="text-slate-400 flex items-center gap-1 whitespace-nowrap">
                          <Lock size={11} aria-hidden="true" />
                          <span dir="ltr" className="font-mono-num">
                            {badge.progressPercent}%
                          </span>
                        </span>
                      )}
                    </div>

                    <h3
                      className={`text-sm font-extrabold leading-snug ${
                        badge.unlocked ? 'text-white' : 'text-slate-200'
                      }`}
                    >
                      {badge.titleAr}
                    </h3>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  {badge.descriptionAr}
                </p>

                <div className="space-y-1.5 pt-1 border-t border-[#2D1F5E]/80">
                  <div className="w-full h-1.5 bg-[#090617] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        badge.unlocked ? palette.barClass : 'bg-slate-500'
                      }`}
                      style={{ width: `${badge.progressPercent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">
                      {badge.unlocked ? 'تم تحقيق الهدف' : 'التقدم الحالي'}
                    </span>
                    <span
                      className={`font-bold ${
                        badge.unlocked ? palette.labelTextClass : 'text-slate-300'
                      }`}
                    >
                      {badge.progressText}
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
