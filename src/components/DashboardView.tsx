import React, { useEffect, useState } from 'react';
import {
  Award,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  FileText,
  Film,
  Gift,
  Lightbulb,
  Lock,
  Moon,
  RefreshCw,
  Sparkles,
  StickyNote,
  Sun,
  Timer,
} from 'lucide-react';
import {
  ALPHA_DARIJA_TIPS,
  getWeeklyReward,
  PAST_EXAMS_BANK,
  SUBJECT_META,
} from '../data/curriculum';
import { getWeeklyMoviePosterSrc } from '../data/moviePosters';
import {
  BranchId,
  DayPlan,
  ExamRef,
  QuickNote,
  QuickNoteCategory,
  SpacedReviewItem,
  StudyTask,
  SubjectId,
  TaskDifficulty,
  TaskNote,
} from '../types/bac';
import {
  AvatarStage,
  DayProgress,
  getEveningReviewId,
  getMorningRecallId,
  TOTAL_CHALLENGE_DAYS,
  UserStats,
  WeekRewardStatus,
} from '../utils/spacedRepetition';
import {
  COACH_BA9I_POSES,
  CoachState,
  getCoachBa9iDashboardState,
} from '../utils/coachBa9i';
import { EvaluatedBadge } from '../utils/badges';
import { DIFFICULTY_META } from '../utils/taskNotes';
import { WeeklyReviewSummaryReport } from '../utils/weeklyReviewSummary';
import { BadgesShowcase } from './BadgesShowcase';
import { CoachBa9iHero } from './CoachBa9iHero';
import { CompletionChartWidget } from './CompletionChartWidget';
import { DailyChallengeWidget } from './DailyChallengeWidget';
import { QuickNotesWidget } from './QuickNotesWidget';
import { EvolvingAvatar, SubjectHeader } from './SubjectBadge';
import { TaskNoteEditor } from './TaskNoteEditor';
import { TaskNotesReviewWidget } from './TaskNotesReviewWidget';
import { WeeklyAchievementsWidget } from './WeeklyAchievementsWidget';
import { WeeklyCalendarWidget } from './WeeklyCalendarWidget';
import { WeeklyProgressBarWidget } from './WeeklyProgressBarWidget';
import { WeeklyReviewSummaryWidget } from './WeeklyReviewSummaryWidget';

interface DashboardViewProps {
  currentDay: number;
  branch: BranchId;
  studentName: string;
  avatarUrl?: string;
  dayPlan: DayPlan;
  dayProgress: DayProgress;
  dueReviews: SpacedReviewItem[];
  completedTaskIds: ReadonlySet<string>;
  completedExtraIds: ReadonlySet<string>;
  solvedChallengeDays: ReadonlySet<number>;
  taskNotes: Record<string, TaskNote>;
  quickNotes: QuickNote[];
  weeklyReviewReport: WeeklyReviewSummaryReport;
  highlightedTaskId?: string | null;
  stats: UserStats;
  avatarStage: AvatarStage;
  weekStatus: WeekRewardStatus;
  badges: EvaluatedBadge[];
  focusMinutesTotal: number;
  highlightedBadgeId?: string | null;
  overdueCount: number;
  onChangeDay: (day: number) => void;
  onJumpToTask: (day: number, taskId: string) => void;
  onRegenerateWeeklyReview: () => void;
  onOpenDayMap: () => void;
  onOpenProfile: () => void;
  onOpenQuickNotesInProfile: () => void;
  onOpenWeeklyMovies: () => void;
  onOpenOverdue: () => void;
  onStartFocusNow: () => void;
  onToggleTask: (taskId: string) => void;
  onToggleExtra: (extraId: string) => void;
  onSolveChallenge: (day: number, bonusXp: number) => void;
  onSaveTaskNote: (payload: {
    task: StudyTask;
    difficulty: TaskDifficulty;
    text: string;
  }) => void;
  onDeleteTaskNote: (taskId: string) => void;
  onAddQuickNote: (payload: { text: string; category: QuickNoteCategory }) => void;
  onTogglePinQuickNote: (id: string) => void;
  onDeleteQuickNote: (id: string) => void;
  onStartFocusWithTask: (task: StudyTask) => void;
  onOpenExam: (exam: ExamRef) => void;
  onOpenSubjectGuide: (subject: SubjectId) => void;
}

