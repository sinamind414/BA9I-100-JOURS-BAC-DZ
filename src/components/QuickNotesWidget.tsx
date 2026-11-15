import React, { useMemo, useState } from 'react';
import {
  ArrowUpLeft,
  Bookmark,
  Lightbulb,
  Pin,
  Plus,
  Trash2,
} from 'lucide-react';
import { QuickNote, QuickNoteCategory } from '../types/bac';
import {
  countQuickNotesByCategory,
  filterAndSortQuickNotes,
  QUICK_NOTE_CATEGORY_META,
} from '../utils/quickNotes';

interface QuickNotesWidgetProps {
  notes: QuickNote[];
  onAddNote: (payload: { text: string; category: QuickNoteCategory }) => void;
  onTogglePin: (id: string) => void;
  onDeleteNote: (id: string) => void;
  onOpenInProfile: () => void;
}

const CATEGORIES: QuickNoteCategory[] = ['idea', 'question', 'reminder'];

export function QuickNotesWidget({
  notes,
  onAddNote,
  onTogglePin,
  onDeleteNote,
  onOpenInProfile,
}: QuickNotesWidgetProps) {
  const [category, setCategory] = useState<QuickNoteCategory>('idea');
  const [text, setText] = useState('');
  const [error, setError] = useState('');

  const counts = useMemo(() => countQuickNotesByCategory(notes), [notes]);
  const sortedNotes = useMemo(
    () => filterAndSortQuickNotes(notes, 'all'),
    [notes]
  );
  const previewNotes = sortedNotes.slice(0, 3);
  const remainingCount = Math.max(0, sortedNotes.length - previewNotes.length);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) {
      setError('يرجى كتابة فكرة أو سؤال قبل الحفظ.');
      return;
    }
    setError('');
    onAddNote({ text: trimmed, category });
    setText('');
  };

  return (
    <section
      aria-label="الملاحظات السريعة والأفكار العشوائية"
      data-testid="quick-notes-widget"
      className="bg-[#110B29] border border-[#2D1F5E] rounded-3xl p-5 space-y-4"
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <Lightbulb size={17} className="text-cyan-400 shrink-0" aria-hidden="true" />
          <div className="min-w-0">
            <h2 className="font-extrabold text-sm text-white truncate">
              الملاحظات السريعة
            </h2>
            <p className="text-[11px] text-slate-400 truncate">
              أفكار وأسئلة عشوائية خارج المهام
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenInProfile}
          className="min-h-[36px] px-2.5 py-1 rounded-xl bg-[#1A113E] hover:bg-[#251854] border border-[#2D1F5E] text-cyan-300 text-xs font-bold flex items-center gap-1 transition-colors whitespace-nowrap shrink-0"
        >
          <span>في الملف</span>
          <span dir="ltr" className="font-mono-num text-pink-300">
            ({counts.total})
          </span>
          <ArrowUpLeft size={13} aria-hidden="true" />
        </button>
      </div>

      {/* Quick Capture Form */}
      <form onSubmit={handleSubmit} className="space-y-3" noValidate>
        <div
          role="group"
          aria-label="تصنيف الملاحظة السريعة"
          className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-[#090617] border border-[#2D1F5E]"
        >
          {CATEGORIES.map((cat) => {
            const active = category === cat;
            const meta = QUICK_NOTE_CATEGORY_META[cat];
            return (
              <button
                key={cat}
                type="button"
                aria-pressed={active}
                onClick={() => setCategory(cat)}
                className={`min-h-[36px] px-2 py-1 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
                  active
                    ? meta.activePillClass
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {meta.labelAr}
              </button>
            );
          })}
        </div>

        <div>
          <label htmlFor="dashboard-quick-note-input" className="sr-only">
            دوّن فكرة أو سؤالاً سريعاً
          </label>
          <textarea
            id="dashboard-quick-note-input"
            rows={2}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (error) setError('');
            }}
            placeholder="سؤال طارئ للأستاذ، فكرة ملخص، أو تذكير حر..."
            className="w-full px-3.5 py-2.5 rounded-2xl bg-[#090617] border border-[#2D1F5E] focus:border-cyan-400 focus:outline-none text-xs sm:text-sm text-white placeholder:text-slate-500 leading-relaxed resize-y"
          />
          {error && (
            <p role="alert" className="text-xs text-rose-400 font-semibold mt-1.5">
              {error}
            </p>
          )}
        </div>

        <button
          type="submit"
          className="w-full min-h-[42px] px-4 py-2 rounded-xl bg-gradient-to-l from-cyan-400 to-teal-300 hover:from-cyan-300 hover:to-teal-200 text-slate-950 text-xs sm:text-sm font-extrabold flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap"
        >
          <Plus size={15} strokeWidth={3} aria-hidden="true" />
          <span>حفظ الملاحظة السريعة</span>
        </button>
      </form>

      {/* Preview List */}
      {previewNotes.length === 0 ? (
        <p className="text-xs text-slate-400 leading-relaxed bg-[#1A113E]/60 border border-[#2D1F5E] rounded-2xl p-3">
          لا توجد ملاحظات سريعة بعد — دوّن أي سؤال أو فكرة تخطر ببالك وستجدها محفوظة هنا وفي ملفك الشخصي.
        </p>
      ) : (
        <div className="space-y-2">
          <ul className="divide-y divide-[#2D1F5E]/80">
            {previewNotes.map((note) => {
              const meta = QUICK_NOTE_CATEGORY_META[note.category];
              return (
                <li
                  key={note.id}
                  data-testid="quick-note-item"
                  className="py-2.5 first:pt-1 last:pb-1 space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold">
                      <span
                        className={`px-2 py-0.5 rounded-md border ${meta.badgeBgClass} ${meta.badgeTextClass} ${meta.borderClass}`}
                      >
                        {meta.labelAr}
                      </span>
                      {note.pinned && (
                        <span className="text-amber-300 flex items-center gap-0.5">
                          <Bookmark size={11} aria-hidden="true" />
                          <span>مثبّت</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={() => onTogglePin(note.id)}
                        aria-pressed={Boolean(note.pinned)}
                        aria-label={
                          note.pinned
                            ? `إلغاء تثبيت الملاحظة: ${note.text}`
                            : `تثبيت الملاحظة: ${note.text}`
                        }
                        className={`min-h-[34px] min-w-[34px] rounded-lg flex items-center justify-center transition-colors ${
                          note.pinned
                            ? 'text-amber-300 bg-amber-400/10'
                            : 'text-slate-400 hover:text-cyan-300 hover:bg-[#1A113E]'
                        }`}
                      >
                        <Pin size={13} aria-hidden="true" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteNote(note.id)}
                        aria-label={`حذف الملاحظة: ${note.text}`}
                        className="min-h-[34px] min-w-[34px] rounded-lg text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 flex items-center justify-center transition-colors"
                      >
                        <Trash2 size={13} aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-slate-100 leading-relaxed break-words">
                    {note.text}
                  </p>
                </li>
              );
            })}
          </ul>

          {remainingCount > 0 && (
            <button
              type="button"
              onClick={onOpenInProfile}
              className="w-full min-h-[36px] px-3 py-1.5 rounded-xl bg-[#1A113E] hover:bg-[#251854] border border-[#2D1F5E] text-xs font-bold text-slate-200 flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>
                عرض باقي الملاحظات (
                <span className="font-mono-num text-cyan-300">
                  +{remainingCount}
                </span>
                ) في الملف الشخصي
              </span>
            </button>
          )}
        </div>
      )}
    </section>
  );
}
