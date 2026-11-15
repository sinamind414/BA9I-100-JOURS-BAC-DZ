import React, { useEffect, useState } from 'react';
import { Check, Trash2, X } from 'lucide-react';
import { StudyTask, TaskDifficulty, TaskNote } from '../types/bac';
import { DIFFICULTY_META } from '../utils/taskNotes';

interface TaskNoteEditorProps {
  task: StudyTask;
  existingNote?: TaskNote;
  onSave: (payload: {
    task: StudyTask;
    difficulty: TaskDifficulty;
    text: string;
  }) => void;
  onDelete?: (taskId: string) => void;
  onCancel: () => void;
}

const DIFFICULTY_OPTIONS: TaskDifficulty[] = ['easy', 'medium', 'hard'];

export function TaskNoteEditor({
  task,
  existingNote,
  onSave,
  onDelete,
  onCancel,
}: TaskNoteEditorProps) {
  const [difficulty, setDifficulty] = useState<TaskDifficulty>(
    existingNote?.difficulty ?? 'medium'
  );
  const [text, setText] = useState<string>(existingNote?.text ?? '');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    setDifficulty(existingNote?.difficulty ?? 'medium');
    setText(existingNote?.text ?? '');
    setError('');
  }, [task.id, existingNote]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) {
      setError('يرجى كتابة ملاحظة قصيرة قبل الحفظ.');
      return;
    }
    setError('');
    onSave({
      task,
      difficulty,
      text: text.trim(),
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      aria-label={`محرر مذكرة مهمة ${task.title}`}
      className="mt-2 p-3.5 rounded-2xl bg-[#1A113E] border border-[#2D1F5E] space-y-3"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-bold text-slate-200">
          تقييم صعوبة المهمة:
        </span>
        <div
          className="flex items-center gap-1 p-1 rounded-xl bg-[#090617] border border-[#2D1F5E]"
          role="group"
          aria-label="مستوى صعوبة المهمة"
        >
          {DIFFICULTY_OPTIONS.map((level) => {
            const active = difficulty === level;
            const meta = DIFFICULTY_META[level];
            return (
              <button
                key={level}
                type="button"
                aria-pressed={active}
                onClick={() => setDifficulty(level)}
                className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                  active
                    ? level === 'hard'
                      ? 'bg-pink-500 text-slate-950'
                      : level === 'medium'
                      ? 'bg-orange-400 text-slate-950'
                      : 'bg-emerald-400 text-slate-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {meta.labelAr}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label htmlFor={`note-input-${task.id}`} className="sr-only">
          ملاحظة حول صعوبة المهمة
        </label>
        <textarea
          id={`note-input-${task.id}`}
          rows={2}
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (error) setError('');
          }}
          placeholder="دوّن سريعاً النقاط الصعبة، القانون الذي أخطأت فيه، أو ما يحتاج إعادة..."
          className="w-full px-3.5 py-2.5 rounded-xl bg-[#090617] border border-[#2D1F5E] focus:border-cyan-400 focus:outline-none text-xs sm:text-sm text-white placeholder:text-slate-500 leading-relaxed resize-y"
        />
        {error && (
          <p role="alert" className="text-xs text-rose-400 font-semibold mt-1">
            {error}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {existingNote && onDelete && (
            <button
              type="button"
              onClick={() => onDelete(task.id)}
              className="min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-semibold text-rose-300 hover:bg-rose-500/15 flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
            >
              <Trash2 size={14} aria-hidden="true" />
              <span>حذف</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-[#110B29] hover:bg-[#251854] border border-[#2D1F5E] text-slate-300 text-xs font-semibold flex items-center gap-1 transition-colors whitespace-nowrap shrink-0"
          >
            <X size={14} aria-hidden="true" />
            <span>إلغاء</span>
          </button>
          <button
            type="submit"
            className="min-h-[40px] px-4 py-1.5 rounded-xl bg-gradient-to-l from-cyan-400 to-teal-300 hover:from-cyan-300 hover:to-teal-200 text-slate-950 text-xs font-extrabold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
          >
            <Check size={14} strokeWidth={3} aria-hidden="true" />
            <span>حفظ المذكرة</span>
          </button>
        </div>
      </div>
    </form>
  );
}