export function DashboardView({
  currentDay,
  branch,
  studentName,
  avatarUrl,
  dayPlan,
  dayProgress,
  dueReviews,
  completedTaskIds,
  completedExtraIds,
  solvedChallengeDays,
  taskNotes,
  quickNotes,
  weeklyReviewReport,
  highlightedTaskId,
  stats,
  avatarStage,
  weekStatus,
  badges,
  focusMinutesTotal,
  highlightedBadgeId,
  overdueCount,
  onChangeDay,
  onJumpToTask,
  onRegenerateWeeklyReview,
  onOpenDayMap,
  onOpenProfile,
  onOpenQuickNotesInProfile,
  onOpenWeeklyMovies,
  onOpenOverdue,
  onStartFocusNow,
  onToggleTask,
  onToggleExtra,
  onSolveChallenge,
  onSaveTaskNote,
  onDeleteTaskNote,
  onAddQuickNote,
  onTogglePinQuickNote,
  onDeleteQuickNote,
  onStartFocusWithTask,
  onOpenExam,
  onOpenSubjectGuide,
}: DashboardViewProps) {
  const [openNoteTaskId, setOpenNoteTaskId] = useState<string | null>(null);

  useEffect(() => {
    setOpenNoteTaskId(null);
  }, [currentDay]);

  useEffect(() => {
    if (!highlightedTaskId) return;
    const timer = window.setTimeout(() => {
      const target = document.querySelector<HTMLElement>(
        `[data-task-id="${highlightedTaskId}"]`
      );
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 80);
    return () => window.clearTimeout(timer);
  }, [highlightedTaskId, currentDay]);

  useEffect(() => {
    if (!highlightedBadgeId) return;
    const timer = window.setTimeout(() => {
      const section = document.getElementById('badges-showcase');
      if (section) {
        section.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 80);
    return () => window.clearTimeout(timer);
  }, [highlightedBadgeId]);

  const morningId = getMorningRecallId(currentDay);
  const eveningId = getEveningReviewId(currentDay);
  const morningDone = completedExtraIds.has(morningId);
  const eveningDone = completedExtraIds.has(eveningId);

  const weekReward = getWeeklyReward(weekStatus.week);
  const dailyCoachTip =
    ALPHA_DARIJA_TIPS[(currentDay - 1) % ALPHA_DARIJA_TIPS.length];

  const completedTasksTodayCount = dayPlan.tasks.filter((t) =>
    completedTaskIds.has(t.id)
  ).length;
  const coachState = getCoachBa9iDashboardState({
    studentName,
    currentDay,
    daysRemaining: stats.daysRemaining,
    dayPercent: dayProgress.percent,
    streakDays: stats.streakDays,
    overdueCount,
    completedTasksToday: completedTasksTodayCount,
    totalTasksToday: dayPlan.tasks.length,
    challengeSolved: solvedChallengeDays.has(currentDay),
  });

  const handleCoachAction = (action: CoachState['actionType']) => {
    if (action === 'overdue') {
      onOpenOverdue();
    } else if (action === 'challenge') {
      document
        .getElementById('daily-challenge-widget')
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else if (action === 'next-day') {
      onChangeDay(Math.min(TOTAL_CHALLENGE_DAYS, currentDay + 1));
    } else {
      onStartFocusNow();
    }
  };

  // Group tasks by subject preserving day order
  const groupedSubjects: { subject: SubjectId; tasks: StudyTask[] }[] = [];
  for (const task of dayPlan.tasks) {
    const existing = groupedSubjects.find((g) => g.subject === task.subject);
    if (existing) {
      existing.tasks.push(task);
    } else {
      groupedSubjects.push({ subject: task.subject, tasks: [task] });
    }
  }

  return (
    <div className="space-y-6">
      {/* Coach BA9I Hero Countdown & MODE FOCUS CTA */}
      <CoachBa9iHero
        currentDay={currentDay}
        dayTitle={dayPlan.title}
        daysRemaining={stats.daysRemaining}
        dayPercent={dayProgress.percent}
        streakDays={stats.streakDays}
        coach={coachState}
        onChangeDay={onChangeDay}
        onOpenDayMap={onOpenDayMap}
        onCoachAction={handleCoachAction}
        onStartFocusNow={onStartFocusNow}
      />

      {/* Weekly Highlights / Achievements (Colorful Cards) */}
      <WeeklyAchievementsWidget
        currentDay={currentDay}
        branch={branch}
        completedTaskIds={completedTaskIds}
        completedExtraIds={completedExtraIds}
        solvedChallengeDays={solvedChallengeDays}
        onSelectDay={onChangeDay}
        onOpenWeeklyMovies={onOpenWeeklyMovies}
      />

      {/* Main 2-Column Workspace on Desktop, Single Stream on Mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Primary Quests Column */}
        <div className="lg:col-span-8 space-y-5">
          {/* Recharts Daily Completion Trend Widget */}
          <CompletionChartWidget
            currentDay={currentDay}
            branch={branch}
            completedTaskIds={completedTaskIds}
            completedExtraIds={completedExtraIds}
            onSelectDay={onChangeDay}
          />

          {/* Recharts 100-Day Weekly Completed Tasks Bar Chart */}
          <WeeklyProgressBarWidget
            currentDay={currentDay}
            branch={branch}
            completedTaskIds={completedTaskIds}
            completedExtraIds={completedExtraIds}
            onSelectDay={onChangeDay}
          />

          {/* Weekly Visual Calendar (Completed vs Remaining + Color Coding) */}
          <WeeklyCalendarWidget
            currentDay={currentDay}
            branch={branch}
            completedTaskIds={completedTaskIds}
            completedExtraIds={completedExtraIds}
            onSelectDay={onChangeDay}
            onToggleTask={onToggleTask}
            onToggleExtra={onToggleExtra}
          />

          {/* Weekly Review Summary (Subjects Needing Focus from localStorage) */}
          <WeeklyReviewSummaryWidget
            report={weeklyReviewReport}
            onRegenerateFromStorage={onRegenerateWeeklyReview}
            onJumpToTask={onJumpToTask}
          />

          {/* Morning Active Recall */}
          <div className="bg-[#110B29] border border-[#2D1F5E] rounded-3xl p-4 sm:p-5">
            <button
              type="button"
              onClick={() => onToggleExtra(morningId)}
              className="w-full text-right flex items-start gap-3.5 min-h-[44px]"
            >
              <span
                className={`w-6 h-6 mt-0.5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                  morningDone
                    ? 'bg-emerald-400 border-emerald-300 text-slate-950'
                    : 'border-slate-500 text-transparent'
                }`}
                aria-hidden="true"
              >
                <Check size={14} strokeWidth={3} />
              </span>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 text-xs text-orange-300 font-bold">
                  <Sun size={14} aria-hidden="true" />
                  <span>مهمة الصباح (Active Recall)</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono-num text-slate-400">+15 XP</span>
                </div>
                <p
                  className={`text-sm leading-relaxed ${
                    morningDone ? 'line-through text-slate-400' : 'text-slate-100'
                  }`}
                >
                  {dayPlan.morningRecallText}
                </p>
              </div>
            </button>
          </div>

          {/* Subject Quest Cards */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <h2 className="text-base font-extrabold text-white">
                المهام الأساسية لليوم {String(currentDay).padStart(2, '0')}
              </h2>
              <span className="text-xs text-slate-400 font-mono-num">
                {dayProgress.completedCount} / {dayProgress.totalCount} مكتمل
              </span>
            </div>

            {groupedSubjects.map(({ subject, tasks }) => {
              const meta = SUBJECT_META[subject];
              return (
                <article
                  key={subject}
                  className="bg-[#110B29] border border-[#2D1F5E] rounded-3xl p-5 space-y-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <SubjectHeader
                      subject={subject}
                      extraText={`${tasks.length} ${
                        tasks.length === 1 ? 'مهمة' : 'مهام'
                      } · ${tasks.reduce((sum, t) => sum + t.xp, 0)} XP`}
                    />
                    <button
                      type="button"
                      onClick={() => onOpenSubjectGuide(subject)}
                      className="min-h-[40px] px-3 py-1.5 rounded-xl bg-[#1A113E] hover:bg-[#251854] border border-[#2D1F5E] text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
                    >
                      <Lightbulb size={14} className="text-cyan-400" aria-hidden="true" />
                      <span>كيف أدرسها؟</span>
                    </button>
                  </div>

                  <div className="divide-y divide-[#2D1F5E]/80">
                    {tasks.map((task) => {
                      const done = completedTaskIds.has(task.id);
                      const existingNote = taskNotes[task.id];
                      const isNoteOpen = openNoteTaskId === task.id;
                      const isHighlighted = highlightedTaskId === task.id;
                      const diffMeta = existingNote
                        ? DIFFICULTY_META[existingNote.difficulty]
                        : null;
                      return (
                        <div
                          key={task.id}
                          data-task-id={task.id}
                          className={`py-3 first:pt-1 last:pb-0 space-y-2.5 transition-all ${
                            isHighlighted
                              ? 'ring-2 ring-cyan-400/80 bg-cyan-400/5 rounded-2xl px-2.5'
                              : ''
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                            <button
                              type="button"
                              onClick={() => onToggleTask(task.id)}
                              className="flex items-start gap-3 text-right flex-1 min-h-[44px] py-1"
                            >
                              <span
                                className={`w-6 h-6 mt-0.5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                                  done
                                    ? 'bg-emerald-400 border-emerald-300 text-slate-950'
                                    : 'border-slate-500 text-transparent hover:border-cyan-400'
                                }`}
                                aria-hidden="true"
                              >
                                <Check size={14} strokeWidth={3} />
                              </span>
                              <div className="space-y-1 flex-1">
                                <span
                                  className={`block text-sm font-medium leading-relaxed ${
                                    done
                                      ? 'line-through text-slate-400'
                                      : 'text-slate-100'
                                  }`}
                                >
                                  {task.title}
                                </span>
                                <span className="block text-xs text-slate-400 font-mono-num">
                                  +{task.xp} XP
                                  {task.isSpacedCandidate
                                    ? ' · جدولة تلقائية (J+1, J+3, J+7, J+15, J+30)'
                                    : ''}
                                </span>
                              </div>
                            </button>

                            <div className="flex items-center gap-2 shrink-0 pr-9 sm:pr-0">
                              <button
                                type="button"
                                onClick={() =>
                                  setOpenNoteTaskId(isNoteOpen ? null : task.id)
                                }
                                aria-expanded={isNoteOpen}
                                aria-label={
                                  existingNote
                                    ? `تعديل مذكرة مهمة ${task.title}`
                                    : `كتابة مذكرة لمهمة ${task.title}`
                                }
                                className={`min-h-[40px] px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${
                                  existingNote || isNoteOpen
                                    ? 'bg-pink-500/15 border-pink-400/50 text-pink-300'
                                    : 'bg-[#1A113E] hover:bg-[#251854] border-[#2D1F5E] text-slate-200'
                                }`}
                              >
                                <StickyNote size={14} aria-hidden="true" />
                                <span>{existingNote ? 'مذكرة ✓' : 'مذكرة'}</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => onStartFocusWithTask(task)}
                                aria-label={`ابدأ مؤقت التركيز لمهمة ${task.title}`}
                                className={`min-h-[40px] px-3 py-1.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 ${meta.badgeBgClass} ${meta.badgeTextClass} ${meta.borderTintClass} hover:opacity-90`}
                              >
                                <Timer size={14} aria-hidden="true" />
                                <span>تركيز</span>
                              </button>
                            </div>
                          </div>

                          {/* Saved Note Inline Preview */}
                          {existingNote && !isNoteOpen && diffMeta && (
                            <div className="pr-9 flex flex-wrap items-baseline gap-x-2 gap-y-0.5 text-xs leading-relaxed">
                              <span className={`font-bold ${diffMeta.textClass}`}>
                                {diffMeta.labelAr}
                              </span>
                              <span className="text-slate-600" aria-hidden="true">
                                ·
                              </span>
                              <span className="text-slate-300">
                                {existingNote.text}
                              </span>
                            </div>
                          )}

                          {/* Inline Quick Note Editor */}
                          {isNoteOpen && (
                            <div className="sm:pr-9">
                              <TaskNoteEditor
                                task={task}
                                existingNote={existingNote}
                                onSave={(payload) => {
                                  onSaveTaskNote(payload);
                                  setOpenNoteTaskId(null);
                                }}
                                onDelete={(id) => {
                                  onDeleteTaskNote(id);
                                  setOpenNoteTaskId(null);
                                }}
                                onCancel={() => setOpenNoteTaskId(null)}
                              />
                            </div>
                          )}

                          {/* Clickable Past Bac Exam Papers */}
                          {task.examIds && task.examIds.length > 0 && (
                            <div className="flex flex-wrap items-center gap-2 pr-9">
                              {task.examIds.map((examId) => {
                                const exam = PAST_EXAMS_BANK[examId];
                                if (!exam) return null;
                                return (
                                  <button
                                    key={exam.id}
                                    type="button"
                                    onClick={() => onOpenExam(exam)}
                                    className="min-h-[38px] px-3 py-1.5 rounded-xl bg-[#1A113E] hover:bg-[#251854] border border-[#2D1F5E] text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
                                  >
                                    <FileText size={13} aria-hidden="true" />
                                    <span>{exam.label} (مع الحل)</span>
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </article>
              );
            })}
          </div>

          {/* Evening Review Task */}
          <div className="bg-[#110B29] border border-[#2D1F5E] rounded-3xl p-4 sm:p-5">
            <button
              type="button"
              onClick={() => onToggleExtra(eveningId)}
              className="w-full text-right flex items-start gap-3.5 min-h-[44px]"
            >
              <span
                className={`w-6 h-6 mt-0.5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                  eveningDone
                    ? 'bg-emerald-400 border-emerald-300 text-slate-950'
                    : 'border-slate-500 text-transparent'
                }`}
                aria-hidden="true"
              >
                <Check size={14} strokeWidth={3} />
              </span>
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 text-xs text-fuchsia-300 font-bold">
                  <Moon size={14} aria-hidden="true" />
                  <span>مراجعة آخر اليوم (قبل النوم)</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono-num text-slate-400">+15 XP</span>
                </div>
                <p
                  className={`text-sm leading-relaxed ${
                    eveningDone ? 'line-through text-slate-400' : 'text-slate-100'
                  }`}
                >
                  {dayPlan.eveningReviewText}
                </p>
              </div>
            </button>
          </div>
        </div>

        {/* Secondary Insights & Gamification Column */}
        <div className="lg:col-span-4 space-y-5">
          {/* Daily XP & Avatar Progress Card */}
          <section className="bg-[#110B29] border border-[#2D1F5E] rounded-3xl p-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <button
                  type="button"
                  onClick={onOpenProfile}
                  aria-label="تغيير الصورة الشخصية"
                  className="rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 shrink-0 hover:opacity-90 transition-opacity"
                >
                  <EvolvingAvatar
                    stage={avatarStage}
                    size="md"
                    avatarUrl={avatarUrl}
                    altName={studentName}
                  />
                </button>
                <div className="min-w-0">
                  <div className="text-xs text-pink-400 font-bold">
                    {avatarStage.badgeText}
                  </div>
                  <div className="font-extrabold text-base text-white truncate">
                    {avatarStage.titleAr}
                  </div>
                  <div className="text-xs text-slate-400 truncate">
                    {avatarStage.subtitleAr}
                  </div>
                </div>
              </div>
              <div className="text-left shrink-0">
                <div className="font-mono-num text-2xl font-extrabold text-cyan-300">
                  {dayProgress.percent}%
                </div>
                <div className="text-[11px] text-slate-400">تقدم اليوم</div>
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="w-full h-2.5 bg-[#090617] border border-[#2D1F5E] rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-l from-cyan-400 via-pink-500 to-orange-400 rounded-full transition-all duration-300"
                  style={{ width: `${dayProgress.percent}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono-num">
                <span>XP اليوم: {dayProgress.earnedXp}</span>
                <span>أيام مكتملة: {stats.completedDaysCount}/100</span>
              </div>
            </div>

            {dayProgress.isDayComplete && (
              <div className="p-3 rounded-2xl bg-emerald-500/15 border border-emerald-400/35 text-emerald-300 text-xs font-bold text-center">
                أحسنت! أتممت اليوم {String(currentDay).padStart(2, '0')} بنسبة 100% وحصلت على تذكرة سحب.
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                document
                  .getElementById('badges-showcase')
                  ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="w-full min-h-[40px] px-3 py-2 rounded-xl bg-[#1A113E] hover:bg-[#251854] border border-[#2D1F5E] flex items-center justify-between text-xs font-bold transition-colors"
            >
              <span className="flex items-center gap-1.5 text-slate-200">
                <Award size={14} className="text-pink-400" aria-hidden="true" />
                <span>شارات الإنجاز</span>
              </span>
              <span dir="ltr" className="font-mono-num text-cyan-300">
                {badges.filter((b) => b.unlocked).length} / {badges.length}
              </span>
            </button>
          </section>

          {/* Daily Curriculum Challenge / Quick Puzzle */}
          <DailyChallengeWidget
            currentDay={currentDay}
            branch={branch}
            isSolved={solvedChallengeDays.has(currentDay)}
            onSolveChallenge={onSolveChallenge}
          />

          {/* Freeform Quick Notes (Ideas & Questions) */}
          <QuickNotesWidget
            notes={quickNotes}
            onAddNote={onAddQuickNote}
            onTogglePin={onTogglePinQuickNote}
            onDeleteNote={onDeleteQuickNote}
            onOpenInProfile={onOpenQuickNotesInProfile}
          />

          {/* Quick Task Difficulty Notes Review */}
          <TaskNotesReviewWidget
            notes={taskNotes}
            onJumpToDay={onChangeDay}
            onDeleteNote={onDeleteTaskNote}
          />

          {/* Automated Spaced Repetition Queue */}
          <section className="bg-[#110B29] border border-[#2D1F5E] rounded-3xl p-5 space-y-3.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <RefreshCw size={16} className="text-cyan-400" aria-hidden="true" />
                <h2 className="font-extrabold text-sm text-white">
                  التكرار المتباعد التلقائي
                </h2>
              </div>
              <span className="text-xs text-slate-400 font-mono-num">
                {dueReviews.length} مستحقة
              </span>
            </div>

            {dueReviews.length === 0 ? (
              <p className="text-xs text-slate-400 leading-relaxed bg-[#1A113E] border border-[#2D1F5E] rounded-2xl p-3.5">
                أكمل مهام الحفظ والفهم في الأيام السابقة لتتم جدولة مراجعتها تلقائياً بعد يوم، 3 أيام، 7، 15، و30 يوماً.
              </p>
            ) : (
              <div className="space-y-2">
                {dueReviews.map((rev) => {
                  const done = completedExtraIds.has(rev.reviewId);
                  const meta = SUBJECT_META[rev.subject];
                  return (
                    <button
                      key={rev.reviewId}
                      type="button"
                      onClick={() => onToggleExtra(rev.reviewId)}
                      className="w-full text-right p-3 rounded-2xl bg-[#1A113E] hover:bg-[#251854] border border-[#2D1F5E] flex items-start gap-3 transition-colors min-h-[44px]"
                    >
                      <span
                        className={`w-5 h-5 mt-0.5 rounded-full border flex items-center justify-center shrink-0 ${
                          done
                            ? 'bg-emerald-400 border-emerald-300 text-slate-950'
                            : 'border-slate-500 text-transparent'
                        }`}
                        aria-hidden="true"
                      >
                        <Check size={12} strokeWidth={3} />
                      </span>
                      <div className="min-w-0 flex-1 space-y-0.5">
                        <div className="flex items-center gap-1.5 text-[11px] font-bold">
                          <span className={meta.badgeTextClass}>
                            {meta.nameAr}
                          </span>
                          <span className="text-slate-500" aria-hidden="true">
                            ·
                          </span>
                          <span className="text-cyan-300 font-mono-num">
                            J+{rev.intervalDays} (من اليوم {rev.sourceDay})
                          </span>
                        </div>
                        <p
                          className={`text-xs leading-snug ${
                            done ? 'line-through text-slate-400' : 'text-slate-200'
                          }`}
                        >
                          {rev.title}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          {/* Weekly Reward Chest (Gen Alpha Movie + Poster) */}
          <section
            data-testid="weekly-reward-card"
            className="bg-[#110B29] border border-[#2D1F5E] rounded-3xl p-5 space-y-3.5"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                {weekStatus.unlocked ? (
                  <Gift size={17} className="text-pink-400" aria-hidden="true" />
                ) : (
                  <Lock size={17} className="text-slate-400" aria-hidden="true" />
                )}
                <h2 className="font-extrabold text-sm text-white">
                  مكافأة الأسبوع {String(weekStatus.week).padStart(2, '0')}
                </h2>
              </div>
              <span className="font-mono-num text-xs font-bold text-pink-300">
                {weekStatus.percent}% / 70%
              </span>
            </div>

            <div className="w-full h-2 bg-[#090617] border border-[#2D1F5E] rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  weekStatus.unlocked
                    ? 'bg-emerald-400'
                    : 'bg-gradient-to-l from-pink-500 to-orange-400'
                }`}
                style={{ width: `${Math.min(100, weekStatus.percent)}%` }}
              />
            </div>

            {/* Movie Photo d'Annonce + Title Preview */}
            <div className="rounded-2xl overflow-hidden bg-[#1A113E] border border-[#2D1F5E]">
              <div className="relative aspect-video w-full bg-[#090617] overflow-hidden">
                <img
                  src={getWeeklyMoviePosterSrc(
                    weekReward.week,
                    weekReward.posterUrl
                  )}
                  alt={weekReward.posterAlt}
                  referrerPolicy="no-referrer"
                  className={`w-full h-full object-cover transition-all ${
                    weekStatus.unlocked ? '' : 'brightness-75'
                  }`}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#090617] via-[#090617]/30 to-transparent" />

                <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#090617]/85 border border-[#2D1F5E] text-[11px] font-bold">
                  {weekStatus.unlocked ? (
                    <span className="text-emerald-300 flex items-center gap-1">
                      <Film size={12} aria-hidden="true" />
                      <span>مفتوح الآن</span>
                    </span>
                  ) : (
                    <span className="text-orange-300 flex items-center gap-1">
                      <Lock size={12} aria-hidden="true" />
                      <span>يفتح عند 70%</span>
                    </span>
                  )}
                </div>

                <div className="absolute bottom-2.5 right-3 left-3 space-y-0.5">
                  <div className="text-[11px] font-bold text-cyan-300">
                    {weekReward.genreAr} · {weekReward.releaseYear}
                  </div>
                  <h3 className="font-extrabold text-sm sm:text-base text-white leading-snug">
                    {weekReward.title}
                  </h3>
                </div>
              </div>

              <div className="p-3.5 space-y-2">
                <p className="text-xs text-slate-300 leading-relaxed">
                  {weekReward.description}
                </p>
                <p
                  className={`text-[11px] font-semibold leading-relaxed ${
                    weekStatus.unlocked ? 'text-emerald-300' : 'text-slate-400'
                  }`}
                >
                  {weekStatus.unlocked
                    ? weekReward.highlightNote
                    : `أكمل مهام الأيام ${weekStatus.startDay} إلى ${weekStatus.endDay} حتى 70% لفتح سهرة الأسبوع بدون تأنيب ضمير.`}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onOpenWeeklyMovies}
              className="w-full min-h-[40px] px-3 py-2 rounded-xl bg-[#1A113E] hover:bg-[#251854] border border-[#2D1F5E] text-cyan-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
            >
              <Film size={14} aria-hidden="true" />
              <span>استعراض أفلام الأسابيع (14)</span>
            </button>
          </section>

          {/* Daily Algerian Gen Alpha Coach BA9I Tip */}
          <section className="bg-[#110B29] border border-[#2D1F5E] rounded-3xl p-5 flex items-start gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#090617] border border-cyan-400/40 p-1 shrink-0 flex items-center justify-center">
              <img
                src={COACH_BA9I_POSES.saha.src}
                alt={COACH_BA9I_POSES.saha.alt}
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="space-y-1.5 min-w-0">
              <div className="flex items-center gap-1.5 text-xs font-extrabold text-cyan-300">
                <Sparkles size={14} className="text-pink-400" aria-hidden="true" />
                <span>رسالة الكوتش BA9I اليوم</span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                {dailyCoachTip}
              </p>
            </div>
          </section>
        </div>
      </div>

      {/* Achievement Badges Showcase */}
      <BadgesShowcase
        badges={badges}
        focusMinutesTotal={focusMinutesTotal}
        highlightedBadgeId={highlightedBadgeId}
      />
    </div>
  );
}
