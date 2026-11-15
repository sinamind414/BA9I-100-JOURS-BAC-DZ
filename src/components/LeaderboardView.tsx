import React, { useState } from 'react';
import { Award, CheckCircle2, Laptop, MapPin, Ticket, Trophy } from 'lucide-react';
import { HALL_OF_FAME, WILAYAS } from '../data/curriculum';
import { ContestSubmission, UserProfile } from '../types/bac';
import { UserStats, validateContestForm } from '../utils/spacedRepetition';

interface LeaderboardViewProps {
  profile: UserProfile;
  stats: UserStats;
  submission: ContestSubmission | null;
  onSubmitContest: (submission: ContestSubmission) => void;
}

type RankingSubTab = 'wilayas' | 'contest' | 'legends';

export function LeaderboardView({
  profile,
  stats,
  submission,
  onSubmitContest,
}: LeaderboardViewProps) {
  const [subTab, setSubTab] = useState<RankingSubTab>('wilayas');
  const [fullName, setFullName] = useState(submission?.fullName ?? profile.name);
  const [phone, setPhone] = useState(submission?.phone ?? '');
  const [address, setAddress] = useState(
    submission?.address ??
      (WILAYAS.find((w) => w.code === profile.wilayaCode)?.nameAr || '')
  );
  const [bacAverage, setBacAverage] = useState(submission?.bacAverage ?? '');
  const [registrationNumber, setRegistrationNumber] = useState(
    submission?.registrationNumber ?? ''
  );
  const [errors, setErrors] = useState<
    Partial<Record<keyof ContestSubmission, string>>
  >({});

  // Merge user's XP into their selected Wilaya dynamically
  const rankedWilayas = [...WILAYAS]
    .map((w) => ({
      ...w,
      totalXp: w.code === profile.wilayaCode ? w.baseXp + stats.totalXp : w.baseXp,
      isUserWilaya: w.code === profile.wilayaCode,
    }))
    .sort((a, b) => b.totalXp - a.totalXp);

  const handleContestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const check = validateContestForm({
      fullName,
      phone,
      address,
      bacAverage,
      registrationNumber,
    });
    if (!check.valid) {
      setErrors(check.errors);
      return;
    }
    setErrors({});
    onSubmitContest({
      fullName: fullName.trim(),
      phone: phone.trim(),
      address: address.trim(),
      bacAverage: bacAverage.trim(),
      registrationNumber: registrationNumber.trim(),
      submittedAt: new Date().toISOString(),
    });
  };

  return (
    <div className="space-y-6">
      {/* Header + Sub-Tabs */}
      <div className="bg-[#110B29] border border-[#2D1F5E] rounded-3xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white">
            بطولة الولايات ومسابقة 3 أجهزة Laptop
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            مساهمتك اليومية ترفع ترتيب ولايتك وتزيد تذاكر السحب الخاصة بك
          </p>
        </div>

        <div
          className="flex items-center gap-1 p-1 bg-[#090617] border border-[#2D1F5E] rounded-xl self-start md:self-auto"
          role="tablist"
        >
          <button
            type="button"
            role="tab"
            aria-selected={subTab === 'wilayas'}
            onClick={() => setSubTab('wilayas')}
            className={`min-h-[40px] px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
              subTab === 'wilayas'
                ? 'bg-cyan-400 text-slate-950'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            بطولة الولايات
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={subTab === 'contest'}
            onClick={() => setSubTab('contest')}
            className={`min-h-[40px] px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
              subTab === 'contest'
                ? 'bg-cyan-400 text-slate-950'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            مسابقة الحاسوب
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={subTab === 'legends'}
            onClick={() => setSubTab('legends')}
            className={`min-h-[40px] px-3.5 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap ${
              subTab === 'legends'
                ? 'bg-cyan-400 text-slate-950'
                : 'text-slate-300 hover:text-white'
            }`}
          >
            أساطير الباك
          </button>
        </div>
      </div>

      {/* Sub-tab 1: Wilaya Leaderboard */}
      {subTab === 'wilayas' && (
        <div className="bg-[#110B29] border border-[#2D1F5E] rounded-3xl overflow-hidden">
          <div className="p-5 border-b border-[#2D1F5E] flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Trophy size={18} className="text-pink-400" aria-hidden="true" />
              <h2 className="font-extrabold text-sm text-white">
                الترتيب الوطني للولايات الجزائرية
              </h2>
            </div>
            <span className="text-xs text-slate-400 font-mono-num">
              مساهمتك: +{stats.totalXp} XP
            </span>
          </div>

          <div className="divide-y divide-[#2D1F5E]/80">
            {rankedWilayas.map((w, idx) => {
              const rank = idx + 1;
              return (
                <div
                  key={w.code}
                  className={`px-5 py-3.5 flex items-center justify-between gap-4 ${
                    w.isUserWilaya ? 'bg-cyan-400/10' : ''
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span
                      className={`w-8 h-8 rounded-xl font-mono-num text-xs font-extrabold flex items-center justify-center shrink-0 ${
                        rank === 1
                          ? 'bg-gradient-to-br from-cyan-400 to-teal-300 text-slate-950'
                          : rank === 2
                          ? 'bg-pink-500 text-slate-950'
                          : rank === 3
                          ? 'bg-orange-400 text-slate-950'
                          : 'bg-[#1A113E] text-slate-300'
                      }`}
                    >
                      {rank}
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 text-sm font-bold text-white">
                        <MapPin size={14} className="text-slate-400 shrink-0" aria-hidden="true" />
                        <span>
                          {w.nameAr} ({String(w.code).padStart(2, '0')})
                        </span>
                        {w.isUserWilaya && (
                          <span className="text-xs text-cyan-300 font-bold">
                            · ولايتك
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 font-mono-num">
                        {w.studentsCount} مشارك نشط
                      </div>
                    </div>
                  </div>

                  <div className="text-left shrink-0">
                    <div className="font-mono-num text-sm font-extrabold text-cyan-300">
                      {w.totalXp.toLocaleString('en-US')} XP
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Sub-tab 2: 3 Laptops Contest & Submission Form */}
      {subTab === 'contest' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 bg-[#110B29] border border-[#2D1F5E] rounded-3xl p-6 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-pink-500/15 text-pink-300 flex items-center justify-center shrink-0">
                <Laptop size={22} aria-hidden="true" />
              </div>
              <div>
                <h2 className="font-extrabold text-base text-white">
                  فرصة الفوز بـ 3 أجهزة Laptop
                </h2>
                <p className="text-xs text-slate-400">
                  لدعم رحلتك الجامعية وتحقيق نجاحك الأكاديمي
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#1A113E] border border-[#2D1F5E] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Ticket size={18} className="text-emerald-400" aria-hidden="true" />
                <span className="text-sm font-bold text-slate-200">
                  تذاكر السحب الحالية
                </span>
              </div>
              <span className="font-mono-num text-2xl font-extrabold text-emerald-300">
                {stats.raffleTickets}
              </span>
            </div>

            <ul className="space-y-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
              <li>1. كل يوم تكمله بنسبة 100% يضيف تذكرة سحب جديدة لحسابك.</li>
              <li>2. كل 3 جلسات تركيز مكتملة تمنحك تذكرة إضافية.</li>
              <li>3. بعد إعلان نتائج البكالوريا، املأ استمارة المشاركة في أجل أقصاه 30 يوماً.</li>
            </ul>
          </div>

          <div className="lg:col-span-7 bg-[#110B29] border border-[#2D1F5E] rounded-3xl p-6 space-y-4">
            <h2 className="font-extrabold text-base text-white">
              إستمارة المشاركة بعد نتائج البكالوريا
            </h2>

            {submission ? (
              <div className="p-5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 space-y-2">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                  <CheckCircle2 size={18} />
                  <span>تم تسجيل استمارتك في السحب بنجاح!</span>
                </div>
                <p className="text-xs text-slate-200">
                  الاسم: {submission.fullName} · المعدل: {submission.bacAverage}/20 · رقم التسجيل: {submission.registrationNumber}
                </p>
              </div>
            ) : (
              <form onSubmit={handleContestSubmit} className="space-y-4" noValidate>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="c-name" className="block text-xs font-bold text-slate-300 mb-1.5">
                      الإسم واللقب
                    </label>
                    <input
                      id="c-name"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#1A113E] border border-[#2D1F5E] focus:border-cyan-400 focus:outline-none text-white text-sm"
                    />
                    {errors.fullName && (
                      <p className="text-xs text-rose-400 mt-1">{errors.fullName}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="c-phone" className="block text-xs font-bold text-slate-300 mb-1.5">
                      رقم الهاتف
                    </label>
                    <input
                      id="c-phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0550123456"
                      className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#1A113E] border border-[#2D1F5E] focus:border-cyan-400 focus:outline-none text-white text-sm font-mono-num"
                    />
                    {errors.phone && (
                      <p className="text-xs text-rose-400 mt-1">{errors.phone}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label htmlFor="c-addr" className="block text-xs font-bold text-slate-300 mb-1.5">
                    العنوان والولاية
                  </label>
                  <input
                    id="c-addr"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#1A113E] border border-[#2D1F5E] focus:border-cyan-400 focus:outline-none text-white text-sm"
                  />
                  {errors.address && (
                    <p className="text-xs text-rose-400 mt-1">{errors.address}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="c-avg" className="block text-xs font-bold text-slate-300 mb-1.5">
                      معدل البكالوريا
                    </label>
                    <input
                      id="c-avg"
                      type="text"
                      value={bacAverage}
                      onChange={(e) => setBacAverage(e.target.value)}
                      placeholder="16.50"
                      className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#1A113E] border border-[#2D1F5E] focus:border-cyan-400 focus:outline-none text-white text-sm font-mono-num"
                    />
                    {errors.bacAverage && (
                      <p className="text-xs text-rose-400 mt-1">{errors.bacAverage}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="c-reg" className="block text-xs font-bold text-slate-300 mb-1.5">
                      رقم التسجيل
                    </label>
                    <input
                      id="c-reg"
                      type="text"
                      value={registrationNumber}
                      onChange={(e) => setRegistrationNumber(e.target.value)}
                      placeholder="38192045"
                      className="w-full min-h-[44px] px-3.5 rounded-xl bg-[#1A113E] border border-[#2D1F5E] focus:border-cyan-400 focus:outline-none text-white text-sm font-mono-num"
                    />
                    {errors.registrationNumber && (
                      <p className="text-xs text-rose-400 mt-1">
                        {errors.registrationNumber}
                      </p>
                    )}
                  </div>
                </div>

                <button
                  type="submit"
                  className="min-h-[46px] px-6 py-2.5 rounded-xl bg-gradient-to-l from-cyan-400 to-teal-300 hover:from-cyan-300 hover:to-teal-200 text-slate-950 font-extrabold text-sm transition-colors"
                >
                  تأكيد وإرسال استمارة السحب
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Sub-tab 3: Hall of Fame */}
      {subTab === 'legends' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {HALL_OF_FAME.map((item) => (
            <article
              key={item.id}
              className="bg-[#110B29] border border-[#2D1F5E] rounded-3xl p-5 space-y-3"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <Award size={18} className="text-pink-400 shrink-0" aria-hidden="true" />
                  <div>
                    <h3 className="font-bold text-sm text-white">
                      {item.studentName}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {item.branchAr} · {item.daysUsed}
                    </p>
                  </div>
                </div>
                <span className="font-mono-num text-lg font-extrabold text-emerald-300">
                  {item.bacAverage}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                «{item.quote}»
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
