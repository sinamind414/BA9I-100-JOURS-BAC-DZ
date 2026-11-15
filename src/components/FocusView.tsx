import React, { useEffect, useState } from 'react';
import {
  CheckCircle2,
  CloudRain,
  Headphones,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  Waves,
} from 'lucide-react';
import { STUDY_DOUAA, SUBJECT_META } from '../data/curriculum';
import { StudyTask } from '../types/bac';
import { ambientAudio, AmbientPreset } from '../utils/ambientAudio';
import { resolveCompletedSessionMinutes } from '../utils/breakIntelligence';
import { getCoachBa9iFocusState } from '../utils/coachBa9i';
import { BreakIntelligencePanel } from './BreakIntelligencePanel';

interface FocusViewProps {
  activeTask: StudyTask | null;
  availableTasks: StudyTask[];
  onSelectTask: (task: StudyTask) => void;
  onCompleteSession: (completedTaskId?: string, sessionMinutes?: number) => void;
}

const PRESETS: { id: AmbientPreset; label: string; icon: React.FC<{ size?: number }> }[] = [
  { id: 'none', label: 'صامت', icon: Volume2 },
  { id: 'rain', label: 'صوت المطر', icon: CloudRain },
  { id: 'lofi', label: 'موسيقى Lo-Fi', icon: Headphones },
  { id: 'ocean', label: 'أمواج هادئة', icon: Waves },
];

const DURATIONS_MIN = [25, 45, 60, 90];

