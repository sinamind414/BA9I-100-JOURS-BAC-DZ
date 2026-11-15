import React, { useMemo, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { BranchId } from '../types/bac';
import {
  buildDailyCompletionSeries,
  DailyTrendPoint,
  summarizeCompletionSeries,
  TrendRange,
} from '../utils/spacedRepetition';

interface CompletionChartWidgetProps {
  currentDay: number;
  branch: BranchId;
  completedTaskIds: ReadonlySet<string>;
  completedExtraIds: ReadonlySet<string>;
  onSelectDay: (day: number) => void;
}

const RANGE_OPTIONS: { id: TrendRange; label: string }[] = [
  { id: '7d', label: '7 أيام' },
  { id: '14d', label: '14 يوماً' },
  { id: '30d', label: '30 يوماً' },
  { id: 'all', label: '100 يوم' },
];

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: DailyTrendPoint }>;
}

function TrendTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const pt = payload[0].payload;
  return (
    <div
      dir="rtl"
      className="bg-[#090617] border border-[#2D1F5E] rounded-2xl px-3.5 py-2.5 shadow-xl space-y-1 text-xs"
    >
      <div className="font-extrabold text-white flex items-center justify-between gap-4">
        <span>اليوم {String(pt.day).padStart(2, '0')}</span>
        <span className="font-mono-num text-cyan-300">{pt.percent}%</span>
      </div>
      <div className="text-slate-300 font-mono-num">
        المهام: {pt.completedCount} / {pt.totalCount}
      </div>
      <div className="text-emerald-300 font-mono-num">+{pt.earnedXp} XP</div>
    </div>
  );
}

export function CompletionChartWidget({
  currentDay,
  branch,
  completedTaskIds,
  completedExtraIds,
  onSelectDay,
}: CompletionChartWidgetProps) {
  const [range, setRange] = useState<TrendRange>('7d');

  const series = useMemo(
    () =>
      buildDailyCompletionSeries(
        completedTaskIds,
        completedExtraIds,
        branch,
        currentDay,
        range
      ),
    [completedTaskIds, completedExtraIds, branch, currentDay, range]
  );

  const summary = useMemo(
    () => summarizeCompletionSeries(series, currentDay),
    [series, currentDay]
  );

  const xInterval = range === 'all' ? 9 : range === '30d' ? 4 : range === '14d' ? 1 : 0;

  return (
    <section
      aria-label="منحنى تطور نسبة إكمال المهام عبر الأيام"
      data-testid="completion-trend-widget"
      className="bg-[#110B29] border border-[#2D1F5E] rounded-3xl p-4 sm:p-5 space-y-4"
    >
      {/* Header & Range Switcher */}
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <TrendingUp size={17} className="text-cyan-400 shrink-0" aria-hidden="true" />
            <h2 className="text-sm sm:text-base font-extrabold text-white">
              منحنى تطور الأداء اليومي
            </h2>
          </div>

          <div
            className="inline-flex items-center gap-1 p-1 rounded-2xl bg-[#090617] border border-[#2D1F5E] max-w-full"
            role="tablist"
            aria-label="نطاق عرض المخطط البياني"
          >
            {RANGE_OPTIONS.map((opt) => {
              const active = range === opt.id;
              return (
                <button
                  key={opt.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setRange(opt.id)}
                  className={`min-h-[36px] px-2.5 sm:px-3 py-1 rounded-xl text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'bg-cyan-400 text-slate-950'
                      : 'text-slate-300 hover:text-white'
                  }`}
                >
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-400">
          <span>
            المتوسط:{' '}
            <strong className="font-mono-num text-cyan-300">{summary.avgPercent}%</strong>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            أيام 100%:{' '}
            <strong className="font-mono-num text-emerald-300">
              {summary.perfectDaysCount}
            </strong>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            الأفضل:{' '}
            <strong className="font-mono-num text-pink-300">
              {summary.bestDay
                ? `اليوم ${String(summary.bestDay).padStart(2, '0')} (${summary.bestPercent}%)`
                : '—'}
            </strong>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            مجموع XP:{' '}
            <strong className="font-mono-num text-slate-200">{summary.totalEarnedXp}</strong>
          </span>
        </div>
      </div>

      {/* Recharts Area Chart */}
      <div className="w-full h-48 sm:h-52" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={series}
            margin={{ top: 10, right: 14, left: -12, bottom: 0 }}
            onClick={(chartState) => {
              const idx = chartState?.activeTooltipIndex;
              if (typeof idx === 'number' && series[idx]) {
                onSelectDay(series[idx].day);
              }
            }}
          >
            <defs>
              <linearGradient id="ba9iCompletionGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22D3EE" stopOpacity={0.38} />
                <stop offset="55%" stopColor="#FF3BA7" stopOpacity={0.14} />
                <stop offset="95%" stopColor="#22D3EE" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid
              stroke="#2D1F5E"
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              dataKey="dayLabel"
              interval={xInterval}
              padding={{ left: 10, right: 10 }}
              tick={{ fill: '#94A3B8', fontSize: 11 }}
              axisLine={{ stroke: '#2D1F5E' }}
              tickLine={false}
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 25, 50, 70, 100]}
              tickFormatter={(v) => `${v}%`}
              tick={{ fill: '#94A3B8', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={<TrendTooltip />}
              cursor={{ stroke: '#FF3BA7', strokeWidth: 1, strokeDasharray: '3 3' }}
            />
            <ReferenceLine
              y={70}
              stroke="#2DD4BF"
              strokeDasharray="4 4"
              strokeOpacity={0.75}
            />
            <Area
              type="monotone"
              dataKey="percent"
              name="نسبة الإكمال"
              stroke="#22D3EE"
              strokeWidth={2.5}
              fill="url(#ba9iCompletionGradient)"
              activeDot={{ r: 5, fill: '#22D3EE', stroke: '#090617', strokeWidth: 2 }}
              dot={(dotProps) => {
                const { cx, cy, payload } = dotProps;
                if (typeof cx !== 'number' || typeof cy !== 'number') return null;
                if (payload?.isCurrent) {
                  return (
                    <circle
                      key={`dot-${payload.day}`}
                      cx={cx}
                      cy={cy}
                      r={4.5}
                      fill="#FF3BA7"
                      stroke="#090617"
                      strokeWidth={2}
                    />
                  );
                }
                if (range === '7d') {
                  return (
                    <circle
                      key={`dot-${payload.day}`}
                      cx={cx}
                      cy={cy}
                      r={3}
                      fill="#22D3EE"
                      stroke="#090617"
                      strokeWidth={1.5}
                    />
                  );
                }
                return null;
              }}
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Legend & Empty Guidance */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#2D1F5E]/80 text-[11px] text-slate-400">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-0.5 bg-cyan-400" aria-hidden="true" />
            <span>نسبة إكمال المهام اليومية</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 border-t border-dashed border-teal-400" aria-hidden="true" />
            <span>هدف فتح مكافأة الأسبوع (70%)</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-pink-500" aria-hidden="true" />
            <span>اليوم المحدد ({String(currentDay).padStart(2, '0')})</span>
          </span>
        </div>

        <span>
          {summary.hasAnyActivity
            ? 'اضغط على أي يوم في الرسم للانتقال إليه'
            : 'أكمل أي مهمة أدناه لتبدأ قراءة منحنى تطورك اليومي'}
        </span>
      </div>
    </section>
  );
}
