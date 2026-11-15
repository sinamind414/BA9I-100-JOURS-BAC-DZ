import React from 'react';
import { ArrowUpLeft, BellRing, Clock, X } from 'lucide-react';
import { SUBJECT_META } from '../data/curriculum';
import { OverdueTasksSummary } from '../utils/overdueReminders';

interface OverdueTasksModalProps {
  open: boolean;
  summary: OverdueTasksSummary;
  onJumpToTask: (day: number, taskId: string) => void;
  onDismissForToday: () => void;
}

export function OverdueTasksModal({
  open,
  summary,
  onJumpToTask,
  onDismissForToday,
}: OverdueTasksModalProps) {
  if (!open || summary.totalOverdueCount === 0) return null;

  const primaryTarget = summary.firstOverdueTarget;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="overdue-modal-title"
      data-testid="overdue-tasks-modal"
      className="fixed inset-0 z-50 bg-[#050311]/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="w-full max-w-xl max-h-[88vh] flex flex-col bg-[#110B29] border border-[#2D1F5E] rounded-3xl p-5 sm:p-6 space-y-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-3 border-b border-[#2D1F5E]">
          <div className="flex items-start gap-3 min-w-0">
            <img
              src="/assets/coach/ba9i-clock-rush.png"
              alt="الكوتش باقي ينبهك للمهام المتأخرة"
              className="w-12 h-12 object-contain shrink-0"
              referrerPolicy="no-referrer"
            />
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-bold text-orange-300">
                <BellRing size={13} aria-hidden="true" />
                <span>تنبيه الكوتش BA9I · بداية اليوم</span>
              </div>
              <h2
                id="overdue-modal-title"
                className="text-base sm:text-lg font-extrabold text-white leading-snug"
              >
                لديك{' '}
                <span className="font-mono-num text-orange-300">
                  {summary.totalOverdueCount}
                </span>{' '}
                {summary.totalOverdueCount === 1
                  ? 'مهمة متأخرة'
                  : 'مهام متأخرة'}{' '}
                من{' '}
                <span className="font-mono-num text-cyan-300">
                  {summary.overdueDaysCount}
                </span>{' '}
                {summary.overdueDaysCount === 1 ? 'يوم سابق' : 'أيام سابقة'}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onDismissForToday}
            aria-label="إغلاق تذكير المهام المتأخرة"
            className="min-h-[44px] min-w-[44px] rounded-xl bg-[#1A113E] hover:bg-[#251854] border border-[#2D1F5E] text-slate-300 flex items-center justify-center shrink-0 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
          تدارك التراكمات مبكراً يحافظ على وتيرة التحضير للبكالوريا. يمكنك الانتقال مباشرة إلى أي مهمة متأخرة وإنجازها الآن.
        </p>

        {/* Scrollable Overdue Days & Tasks List */}
        <div className="overflow-y-auto divide-y divide-[#2D1F5E]/90 pr-0.5 flex-1">
          {summary.days.map((group) => (
            <div key={group.day} className="py-3.5 first:pt-1 last:pb-1 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-white">
                    <span className="text-cyan-300 font-mono-num">
                      اليوم {String(group.day).padStart(2, '0')}
                    </span>
                    <span className="text-slate-600" aria-hidden="true">
                      ·
                    </span>
                    <span className="text-slate-400 font-semibold">
                      <span className="font-mono-num">{group.count}</span>{' '}
                      متأخرة
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {group.dayTitle}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    onJumpToTask(group.day, group.overdueTasks[0].id)
                  }
                  className="min-h-[36px] px-3 py-1 rounded-xl bg-[#1A113E] hover:bg-[#251854] border border-[#2D1F5E] text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
                >
                  <span>فتح اليوم</span>
                  <ArrowUpLeft size={13} aria-hidden="true" />
                </button>
              </div>

              <ul className="space-y-1.5">
                {group.overdueTasks.map((task) => {
                  const meta = SUBJECT_META[task.subject];
                  return (
                    <li
                      key={task.id}
                      className="flex items-center justify-between gap-3 px-3 py-2 rounded-2xl bg-[#1A113E]/85 border border-[#2D1F5E]"
                    >
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold">
                          <span className={meta.badgeTextClass}>
                            {meta.nameAr}
                          </span>
                          <span className="text-slate-600" aria-hidden="true">
                            ·
                          </span>
                          <span className="font-mono-num text-slate-400">
                            +{task.xp} XP
                          </span>
                        </div>
                        <p className="text-xs text-slate-100 leading-snug line-clamp-2">
                          {task.title}
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => onJumpToTask(group.day, task.id)}
                        aria-label={`الانتقال إلى مهمة ${task.title} في اليوم ${group.day}`}
                        className="min-h-[36px] px-2.5 py-1 rounded-xl bg-pink-500/15 hover:bg-pink-500/25 border border-pink-400/45 text-pink-200 text-xs font-bold flex items-center gap-1 transition-colors whitespace-nowrap shrink-0"
                      >
                        <span>انتقال</span>
                        <ArrowUpLeft size={13} aria-hidden="true" />
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-[#2D1F5E] flex flex-col-reverse sm:flex-row sm:items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={onDismissForToday}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-[#1A113E] hover:bg-[#251854] border border-[#2D1F5E] text-slate-300 text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
          >
            <Clock size={15} aria-hidden="true" />
            <span>تأجيل لوقت لاحق</span>
          </button>

          {primaryTarget && (
            <button
              type="button"
              onClick={() =>
                onJumpToTask(primaryTarget.day, primaryTarget.taskId)
              }
              className="min-h-[44px] px-5 py-2 rounded-xl bg-gradient-to-l from-cyan-400 to-teal-300 hover:from-cyan-300 hover:to-teal-200 text-slate-950 text-xs sm:text-sm font-extrabold flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
            >
              <span>
                الانتقال مباشرة إلى اليوم{' '}
                {String(primaryTarget.day).padStart(2, '0')}
              </span>
              <ArrowUpLeft size={16} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

interface OverdueReminderToastProps {
  visible: boolean;
  summary: OverdueTasksSummary;
  onJumpToFirstOverdue: () => void;
  onOpenModal: () => void;
  onClose: () => void;
}

export function OverdueReminderToast({
  visible,
  summary,
  onJumpToFirstOverdue,
  onOpenModal,
  onClose,
}: OverdueReminderToastProps) {
  if (!visible || summary.totalOverdueCount === 0 || !summary.firstOverdueTarget) {
    return null;
  }

  return (
    <div
      role="status"
      aria-live="polite"
      data-testid="overdue-reminder-toast"
      className="fixed bottom-20 lg:bottom-6 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md z-40 bg-[#110B29] border border-orange-400/55 rounded-2xl p-3.5 shadow-2xl flex items-center justify-between gap-3"
    >
      <div className="flex items-center gap-2.5 min-w-0 flex-1">
        <img
          src="/assets/coach/ba9i-clock-rush.png"
          alt=""
          aria-hidden="true"
          className="w-10 h-10 object-contain shrink-0"
          referrerPolicy="no-referrer"
        />
        <div className="min-w-0">
          <div className="text-xs font-extrabold text-white truncate">
            الكوتش BA9I: لديك{' '}
            <span className="font-mono-num text-orange-300">
              {summary.totalOverdueCount}
            </span>{' '}
            مهام متأخرة بانتظارك
          </div>
          <button
            type="button"
            onClick={onOpenModal}
            className="text-[11px] font-semibold text-cyan-300 hover:underline mt-0.5"
          >
            عرض القائمة الكاملة
          </button>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={onJumpToFirstOverdue}
          className="min-h-[38px] px-3 py-1.5 rounded-xl bg-gradient-to-l from-cyan-400 to-teal-300 hover:from-cyan-300 hover:to-teal-200 text-slate-950 text-xs font-extrabold flex items-center gap-1 transition-colors whitespace-nowrap"
        >
          <span>انتقال سريع</span>
          <ArrowUpLeft size={13} aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={onClose}
          aria-label="إخفاء الإشعار"
          className="min-h-[38px] min-w-[38px] rounded-xl text-slate-400 hover:text-white hover:bg-[#1A113E] flex items-center justify-center transition-colors"
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
