import React, { useState } from 'react';
import {
  ArrowUpLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Target,
} from 'lucide-react';
import { SUBJECT_META } from '../data/curriculum';
import {
  FocusPriorityTier,
  WeeklyReviewSummaryReport,
} from '../utils/weeklyReviewSummary';

interface WeeklyReviewSummaryWidgetProps {
  report: WeeklyReviewSummaryReport;
  onRegenerateFromStorage: () => void;
  onJumpToTask: (day: number, taskId: string) => void;
}

const PRIORITY_STYLE: Record<
  FocusPriorityTier,
  {
    labelAr: string;
    badgeClass: string;
    barClass: string;
    cardBorderClass: string;
  }
> = {
  high: {
    labelAr: 'تركيز عالٍ',
    badgeClass: 'bg-pink-500/20 text-pink-300 border-pink-400/45',
    barClass: 'bg-gradient-to-l from-pink-500 to-rose-400',
    cardBorderClass: 'border-pink-400/40',
  },
  medium: {
    labelAr: 'أولوية متوسطة',
    badgeClass: 'bg-orange-500/20 text-orange-300 border-orange-400/45',
    barClass: 'bg-gradient-to-l from-orange-400 to-amber-300',
    cardBorderClass: 'border-orange-400/35',
  },
  low: {
    labelAr: 'متابعة خفيفة',
    badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/40',
    barClass: 'bg-gradient-to-l from-cyan-400 to-teal-300',
    cardBorderClass: 'border-[#2D1F5E]',
  },
};

