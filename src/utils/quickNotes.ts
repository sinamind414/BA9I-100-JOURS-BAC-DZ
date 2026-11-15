import { QuickNote, QuickNoteCategory } from '../types/bac';

export const QUICK_NOTE_CATEGORY_META: Record<
  QuickNoteCategory,
  {
    labelAr: string;
    pluralAr: string;
    badgeBgClass: string;
    badgeTextClass: string;
    borderClass: string;
    activePillClass: string;
  }
> = {
  idea: {
    labelAr: 'فكرة',
    pluralAr: 'أفكار',
    badgeBgClass: 'bg-cyan-500/15',
    badgeTextClass: 'text-cyan-300',
    borderClass: 'border-cyan-400/35',
    activePillClass: 'bg-cyan-400 text-slate-950',
  },
  question: {
    labelAr: 'سؤال',
    pluralAr: 'أسئلة',
    badgeBgClass: 'bg-pink-500/15',
    badgeTextClass: 'text-pink-300',
    borderClass: 'border-pink-400/35',
    activePillClass: 'bg-pink-500 text-slate-950',
  },
  reminder: {
    labelAr: 'تذكير',
    pluralAr: 'تذكيرات',
    badgeBgClass: 'bg-orange-500/15',
    badgeTextClass: 'text-orange-300',
    borderClass: 'border-orange-400/35',
    activePillClass: 'bg-orange-400 text-slate-950',
  },
};

export function isValidQuickNoteCategory(
  value: unknown
): value is QuickNoteCategory {
  return value === 'idea' || value === 'question' || value === 'reminder';
}

export function sanitizeQuickNotes(raw: unknown): QuickNote[] {
  if (!Array.isArray(raw)) return [];
  const seen = new Set<string>();
  const result: QuickNote[] = [];

  for (const item of raw) {
    if (!item || typeof item !== 'object') continue;
    const candidate = item as Partial<QuickNote>;
    if (typeof candidate.id !== 'string' || !candidate.id.trim()) continue;
    if (seen.has(candidate.id)) continue;
    if (typeof candidate.text !== 'string' || !candidate.text.trim()) continue;

    seen.add(candidate.id);
    const createdAt =
      typeof candidate.createdAt === 'string' && candidate.createdAt.trim()
        ? candidate.createdAt
        : new Date(0).toISOString();
    const updatedAt =
      typeof candidate.updatedAt === 'string' && candidate.updatedAt.trim()
        ? candidate.updatedAt
        : createdAt;

    result.push({
      id: candidate.id,
      text: candidate.text.trim(),
      category: isValidQuickNoteCategory(candidate.category)
        ? candidate.category
        : 'idea',
      pinned: Boolean(candidate.pinned),
      createdAt,
      updatedAt,
    });
  }

  return result;
}

export interface AddQuickNoteInput {
  text: string;
  category: QuickNoteCategory;
  pinned?: boolean;
  id?: string;
  now?: string;
}

export function addQuickNote(
  notes: QuickNote[],
  input: AddQuickNoteInput
): QuickNote[] {
  const trimmed = input.text.trim();
  if (!trimmed) return notes;

  const timestamp = input.now ?? new Date().toISOString();
  const noteId =
    input.id ??
    `qn-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

  const created: QuickNote = {
    id: noteId,
    text: trimmed,
    category: isValidQuickNoteCategory(input.category)
      ? input.category
      : 'idea',
    pinned: Boolean(input.pinned),
    createdAt: timestamp,
    updatedAt: timestamp,
  };

  return [created, ...notes];
}

export function togglePinQuickNote(
  notes: QuickNote[],
  id: string
): QuickNote[] {
  let changed = false;
  const next = notes.map((note) => {
    if (note.id !== id) return note;
    changed = true;
    return {
      ...note,
      pinned: !note.pinned,
    };
  });
  return changed ? next : notes;
}

export function removeQuickNote(notes: QuickNote[], id: string): QuickNote[] {
  const next = notes.filter((note) => note.id !== id);
  return next.length === notes.length ? notes : next;
}

export function filterAndSortQuickNotes(
  notes: QuickNote[],
  categoryFilter: 'all' | QuickNoteCategory
): QuickNote[] {
  const filtered = notes.filter((note) =>
    categoryFilter === 'all' ? true : note.category === categoryFilter
  );

  return [...filtered].sort((a, b) => {
    const pinDiff = Number(Boolean(b.pinned)) - Number(Boolean(a.pinned));
    if (pinDiff !== 0) return pinDiff;

    const updatedDiff =
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    if (!Number.isNaN(updatedDiff) && updatedDiff !== 0) {
      return updatedDiff;
    }

    const createdDiff =
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    if (!Number.isNaN(createdDiff) && createdDiff !== 0) {
      return createdDiff;
    }

    return b.id.localeCompare(a.id);
  });
}

export function countQuickNotesByCategory(notes: QuickNote[]): {
  total: number;
  idea: number;
  question: number;
  reminder: number;
} {
  let idea = 0;
  let question = 0;
  let reminder = 0;

  for (const note of notes) {
    if (note.category === 'question') question += 1;
    else if (note.category === 'reminder') reminder += 1;
    else idea += 1;
  }

  return {
    total: idea + question + reminder,
    idea,
    question,
    reminder,
  };
}
