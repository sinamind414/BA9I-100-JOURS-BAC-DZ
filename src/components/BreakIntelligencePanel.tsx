import React, { useEffect, useState } from 'react';
import {
  Activity,
  Check,
  CheckCircle2,
  Droplets,
  Pause,
  Play,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { ambientAudio } from '../utils/ambientAudio';
import {
  BreakRecommendation,
  BreakTierId,
  getBreakRecommendation,
} from '../utils/breakIntelligence';

interface BreakIntelligencePanelProps {
  selectedDurationMin: number;
  completedSessionMin: number | null;
  completionNonce: number;
  onDismissBreak: () => void;
}

const TIER_STYLES: Record<
  BreakTierId,
  {
    surface: string;
    iconBox: string;
    accentText: string;
    progressBar: string;
    primaryBtn: string;
  }
> = {
  sprint: {
    surface:
      'bg-[#1A113E] bg-gradient-to-br from-cyan-500/15 via-[#1A113E] to-[#110B29] border-cyan-400/45',
    iconBox: 'bg-cyan-400/15 border-cyan-300/30 text-cyan-200',
    accentText: 'text-cyan-300',
    progressBar: 'bg-cyan-400',
    primaryBtn: 'bg-cyan-400 hover:bg-cyan-300 text-slate-950',
  },
  balanced: {
    surface:
      'bg-[#1A113E] bg-gradient-to-br from-teal-500/15 via-[#1A113E] to-[#110B29] border-teal-400/45',
    iconBox: 'bg-teal-400/15 border-teal-300/30 text-teal-200',
    accentText: 'text-teal-300',
    progressBar: 'bg-teal-400',
    primaryBtn: 'bg-teal-400 hover:bg-teal-300 text-slate-950',
  },
  deep: {
    surface:
      'bg-[#1A113E] bg-gradient-to-br from-orange-500/15 via-[#1A113E] to-[#110B29] border-orange-400/45',
    iconBox: 'bg-orange-400/15 border-orange-300/30 text-orange-200',
    accentText: 'text-orange-300',
    progressBar: 'bg-orange-400',
    primaryBtn: 'bg-orange-400 hover:bg-orange-300 text-slate-950',
  },
  marathon: {
    surface:
      'bg-[#1A113E] bg-gradient-to-br from-pink-500/15 via-[#1A113E] to-[#110B29] border-pink-400/45',
    iconBox: 'bg-pink-400/15 border-pink-300/30 text-pink-200',
    accentText: 'text-pink-300',
    progressBar: 'bg-pink-400',
    primaryBtn: 'bg-pink-400 hover:bg-pink-300 text-slate-950',
  },
};

export function BreakIntelligencePanel({
  selectedDurationMin,
  completedSessionMin,
  completionNonce,
  onDismissBreak,
}: BreakIntelligencePanelProps) {
  const isActive = completedSessionMin !== null;
  const activeMinutes = completedSessionMin ?? selectedDurationMin;
  const recommendation: BreakRecommendation =
    getBreakRecommendation(activeMinutes);
  const style = TIER_STYLES[recommendation.tier];

  const [checkedSteps, setCheckedSteps] = useState<string[]>([]);
  const [breakSecondsLeft, setBreakSecondsLeft] = useState<number>(
    recommendation.breakMinutes * 60
  );
  const [breakRunning, setBreakRunning] = useState<boolean>(false);
  const [breakFinished, setBreakFinished] = useState<boolean>(false);

  // Reset checklist and break timer whenever a new focus session completes
  useEffect(() => {
    const rec = getBreakRecommendation(completedSessionMin ?? selectedDurationMin);
    setCheckedSteps([]);
    setBreakSecondsLeft(rec.breakMinutes * 60);
    setBreakRunning(false);
    setBreakFinished(false);
  }, [completionNonce, completedSessionMin, selectedDurationMin]);

  useEffect(() => {
    if (!breakRunning) return;
    const id = window.setInterval(() => {
      setBreakSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(id);
          setBreakRunning(false);
          setBreakFinished(true);
          ambientAudio.playCompletionChime();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [breakRunning]);

  const toggleStep = (stepId: string) => {
    setCheckedSteps((prev) =>
      prev.includes(stepId)
        ? prev.filter((id) => id !== stepId)
        : [...prev, stepId]
    );
  };

  const minsStr = String(Math.floor(breakSecondsLeft / 60)).padStart(2, '0');
  const secsStr = String(breakSecondsLeft % 60).padStart(2, '0');

  if (!isActive) {
    return (
      <section
        aria-label="معاينة ذكاء الاستراحة"
        data-testid="break-intelligence-preview"
        className="w-full rounded-2xl bg-[#1A113E] border border-[#2D1F5E] p-4 text-right space-y-2"
      >
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Activity size={16} className={style.accentText} aria-hidden="true" />
            <h2 className="text-xs sm:text-sm font-extrabold text-white">
              ذكاء الاستراحة (تلقائي بعد الجلسة)
            </h2>
          </div>
          <span className={`text-xs font-bold ${style.accentText}`}>
            {recommendation.categoryLabelAr} ·{' '}
            <span className="font-mono-num">{recommendation.breakMinutes}</span> د
          </span>
        </div>
        <p className="text-xs text-slate-300 leading-relaxed">
          عند إنهاء جلسة{' '}
          <span className="font-mono-num font-bold text-white">
            {selectedDurationMin}
          </span>{' '}
          دقيقة، سيقترح التطبيق:{' '}
          <strong className="text-white">{recommendation.titleAr}</strong>.
        </p>
      </section>
    );
  }

  const completedStepsCount = checkedSteps.length;
  const totalStepsCount = recommendation.steps.length;

  return (
    <section
      aria-label="توصية ذكاء الاستراحة"
      data-testid="break-intelligence-card"
      className={`w-full rounded-2xl border p-4 sm:p-5 text-right space-y-4 ${style.surface}`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          <div
            className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${style.iconBox}`}
          >
            <Sparkles size={18} aria-hidden="true" />
          </div>
          <div className="space-y-1 min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-bold">
              <span className={style.accentText}>ذكاء الاستراحة</span>
              <span className="text-slate-400" aria-hidden="true">
                ·
              </span>
              <span className="text-slate-200">
                بعد جلسة{' '}
                <span className="font-mono-num">
                  {recommendation.sessionMinutes}
                </span>{' '}
                دقيقة
              </span>
              <span className="text-slate-400" aria-hidden="true">
                ·
              </span>
              <span className={style.accentText}>
                استراحة{' '}
                <span className="font-mono-num">
                  {recommendation.breakMinutes}
                </span>{' '}
                د
              </span>
            </div>
            <h2 className="text-sm sm:text-base font-extrabold text-white leading-snug">
              {recommendation.titleAr}
            </h2>
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-200 leading-relaxed">
        {recommendation.rationaleAr}
      </p>

      {/* Exercise / Stretch Checklist */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-slate-200">
            التمارين والأنشطة المقترحة
          </span>
          <span
            dir="ltr"
            className={`inline-block font-mono-num font-bold ${style.accentText}`}
          >
            {completedStepsCount} / {totalStepsCount}
          </span>
        </div>

        <div className="space-y-2">
          {recommendation.steps.map((step) => {
            const done = checkedSteps.includes(step.id);
            return (
              <button
                key={step.id}
                type="button"
                onClick={() => toggleStep(step.id)}
                className={`w-full text-right p-3 rounded-xl border flex items-start gap-2.5 transition-colors min-h-[44px] ${
                  done
                    ? 'bg-teal-500/15 border-teal-400/50 text-teal-100'
                    : 'bg-[#110B29]/90 hover:bg-[#251854] border-[#2D1F5E] text-slate-100'
                }`}
              >
                <span
                  className={`w-5 h-5 mt-0.5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                    done
                      ? 'bg-teal-400 border-teal-300 text-slate-950'
                      : 'border-slate-500 text-transparent'
                  }`}
                  aria-hidden="true"
                >
                  <Check size={12} strokeWidth={3} />
                </span>
                <div className="flex-1 min-w-0">
                  <div
                    className={`text-xs font-semibold leading-snug ${
                      done ? 'line-through text-slate-300' : 'text-white'
                    }`}
                  >
                    {step.label}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    المدة المقترحة:{' '}
                    <span className="text-slate-300 font-semibold">
                      {step.durationHint}
                    </span>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Hydration tip */}
      <div className="flex items-center gap-2 text-xs text-slate-200 bg-[#110B29]/80 border border-[#2D1F5E] rounded-xl px-3 py-2.5">
        <Droplets size={15} className={style.accentText} aria-hidden="true" />
        <span>{recommendation.hydrationTipAr}</span>
      </div>

      {breakFinished && (
        <div className="p-3 rounded-xl bg-teal-500/15 border border-teal-400/40 text-teal-200 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 size={16} aria-hidden="true" />
          <span>انتهت الاستراحة بنجاح! أنت جاهز للانطلاق في الجلسة التالية.</span>
        </div>
      )}

      {/* Guided Break Timer Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="flex items-center gap-2.5">
          <span
            dir="ltr"
            data-testid="break-timer-display"
            className="font-mono-num text-lg font-extrabold text-white bg-[#090617]/90 border border-[#2D1F5E] px-3 py-1.5 rounded-xl"
          >
            {minsStr}:{secsStr}
          </span>
          <span className="text-xs text-slate-300">
            {breakRunning ? 'الاستراحة جارية الآن' : 'مؤقت الاستراحة الذكي'}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => {
              if (breakFinished) {
                setBreakSecondsLeft(recommendation.breakMinutes * 60);
                setBreakFinished(false);
              }
              setBreakRunning((r) => !r);
            }}
            className={`min-h-[40px] px-4 py-2 rounded-xl font-extrabold text-xs flex items-center gap-1.5 transition-colors whitespace-nowrap ${style.primaryBtn}`}
          >
            {breakRunning ? <Pause size={14} /> : <Play size={14} />}
            <span>
              {breakRunning
                ? 'إيقاف الاستراحة'
                : `ابدأ مؤقت الاستراحة (${recommendation.breakMinutes} د)`}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setBreakRunning(false);
              setBreakSecondsLeft(recommendation.breakMinutes * 60);
              setBreakFinished(false);
            }}
            aria-label="إعادة ضبط مؤقت الاستراحة"
            className="min-h-[40px] min-w-[40px] rounded-xl bg-[#110B29] hover:bg-[#251854] border border-[#2D1F5E] text-slate-200 flex items-center justify-center transition-colors"
          >
            <RotateCcw size={15} />
          </button>

          <button
            type="button"
            onClick={onDismissBreak}
            className="min-h-[40px] px-3 py-2 rounded-xl bg-[#110B29] hover:bg-[#251854] border border-[#2D1F5E] text-slate-200 text-xs font-bold transition-colors whitespace-nowrap"
          >
            العودة للجلسة التالية
          </button>
        </div>
      </div>
    </section>
  );
}
