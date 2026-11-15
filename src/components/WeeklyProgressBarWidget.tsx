import React, { useMemo } from 'react';
import { BarChart3 } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { BranchId } from '../types/bac';
import {
  buildWeeklyProgressBarSeries,
  summarizeWeeklyProgressSeries,
  WeeklyTasksBarPoint,
} from '../utils/spacedRepetition';

interface WeeklyProgressBarWidgetProps {
  currentDay: number;
  branch: BranchId;
  completedTaskIds: ReadonlySet<string>;
  completedExtraIds: ReadonlySet<string>;
  onSelectDay: (day: number) => void;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ payload: WeeklyTasksBarPoint }>;
}

function WeeklyBarTooltip({ active, payload }: CustomTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const pt = payload[0].payload;
  return (
    <div
      dir="rtl"
      className="bg-[#090617] border border-[#2D1F5E] rounded-2xl px-3.5 py-2.5 shadow-xl space-y-1 text-xs"
    >
      <div className="font-extrabold text-white flex items-center justify-between gap-4">
        <span>
          الأسبوع {String(pt.week).padStart(2, '0')} (أيام{' '}
          {String(pt.startDay).padStart(2, '0')}-{String(pt.endDay).padStart(2, '0')})
        </span>
        <span className="font-mono-num text-cyan-300">{pt.percent}%</span>
      </div>
      <div className="text-slate-200 font-mono-num">
        المهام المنجزة: <strong className="text-pink-300">{pt.completedTasks}</strong> /{' '}
        {pt.totalTasks}
      </div>
      <div className="text-slate-400 font-mono-num">
        المهام الأساسية: {pt.coreCompletedTasks} / {pt.coreTotalTasks}
      </div>
      <div className="text-emerald-300 font-mono-num">+{pt.earnedXp} XP</div>
    </div>
  );
}

function getBarColor(pt: WeeklyTasksBarPoint): string {
  if (pt.isCurrentWeek) return '#FF3BA7';
  if (pt.percent >= 70) return '#2DD4BF';
  if (pt.completedTasks > 0) return '#22D3EE';
  return '#24184E';
}

export function WeeklyProgressBarWidget({
  currentDay,
  branch,
  completedTaskIds,
  completedExtraIds,
  onSelectDay,
}: WeeklyProgressBarWidgetProps) {
  const series = useMemo(
    () =>
      buildWeeklyProgressBarSeries(
        completedTaskIds,
        completedExtraIds,
        branch,
        currentDay
      ),
    [completedTaskIds, completedExtraIds, branch, currentDay]
  );

  const summary = useMemo(
    () => summarizeWeeklyProgressSeries(series),
    [series]
  );

  const currentWeek = Math.ceil(Math.max(1, Math.min(100, currentDay)) / 7);

  return (
    <section
      aria-label="تقدّم الـ 100 يوم — المهام المنجزة أسبوعياً"
      data-testid="weekly-progress-bar-widget"
      className="bg-[#110B29] border border-[#2D1F5E] rounded-3xl p-4 sm:p-5 space-y-4"
    >
      {/* Header & KPI Strip */}
      <div className="space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BarChart3 size={17} className="text-pink-400 shrink-0" aria-hidden="true" />
            <h2 className="text-sm sm:text-base font-extrabold text-white">
              تقدّم الـ 100 يوم — المهام المنجزة أسبوعياً
            </h2>
          </div>

          <span className="px-3 py-1 rounded-xl bg-[#090617] border border-[#2D1F5E] text-xs font-bold text-cyan-300 font-mono-num whitespace-nowrap shrink-0">
            الأسبوع {String(currentWeek).padStart(2, '0')} / {series.length}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-slate-400">
          <span>
            إجمالي المنجز:{' '}
            <strong className="font-mono-num text-pink-300">
              {summary.totalCompletedTasks} مهمة
            </strong>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            تقدم الـ 100 يوم:{' '}
            <strong dir="ltr" className="inline-block font-mono-num text-cyan-300">
              {summary.overallPercent}%
            </strong>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            أفضل أسبوع:{' '}
            <strong className="font-mono-num text-teal-300">
              {summary.bestWeek
                ? `الأسبوع ${String(summary.bestWeek).padStart(2, '0')} (${summary.bestWeekCount} مهمة)`
                : '—'}
            </strong>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            الأسابيع النشطة:{' '}
            <strong className="font-mono-num text-slate-200">
              {summary.activeWeeksCount} / {series.length}
            </strong>
          </span>
        </div>
      </div>

      {/* Recharts 15-Week Bar Chart */}
      <div className="w-full h-52 sm:h-56" dir="ltr">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={series}
            margin={{ top: 10, right: 10, left: -14, bottom: 0 }}
            onClick={(chartState) => {
              const idx = chartState?.activeTooltipIndex;
              if (typeof idx === 'number' && series[idx]) {
                onSelectDay(series[idx].startDay);
              }
            }}
          >
            <CartesianGrid
              stroke="#2D1F5E"
              strokeDasharray="3 3"
              vertical={false}
            />
            <XAxis
              dataKey="weekLabel"
              interval="preserveStartEnd"
              minTickGap={10}
              tick={{ fill: '#94A3B8', fontSize: 10 }}
              axisLine={{ stroke: '#2D1F5E' }}
              tickLine={false}
            />
            <YAxis
              allowDecimals={false}
              tick={{ fill: '#94A3B8', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              content={<WeeklyBarTooltip />}
              cursor={{ fill: 'rgba(34, 211, 238, 0.08)' }}
            />
            <Bar
              dataKey="completedTasks"
              name="المهام المنجزة"
              radius={[6, 6, 0, 0]}
              maxBarSize={28}
              background={{ fill: '#1A113E', radius: 6 }}
              isAnimationActive={false}
              className="cursor-pointer"
            >
              {series.map((entry) => (
                <Cell key={`week-bar-${entry.week}`} fill={getBarColor(entry)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Legend & Interactive Guidance */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#2D1F5E]/80 text-[11px] text-slate-400">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-[#FF3BA7]" aria-hidden="true" />
            <span>الأسبوع الحالي ({String(currentWeek).padStart(2, '0')})</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-[#2DD4BF]" aria-hidden="true" />
            <span>
              إنجاز{' '}
              <span dir="ltr" className="inline-block font-mono-num">
                70%
              </span>{' '}
              فأكثر
            </span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-sm bg-[#22D3EE]" aria-hidden="true" />
            <span>أسبوع نشط</span>
          </span>
        </div>

        <span>اضغط على أي عمود أسبوعي للانتقال إلى أول يوم فيه</span>
      </div>
    </section>
  );
}
