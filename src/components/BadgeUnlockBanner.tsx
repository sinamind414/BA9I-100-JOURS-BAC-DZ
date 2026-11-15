import React, { useEffect } from 'react';
import { Award, Sparkles, X } from 'lucide-react';
import { EvaluatedBadge } from '../utils/badges';
import { BADGE_TIER_PALETTES, BadgeEmblem } from './BadgeEmblem';

interface BadgeUnlockBannerProps {
  badge: EvaluatedBadge | null;
  queueCount: number;
  onViewBadges: (badgeId: string) => void;
  onDismiss: () => void;
}

export function BadgeUnlockBanner({
  badge,
  queueCount,
  onViewBadges,
  onDismiss,
}: BadgeUnlockBannerProps) {
  useEffect(() => {
    if (!badge) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onDismiss();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [badge, onDismiss]);

  if (!badge) return null;

  const palette = BADGE_TIER_PALETTES[badge.tier];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#050311]/80 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="badge-unlock-title"
      data-testid="badge-unlock-banner"
      onClick={onDismiss}
    >
      <div
        key={badge.id}
        onClick={(e) => e.stopPropagation()}
        className={`relative w-full max-w-md rounded-3xl p-6 border text-center space-y-5 shadow-2xl animate-badge-pop ${palette.surfaceClass} ${palette.borderClass}`}
      >
        <button
          type="button"
          onClick={onDismiss}
          aria-label="إغلاق إشعار الشارة"
          className="absolute top-4 left-4 min-h-[40px] min-w-[40px] rounded-xl bg-[#110B29]/90 hover:bg-[#251854] border border-[#2D1F5E] text-slate-300 flex items-center justify-center transition-colors"
        >
          <X size={16} />
        </button>

        <div className="flex flex-col items-center space-y-3 pt-1">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-pink-300">
            <Sparkles size={14} aria-hidden="true" />
            <span>شارة إنجاز جديدة من الكوتش BA9I</span>
            {queueCount > 1 && (
              <>
                <span className="text-slate-500" aria-hidden="true">
                  ·
                </span>
                <span className="text-cyan-300 font-mono-num">
                  متبقي {queueCount - 1}
                </span>
              </>
            )}
          </div>

          <div className="flex items-center justify-center gap-4">
            <img
              src="/assets/coach/ba9i-victory.png"
              alt="الكوتش باقي يحتفل بفوزك بالشارة"
              className="w-20 h-20 object-contain drop-shadow-[0_6px_16px_rgba(34,211,238,0.28)]"
              referrerPolicy="no-referrer"
            />
            <BadgeEmblem
              iconKey={badge.iconKey}
              tier={badge.tier}
              unlocked={true}
              progressPercent={100}
              size="lg"
              celebrate={true}
            />
          </div>

          <div className="space-y-1.5">
            <div className={`text-xs font-bold ${palette.labelTextClass}`}>
              {badge.categoryLabelAr} · {badge.progressText}
            </div>
            <h2
              id="badge-unlock-title"
              className="text-xl font-extrabold text-white"
            >
              {badge.titleAr}
            </h2>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed max-w-xs mx-auto">
              {badge.descriptionAr}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => onViewBadges(badge.id)}
            className="w-full sm:flex-1 min-h-[44px] px-4 py-2.5 rounded-xl bg-gradient-to-l from-cyan-400 to-teal-300 hover:from-cyan-300 hover:to-teal-200 text-slate-950 font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
          >
            <Award size={16} aria-hidden="true" />
            <span>عرض الشارات</span>
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="w-full sm:w-auto min-h-[44px] px-5 py-2.5 rounded-xl bg-[#110B29] hover:bg-[#251854] border border-[#2D1F5E] text-slate-200 font-bold text-xs sm:text-sm transition-colors whitespace-nowrap"
          >
            متابعة المراجعة
          </button>
        </div>
      </div>
    </div>
  );
}
