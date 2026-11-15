import React, { useState } from 'react';
import { BookHeart, BookOpenCheck, CalendarCheck2, CheckCircle2, Zap } from 'lucide-react';
import {
  EXAM_WEEK_PROTOCOL,
  METHODOLOGY_GUIDES,
  SUBJECT_META,
} from '../data/curriculum';
import { SubjectId } from '../types/bac';
import { SubjectHeader } from './SubjectBadge';

interface CheatsheetsViewProps {
  initialSubject?: SubjectId | null;
  onOpenExamDouaa?: () => void;
}

export function CheatsheetsView({
  initialSubject,
  onOpenExamDouaa,
}: CheatsheetsViewProps) {
  const [section, setSection] = useState<'guides' | 'protocol'>('guides');
  const [selectedSubject, setSelectedSubject] = useState<SubjectId | 'all'>(
    initialSubject ?? 'all'
  );
  const [thunderMode, setThunderMode] = useState<boolean>(false);

  const visibleGuides =
    selectedSubject === 'all'
      ? METHODOLOGY_GUIDES
      : METHODOLOGY_GUIDES.filter((g) => g.subject === selectedSubject);

  return (
    <div className="space-y-6">
      {/* Header & Section Switcher */}
      <div className="bg-[#110B29] border border-[#2D1F5E] rounded-3xl p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-extrabold text-white">
            منهجية الدراسة وليالي الرعد
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            أساليب المراجعة لكل مادة وبروتوكول أيام البكالوريا من كتاب MR. BAC
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div
            className="inline-flex p-1 rounded-2xl bg-[#090617] border border-[#2D1F5E]"
            role="tablist"
            aria-label="أقسام ليلة الرعد"
          >
            <button
              type="button"
              role="tab"
              aria-selected={section === 'guides'}
              onClick={() => setSection('guides')}
              className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                section === 'guides'
                  ? 'bg-cyan-400 text-slate-950'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <BookOpenCheck size={14} aria-hidden="true" />
              <span>منهجية المواد</span>
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={section === 'protocol'}
              onClick={() => setSection('protocol')}
              className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors whitespace-nowrap ${
                section === 'protocol'
                  ? 'bg-cyan-400 text-slate-950'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <CalendarCheck2 size={14} aria-hidden="true" />
              <span>بروتوكول أيام البكالوريا</span>
            </button>
          </div>

          {section === 'guides' && (
            <button
              type="button"
              onClick={() => setThunderMode((m) => !m)}
              className={`min-h-[44px] px-4 py-2 rounded-xl border text-xs font-extrabold flex items-center justify-center gap-2 transition-colors whitespace-nowrap shrink-0 ${
                thunderMode
                  ? 'bg-gradient-to-l from-cyan-400 to-teal-300 border-cyan-300 text-slate-950'
                  : 'bg-[#1A113E] border-[#2D1F5E] text-pink-300 hover:border-pink-400/50'
              }`}
            >
              <Zap size={16} aria-hidden="true" />
              <span>{thunderMode ? 'وضع ليلة الرعد مفعل' : 'تفعيل وضع ليلة الرعد'}</span>
            </button>
          )}
        </div>
      </div>

      {section === 'guides' ? (
        <>
          {/* Subject Filter Bar */}
          <div
            className="flex items-center gap-2 overflow-x-auto hide-scrollbar pb-1"
            role="tablist"
            aria-label="تصفية المواد الدراسية"
          >
            <button
              type="button"
              role="tab"
              aria-selected={selectedSubject === 'all'}
              onClick={() => setSelectedSubject('all')}
              className={`min-h-[40px] px-4 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                selectedSubject === 'all'
                  ? 'bg-cyan-400 text-slate-950'
                  : 'bg-[#110B29] border border-[#2D1F5E] text-slate-300 hover:text-white'
              }`}
            >
              جميع المواد ({METHODOLOGY_GUIDES.length})
            </button>

            {METHODOLOGY_GUIDES.map((g) => {
              const meta = SUBJECT_META[g.subject];
              const active = selectedSubject === g.subject;
              return (
                <button
                  key={g.subject}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSelectedSubject(g.subject)}
                  className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-cyan-400 text-slate-950'
                      : 'bg-[#110B29] border border-[#2D1F5E] text-slate-300 hover:text-white'
                  }`}
                >
                  {meta.nameAr}
                </button>
              );
            })}
          </div>

          {/* Guide Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {visibleGuides.map((guide) => (
              <article
                key={guide.subject}
                className="bg-[#110B29] border border-[#2D1F5E] rounded-3xl p-5 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <SubjectHeader
                      subject={guide.subject}
                      extraText={guide.keyResources.join(' · ')}
                    />
                    {thunderMode && (
                      <span className="text-xs font-bold text-pink-300 shrink-0">
                        ليلة الرعد
                      </span>
                    )}
                  </div>

                  {thunderMode ? (
                    <div className="space-y-2.5 bg-[#1A113E] border border-pink-400/30 rounded-2xl p-4">
                      <div className="flex items-center gap-2 text-xs font-bold text-pink-300">
                        <Zap size={14} aria-hidden="true" />
                        <span>نقاط الحسم السريعة قبل الامتحان</span>
                      </div>
                      <ul className="space-y-2">
                        {guide.thunderTips.map((tip, idx) => (
                          <li
                            key={idx}
                            className="text-xs sm:text-sm text-slate-100 leading-relaxed flex items-start gap-2"
                          >
                            <span className="text-pink-400 font-bold">•</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <ol className="space-y-2.5">
                      {guide.steps.map((step, idx) => (
                        <li
                          key={idx}
                          className="text-xs sm:text-sm text-slate-200 leading-relaxed flex items-start gap-2.5"
                        >
                          <span className="font-mono-num text-xs font-bold text-cyan-400 mt-0.5 shrink-0">
                            0{idx + 1}.
                          </span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>

                {!thunderMode && (
                  <div className="pt-3 border-t border-[#2D1F5E] flex items-center gap-2 text-xs text-slate-400">
                    <BookOpenCheck size={14} className="text-emerald-400 shrink-0" aria-hidden="true" />
                    <span className="truncate">{guide.thunderTips[0]}</span>
                  </div>
                )}
              </article>
            ))}
          </div>
        </>
      ) : (
        /* Exam Week Protocol (Saturday -> Thursday from PDF 2 p.104-110) */
        <div className="space-y-5">
          <div className="bg-[#110B29] border border-[#2D1F5E] rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-base font-extrabold text-cyan-300">
                دليل أسبوع البكالوريا الرسمي (السبت ← الخميس)
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                القاعدة الذهبية أثناء أيام الامتحان: كل مادة تجتازها انسها تماماً وركز على المادة القادمة بهدوء وثقة.
              </p>
            </div>
            {onOpenExamDouaa && (
              <button
                type="button"
                onClick={onOpenExamDouaa}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors whitespace-nowrap shrink-0"
              >
                <BookHeart size={16} aria-hidden="true" />
                <span>قراءة دعاء الإمتحان</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {EXAM_WEEK_PROTOCOL.map((item, idx) => (
              <article
                key={item.id}
                className="bg-[#110B29] border border-[#2D1F5E] rounded-3xl p-5 space-y-3.5"
              >
                <div className="flex items-center justify-between gap-2 pb-2.5 border-b border-[#2D1F5E]">
                  <span className="text-sm font-extrabold text-pink-400">
                    {item.dayName}
                  </span>
                  <span className="font-mono-num text-xs text-slate-400">
                    0{idx + 1} / 06
                  </span>
                </div>

                <h3 className="text-sm sm:text-base font-bold text-white">
                  {item.title}
                </h3>

                <ul className="space-y-2.5">
                  {item.checklist.map((step, sIdx) => (
                    <li
                      key={sIdx}
                      className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-200 leading-relaxed"
                    >
                      <CheckCircle2
                        size={15}
                        className="text-emerald-400 shrink-0 mt-0.5"
                        aria-hidden="true"
                      />
                      <span>{step}</span>
                    </li>
                  ))}
                </ul>

                {item.closingNote && (
                  <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-extrabold text-center">
                    {item.closingNote}
                  </div>
                )}
              </article>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
