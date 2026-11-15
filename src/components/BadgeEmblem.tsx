import React from 'react';
import {
  BrainCircuit,
  CalendarCheck2,
  Crown,
  Flame,
  Headphones,
  NotebookPen,
  Sparkles,
  Timer,
} from 'lucide-react';
import { BadgeIconKey, BadgeTier } from '../utils/badges';

export const BADGE_TIER_PALETTES: Record<
  BadgeTier,
  {
    primary: string;
    secondary: string;
    ringClass: string;
    surfaceClass: string;
    borderClass: string;
    textClass: string;
    barClass: string;
    labelTextClass: string;
  }
> = {
  amber: {
    primary: '#FF8C42',
    secondary: '#EC4899',
    ringClass: 'border-orange-400/65',
    surfaceClass: 'bg-[#1A113E] bg-gradient-to-br from-orange-500/18 via-[#1A113E] to-[#110B29]',
    borderClass: 'border-orange-400/50',
    textClass: 'text-orange-200',
    barClass: 'bg-orange-400',
    labelTextClass: 'text-orange-300',
  },
  cyan: {
    primary: '#22D3EE',
    secondary: '#06B6D4',
    ringClass: 'border-cyan-400/65',
    surfaceClass: 'bg-[#1A113E] bg-gradient-to-br from-cyan-500/18 via-[#1A113E] to-[#110B29]',
    borderClass: 'border-cyan-400/55',
    textClass: 'text-cyan-200',
    barClass: 'bg-cyan-400',
    labelTextClass: 'text-cyan-300',
  },
  emerald: {
    primary: '#2DD4BF',
    secondary: '#10B981',
    ringClass: 'border-teal-400/65',
    surfaceClass: 'bg-[#1A113E] bg-gradient-to-br from-teal-500/18 via-[#1A113E] to-[#110B29]',
    borderClass: 'border-teal-400/55',
    textClass: 'text-teal-200',
    barClass: 'bg-teal-400',
    labelTextClass: 'text-teal-300',
  },
  violet: {
    primary: '#C084FC',
    secondary: '#9333EA',
    ringClass: 'border-purple-400/65',
    surfaceClass: 'bg-[#1A113E] bg-gradient-to-br from-purple-500/18 via-[#1A113E] to-[#110B29]',
    borderClass: 'border-purple-400/55',
    textClass: 'text-purple-200',
    barClass: 'bg-purple-400',
    labelTextClass: 'text-purple-300',
  },
  sky: {
    primary: '#38BDF8',
    secondary: '#2563EB',
    ringClass: 'border-sky-400/65',
    surfaceClass: 'bg-[#1A113E] bg-gradient-to-br from-sky-500/18 via-[#1A113E] to-[#110B29]',
    borderClass: 'border-sky-400/55',
    textClass: 'text-sky-200',
    barClass: 'bg-sky-400',
    labelTextClass: 'text-sky-300',
  },
  gold: {
    primary: '#FDE047',
    secondary: '#FF8C42',
    ringClass: 'border-yellow-400/70',
    surfaceClass: 'bg-[#1A113E] bg-gradient-to-br from-yellow-500/18 via-[#1A113E] to-[#110B29]',
    borderClass: 'border-yellow-400/55',
    textClass: 'text-yellow-200',
    barClass: 'bg-yellow-400',
    labelTextClass: 'text-yellow-300',
  },
  rose: {
    primary: '#FF3BA7',
    secondary: '#E11D48',
    ringClass: 'border-pink-400/65',
    surfaceClass: 'bg-[#1A113E] bg-gradient-to-br from-pink-500/18 via-[#1A113E] to-[#110B29]',
    borderClass: 'border-pink-400/55',
    textClass: 'text-pink-200',
    barClass: 'bg-pink-400',
    labelTextClass: 'text-pink-300',
  },
  teal: {
    primary: '#2DD4BF',
    secondary: '#0D9488',
    ringClass: 'border-teal-400/65',
    surfaceClass: 'bg-[#1A113E] bg-gradient-to-br from-teal-500/18 via-[#1A113E] to-[#110B29]',
    borderClass: 'border-teal-400/55',
    textClass: 'text-teal-200',
    barClass: 'bg-teal-400',
    labelTextClass: 'text-teal-300',
  },
};

