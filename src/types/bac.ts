export type BranchId =
  | 'sciences'
  | 'math'
  | 'tech_math'
  | 'gestion'
  | 'lettres'
  | 'langues';

export type SubjectId =
  | 'physics'
  | 'science'
  | 'math'
  | 'arabic'
  | 'philosophy'
  | 'history'
  | 'islamic'
  | 'french'
  | 'english';

export type TabId = 'quests' | 'focus' | 'thunder' | 'ranking';

export interface BranchInfo {
  id: BranchId;
  nameAr: string;
  shortAr: string;
  tagline: string;
  coreSubjects: SubjectId[];
}

export interface ExamRef {
  id: string;
  label: string;
  year: number;
  branchLabel: string;
  subject: SubjectId;
  title: string;
  summary: string;
  keyFormulas: string[];
  solutionSteps: string[];
}

export interface StudyTask {
  id: string;
  day: number;
  subject: SubjectId;
  title: string;
  xp: number;
  isSpacedCandidate?: boolean;
  examIds?: string[];
}

export interface DayPlan {
  day: number;
  title: string;
  morningRecallText: string;
  eveningReviewText: string;
  tasks: StudyTask[];
  isFromBook?: boolean;
}

export interface SpacedReviewItem {
  reviewId: string;
  sourceTaskId: string;
  sourceDay: number;
  dueDay: number;
  intervalDays: number;
  subject: SubjectId;
  title: string;
}

export interface SubjectMeta {
  id: SubjectId;
  nameAr: string;
  accentHex: string;
  badgeBgClass: string;
  badgeTextClass: string;
  borderTintClass: string;
  shortCode: string;
}

export interface MethodologyGuide {
  subject: SubjectId;
  titleAr: string;
  steps: string[];
  thunderTips: string[];
  keyResources: string[];
}

export interface WeeklyReward {
  week: number;
  title: string;
  genreAr: string;
  releaseYear: number;
  vibeTag: string;
  posterAlt: string;
  posterUrl: string;
  category: string;
  subtitle: string;
  description: string;
  highlightNote: string;
}

export interface ExamWeekDay {
  id: string;
  dayName: string;
  title: string;
  checklist: string[];
  closingNote?: string;
}

export interface WilayaRank {
  code: number;
  nameAr: string;
  baseXp: number;
  studentsCount: number;
}

export interface HallOfFameEntry {
  id: string;
  studentName: string;
  bacAverage: string;
  branchAr: string;
  daysUsed: string;
  quote: string;
}

export type ReadinessLevel = 'panic' | 'steady' | 'advanced';

export interface UserProfile {
  name: string;
  branch: BranchId;
  targetAverage: number;
  wilayaCode: number;
  readiness: ReadinessLevel;
  onboarded: boolean;
  avatarUrl?: string;
}

export interface ContestSubmission {
  fullName: string;
  phone: string;
  address: string;
  bacAverage: string;
  registrationNumber: string;
  submittedAt: string;
}

export type TaskDifficulty = 'easy' | 'medium' | 'hard';

export interface TaskNote {
  taskId: string;
  day: number;
  subject: SubjectId;
  taskTitle: string;
  difficulty: TaskDifficulty;
  text: string;
  updatedAt: string;
}

export type QuickNoteCategory = 'idea' | 'question' | 'reminder';

export interface QuickNote {
  id: string;
  text: string;
  category: QuickNoteCategory;
  pinned?: boolean;
  createdAt: string;
  updatedAt: string;
}

