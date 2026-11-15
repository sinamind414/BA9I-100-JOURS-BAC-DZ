import React, { useMemo, useState } from 'react';
import { ArrowUpLeft, NotebookPen, Trash2 } from 'lucide-react';
import { SUBJECT_META } from '../data/curriculum';
import { TaskDifficulty, TaskNote } from '../types/bac';
import {
  countNotesByDifficulty,
  DIFFICULTY_META,
  filterAndSortTaskNotes,
} from '../utils/taskNotes';

interface TaskNotesReviewWidgetProps {
  notes: Record<string, TaskNote>;
  onJumpToDay: (day: number) => void;
  onDeleteNote: (taskId: string) => void;
}

type FilterOption = 'all' | TaskDifficulty;

export function TaskNotesReviewWidget({
  notes,
  onJumpToDay,
  onDeleteNote,
}: TaskNotesReviewWidgetProps) {
  const [filter, setFilter] = useState<FilterOption>('all');

  const counts = useMemo(() => countNotesByDifficulty(notes), [notes]);
  const visibleNotes = useMemo(
    () => filterAndSortTaskNotes(notes, filter),
    [notes, filter]
  );

  const filterTabs: { id: FilterOption; label: string; count: number }[] = [
    { id: 'all', label: 'الكل', count: counts.total },
    { id: 'hard', label: 'صعب', count: counts.hard },
    { id: 'medium', label: 'متوسط', count: counts.medium },
    { id: 'easy', label: 'سهل', count: counts.easy },
  ];

  return (
    <section
      aria-label="سجل مذكرات صعوبة المهام"
      data-testid="task-notes-review-widget"
      className="bg-[#110B29] border border-[#2D1F5E] rounded-3xl p-5 space-y-4"
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <NotebookPen size={17} className="text-pink-400 shrink-0" aria-hidden="true" />
          <h2 className="font-extrabold text-sm text-white">
            مذكرات صعوبة المهام
          </h2>
        </div>
        <span className="text-xs text-slate-400">
          <strong className="font-mono-num text-cyan-300">{counts.total}</strong>{' '}
          مذكرة
        </span>
      </div>

      {/* Difficulty Filter Tabs */}
      <div
        role="tablist"
        aria-label="تصفية المذكرات حسب الصعوبة"
        className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-[#090617] border border-[#2D1F5E]"
      >
        {filterTabs.map((tab) => {
          const active = filter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setFilter(tab.id)}
              className={`min-h-[36px] px-2 py-1 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 flex items-center justify-center gap-1 ${
                active
                  ? 'bg-cyan-400 text-slate-950'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <span>{tab.label}</span>
              <span className="font-mono-num opacity-80">({tab.count})</span>
            </button>
          );
        })}
      </div>

      {/* Notes List or Empty State */}
      {visibleNotes.length === 0 ? (
        <p className="text-xs text-slate-400 leading-relaxed py-2">
          {counts.total === 0
            ? 'لا توجد مذكرات محفوظة بعد — اضغط «مذكرة» بجانب أي مهمة لتدوين الصعوبات ومراجعتها لاحقاً.'
            : 'لا توجد مذكرات في هذا التصنيف.'}
        </p>
      ) : (
        <ul className="divide-y divide-[#2D1F5E]/80 max-h-[320px] overflow-y-auto pr-0.5">
          {visibleNotes.map((note) => {
            const subjectMeta = SUBJECT_META[note.subject];
            const diffMeta = DIFFICULTY_META[note.difficulty];
            return (
              <li key={note.taskId} className="py-3 first:pt-1 last:pb-1 space-y-1.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-[11px] font-bold min-w-0">
                    <span className={subjectMeta.badgeTextClass}>
                      {subjectMeta.nameAr}
                    </span>
                    <span className="text-slate-600" aria-hidden="true">
                      ·
                    </span>
                    <span className={diffMeta.textClass}>
                      {diffMeta.labelAr}
                    </span>
                    <span className="text-slate-600" aria-hidden="true">
                      ·
                    </span>
                    <span className="text-slate-400">
                      اليوم{' '}
                      <span className="font-mono-num">
                        {String(note.day).padStart(2, '0')}
                      </span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => onJumpToDay(note.day)}
                      aria-label={`الانتقال إلى اليوم ${note.day} لمراجعة ${note.taskTitle}`}
                      className="min-h-[34px] px-2 rounded-lg text-[11px] font-bold text-cyan-300 hover:bg-[#1A113E] flex items-center gap-1 transition-colors whitespace-nowrap shrink-0"
                    >
                      <span>عرض</span>
                      <ArrowUpLeft size={12} aria-hidden="true" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeleteNote(note.taskId)}
                      aria-label={`حذف مذكرة ${note.taskTitle}`}
                      className="min-h-[34px] min-w-[34px] rounded-lg text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 flex items-center justify-center transition-colors shrink-0"
                    >
                      <Trash2 size={13} aria-hidden="true" />
                    </button>
                  </div>
                </div>

                <p className="text-xs font-semibold text-slate-300 truncate">
                  {note.taskTitle}
                </p>
                <p className="text-xs text-slate-100 leading-relaxed">
                  {note.text}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
