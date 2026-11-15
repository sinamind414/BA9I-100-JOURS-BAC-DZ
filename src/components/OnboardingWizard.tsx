import React, { useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Check,
  Rocket,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { BRANCHES, WILAYAS } from '../data/curriculum';
import { BranchId, ReadinessLevel, UserProfile } from '../types/bac';
import { processAvatarImageFile } from '../utils/avatarUpload';
import { getAvatarStage } from '../utils/spacedRepetition';
import { EvolvingAvatar } from './SubjectBadge';

interface OnboardingWizardProps {
  onComplete: (profile: UserProfile) => void;
  onQuickDemo: () => void;
}

const TARGET_AVERAGES = [
  { value: 12, label: '12 / 20', desc: 'النجاح وبناء الثقة' },
  { value: 14, label: '14 / 20', desc: 'تقدير جيد وتخصص قوي' },
  { value: 16, label: '16 / 20', desc: 'امتياز وتنافس عالٍ' },
  { value: 18, label: '18 / 20', desc: 'أسطورة البكالوريا' },
];

const READINESS_OPTIONS: { id: ReadinessLevel; label: string; sub: string }[] = [
  { id: 'panic', label: 'متأخر وأحتاج إنقاذاً سريعاً', sub: 'ابدأ بخطة مكثفة ومنظمة' },
  { id: 'steady', label: 'أسير بشكل متوسط', sub: 'ثبت معلوماتك بالتكرار المتباعد' },
  { id: 'advanced', label: 'متقدم وأستهدف الامتياز', sub: 'ركز على البكالوريات والأفكار الصعبة' },
];

export function OnboardingWizard({
  onComplete,
  onQuickDemo,
}: OnboardingWizardProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [branch, setBranch] = useState<BranchId>('sciences');
  const [targetAverage, setTargetAverage] = useState<number>(16);
  const [readiness, setReadiness] = useState<ReadinessLevel>('steady');
  const [name, setName] = useState<string>('');
  const [wilayaCode, setWilayaCode] = useState<number>(19);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(undefined);
  const [avatarError, setAvatarError] = useState<string>('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [nameError, setNameError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

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

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setNameError('يرجى كتابة اسمك الأول أو لقبك للبدء.');
      return;
    }
    setNameError('');
    onComplete({
      name: trimmed,
      branch,
      targetAverage,
      wilayaCode,
      readiness,
      onboarded: true,
      avatarUrl,
    });
  };

  return (
    <div className="min-h-screen bg-[#090617] text-slate-100 flex items-center justify-center p-4 lg:p-8">
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Left Brand Panel */}
        <div className="lg:col-span-5 bg-[#110B29] border border-[#2D1F5E] rounded-3xl p-6 lg:p-8 flex flex-col justify-between relative overflow-hidden">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-gradient-to-l from-cyan-400 via-pink-500 to-orange-400"
          />
          <div className="space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[#090617] border border-pink-500/50 shadow-[0_0_20px_rgba(255,59,167,0.28)] shrink-0 flex items-center justify-center">
                <img
                  src="/assets/coach/logo-neon.png"
                  alt="شعار BA9I 100 JOURS - BAC"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div>
                <h1 className="text-xl font-extrabold text-white tracking-tight">
                  <span className="text-pink-400">BA9I</span>{' '}
                  <span className="text-orange-300">100 JOURS</span>
                </h1>
                <p className="text-sm text-cyan-300 font-semibold">
                  تحدي الـ 100 يوم للبكالوريا
                </p>
              </div>
            </div>

            {/* Coach BA9I Welcome Strip */}
            <div className="rounded-2xl bg-[#1A113E] border border-cyan-400/35 p-3.5 flex items-center gap-3">
              <img
                src="/assets/coach/ba9i-saha.png"
                alt="الكوتش باقي يرحب بك في التطبيق"
                className="w-14 h-14 object-contain shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0 space-y-0.5">
                <div className="text-xs font-extrabold text-pink-300">
                  الكوتش BA9I معاك!
                </div>
                <p className="text-xs text-slate-200 leading-relaxed">
                  «أهلاً بيك يا بطل! أنا الكوتش باقي — خطوة بخطوة نوصّلو للمعدل اللي تحلم بيه.»
                </p>
              </div>
            </div>

            <div className="space-y-2.5 pt-1">
              <h2 className="text-2xl lg:text-2xl font-extrabold text-white leading-snug">
                نظّم مراجعتك، وتفوّق في البكالوريا بخطة يومية ذكية.
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                يحوّل البرنامج تحدّي الـ 100 يوم إلى مهام يومية دقيقة مع خوارزمية التكرار المتباعد التلقائية، مؤقت التركيز، وبطولة الولايات.
              </p>
            </div>

            <ul className="space-y-2 text-sm text-slate-300">
              <li className="flex items-center gap-2.5">
                <Check size={16} className="text-teal-400 shrink-0" />
                <span>جدولة تلقائية للمراجعة (J+1، J+3، J+7، J+15، J+30)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check size={16} className="text-cyan-400 shrink-0" />
                <span>حلول ومواضيع البكالوريا السابقة مدمجة مباشرة</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Check size={16} className="text-pink-400 shrink-0" />
                <span>تذاكر يومية للمشاركة في مسابقة 3 أجهزة Laptop</span>
              </li>
            </ul>
          </div>

          <div className="pt-6 mt-6 border-t border-[#2D1F5E] flex items-center justify-between gap-3">
            <span className="text-xs text-slate-400">
              جاهز للتجربة الفورية؟
            </span>
            <button
              type="button"
              onClick={onQuickDemo}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-[#1A113E] hover:bg-[#251854] border border-cyan-400/40 text-cyan-300 text-xs font-bold transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5"
            >
              <Sparkles size={14} />
              <span>دخول سريع (اليوم 06)</span>
            </button>
          </div>
        </div>

        {/* Right Interactive Setup Card */}
        <div className="lg:col-span-7 bg-[#110B29] border border-[#2D1F5E] rounded-3xl p-6 lg:p-8 flex flex-col justify-between">
          <div>
            {/* Step Progress Header */}
            <div className="flex items-center justify-between gap-4 pb-6 border-b border-[#2D1F5E]">
              <div>
                <p className="text-xs text-cyan-300 font-bold">
                  الخطوة {step} من 3
                </p>
                <h2 className="text-lg font-bold text-white mt-0.5">
                  {step === 1
                    ? 'اختر شعبتك الدراسية'
                    : step === 2
                    ? 'حدد هدفك ومستوى التقدم الحالي'
                    : 'أكمل ملفك الشخصي وولايتك'}
                </h2>
              </div>
              <div className="flex items-center gap-1.5" aria-hidden="true">
                {[1, 2, 3].map((s) => (
                  <span
                    key={s}
                    className={`h-2 rounded-full transition-all ${
                      s === step
                        ? 'w-8 bg-gradient-to-l from-cyan-400 to-pink-500'
                        : s < step
                        ? 'w-4 bg-teal-400'
                        : 'w-4 bg-[#2D1F5E]'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Step 1: Branch */}
            {step === 1 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-6">
                {BRANCHES.map((b) => {
                  const selected = branch === b.id;
                  return (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setBranch(b.id)}
                      className={`min-h-[76px] text-right p-4 rounded-2xl border transition-colors flex flex-col justify-between ${
                        selected
                          ? 'bg-cyan-500/12 border-cyan-400 text-white'
                          : 'bg-[#1A113E] border-[#2D1F5E] text-slate-200 hover:border-pink-400/50'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full gap-2">
                        <span className="font-bold text-sm">{b.nameAr}</span>
                        <span
                          className={`text-xs font-mono-num ${
                            selected ? 'text-cyan-300' : 'text-slate-400'
                          }`}
                        >
                          {b.shortAr}
                        </span>
                      </div>
                      <span className="text-xs text-slate-400 mt-1.5">
                        {b.tagline}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}

            {/* Step 2: Target Average & Readiness */}
            {step === 2 && (
              <div className="space-y-6 pt-6">
                <div>
                  <p className="text-sm font-semibold text-slate-200 mb-3">
                    المعدل المستهدف في شهادة البكالوريا
                  </p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {TARGET_AVERAGES.map((t) => {
                      const active = targetAverage === t.value;
                      return (
                        <button
                          key={t.value}
                          type="button"
                          onClick={() => setTargetAverage(t.value)}
                          className={`min-h-[68px] p-3 rounded-2xl border text-center transition-colors ${
                            active
                              ? 'bg-pink-500/15 border-pink-400 text-white'
                              : 'bg-[#1A113E] border-[#2D1F5E] text-slate-300 hover:border-cyan-400/50'
                          }`}
                        >
                          <div className="font-mono-num font-bold text-base text-cyan-300">
                            {t.label}
                          </div>
                          <div className="text-[11px] text-slate-400 mt-1">
                            {t.desc}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-slate-200 mb-3">
                    كيف تقيّم جاهزيتك الآن؟
                  </p>
                  <div className="space-y-2.5">
                    {READINESS_OPTIONS.map((opt) => {
                      const active = readiness === opt.id;
                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => setReadiness(opt.id)}
                          className={`w-full min-h-[56px] p-3.5 rounded-2xl border text-right transition-colors flex items-center justify-between gap-3 ${
                            active
                              ? 'bg-cyan-500/12 border-cyan-400 text-white'
                              : 'bg-[#1A113E] border-[#2D1F5E] text-slate-300 hover:border-pink-400/50'
                          }`}
                        >
                          <div>
                            <div className="text-sm font-bold">{opt.label}</div>
                            <div className="text-xs text-slate-400">
                              {opt.sub}
                            </div>
                          </div>
                          {active && (
                            <Check size={18} className="text-cyan-300 shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Name & Wilaya */}
            {step === 3 && (
              <form id="onboarding-final-form" onSubmit={handleFinish} className="space-y-5 pt-6">
                <div>
                  <label
                    htmlFor="student-name"
                    className="block text-sm font-semibold text-slate-200 mb-2"
                  >
                    الاسم أو اللقب
                  </label>
                  <input
                    id="student-name"
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (nameError) setNameError('');
                    }}
                    placeholder="مثال: أمين أو سارة"
                    className="w-full min-h-[48px] px-4 rounded-xl bg-[#1A113E] border border-[#2D1F5E] text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
                  />
                  {nameError && (
                    <p className="text-xs text-rose-400 mt-1.5">{nameError}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="student-wilaya"
                    className="block text-sm font-semibold text-slate-200 mb-2"
                  >
                    الولاية (للمنافسة في بطولة الولايات)
                  </label>
                  <select
                    id="student-wilaya"
                    value={wilayaCode}
                    onChange={(e) => setWilayaCode(Number(e.target.value))}
                    className="w-full min-h-[48px] px-4 rounded-xl bg-[#1A113E] border border-[#2D1F5E] text-white focus:outline-none focus:border-cyan-400"
                  >
                    {WILAYAS.map((w) => (
                      <option key={w.code} value={w.code}>
                        {String(w.code).padStart(2, '0')} - ولاية {w.nameAr}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-4 rounded-2xl bg-[#1A113E] border border-[#2D1F5E] space-y-3">
                  <div className="flex items-center gap-3.5">
                    <EvolvingAvatar
                      stage={getAvatarStage(1)}
                      size="md"
                      avatarUrl={avatarUrl}
                      altName={name}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-slate-200">
                        صورة الحساب (اختياري)
                      </div>
                      <p className="text-[11px] text-slate-400">
                        يمكنك رفع صورتك الشخصية أو ترك الأفاتار التفاعلي يتطور مع مستواك.
                      </p>
                    </div>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/gif"
                    onChange={handlePhotoChange}
                    aria-label="رفع صورة شخصية اختيارية"
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
                          : 'رفع صورة شخصية'}
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
                        <span>إزالة الصورة</span>
                      </button>
                    )}
                  </div>
                  {avatarError && (
                    <p role="alert" className="text-xs text-rose-400 font-semibold">
                      {avatarError}
                    </p>
                  )}
                </div>

                <div className="p-4 rounded-2xl bg-[#1A113E] border border-[#2D1F5E] text-xs text-slate-300 leading-relaxed">
                  كل مهمة تنجزها تضيف نقاط <span className="text-cyan-300 font-bold">XP</span> لرصيدك ولترتيب ولايتك، وكل يوم تنهيه بالكامل يمنحك <span className="text-pink-300 font-bold">تذكرة سحب</span> لمسابقة 3 أجهزة Laptop بعد البكالوريا.
                </div>
              </form>
            )}
          </div>

          {/* Footer Navigation Buttons */}
          <div className="flex items-center justify-between gap-3 pt-8 mt-6 border-t border-[#2D1F5E]">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s === 3 ? 2 : 1))}
                className="min-h-[44px] px-5 py-2.5 rounded-xl bg-[#1A113E] hover:bg-[#251854] border border-[#2D1F5E] text-slate-200 text-sm font-semibold flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
              >
                <ArrowRight size={16} />
                <span>السابق</span>
              </button>
            ) : (
              <div />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={() => setStep((s) => (s === 1 ? 2 : 3))}
                className="min-h-[44px] px-6 py-2.5 rounded-xl bg-gradient-to-l from-cyan-400 to-teal-300 hover:from-cyan-300 hover:to-teal-200 text-slate-950 text-sm font-extrabold flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
              >
                <span>التالي</span>
                <ArrowLeft size={16} />
              </button>
            ) : (
              <button
                type="submit"
                form="onboarding-final-form"
                className="min-h-[44px] px-6 py-2.5 rounded-xl bg-gradient-to-l from-cyan-400 to-teal-300 hover:from-cyan-300 hover:to-teal-200 text-slate-950 text-sm font-extrabold flex items-center gap-2 transition-colors whitespace-nowrap shrink-0"
              >
                <Rocket size={16} />
                <span>ابدأ تحدي الـ 100 يوم</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