export function WeeklyReviewSummaryWidget({
  report,
  onRegenerateFromStorage,
  onJumpToTask,
}: WeeklyReviewSummaryWidgetProps) {
  const [expandedAll, setExpandedAll] = useState(false);

  const visibleSubjects = expandedAll
    ? report.focusSubjects
    : report.focusSubjects.slice(0, 3);
  const hiddenCount = Math.max(0, report.focusSubjects.length - 3);
  const topSubjectMeta = report.topFocusSubject
    ? SUBJECT_META[report.topFocusSubject.subject]
    : null;

  return (
    <section
      aria-label="ملخص المراجعة الأسبوعي — المواد التي تحتاج تركيزاً أكبر"
      data-testid="weekly-review-summary-widget"
      className="bg-[#110B29] border border-[#2D1F5E] rounded-3xl p-4 sm:p-5 space-y-4"
    >
      {/* Header & Regenerate CTA */}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center gap-2">
            <Target size={18} className="text-pink-400 shrink-0" aria-hidden="true" />
            <h2 className="text-sm sm:text-base font-extrabold text-white">
              ملخص المراجعة الأسبوعي — أولويات التركيز
            </h2>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            تحليل آخر{' '}
            <span className="font-mono-num text-slate-200 font-bold">
              {report.daysCount}
            </span>{' '}
            أيام (الأيام{' '}
            <span className="font-mono-num text-cyan-300 font-bold">
              {String(report.windowStartDay).padStart(2, '0')} -{' '}
              {String(report.windowEndDay).padStart(2, '0')}
            </span>
            ) بناءً على المهام غير المكتملة المحفوظة
          </p>
        </div>

        <button
          type="button"
          onClick={onRegenerateFromStorage}
          aria-label="توليد ملخص المراجعة الأسبوعي"
          className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-gradient-to-l from-pink-500/20 to-cyan-500/20 hover:from-pink-500/30 hover:to-cyan-500/30 border border-cyan-400/45 text-cyan-200 text-xs font-extrabold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
        >
          <RefreshCw size={14} aria-hidden="true" />
          <span>توليد ملخص جديد</span>
        </button>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div className="rounded-2xl bg-[#1A113E] border border-[#2D1F5E] px-3.5 py-2.5 space-y-0.5">
          <div className="text-[11px] text-slate-400">المادة الأولى للتركيز</div>
          <div className="text-sm font-extrabold text-pink-300 truncate">
            {topSubjectMeta ? topSubjectMeta.nameAr : 'جميع المواد مكتملة'}
          </div>
        </div>

        <div className="rounded-2xl bg-[#1A113E] border border-[#2D1F5E] px-3.5 py-2.5 space-y-0.5">
          <div className="text-[11px] text-slate-400">المهام المتبقية (7 أيام)</div>
          <div className="text-sm font-extrabold text-orange-300 font-mono-num">
            {report.incompleteTasks} من {report.totalTasks} مهمة
          </div>
        </div>

        <div className="rounded-2xl bg-[#1A113E] border border-[#2D1F5E] px-3.5 py-2.5 space-y-0.5">
          <div className="text-[11px] text-slate-400">نسبة إنجاز الفترة</div>
          <div
            dir="ltr"
            className="text-sm font-extrabold text-cyan-300 font-mono-num inline-block"
          >
            {report.completionPercent}%
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-200 leading-relaxed bg-[#090617] border border-[#2D1F5E] rounded-2xl px-3.5 py-2.5">
        {report.coachRecommendationAr}
      </p>

      {/* Priority Subjects or Mastered Empty State */}
      {report.focusSubjects.length === 0 ? (
        <div
          data-testid="weekly-review-all-complete"
          className="rounded-2xl bg-emerald-500/10 border border-emerald-400/35 p-4 flex items-center gap-3 text-emerald-200"
        >
          <CheckCircle2 size={20} className="text-emerald-300 shrink-0" aria-hidden="true" />
          <div className="space-y-0.5 text-xs sm:text-sm">
            <div className="font-extrabold">لا توجد مواد متأخرة في الأيام السبعة الماضية</div>
            <p className="text-emerald-200/80 text-xs">
              أكملت جميع المهام المبرمجة في هذه الفترة بنجاح. واصل التقدم لليوم التالي!
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleSubjects.map((item) => {
            const subjectMeta = SUBJECT_META[item.subject];
            const style = PRIORITY_STYLE[item.priorityTier];
            const previewTasks = item.sampleIncompleteTasks.slice(0, 2);
            const extraTasksCount = Math.max(
              0,
              item.sampleIncompleteTasks.length - previewTasks.length
            );

            return (
              <article
                key={item.subject}
                data-testid="weekly-review-subject-card"
                data-subject={item.subject}
                className={`rounded-2xl bg-[#1A113E] border ${style.cardBorderClass} p-3.5 sm:p-4 space-y-3`}
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className={`px-2.5 py-1 rounded-xl border text-xs font-extrabold ${subjectMeta.badgeBgClass} ${subjectMeta.badgeTextClass} ${subjectMeta.borderTintClass}`}
                    >
                      {subjectMeta.nameAr}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-lg border text-[11px] font-bold ${style.badgeClass}`}
                    >
                      {style.labelAr}
                    </span>
                    {item.isCoreSubject && (
                      <span className="text-[11px] font-semibold text-slate-400">
                        مادة أساسية
                      </span>
                    )}
                  </div>

                  <div className="text-xs font-bold text-slate-200 font-mono-num">
                    <span className="text-pink-300">{item.incompleteTasks}</span>{' '}
                    غير مكتملة (من {item.totalTasks})
                  </div>
                </div>

                {/* Progress / Gap Bar */}
                <div className="space-y-1">
                  <div className="w-full h-2 bg-[#090617] border border-[#2D1F5E] rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${style.barClass}`}
                      style={{ width: `${Math.max(8, item.incompletePercent)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>
                      نسبة النقص:{' '}
                      <span dir="ltr" className="inline-block font-mono-num text-slate-200 font-bold">
                        {item.incompletePercent}%
                      </span>
                    </span>
                    <span>
                      نقاط للاستدراك:{' '}
                      <span dir="ltr" className="inline-block font-mono-num text-cyan-300 font-bold">
                        +{item.incompleteXp} XP
                      </span>
                    </span>
                  </div>
                </div>

                {/* Actionable Incomplete Tasks */}
                <ul className="space-y-1.5">
                  {previewTasks.map((t) => (
                    <li key={t.taskId}>
                      <button
                        type="button"
                        onClick={() => onJumpToTask(t.day, t.taskId)}
                        className="w-full text-right px-3 py-2 rounded-xl bg-[#090617]/80 hover:bg-[#110B29] border border-[#2D1F5E] hover:border-cyan-400/50 flex items-center justify-between gap-2 text-xs transition-colors min-h-[38px]"
                      >
                        <div className="min-w-0 flex items-center gap-2">
                          <span className="font-mono-num font-bold text-cyan-300 shrink-0">
                            اليوم {String(t.day).padStart(2, '0')}
                          </span>
                          <span className="text-slate-600" aria-hidden="true">
                            ·
                          </span>
                          <span className="text-slate-200 truncate">{t.title}</span>
                        </div>
                        <span className="text-cyan-300 font-bold flex items-center gap-1 shrink-0 whitespace-nowrap">
                          <span>استدراك</span>
                          <ArrowUpLeft size={13} aria-hidden="true" />
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>

                {extraTasksCount > 0 && (
                  <div className="text-[11px] text-slate-400 pr-1">
                    و{' '}
                    <span className="font-mono-num text-slate-200 font-bold">
                      {extraTasksCount}
                    </span>{' '}
                    مهام أخرى متبقية في هذه المادة خلال الأيام السبعة الماضية.
                  </div>
                )}
              </article>
            );
          })}

          {hiddenCount > 0 && (
            <button
              type="button"
              onClick={() => setExpandedAll((v) => !v)}
              className="w-full min-h-[40px] px-4 py-2 rounded-xl bg-[#1A113E] hover:bg-[#251854] border border-[#2D1F5E] text-xs font-bold text-cyan-300 flex items-center justify-center gap-1.5 transition-colors"
            >
              {expandedAll ? (
                <>
                  <ChevronUp size={15} aria-hidden="true" />
                  <span>عرض أول 3 مواد فقط</span>
                </>
              ) : (
                <>
                  <ChevronDown size={15} aria-hidden="true" />
                  <span>عرض باقي المواد ({hiddenCount}+)</span>
                </>
              )}
            </button>
          )}
        </div>
      )}

      {/* Mastered Subjects Footer */}
      {report.masteredSubjects.length > 0 && report.focusSubjects.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-[#2D1F5E]/80 text-[11px] text-slate-300">
          <span className="text-emerald-300 font-bold flex items-center gap-1">
            <CheckCircle2 size={13} aria-hidden="true" />
            <span>مواد منجزة بالكامل في هذه الفترة:</span>
          </span>
          {report.masteredSubjects.map((subj) => (
            <span
              key={subj}
              className="px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-400/30 text-emerald-200 font-semibold"
            >
              {SUBJECT_META[subj].nameAr}
            </span>
          ))}
        </div>
      )}
    </section>
  );
}
