import { SubjectId, TaskDifficulty, TaskNote } from '../types/bac';

export const DIFFICULTY_META: Record<
  TaskDifficulty,
  { labelAr: string; textClass: string }
> = {
  easy: { labelAr: 'سهل', textClass: 'text-emerald-300' },
  medium: { labelAr: 'متوسط', textClass: 'text-amber-300' },
  hard: { labelAr: 'صعب', textClass: 'text-rose-300' },
};

export interface UpsertTaskNoteInput {
  taskId: string;
  day: number;
  subject: SubjectId;
  taskTitle: string;
  difficulty: TaskDifficulty;
  text: string;
  updatedAt?: string;
}

export function upsertTaskNote(
  notes: Record<string, TaskNote>,
  input: UpsertTaskNoteInput
): Record<string, TaskNote> {
  const trimmed = input.text.trim();
  if (!trimmed) {
    return notes;
  }

  return {
    ...notes,
    [input.taskId]: {
      taskId: input.taskId,
      day: input.day,
      subject: input.subject,
      taskTitle: input.taskTitle,
      difficulty: input.difficulty,
      text: trimmed,
      updatedAt: input.updatedAt ?? new Date().toISOString(),
    },
  };
}

export function removeTaskNote(
  notes: Record<string, TaskNote>,
  taskId: string
): Record<string, TaskNote> {
  if (!(taskId in notes)) return notes;
  const next = { ...notes };
  delete next[taskId];
  return next;
}

export function filterAndSortTaskNotes(
  notes: Record<string, TaskNote>,
  difficultyFilter: 'all' | TaskDifficulty
): TaskNote[] {
  const list = Object.values(notes).filter((note) =>
    difficultyFilter === 'all' ? true : note.difficulty === difficultyFilter
  );

  return list.sort((a, b) => {
    const timeDiff =
      new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    if (!Number.isNaN(timeDiff) && timeDiff !== 0) {
      return timeDiff;
    }
    return b.day - a.day;
  });
}

export function countNotesByDifficulty(notes: Record<string, TaskNote>): {
  total: number;
  hard: number;
  medium: number;
  easy: number;
} {
  let hard = 0;
  let medium = 0;
  let easy = 0;

  for (const note of Object.values(notes)) {
    if (note.difficulty === 'hard') hard += 1;
    else if (note.difficulty === 'medium') medium += 1;
    else easy += 1;
  }

  return {
    total: hard + medium + easy,
    hard,
    medium,
    easy,
  };
}