function renderBadgeIcon(iconKey: BadgeIconKey, size: number) {
  switch (iconKey) {
    case 'spark':
      return <Sparkles size={size} aria-hidden="true" />;
    case 'flame':
      return <Flame size={size} aria-hidden="true" />;
    case 'calendar':
      return <CalendarCheck2 size={size} aria-hidden="true" />;
    case 'headphones':
      return <Headphones size={size} aria-hidden="true" />;
    case 'timer':
      return <Timer size={size} aria-hidden="true" />;
    case 'crown':
      return <Crown size={size} aria-hidden="true" />;
    case 'brain':
      return <BrainCircuit size={size} aria-hidden="true" />;
    case 'note':
      return <NotebookPen size={size} aria-hidden="true" />;
  }
}

interface BadgeEmblemProps {
  iconKey: BadgeIconKey;
  tier: BadgeTier;
  unlocked: boolean;
  progressPercent: number;
  size?: 'md' | 'lg';
  celebrate?: boolean;
}

export function BadgeEmblem({
  iconKey,
  tier,
  unlocked,
  progressPercent,
  size = 'md',
  celebrate = false,
}: BadgeEmblemProps) {
  const palette = BADGE_TIER_PALETTES[tier];
  const boxDim = size === 'lg' ? 'w-20 h-20' : 'w-14 h-14';
  const iconSize = size === 'lg' ? 30 : 21;

  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const strokeOffset =
    circumference * (1 - Math.max(0, Math.min(100, progressPercent)) / 100);

  return (
    <div className={`relative ${boxDim} flex items-center justify-center shrink-0`}>
      {celebrate && unlocked && (
        <span
          aria-hidden="true"
          className={`absolute inset-0 rounded-2xl border-2 ${palette.ringClass} animate-badge-ring pointer-events-none`}
        />
      )}

      <svg
        viewBox="0 0 64 64"
        className="w-full h-full"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={`grad-${tier}-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={palette.primary} stopOpacity="0.34" />
            <stop offset="100%" stopColor={palette.secondary} stopOpacity="0.18" />
          </linearGradient>
        </defs>

        {/* Outer geometric medal plate */}
        <polygon
          points="32,4 52,12 60,32 52,52 32,60 12,52 4,32 12,12"
          fill={unlocked ? `url(#grad-${tier}-${size})` : '#0D0821'}
          stroke={unlocked ? palette.primary : '#2D1F5E'}
          strokeWidth={unlocked ? '2' : '1.5'}
        />

        {/* Progress ring for locked badges or outer framing ring for unlocked */}
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke={unlocked ? palette.primary : '#2D1F5E'}
          strokeOpacity={unlocked ? 0.3 : 0.85}
          strokeWidth="2.5"
        />
        {!unlocked && progressPercent > 0 && (
          <circle
            cx="32"
            cy="32"
            r={radius}
            fill="none"
            stroke={palette.primary}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeOffset}
            transform="rotate(-90 32 32)"
          />
        )}
      </svg>

      {/* Center Emblem Icon */}
      <div
        className={`absolute inset-0 flex items-center justify-center ${
          unlocked ? palette.textClass : 'text-slate-500'
        }`}
      >
        {renderBadgeIcon(iconKey, iconSize)}
      </div>

      {/* Shine sweep overlay on unlock celebration */}
      {celebrate && unlocked && (
        <div
          aria-hidden="true"
          className="absolute inset-1 rounded-xl overflow-hidden pointer-events-none"
        >
          <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/40 to-transparent animate-badge-shine" />
        </div>
      )}
    </div>
  );
}
