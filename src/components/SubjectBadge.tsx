import React from 'react';
import {
  Atom,
  BookOpen,
  Calculator,
  Dna,
  Globe2,
  Languages,
  Landmark,
  Lightbulb,
  MoonStar,
} from 'lucide-react';
import { SUBJECT_META } from '../data/curriculum';
import { SubjectId } from '../types/bac';
import { AvatarStage } from '../utils/spacedRepetition';

export function SubjectIcon({
  subject,
  size = 18,
}: {
  subject: SubjectId;
  size?: number;
}) {
  switch (subject) {
    case 'physics':
      return <Atom size={size} aria-hidden="true" />;
    case 'science':
      return <Dna size={size} aria-hidden="true" />;
    case 'math':
      return <Calculator size={size} aria-hidden="true" />;
    case 'arabic':
      return <BookOpen size={size} aria-hidden="true" />;
    case 'philosophy':
      return <Lightbulb size={size} aria-hidden="true" />;
    case 'history':
      return <Landmark size={size} aria-hidden="true" />;
    case 'islamic':
      return <MoonStar size={size} aria-hidden="true" />;
    case 'french':
      return <Globe2 size={size} aria-hidden="true" />;
    case 'english':
      return <Languages size={size} aria-hidden="true" />;
  }
}

export function SubjectHeader({
  subject,
  extraText,
}: {
  subject: SubjectId;
  extraText?: string;
}) {
  const meta = SUBJECT_META[subject];
  return (
    <div className="flex items-center gap-2.5 min-w-0">
      <div
        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${meta.badgeBgClass} ${meta.badgeTextClass}`}
      >
        <SubjectIcon subject={subject} size={18} />
      </div>
      <div className="min-w-0">
        <h3 className={`font-bold text-sm truncate ${meta.badgeTextClass}`}>
          {meta.nameAr}
        </h3>
        {extraText && (
          <p className="text-xs text-slate-400 truncate">{extraText}</p>
        )}
      </div>
    </div>
  );
}

export function EvolvingAvatar({
  stage,
  size = 'md',
  avatarUrl,
  altName,
}: {
  stage: AvatarStage;
  size?: 'sm' | 'md' | 'lg';
  avatarUrl?: string;
  altName?: string;
}) {
  const [imgFailed, setImgFailed] = React.useState(false);

  React.useEffect(() => {
    setImgFailed(false);
  }, [avatarUrl]);

  const dim =
    size === 'sm' ? 'w-10 h-10' : size === 'lg' ? 'w-16 h-16' : 'w-12 h-12';
  const ringClass =
    stage.tier >= 4
      ? 'border-pink-400 bg-pink-500/15 text-pink-300'
      : stage.tier === 3
      ? 'border-cyan-400 bg-cyan-500/15 text-cyan-300'
      : stage.tier === 2
      ? 'border-emerald-400 bg-emerald-500/15 text-emerald-300'
      : 'border-[#2D1F5E] bg-[#1A113E] text-slate-200';

  const showCustomImage = Boolean(avatarUrl && !imgFailed);

  return (
    <div
      className={`${dim} rounded-2xl border ${ringClass} flex items-center justify-center shrink-0 relative overflow-hidden`}
      title={altName ? `${altName} · ${stage.titleAr}` : stage.titleAr}
    >
      {showCustomImage ? (
        <img
          src={avatarUrl}
          alt={altName ? `صورة ${altName}` : 'الصورة الشخصية للطالب'}
          onError={() => setImgFailed(true)}
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
        />
      ) : (
        <svg
          viewBox="0 0 40 40"
          className="w-4/5 h-4/5"
          fill="none"
          aria-hidden="true"
        >
        {/* Hoodie / Shoulders */}
        <path
          d="M8 35c0-6.5 5.4-11 12-11s12 4.5 12 11"
          fill={stage.tier >= 4 ? '#FF3BA7' : stage.tier === 3 ? '#22D3EE' : '#8B5CF6'}
          fillOpacity="0.28"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        {/* Head */}
        <circle
          cx="20"
          cy="15"
          r="6.5"
          fill="#110B29"
          stroke="currentColor"
          strokeWidth="1.8"
        />
        {/* Headphones (tier >= 2) */}
        {stage.tier >= 2 && (
          <path
            d="M12.5 15a7.5 7.5 0 0 1 15 0"
            stroke="#FF8C42"
            strokeWidth="2"
            strokeLinecap="round"
          />
        )}
        {/* Glasses / Focus Visor (tier >= 3) */}
        {stage.tier >= 3 && (
          <path
            d="M15.5 14.5h3.5m2 0h3.5"
            stroke="#22D3EE"
            strokeWidth="1.8"
            strokeLinecap="round"
          />
        )}
        {/* Crown / Star (tier >= 4) */}
        {stage.tier >= 4 && (
          <path
            d="M16 6.5l4-3 4 3"
            stroke="#FF3BA7"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}
        </svg>
      )}
    </div>
  );
}
