import React from 'react';
import {
  Bell,
  BookHeart,
  CheckSquare,
  Flame,
  Headphones,
  Ticket,
  Trophy,
  UserCog,
  Zap,
} from 'lucide-react';
import { BRANCHES } from '../data/curriculum';
import { TabId, UserProfile } from '../types/bac';
import { AvatarStage, UserStats } from '../utils/spacedRepetition';
import { EvolvingAvatar } from './SubjectBadge';

interface NavigationShellProps {
  activeTab: TabId;
  onChangeTab: (tab: TabId) => void;
  profile: UserProfile;
  stats: UserStats;
  avatarStage: AvatarStage;
  onOpenDouaa: () => void;
  onOpenProfile: () => void;
}

const NAV_ITEMS: { id: TabId; label: string; icon: React.FC<{ size?: number }> }[] = [
  { id: 'quests', label: 'مهامي', icon: CheckSquare },
  { id: 'focus', label: 'التركيز', icon: Headphones },
  { id: 'thunder', label: 'ليلة الرعد', icon: Zap },
  { id: 'ranking', label: 'الترتيب', icon: Trophy },
];

export function TopHeader({
  profile,
  stats,
  overdueCount = 0,
  onOpenDouaa,
  onOpenProfile,
  onOpenOverdue,
}: Omit<NavigationShellProps, 'activeTab' | 'onChangeTab' | 'avatarStage'> & {
  overdueCount?: number;
  onOpenOverdue?: () => void;
}) {
  const branchName =
    BRANCHES.find((b) => b.id === profile.branch)?.shortAr ?? 'ع.ت';

  return (
    <header className="sticky top-0 z-30 h-14 bg-[#090617]/95 backdrop-blur-md border-b border-[#2D1F5E] px-2.5 sm:px-4 lg:px-6 flex items-center justify-between gap-1.5 sm:gap-2">
      {/* Brand Zone */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 shrink-0 sm:shrink">
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl overflow-hidden bg-[#110B29] border border-pink-500/45 shadow-[0_0_12px_rgba(255,59,167,0.22)] shrink-0 lg:hidden">
          <img
            src="/assets/coach/logo-neon.png"
            alt="شعار BA9I 100 JOURS"
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <span className="font-extrabold text-sm sm:text-base text-white whitespace-nowrap shrink-0">
          <span className="text-pink-400">BA9I</span>{' '}
          <span className="text-cyan-300">100</span>
        </span>
        <span className="hidden sm:inline text-slate-600" aria-hidden="true">
          ·
        </span>
        <span className="hidden sm:inline text-xs text-slate-300 truncate">
          {profile.name} ({branchName})
        </span>
      </div>

      {/* Metrics & Primary Actions */}
      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
        <div
          className="flex items-center gap-1.5 sm:gap-3 px-1 sm:px-2.5 py-1 text-xs font-mono-num"
          aria-label={`سلسلة الالتزام ${stats.streakDays} أيام وتذاكر السحب ${stats.raffleTickets}`}
        >
          <span className="flex items-center gap-1 text-orange-300 font-bold whitespace-nowrap">
            <Flame size={14} className="text-orange-400" aria-hidden="true" />
            <span>{stats.streakDays}</span>
          </span>
          <span className="text-slate-600" aria-hidden="true">
            /
          </span>
          <span className="flex items-center gap-1 text-teal-300 font-bold whitespace-nowrap">
            <Ticket size={14} className="text-teal-400" aria-hidden="true" />
            <span>{stats.raffleTickets}</span>
          </span>
        </div>

        {overdueCount > 0 && onOpenOverdue && (
          <button
            type="button"
            onClick={onOpenOverdue}
            data-testid="overdue-bell-button"
            aria-label={`تنبيه المهام المتأخرة (${overdueCount})`}
            className="min-h-[38px] sm:min-h-[40px] px-2 sm:px-2.5 py-1.5 rounded-xl bg-orange-500/15 hover:bg-orange-500/25 border border-orange-400/50 text-orange-300 text-xs font-bold flex items-center gap-1 transition-colors whitespace-nowrap shrink-0"
          >
            <Bell size={14} aria-hidden="true" />
            <span className="font-mono-num">{overdueCount}</span>
          </button>
        )}

        <button
          type="button"
          onClick={onOpenDouaa}
          className="min-h-[38px] sm:min-h-[40px] px-2 sm:px-3 py-1.5 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 border border-teal-400/35 text-teal-300 text-xs font-bold flex items-center gap-1 sm:gap-1.5 transition-colors whitespace-nowrap shrink-0"
        >
          <BookHeart size={14} aria-hidden="true" />
          <span className="hidden sm:inline">دعاء الدراسة</span>
          <span className="sm:hidden">دعاء</span>
        </button>

        <button
          type="button"
          onClick={onOpenProfile}
          aria-label="إعدادات الحساب والشعبة"
          className="min-h-[38px] min-w-[38px] sm:min-h-[40px] sm:min-w-[40px] rounded-xl bg-[#1A113E] hover:bg-[#251854] border border-[#2D1F5E] text-slate-200 flex items-center justify-center transition-colors shrink-0 lg:hidden"
        >
          <UserCog size={16} aria-hidden="true" />
        </button>
      </div>
    </header>
  );
}

export function DesktopSidebar({
  activeTab,
  onChangeTab,
  profile,
  stats,
  avatarStage,
  onOpenDouaa,
  onOpenProfile,
}: NavigationShellProps) {
  const branchInfo = BRANCHES.find((b) => b.id === profile.branch);

  return (
    <aside className="hidden lg:flex lg:flex-col lg:w-68 lg:shrink-0 lg:sticky lg:top-0 lg:h-screen bg-[#0D0821] border-l border-[#2D1F5E] p-5 justify-between">
      <div className="space-y-6">
        {/* Brand */}
        <div className="flex items-center gap-3 pb-4 border-b border-[#2D1F5E]">
          <div className="w-12 h-12 rounded-2xl overflow-hidden bg-[#110B29] border border-pink-500/50 shadow-[0_0_16px_rgba(255,59,167,0.25)] shrink-0">
            <img
              src="/assets/coach/logo-neon.png"
              alt="شعار BA9I 100 JOURS - BAC"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="min-w-0">
            <div className="font-extrabold text-base text-white truncate">
              <span className="text-pink-400">BA9I</span>{' '}
              <span className="text-orange-300">100 JOURS</span>
            </div>
            <div className="text-xs text-cyan-300 font-semibold truncate">
              تحدي البكالوريا · الكوتش BA9I
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <div className="p-3.5 rounded-2xl bg-[#110B29] border border-[#2D1F5E] space-y-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onOpenProfile}
              aria-label="تغيير الصورة الشخصية أو تعديل الملف"
              className="rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 shrink-0 hover:opacity-90 transition-opacity"
            >
              <EvolvingAvatar
                stage={avatarStage}
                size="sm"
                avatarUrl={profile.avatarUrl}
                altName={profile.name}
              />
            </button>
            <div className="min-w-0 flex-1">
              <div className="font-bold text-sm text-white truncate">
                {profile.name}
              </div>
              <div className="text-xs text-slate-400 truncate">
                {branchInfo?.nameAr} · الهدف {profile.targetAverage}/20
              </div>
            </div>
          </div>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="text-cyan-300 font-bold truncate">
                المستوى {stats.level} · {avatarStage.titleAr}
              </span>
              <span className="font-mono-num text-pink-300 whitespace-nowrap shrink-0">
                {stats.totalXp} XP
              </span>
            </div>
            <div className="w-full h-1.5 bg-[#090617] rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-l from-cyan-400 to-pink-500 rounded-full transition-all duration-300"
                style={{ width: `${stats.levelProgressPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Primary Nav */}
        <nav className="space-y-1.5" aria-label="التنقل الرئيسي">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onChangeTab(item.id)}
                className={`w-full min-h-[46px] px-4 py-2.5 rounded-xl flex items-center gap-3 text-sm font-bold transition-colors whitespace-nowrap ${
                  active
                    ? 'bg-gradient-to-l from-cyan-400 to-teal-300 text-slate-950 shadow-[0_6px_18px_rgba(34,211,238,0.2)]'
                    : 'text-slate-300 hover:bg-[#1A113E] hover:text-white'
                }`}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Actions */}
      <div className="space-y-2 pt-4 border-t border-[#2D1F5E]">
        <button
          type="button"
          onClick={onOpenDouaa}
          className="w-full min-h-[44px] px-4 py-2 rounded-xl bg-teal-500/15 hover:bg-teal-500/25 border border-teal-400/35 text-teal-300 text-xs font-bold flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
        >
          <BookHeart size={16} aria-hidden="true" />
          <span>دعاء بداية الدراسة</span>
        </button>
        <button
          type="button"
          onClick={onOpenProfile}
          className="w-full min-h-[44px] px-4 py-2 rounded-xl bg-[#1A113E] hover:bg-[#251854] border border-[#2D1F5E] text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
        >
          <UserCog size={16} aria-hidden="true" />
          <span>تعديل الملف والشعبة</span>
        </button>
      </div>
    </aside>
  );
}

export function MobileBottomNav({
  activeTab,
  onChangeTab,
}: {
  activeTab: TabId;
  onChangeTab: (tab: TabId) => void;
}) {
  return (
    <nav
      aria-label="شريط التنقل السفلي"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-[#0D0821]/95 backdrop-blur-md border-t border-[#2D1F5E] grid grid-cols-4 items-center px-2"
    >
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const active = activeTab === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onChangeTab(item.id)}
            className={`min-h-[48px] flex flex-col items-center justify-center gap-1 text-[11px] font-bold transition-colors whitespace-nowrap ${
              active ? 'text-cyan-300' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Icon size={20} />
            <span>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