export function FocusView({
  activeTask,
  availableTasks,
  onSelectTask,
  onCompleteSession,
}: FocusViewProps) {
  const [durationMin, setDurationMin] = useState<number>(45);
  const [secondsLeft, setSecondsLeft] = useState<number>(45 * 60);
  const [running, setRunning] = useState<boolean>(false);
  const [ambient, setAmbient] = useState<AmbientPreset>('none');
  const [volume, setVolume] = useState<number>(0.4);
  const [showDouaaBanner, setShowDouaaBanner] = useState<boolean>(true);
  const [sessionDoneMsg, setSessionDoneMsg] = useState<string>('');
  const [completedSessionMin, setCompletedSessionMin] = useState<number | null>(
    null
  );
  const [completionNonce, setCompletionNonce] = useState<number>(0);

  useEffect(() => {
    if (!running) return;
    const id = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(id);
          setRunning(false);
          ambientAudio.playCompletionChime();
          const finishedMin = resolveCompletedSessionMinutes(durationMin, 0);
          setCompletedSessionMin(finishedMin);
          setCompletionNonce((n) => n + 1);
          setSessionDoneMsg('أحسنت! أتممت جلسة التركيز وحصلت على +25 XP');
          onCompleteSession(activeTask?.id, finishedMin);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [running, durationMin, activeTask, onCompleteSession]);

  useEffect(() => {
    return () => {
      ambientAudio.stop();
    };
  }, []);

  const handleSelectDuration = (mins: number) => {
    setRunning(false);
    setDurationMin(mins);
    setSecondsLeft(mins * 60);
    setSessionDoneMsg('');
    setCompletedSessionMin(null);
  };

  const handleTogglePreset = (preset: AmbientPreset) => {
    setAmbient(preset);
    ambientAudio.play(preset, volume);
  };

  const handleVolumeChange = (val: number) => {
    setVolume(val);
    ambientAudio.setVolume(val);
  };

  const handleFinishEarly = () => {
    setRunning(false);
    ambientAudio.playCompletionChime();
    const finishedMin = resolveCompletedSessionMinutes(durationMin, secondsLeft);
    setCompletedSessionMin(finishedMin);
    setCompletionNonce((n) => n + 1);
    setSessionDoneMsg('تم تسجيل الجلسة بنجاح (+25 XP)');
    onCompleteSession(activeTask?.id, finishedMin);
  };

  const totalSeconds = durationMin * 60;
  const progressRatio = totalSeconds > 0 ? 1 - secondsLeft / totalSeconds : 0;
  const minsStr = String(Math.floor(secondsLeft / 60)).padStart(2, '0');
  const secsStr = String(secondsLeft % 60).padStart(2, '0');

  const taskMeta = activeTask ? SUBJECT_META[activeTask.subject] : null;
  const coachFocus = getCoachBa9iFocusState({
    running,
    onBreak: completedSessionMin !== null,
    durationMin,
    activeSubject: activeTask?.subject,
    completedSessionMin,
  });

  return (
    <div className="space-y-6">
      <div className="bg-[#110B29] border border-[#2D1F5E] rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-white">
            وضع التركيز العميق · <span className="text-pink-400">MODE FOCUS</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            اعزل المشتتات مع الكوتش BA9I، شغّل الخلفية الصوتية، وأنجز مهمتك بتركيز كامل
          </p>
        </div>
        <div className="flex items-center gap-1.5 bg-[#1A113E] p-1 rounded-xl border border-[#2D1F5E]">
          {DURATIONS_MIN.map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => handleSelectDuration(m)}
              className={`min-h-[38px] px-3 rounded-lg text-xs font-mono-num font-bold transition-colors ${
                durationMin === m
                  ? 'bg-cyan-400 text-slate-950'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              {m} د
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Timer Dial Panel */}
        <div className="lg:col-span-7 bg-[#110B29] border border-[#2D1F5E] rounded-3xl p-6 sm:p-8 flex flex-col items-center text-center space-y-5 relative overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-l from-cyan-400 via-pink-500 to-orange-400"
          />

          {/* Coach BA9I Focus Companion (Mockup: MODE FOCUS - Ba9i) */}
          <div
            data-testid="coach-ba9i-focus-card"
            className={`w-full rounded-2xl border p-3.5 flex flex-col sm:flex-row items-center gap-3.5 text-right ${coachFocus.pose.bubbleBgClass}`}
          >
            <div className="w-20 h-20 rounded-2xl bg-[#090617] border border-[#2D1F5E] p-1.5 flex items-center justify-center shrink-0">
              <img
                src={coachFocus.pose.src}
                alt={coachFocus.pose.alt}
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="min-w-0 flex-1 space-y-1 text-center sm:text-right">
              <div className="text-xs font-extrabold text-pink-300">
                الكوتش BA9I · {coachFocus.title}
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {coachFocus.tip}
              </p>
            </div>
          </div>

          {activeTask && taskMeta ? (
            <div className="space-y-1">
              <div className={`text-xs font-bold ${taskMeta.badgeTextClass}`}>
                المهمة المختارة · {taskMeta.nameAr}
              </div>
              <p className="text-sm sm:text-base font-bold text-white max-w-md">
                {activeTask.title}
              </p>
            </div>
          ) : (
            <p className="text-sm text-slate-300">
              جلسة تركيز حرة — اختر مهمة من القائمة لربطها بالمؤقت
            </p>
          )}

          {/* Circular Progress Dial (Neon Gradient) */}
          <div className="relative w-56 h-56 flex items-center justify-center">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200" aria-hidden="true">
              <defs>
                <linearGradient id="ba9iFocusNeonArc" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#22D3EE" />
                  <stop offset="55%" stopColor="#FF3BA7" />
                  <stop offset="100%" stopColor="#FF8C42" />
                </linearGradient>
              </defs>
              <circle
                cx="100"
                cy="100"
                r="88"
                stroke="#1A113E"
                strokeWidth="12"
                fill="none"
              />
              <circle
                cx="100"
                cy="100"
                r="88"
                stroke="url(#ba9iFocusNeonArc)"
                strokeWidth="12"
                strokeLinecap="round"
                fill="none"
                strokeDasharray={2 * Math.PI * 88}
                strokeDashoffset={2 * Math.PI * 88 * (1 - progressRatio)}
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-mono-num text-5xl font-extrabold text-white tracking-tight">
                {minsStr}:{secsStr}
              </span>
              <span className="text-xs text-cyan-300 mt-1 font-semibold">
                {running ? 'جلسة نشطة الآن' : 'جاهز للبدء'}
              </span>
            </div>
          </div>

          {sessionDoneMsg && (
            <div className="w-full max-w-md p-3 rounded-2xl bg-teal-500/15 border border-teal-400/40 text-teal-200 text-xs font-bold">
              {sessionDoneMsg}
            </div>
          )}

          {/* Timer Controls */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setSessionDoneMsg('');
                setCompletedSessionMin(null);
                if (secondsLeft === 0) {
                  setSecondsLeft(durationMin * 60);
                }
                setRunning((r) => !r);
              }}
              className="min-h-[48px] px-7 py-2.5 rounded-2xl bg-gradient-to-l from-cyan-400 to-teal-300 hover:from-cyan-300 hover:to-teal-200 text-slate-950 font-extrabold text-sm flex items-center gap-2 transition-colors whitespace-nowrap"
            >
              {running ? <Pause size={18} /> : <Play size={18} />}
              <span>{running ? 'إيقاف مؤقت' : 'ابدأ المؤقت'}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRunning(false);
                setSecondsLeft(durationMin * 60);
                setSessionDoneMsg('');
                setCompletedSessionMin(null);
              }}
              aria-label="إعادة ضبط المؤقت"
              className="min-h-[48px] min-w-[48px] rounded-2xl bg-[#1A113E] hover:bg-[#251854] border border-[#2D1F5E] text-slate-200 flex items-center justify-center transition-colors"
            >
              <RotateCcw size={18} />
            </button>

            <button
              type="button"
              onClick={handleFinishEarly}
              className="min-h-[48px] px-5 py-2.5 rounded-2xl bg-pink-500/15 hover:bg-pink-500/25 border border-pink-400/45 text-pink-200 font-bold text-sm flex items-center gap-2 transition-colors whitespace-nowrap"
            >
              <CheckCircle2 size={18} />
              <span>أنهيت المهمة</span>
            </button>
          </div>

          <BreakIntelligencePanel
            selectedDurationMin={durationMin}
            completedSessionMin={completedSessionMin}
            completionNonce={completionNonce}
            onDismissBreak={() => {
              setCompletedSessionMin(null);
              setSessionDoneMsg('');
              setSecondsLeft(durationMin * 60);
            }}
          />

          {showDouaaBanner && (
            <div className="w-full p-4 rounded-2xl bg-[#1A113E] border border-[#2D1F5E] text-right space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-teal-300">
                  تذكير قبل البدء
                </span>
                <button
                  type="button"
                  onClick={() => setShowDouaaBanner(false)}
                  className="text-xs text-slate-400 hover:text-slate-200"
                >
                  إخفاء
                </button>
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {STUDY_DOUAA.verse}
              </p>
            </div>
          )}
        </div>

        {/* Right Side: Ambient Audio + Task Selector */}
        <div className="lg:col-span-5 space-y-5">
          {/* Ambient Audio Mixer */}
          <section className="bg-[#110B29] border border-[#2D1F5E] rounded-3xl p-5 space-y-4">
            <h2 className="font-extrabold text-sm text-white">
              خلفية صوتية للتركيز (تعمل بدون إنترنت)
            </h2>
            <div className="grid grid-cols-2 gap-2.5">
              {PRESETS.map((p) => {
                const Icon = p.icon;
                const active = ambient === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleTogglePreset(p.id)}
                    className={`min-h-[48px] px-3.5 py-2.5 rounded-2xl border text-xs font-bold flex items-center gap-2 transition-colors ${
                      active
                        ? 'bg-cyan-500/15 border-cyan-400 text-cyan-300'
                        : 'bg-[#1A113E] border-[#2D1F5E] text-slate-300 hover:border-pink-400/50'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{p.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <label htmlFor="ambient-volume">مستوى الصوت</label>
                <span className="font-mono-num">{Math.round(volume * 100)}%</span>
              </div>
              <input
                id="ambient-volume"
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={volume}
                onChange={(e) => handleVolumeChange(Number(e.target.value))}
                className="w-full accent-cyan-400"
              />
            </div>
          </section>

          {/* Linked Task Picker */}
          <section className="bg-[#110B29] border border-[#2D1F5E] rounded-3xl p-5 space-y-3">
            <h2 className="font-extrabold text-sm text-white">
              اختر مهمة اليوم للعمل عليها
            </h2>
            <div className="space-y-2 max-h-72 overflow-y-auto">
              {availableTasks.map((t) => {
                const selected = activeTask?.id === t.id;
                const meta = SUBJECT_META[t.subject];
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => onSelectTask(t)}
                    className={`w-full text-right p-3 rounded-2xl border transition-colors ${
                      selected
                        ? 'bg-pink-500/12 border-pink-400 text-white'
                        : 'bg-[#1A113E] border-[#2D1F5E] text-slate-300 hover:border-cyan-400/50'
                    }`}
                  >
                    <div className={`text-[11px] font-bold ${meta.badgeTextClass}`}>
                      {meta.nameAr}
                    </div>
                    <div className="text-xs mt-0.5 line-clamp-2">{t.title}</div>
                  </button>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
