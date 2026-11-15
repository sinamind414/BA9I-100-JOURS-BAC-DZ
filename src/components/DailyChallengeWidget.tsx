import React, { useEffect, useMemo, useState } from 'react';
import {
  BrainCircuit,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  XCircle,
} from 'lucide-react';
import { SUBJECT_META } from '../data/curriculum';
import { getDailyChallengeForDay } from '../data/dailyChallenges';
import { BranchId } from '../types/bac';
import { evaluateDailyChallengeAttempt } from '../utils/spacedRepetition';

interface DailyChallengeWidgetProps {
  currentDay: number;
  branch: BranchId;
  isSolved: boolean;
  onSolveChallenge: (day: number, bonusXp: number) => void;
}

const OPTION_LETTERS = ['أ', 'ب', 'ج', 'د'] as const;

export function DailyChallengeWidget({
  currentDay,
  branch,
  isSolved,
  onSolveChallenge,
}: DailyChallengeWidgetProps) {
  const challenge = useMemo(
    () => getDailyChallengeForDay(currentDay, branch),
    [currentDay, branch]
  );
  const subjectMeta = SUBJECT_META[challenge.subject];

  const [wrongIndex, setWrongIndex] = useState<number | null>(null);
  const [showHint, setShowHint] = useState(false);

  useEffect(() => {
    setWrongIndex(null);
    setShowHint(false);
  }, [currentDay, branch]);

  const handleSelectOption = (index: number) => {
    if (isSolved) return;
    const result = evaluateDailyChallengeAttempt(challenge, index, isSolved);
    if (result.isCorrect) {
      setWrongIndex(null);
      onSolveChallenge(currentDay, result.awardedXp);
    } else {
      setWrongIndex(index);
    }
  };

  return (
    <section
      id="daily-challenge-widget"
      aria-label="تحدي اليوم"
      data-testid="daily-challenge-widget"
      className="bg-[#110B29] border border-[#2D1F5E] rounded-3xl p-5 space-y-4"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <BrainCircuit
              size={17}
              className={isSolved ? 'text-emerald-400 shrink-0' : 'text-cyan-400 shrink-0'}
              aria-hidden="true"
            />
            <h2 className="font-extrabold text-sm text-white">تحدي اليوم</h2>
          </div>
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-400">
            <span className={`font-bold ${subjectMeta.badgeTextClass}`}>
              {subjectMeta.nameAr}
            </span>
            <span aria-hidden="true">·</span>
            <span>{challenge.kind === 'puzzle' ? 'لغز سريع' : 'سؤال منهجي'}</span>
            <span aria-hidden="true">·</span>
            <span
              className={`font-mono-num font-bold ${
                isSolved ? 'text-emerald-300' : 'text-pink-300'
              }`}
            >
              +{challenge.bonusXp} XP
            </span>
          </div>
        </div>

        <span
          className={`text-xs font-bold whitespace-nowrap shrink-0 flex items-center gap-1 ${
            isSolved ? 'text-emerald-300' : 'text-slate-400'
          }`}
        >
          {isSolved ? (
            <>
              <CheckCircle2 size={14} aria-hidden="true" />
              <span>محلول</span>
            </>
          ) : (
            <span>
              اليوم <span className="font-mono-num">{String(currentDay).padStart(2, '0')}</span>
            </span>
          )}
        </span>
      </div>

      {/* Question Prompt */}
      <p
        dir="auto"
        className="text-xs sm:text-sm font-semibold text-slate-100 leading-relaxed"
      >
        {challenge.question}
      </p>

      {/* Multiple-Choice Options */}
      <div className="space-y-2" role="group" aria-label="خيارات تحدي اليوم">
        {challenge.options.map((optionText, idx) => {
          const isCorrectOption = isSolved && idx === challenge.correctIndex;
          const isWrongAttempt = !isSolved && wrongIndex === idx;

          let cardClass =
            'bg-[#1A113E] hover:bg-[#251854] border-[#2D1F5E] text-slate-200';
          let letterClass = 'bg-[#090617] text-slate-300 border-[#2D1F5E]';

          if (isCorrectOption) {
            cardClass =
              'bg-emerald-500/20 border-emerald-400/60 text-emerald-100';
            letterClass =
              'bg-emerald-400 text-slate-950 border-emerald-300';
          } else if (isWrongAttempt) {
            cardClass =
              'bg-rose-500/15 border-rose-400/55 text-rose-100';
            letterClass =
              'bg-rose-500/25 text-rose-200 border-rose-400/50';
          } else if (isSolved) {
            cardClass =
              'bg-[#1A113E]/60 border-[#2D1F5E]/70 text-slate-400 opacity-75';
          }

          return (
            <button
              key={idx}
              type="button"
              disabled={isSolved}
              onClick={() => handleSelectOption(idx)}
              aria-pressed={isCorrectOption || isWrongAttempt}
              className={`w-full min-h-[44px] px-3 py-2.5 rounded-2xl border text-right flex items-center gap-2.5 transition-colors disabled:cursor-default ${cardClass}`}
            >
              <span
                className={`w-6 h-6 rounded-lg border text-xs font-extrabold flex items-center justify-center shrink-0 ${letterClass}`}
                aria-hidden="true"
              >
                {OPTION_LETTERS[idx]}
              </span>
              <span dir="auto" className="flex-1 text-xs leading-snug">
                {optionText}
              </span>
              {isCorrectOption && (
                <CheckCircle2
                  size={16}
                  className="text-emerald-300 shrink-0"
                  aria-hidden="true"
                />
              )}
              {isWrongAttempt && (
                <XCircle
                  size={16}
                  className="text-rose-300 shrink-0"
                  aria-hidden="true"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Feedback, Explanation & Hint Controls */}
      {isSolved ? (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-400/35 space-y-1.5">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-emerald-300">
            <Sparkles size={14} aria-hidden="true" />
            <span>
              إجابة صحيحة! أُضيفت{' '}
              <span className="font-mono-num">+{challenge.bonusXp} XP</span> لرصيدك
            </span>
          </div>
          <p className="text-xs text-slate-200 leading-relaxed">
            {challenge.explanation}
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {wrongIndex !== null && (
            <div
              role="status"
              className="flex items-center gap-2 text-xs font-bold text-rose-300"
            >
              <XCircle size={14} className="shrink-0" aria-hidden="true" />
              <span>إجابة غير صحيحة — راجع التلميح وحاول مرة أخرى.</span>
            </div>
          )}

          <div className="flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={() => setShowHint((prev) => !prev)}
              aria-expanded={showHint}
              className="min-h-[44px] text-xs font-semibold text-cyan-300 hover:text-cyan-200 flex items-center gap-1.5 transition-colors whitespace-nowrap"
            >
              <HelpCircle size={14} aria-hidden="true" />
              <span>{showHint ? 'إخفاء التلميح' : 'إظهار تلميح'}</span>
            </button>
            <span className="text-[11px] text-slate-400">
              اختر الإجابة الصحيحة لكسب النقاط
            </span>
          </div>

          {showHint && (
            <p className="text-xs text-slate-300 leading-relaxed bg-[#1A113E] border border-[#2D1F5E] rounded-2xl p-3">
              {challenge.hint}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
