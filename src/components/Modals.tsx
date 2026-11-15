import React, { useEffect, useRef, useState } from 'react';
import {
  Bookmark,
  Camera,
  CheckCircle2,
  FileText,
  Film,
  Lightbulb,
  Lock,
  Pin,
  Plus,
  RotateCcw,
  Trash2,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react';
import {
  BRANCHES,
  EXAM_DOUAA,
  STUDY_DOUAA,
  WEEKLY_REWARDS,
  WILAYAS,
} from '../data/curriculum';
import { getWeeklyMoviePosterSrc } from '../data/moviePosters';
import {
  BranchId,
  ExamRef,
  QuickNote,
  QuickNoteCategory,
  UserProfile,
} from '../types/bac';
import { processAvatarImageFile } from '../utils/avatarUpload';
import {
  countQuickNotesByCategory,
  filterAndSortQuickNotes,
  QUICK_NOTE_CATEGORY_META,
} from '../utils/quickNotes';
import {
  AvatarStage,
  getAvatarStage,
  TOTAL_CHALLENGE_DAYS,
} from '../utils/spacedRepetition';
import { EvolvingAvatar } from './SubjectBadge';

export function DouaaModal({
  open,
  initialMode = 'study',
  onClose,
}: {
  open: boolean;
  initialMode?: 'study' | 'exam';
  onClose: () => void;
}) {
  const [mode, setMode] = useState<'study' | 'exam'>(initialMode);
  const [speaking, setSpeaking] = useState(false);

  useEffect(() => {
    if (open) {
      setMode(initialMode);
    }
  }, [open, initialMode]);

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!open) return null;

  const activeDouaa = mode === 'exam' ? EXAM_DOUAA : STUDY_DOUAA;

  const stopSpeech = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setSpeaking(false);
  };

  const toggleAudio = () => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    if (speaking) {
      stopSpeech();
      return;
    }
    const utterance = new SpeechSynthesisUtterance(
      `${activeDouaa.verse} ${activeDouaa.text}`
    );
    utterance.lang = 'ar-SA';
    utterance.rate = 0.88;
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => setSpeaking(false);
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="douaa-title"
      className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="w-full max-w-lg bg-[#110B29] border border-[#2D1F5E] rounded-3xl p-6 space-y-5">
        <div className="flex items-center justify-between gap-4">
          <h2 id="douaa-title" className="text-lg font-extrabold text-emerald-300">
            {mode === 'exam' ? 'دعاء الإمتحان والتثبيت' : 'دعاء الدراسة والتوفيق'}
          </h2>
          <button
            type="button"
            onClick={() => {
              stopSpeech();
              onClose();
            }}
            aria-label="إغلاق نافذة الدعاء"
            className="min-h-[44px] min-w-[44px] rounded-xl bg-[#1A113E] hover:bg-[#251854] text-slate-300 flex items-center justify-center"
          >
            <X size={18} />
          </button>
        </div>

        <div
          className="grid grid-cols-2 gap-2 p-1 rounded-2xl bg-[#090617] border border-[#2D1F5E]"
          role="tablist"
          aria-label="اختيار الدعاء"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'study'}
            onClick={() => {
              stopSpeech();
              setMode('study');
            }}
            className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
              mode === 'study'
                ? 'bg-emerald-400 text-slate-950'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            دعاء الدراسة
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'exam'}
            onClick={() => {
              stopSpeech();
              setMode('exam');
            }}
            className={`min-h-[40px] px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
              mode === 'exam'
                ? 'bg-cyan-400 text-slate-950'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            دعاء الإمتحان
          </button>
        </div>

        <div className="p-4 rounded-2xl bg-[#1A113E] border border-emerald-400/25 text-center space-y-3">
          <p className="text-base sm:text-lg font-bold text-cyan-300 leading-relaxed">
            {activeDouaa.verse}
          </p>
          <hr className="border-[#2D1F5E]" />
          <p className="text-sm sm:text-base text-slate-100 leading-loose">
            {activeDouaa.text}
          </p>
        </div>

        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={toggleAudio}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-[#1A113E] hover:bg-[#251854] border border-[#2D1F5E] text-slate-200 text-sm font-semibold flex items-center gap-2 whitespace-nowrap"
          >
            {speaking ? <VolumeX size={17} /> : <Volume2 size={17} />}
            <span>{speaking ? 'إيقاف التلاوة' : 'استماع للدعاء'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              stopSpeech();
              onClose();
            }}
            className="min-h-[44px] px-6 py-2 rounded-xl bg-gradient-to-l from-cyan-400 to-teal-300 hover:from-cyan-300 hover:to-teal-200 text-slate-950 text-sm font-extrabold whitespace-nowrap"
          >
            {mode === 'exam' ? 'توكلت على الله' : 'بسم الله، نبدأ المراجعة'}
          </button>
        </div>
      </div>
    </div>
  );
}

export function ExamPreviewModal({
  exam,
  onClose,
}: {
  exam: ExamRef | null;
  onClose: () => void;
}) {
  if (!exam) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="exam-modal-title"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="w-full max-w-2xl max-h-[88vh] overflow-y-auto bg-[#110B29] border border-[#2D1F5E] rounded-3xl p-6 space-y-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-pink-300 font-semibold">
              <FileText size={14} aria-hidden="true" />
              <span>{exam.label}</span>
              <span aria-hidden="true">·</span>
              <span>{exam.branchLabel}</span>
            </div>
            <h2 id="exam-modal-title" className="text-lg font-extrabold text-white">
              {exam.title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق موضوع البكالوريا"
            className="min-h-[44px] min-w-[44px] rounded-xl bg-[#1A113E] hover:bg-[#251854] text-slate-300 flex items-center justify-center shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-bold text-cyan-300">ملخص التمرين / الموضوع</h3>
          <p className="text-sm text-slate-200 leading-relaxed bg-[#1A113E] border border-[#2D1F5E] p-4 rounded-2xl">
            {exam.summary}
          </p>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-bold text-pink-300">أهم القوانين والأفكار المفتاحية</h3>
          <ul className="space-y-2 bg-[#1A113E] border border-[#2D1F5E] p-4 rounded-2xl">
            {exam.keyFormulas.map((formula, idx) => (
              <li
                key={idx}
                className="text-xs sm:text-sm text-slate-200 leading-relaxed flex items-start gap-2"
              >
                <span className="text-pink-400 font-bold">•</span>
                <span>{formula}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-2">
          <h3 className="text-sm font-bold text-emerald-300">خطوات الحل المنهجي النموذجي</h3>
          <ol className="space-y-2 bg-[#1A113E] border border-[#2D1F5E] p-4 rounded-2xl">
            {exam.solutionSteps.map((step, idx) => (
              <li
                key={idx}
                className="text-xs sm:text-sm text-slate-200 leading-relaxed"
              >
                {step}
              </li>
            ))}
          </ol>
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[44px] px-6 py-2 rounded-xl bg-gradient-to-l from-cyan-400 to-teal-300 hover:from-cyan-300 hover:to-teal-200 text-slate-950 text-sm font-extrabold"
          >
            فهمت الفكرة، إغلاق
          </button>
        </div>
      </div>
    </div>
  );
}

export function DayMapModal({
  open,
  currentDay,
  dayCompletionMap,
  onSelectDay,
  onClose,
}: {
  open: boolean;
  currentDay: number;
  dayCompletionMap: Record<number, number>;
  onSelectDay: (day: number) => void;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="daymap-title"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="w-full max-w-2xl max-h-[85vh] flex flex-col bg-[#110B29] border border-[#2D1F5E] rounded-3xl p-6">
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-[#2D1F5E]">
          <div>
            <h2 id="daymap-title" className="text-lg font-extrabold text-white">
              خريطة الـ 100 يوم للبكالوريا
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              اضغط على أي يوم للانتقال إليه مباشرة
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق خريطة الأيام"
            className="min-h-[44px] min-w-[44px] rounded-xl bg-[#1A113E] hover:bg-[#251854] text-slate-300 flex items-center justify-center"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto py-4 grid grid-cols-5 sm:grid-cols-10 gap-2">
          {Array.from({ length: TOTAL_CHALLENGE_DAYS }, (_, idx) => idx + 1).map(
            (day) => {
              const pct = dayCompletionMap[day] ?? 0;
              const isCurrent = day === currentDay;
              const isDone = pct === 100;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => {
                    onSelectDay(day);
                    onClose();
                  }}
                  aria-label={`اليوم ${day}، نسبة الإنجاز ${pct}%`}
                  className={`min-h-[44px] rounded-xl border font-mono-num text-xs font-bold flex flex-col items-center justify-center transition-colors ${
                    isCurrent
                      ? 'bg-cyan-400 border-cyan-300 text-slate-950'
                      : isDone
                      ? 'bg-emerald-500/20 border-emerald-400/45 text-emerald-300'
                      : pct > 0
                      ? 'bg-pink-500/15 border-pink-400/35 text-pink-200'
                      : 'bg-[#1A113E] border-[#2D1F5E] text-slate-300 hover:border-cyan-400/50'
                  }`}
                >
                  <span>{String(day).padStart(2, '0')}</span>
                  {isDone && !isCurrent && (
                    <CheckCircle2 size={10} className="mt-0.5" aria-hidden="true" />
                  )}
                </button>
              );
            }
          )}
        </div>
      </div>
    </div>
  );
}

const PROFILE_QUICK_NOTE_FILTERS: Array<'all' | QuickNoteCategory> = [
  'all',
  'idea',
  'question',
  'reminder',
];

export function ProfileModal({
  open,
  profile,
  avatarStage,
  quickNotes = [],
  focusQuickNotesSignal = 0,
  onAddQuickNote,
  onTogglePinQuickNote,
  onDeleteQuickNote,
  onSave,
  onResetProgress,
  onClose,
}: {
  open: boolean;
  profile: UserProfile;
  avatarStage?: AvatarStage;
  quickNotes?: QuickNote[];
  focusQuickNotesSignal?: number;
  onAddQuickNote?: (payload: { text: string; category: QuickNoteCategory }) => void;
  onTogglePinQuickNote?: (id: string) => void;
  onDeleteQuickNote?: (id: string) => void;
  onSave: (next: UserProfile) => void;
  onResetProgress: () => void;
  onClose: () => void;
}) {
  const [name, setName] = useState(profile.name);
  const [branch, setBranch] = useState<BranchId>(profile.branch);
  const [wilayaCode, setWilayaCode] = useState<number>(profile.wilayaCode);
  const [targetAverage, setTargetAverage] = useState<number>(profile.targetAverage);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(profile.avatarUrl);
  const [avatarError, setAvatarError] = useState<string>('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [noteFilter, setNoteFilter] = useState<'all' | QuickNoteCategory>('all');
  const [modalNoteCategory, setModalNoteCategory] =
    useState<QuickNoteCategory>('idea');
  const [modalNoteText, setModalNoteText] = useState('');
  const [modalNoteError, setModalNoteError] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const quickNotesSectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (open) {
      setName(profile.name);
      setBranch(profile.branch);
      setWilayaCode(profile.wilayaCode);
      setTargetAverage(profile.targetAverage);
      setAvatarUrl(profile.avatarUrl);
      setAvatarError('');
      setConfirmReset(false);
      setModalNoteText('');
      setModalNoteError('');
    }
  }, [open, profile]);

  useEffect(() => {
    if (!open || focusQuickNotesSignal <= 0) return;
    const timer = window.setTimeout(() => {
      quickNotesSectionRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 60);
    return () => window.clearTimeout(timer);
  }, [open, focusQuickNotesSignal]);

  if (!open) return null;

  const quickNoteCounts = countQuickNotesByCategory(quickNotes);
  const visibleQuickNotes = filterAndSortQuickNotes(quickNotes, noteFilter);

  const previewStage = avatarStage ?? getAvatarStage(1);

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setAvatarError('');
    setUploadingPhoto(true);
    try {
      const processed = await processAvatarImageFile(file);
      setAvatarUrl(processed);
    } catch (err) {
      setAvatarError(
        err instanceof Error ? err.message : 'تعذر تحميل الصورة المختارة.'
      );
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({
      ...profile,
      name: name.trim(),
      branch,
      wilayaCode,
      targetAverage,
      avatarUrl,
    });
    onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="w-full max-w-lg max-h-[90vh] overflow-y-auto bg-[#110B29] border border-[#2D1F5E] rounded-3xl p-5 sm:p-6 space-y-5">
        <div className="flex items-center justify-between gap-4">
          <h2 id="profile-modal-title" className="text-lg font-extrabold text-white">
            تعديل الملف الشخصي والشعبة
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق إعدادات الحساب"
            className="min-h-[44px] min-w-[44px] rounded-xl bg-[#1A113E] hover:bg-[#251854] text-slate-300 flex items-center justify-center"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Optional Avatar Photo Upload */}
          <div className="p-4 rounded-2xl bg-[#1A113E] border border-[#2D1F5E] space-y-3">
            <div className="flex items-center gap-3.5">
              <EvolvingAvatar
                stage={previewStage}
                size="lg"
                avatarUrl={avatarUrl}
                altName={name || profile.name}
              />
              <div className="min-w-0 flex-1 space-y-1">
                <div className="text-xs font-bold text-white">
                  الصورة الشخصية (اختياري)
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  يمكنك رفع صورتك من الجهاز أو الاحتفاظ بالأفاتار التفاعلي.
                </p>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/gif"
              onChange={handlePhotoChange}
              aria-label="رفع صورة شخصية للأفاتار"
              className="sr-only"
            />

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={uploadingPhoto}
                onClick={() => fileInputRef.current?.click()}
                className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-[#110B29] hover:bg-[#251854] border border-[#2D1F5E] text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap"
              >
                <Camera size={14} aria-hidden="true" />
                <span>
                  {uploadingPhoto
                    ? 'جاري المعالجة...'
                    : avatarUrl
                    ? 'تغيير الصورة'
                    : 'رفع صورة من الجهاز'}
                </span>
              </button>

              {avatarUrl && (
                <button
                  type="button"
                  onClick={() => {
                    setAvatarUrl(undefined);
                    setAvatarError('');
                  }}
                  className="min-h-[40px] px-3 py-1.5 rounded-xl bg-[#110B29] hover:bg-rose-500/15 border border-[#2D1F5E] text-slate-300 hover:text-rose-300 text-xs font-semibold flex items-center gap-1.5 transition-colors whitespace-nowrap"
                >
                  <Trash2 size={14} aria-hidden="true" />
                  <span>حذف الصورة</span>
                </button>
              )}
            </div>

            {avatarError && (
              <p role="alert" className="text-xs text-rose-400 font-semibold">
                {avatarError}
              </p>
            )}
          </div>

          <div>
            <label htmlFor="edit-name" className="block text-xs font-bold text-slate-300 mb-1.5">
              الاسم
            </label>
            <input
              id="edit-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#1A113E] border border-[#2D1F5E] focus:border-cyan-400 focus:outline-none text-white text-sm"
            />
          </div>

          <div>
            <label htmlFor="edit-branch" className="block text-xs font-bold text-slate-300 mb-1.5">
              الشعبة
            </label>
            <select
              id="edit-branch"
              value={branch}
              onChange={(e) => setBranch(e.target.value as BranchId)}
              className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#1A113E] border border-[#2D1F5E] focus:border-cyan-400 focus:outline-none text-white text-sm"
            >
              {BRANCHES.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.nameAr}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="edit-wilaya" className="block text-xs font-bold text-slate-300 mb-1.5">
                الولاية
              </label>
              <select
                id="edit-wilaya"
                value={wilayaCode}
                onChange={(e) => setWilayaCode(Number(e.target.value))}
                className="w-full min-h-[44px] px-3 rounded-xl bg-[#1A113E] border border-[#2D1F5E] focus:border-cyan-400 focus:outline-none text-white text-sm"
              >
                {WILAYAS.map((w) => (
                  <option key={w.code} value={w.code}>
                    {w.code} - {w.nameAr}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="edit-target" className="block text-xs font-bold text-slate-300 mb-1.5">
                المعدل المستهدف
              </label>
              <select
                id="edit-target"
                value={targetAverage}
                onChange={(e) => setTargetAverage(Number(e.target.value))}
                className="w-full min-h-[44px] px-3 rounded-xl bg-[#1A113E] border border-[#2D1F5E] focus:border-cyan-400 focus:outline-none text-white text-sm font-mono-num"
              >
                {[12, 13, 14, 15, 16, 17, 18, 19].map((val) => (
                  <option key={val} value={val}>
                    {val} / 20
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-between gap-3">
            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="min-h-[44px] px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 text-xs font-semibold flex items-center gap-1.5"
              >
                <RotateCcw size={14} />
                <span>تصفير التقدم</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onResetProgress();
                  setConfirmReset(false);
                  onClose();
                }}
                className="min-h-[44px] px-3 py-2 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 text-xs font-bold"
              >
                تأكيد التصفير النهائي
              </button>
            )}

            <button
              type="submit"
              className="min-h-[44px] px-6 py-2 rounded-xl bg-gradient-to-l from-cyan-400 to-teal-300 hover:from-cyan-300 hover:to-teal-200 text-slate-950 text-sm font-extrabold"
            >
              حفظ التعديلات
            </button>
          </div>
        </form>

        {/* Dedicated Profile Quick Notes Section */}
        <section
          ref={quickNotesSectionRef}
          aria-labelledby="profile-quick-notes-title"
          data-testid="profile-quick-notes-section"
          className="pt-5 border-t border-[#2D1F5E] space-y-4"
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <Lightbulb size={17} className="text-pink-400 shrink-0" aria-hidden="true" />
              <div>
                <h3
                  id="profile-quick-notes-title"
                  className="text-sm sm:text-base font-extrabold text-white"
                >
                  الملاحظات السريعة
                </h3>
                <p className="text-[11px] text-slate-400">
                  أفكار وأسئلة عشوائية غير مرتبطة بمهمة محددة
                </p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-xl bg-[#090617] border border-[#2D1F5E] text-xs font-bold text-cyan-300 font-mono-num shrink-0">
              {quickNoteCounts.total} ملاحظة
            </span>
          </div>

          {onAddQuickNote && (
            <div className="p-3.5 rounded-2xl bg-[#1A113E] border border-[#2D1F5E] space-y-2.5">
              <div className="flex flex-wrap items-center gap-1.5">
                {(['idea', 'question', 'reminder'] as QuickNoteCategory[]).map((cat) => {
                  const active = modalNoteCategory === cat;
                  const meta = QUICK_NOTE_CATEGORY_META[cat];
                  return (
                    <button
                      key={cat}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setModalNoteCategory(cat)}
                      className={`min-h-[32px] px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                        active
                          ? meta.activePillClass
                          : 'bg-[#090617] text-slate-300 hover:text-white border border-[#2D1F5E]'
                      }`}
                    >
                      {meta.labelAr}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-start gap-2">
                <label htmlFor="profile-quick-note-input" className="sr-only">
                  إضافة ملاحظة سريعة جديدة
                </label>
                <input
                  id="profile-quick-note-input"
                  type="text"
                  value={modalNoteText}
                  onChange={(e) => {
                    setModalNoteText(e.target.value);
                    if (modalNoteError) setModalNoteError('');
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const trimmed = modalNoteText.trim();
                      if (!trimmed) {
                        setModalNoteError('يرجى كتابة فكرة أو سؤال قبل الحفظ.');
                        return;
                      }
                      onAddQuickNote({ text: trimmed, category: modalNoteCategory });
                      setModalNoteText('');
                      setModalNoteError('');
                    }
                  }}
                  placeholder="أضف فكرة أو سؤالاً جديداً مباشرة..."
                  className="flex-1 min-w-0 min-h-[40px] px-3 rounded-xl bg-[#090617] border border-[#2D1F5E] focus:border-cyan-400 focus:outline-none text-xs sm:text-sm text-white placeholder:text-slate-500"
                />
                <button
                  type="button"
                  onClick={() => {
                    const trimmed = modalNoteText.trim();
                    if (!trimmed) {
                      setModalNoteError('يرجى كتابة فكرة أو سؤال قبل الحفظ.');
                      return;
                    }
                    onAddQuickNote({ text: trimmed, category: modalNoteCategory });
                    setModalNoteText('');
                    setModalNoteError('');
                  }}
                  aria-label="إضافة ملاحظة سريعة"
                  className="min-h-[40px] px-3.5 rounded-xl bg-gradient-to-l from-cyan-400 to-teal-300 hover:from-cyan-300 hover:to-teal-200 text-slate-950 text-xs font-extrabold flex items-center gap-1 whitespace-nowrap shrink-0"
                >
                  <Plus size={14} strokeWidth={3} aria-hidden="true" />
                  <span>إضافة</span>
                </button>
              </div>
              {modalNoteError && (
                <p role="alert" className="text-xs text-rose-400 font-semibold">
                  {modalNoteError}
                </p>
              )}
            </div>
          )}

          {/* Category Filter Tabs */}
          <div
            role="tablist"
            aria-label="تصفية الملاحظات السريعة"
            className="grid grid-cols-4 gap-1 p-1 rounded-xl bg-[#090617] border border-[#2D1F5E]"
          >
            {PROFILE_QUICK_NOTE_FILTERS.map((filterId) => {
              const active = noteFilter === filterId;
              const label =
                filterId === 'all'
                  ? 'الكل'
                  : QUICK_NOTE_CATEGORY_META[filterId].pluralAr;
              const count =
                filterId === 'all'
                  ? quickNoteCounts.total
                  : quickNoteCounts[filterId];
              return (
                <button
                  key={filterId}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setNoteFilter(filterId)}
                  className={`min-h-[34px] px-2 py-1 rounded-lg text-[11px] font-bold transition-colors whitespace-nowrap flex items-center justify-center gap-1 ${
                    active
                      ? 'bg-cyan-400 text-slate-950'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  <span>{label}</span>
                  <span className="font-mono-num opacity-80">({count})</span>
                </button>
              );
            })}
          </div>

          {visibleQuickNotes.length === 0 ? (
            <p className="text-xs text-slate-400 leading-relaxed bg-[#1A113E]/60 border border-[#2D1F5E] rounded-2xl p-3.5">
              {quickNoteCounts.total === 0
                ? 'لا توجد ملاحظات سريعة محفوظة حتى الآن — استخدم صندوق الملاحظات في لوحة القيادة أو الحقل أعلاه لحفظ أي فكرة.'
                : 'لا توجد ملاحظات في هذا التصنيف حالياً.'}
            </p>
          ) : (
            <ul className="space-y-2 max-h-60 overflow-y-auto pr-0.5">
              {visibleQuickNotes.map((note) => {
                const meta = QUICK_NOTE_CATEGORY_META[note.category];
                return (
                  <li
                    key={note.id}
                    data-testid="profile-quick-note-item"
                    className="p-3 rounded-2xl bg-[#1A113E] border border-[#2D1F5E] space-y-1.5"
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
                        {onTogglePinQuickNote && (
                          <button
                            type="button"
                            onClick={() => onTogglePinQuickNote(note.id)}
                            aria-pressed={Boolean(note.pinned)}
                            aria-label={
                              note.pinned
                                ? `إلغاء تثبيت: ${note.text}`
                                : `تثبيت: ${note.text}`
                            }
                            className={`min-h-[34px] min-w-[34px] rounded-lg flex items-center justify-center transition-colors ${
                              note.pinned
                                ? 'text-amber-300 bg-amber-400/10'
                                : 'text-slate-400 hover:text-cyan-300 hover:bg-[#110B29]'
                            }`}
                          >
                            <Pin size={13} aria-hidden="true" />
                          </button>
                        )}
                        {onDeleteQuickNote && (
                          <button
                            type="button"
                            onClick={() => onDeleteQuickNote(note.id)}
                            aria-label={`حذف: ${note.text}`}
                            className="min-h-[34px] min-w-[34px] rounded-lg text-slate-400 hover:text-rose-300 hover:bg-rose-500/10 flex items-center justify-center transition-colors"
                          >
                            <Trash2 size={13} aria-hidden="true" />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-100 leading-relaxed break-words">
                      {note.text}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

export function WeeklyMoviesModal({
  open,
  currentWeek,
  onSelectWeekDay,
  onClose,
}: {
  open: boolean;
  currentWeek: number;
  onSelectWeekDay: (day: number) => void;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="weekly-movies-modal-title"
      data-testid="weekly-movies-modal"
      className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <div className="w-full max-w-4xl max-h-[88vh] flex flex-col bg-[#110B29] border border-[#2D1F5E] rounded-3xl p-5 sm:p-6 space-y-4">
        <div className="shrink-0 flex items-start justify-between gap-4 pb-3 border-b border-[#2D1F5E]">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-pink-400">
              <Film size={15} aria-hidden="true" />
              <span>قائمة مكافآت جيل ألفا · 14 أسبوعاً</span>
            </div>
            <h2
              id="weekly-movies-modal-title"
              className="text-lg font-extrabold text-white"
            >
              أفلام الراحة الأسبوعية وبوسترات الإعلان
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق معرض الأفلام الأسبوعية"
            className="min-h-[44px] min-w-[44px] rounded-xl bg-[#1A113E] hover:bg-[#251854] text-slate-300 flex items-center justify-center shrink-0 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto pr-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
            {WEEKLY_REWARDS.map((reward) => {
              const posterSrc = getWeeklyMoviePosterSrc(
                reward.week,
                reward.posterUrl
              );
              const isCurrent = reward.week === currentWeek;
              const startDay = (reward.week - 1) * 7 + 1;

              return (
                <article
                  key={reward.week}
                  className={`flex flex-col rounded-2xl overflow-hidden bg-[#1A113E] border transition-colors ${
                    isCurrent
                      ? 'border-cyan-400/75'
                      : 'border-[#2D1F5E]'
                  }`}
                >
                  <div className="relative aspect-video w-full shrink-0 bg-[#090617] overflow-hidden">
                    <img
                      src={posterSrc}
                      alt={reward.posterAlt}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover block"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#090617] via-[#090617]/45 to-transparent" />
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5 text-[11px] font-extrabold text-white bg-[#090617]/85 border border-[#2D1F5E] px-2.5 py-1 rounded-lg">
                      <span className="text-pink-300 font-mono-num">
                        الأسبوع {String(reward.week).padStart(2, '0')}
                      </span>
                      {isCurrent && (
                        <>
                          <span className="text-slate-500" aria-hidden="true">
                            ·
                          </span>
                          <span className="text-emerald-300">الأسبوع الحالي</span>
                        </>
                      )}
                    </div>
                    <div className="absolute bottom-2.5 right-3 left-3 flex items-end justify-between gap-2">
                      <div className="min-w-0 space-y-0.5">
                        <div className="text-[11px] font-semibold text-cyan-300">
                          {reward.genreAr} · {reward.releaseYear}
                        </div>
                        <h3 className="text-sm sm:text-base font-extrabold text-white leading-snug">
                          {reward.title}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 flex flex-col justify-between p-3.5 space-y-3">
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {reward.description}
                    </p>
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-[#2D1F5E]/80">
                      <span className="text-[11px] font-bold text-cyan-300">
                        {reward.vibeTag}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          onSelectWeekDay(startDay);
                          onClose();
                        }}
                        className="min-h-[36px] px-3 py-1 rounded-xl bg-[#110B29] hover:bg-[#251854] border border-[#2D1F5E] text-cyan-300 text-xs font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap"
                      >
                        {!isCurrent && <Lock size={12} aria-hidden="true" />}
                        <span>
                          معاينة الأسبوع{' '}
                          <span className="font-mono-num">
                            {String(reward.week).padStart(2, '0')}
                          </span>
                        </span>
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
