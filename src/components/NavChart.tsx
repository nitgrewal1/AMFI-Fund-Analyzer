import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { NavDataPoint } from '../types';
import { formatNav } from '../utils/formatters';
import { TrendingUp, TrendingDown, Calendar, Activity, BarChart2 } from 'lucide-react';

interface NavChartProps {
  data: NavDataPoint[];
  schemeName: string;
  category?: string;
  schemeCode?: number;
}

type Timeframe = '1M' | '3M' | '6M' | '1Y' | '3Y' | '5Y' | '10Y' | 'MAX';

export const NavChart: React.FC<NavChartProps> = ({
  data,
  schemeName,
  category = 'Equity',
}) => {
  const [timeframe, setTimeframe] = useState<Timeframe>('1Y');
  const [chartMode, setChartMode] = useState<'nav' | 'growthPct'>('nav');

  // Ensure chronologically sorted dataset
  const sortedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return [...data]
      .filter((pt) => typeof pt.nav === 'number' && !isNaN(pt.nav) && pt.nav > 0)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [data]);

  // Filter data based on selected timeframe
  const filteredData = useMemo(() => {
    if (sortedData.length === 0) return [];

    const latest = sortedData[sortedData.length - 1];
    const latestDate = new Date(latest.date);

    let daysToSubtract = 365;
    if (timeframe === '1M') daysToSubtract = 30;
    else if (timeframe === '3M') daysToSubtract = 90;
    else if (timeframe === '6M') daysToSubtract = 180;
    else if (timeframe === '1Y') daysToSubtract = 365;
    else if (timeframe === '3Y') daysToSubtract = 365 * 3;
    else if (timeframe === '5Y') daysToSubtract = 365 * 5;
    else if (timeframe === '10Y') daysToSubtract = 365 * 10;
    else if (timeframe === 'MAX') daysToSubtract = 365 * 30;

    const cutoffTime = latestDate.getTime() - daysToSubtract * 24 * 60 * 60 * 1000;
    const subset = sortedData.filter((item) => new Date(item.date).getTime() >= cutoffTime);
    const activeData = subset.length > 0 ? subset : sortedData.slice(-30);

    // Downsample if dataset is very large for crisp, smooth rendering
    if (activeData.length > 300) {
      const step = Math.ceil(activeData.length / 220);
      const sampled: NavDataPoint[] = [];
      for (let i = 0; i < activeData.length; i += step) {
        sampled.push(activeData[i]);
      }
      if (sampled[sampled.length - 1]?.date !== activeData[activeData.length - 1]?.date) {
        sampled.push(activeData[activeData.length - 1]);
      }
      return sampled;
    }

    return activeData;
  }, [sortedData, timeframe]);

  // Compute period metrics & chart points
  const { chartData, periodReturn, periodGain, minNav, maxNav, startNav, endNav, yDomain } = useMemo(() => {
    if (filteredData.length === 0) {
      return {
        chartData: [],
        periodReturn: 0,
        periodGain: 0,
        minNav: 0,
        maxNav: 0,
        startNav: 0,
        endNav: 0,
        yDomain: [0, 100] as [number, number]
      };
    }

    const start = filteredData[0].nav;
    const end = filteredData[filteredData.length - 1].nav;
    const returnPct = Number((((end - start) / start) * 100).toFixed(2));
    const gainVal = Number((end - start).toFixed(2));

    let min = Infinity;
    let max = -Infinity;

    const points = filteredData.map((pt, idx) => {
      if (pt.nav < min) min = pt.nav;
      if (pt.nav > max) max = pt.nav;

      const growthPct = Number((((pt.nav - start) / start) * 100).toFixed(2));
      const prevNav = idx > 0 ? filteredData[idx - 1].nav : pt.nav;
      const dayChangePct = idx > 0 ? Number((((pt.nav - prevNav) / prevNav) * 100).toFixed(2)) : 0;

      const dateObj = new Date(pt.date);
      const formattedDate = dateObj.toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: timeframe === 'MAX' || timeframe === '10Y' || timeframe === '5Y' || timeframe === '3Y' ? '2-digit' : undefined
      });

      return {
        date: pt.date,
        formattedDate,
        nav: Number(pt.nav.toFixed(4)),
        growthPct,
        dayChangePct,
      };
    });

    // Optical padding for Y Axis to ensure the graph looks professional and never touches container edges
    const range = max - min;
    const padding = Math.max(range * 0.08, min * 0.02, 0.5);
    const domainMin = chartMode === 'nav' ? Math.max(0, Math.floor((min - padding) * 10) / 10) : Math.floor(Math.min(...points.map(p => p.growthPct)) - 2);
    const domainMax = chartMode === 'nav' ? Math.ceil((max + padding) * 10) / 10 : Math.ceil(Math.max(...points.map(p => p.growthPct)) + 2);

    return {
      chartData: points,
      periodReturn: returnPct,
      periodGain: gainVal,
      minNav: min,
      maxNav: max,
      startNav: start,
      endNav: end,
      yDomain: [domainMin, domainMax] as [number, number]
    };
  }, [filteredData, timeframe, chartMode]);

  const isPositive = periodReturn >= 0;
  const strokeColor = isPositive ? '#10b981' : '#f43f5e';
  const fillColor = isPositive ? '#10b981' : '#f43f5e';

  // Custom Interactive Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const point = payload[0].payload;
      const pointGrowth = point.growthPct;

      return (
        <div className="bg-white/95 dark:bg-slate-950/95 border border-slate-200 dark:border-slate-700/80 p-3 rounded-2xl shadow-xl backdrop-blur-md text-xs z-50 min-w-[190px]">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5 mb-2">
            <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1.5 text-[11px]">
              <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              {point.date}
            </span>
            <span className={`font-mono font-bold text-xs ${pointGrowth >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
              {pointGrowth >= 0 ? '+' : ''}{pointGrowth}%
            </span>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-slate-500 dark:text-slate-400 text-[11px]">NAV:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white text-sm">₹{formatNav(point.nav)}</span>
            </div>
            {point.dayChangePct !== 0 && (
              <div className="flex justify-between items-center text-[10px]">
                <span className="text-slate-400 dark:text-slate-500">Period Change:</span>
                <span className={`font-mono font-semibold ${point.nav >= startNav ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {point.nav >= startNav ? '+' : ''}₹{formatNav(point.nav - startNav)}
                </span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  const timeframeOptions: Timeframe[] = ['1M', '3M', '6M', '1Y', '3Y', '5Y', '10Y', 'MAX'];

  return (
    <div id="nav-chart-card" className="w-full bg-white dark:bg-slate-900 rounded-3xl p-3.5 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-xl relative overflow-hidden">
      {/* Header: Current NAV, Period Return & Mode Switch */}
      <div className="flex flex-wrap items-start justify-between gap-2.5 sm:gap-3 mb-2.5">
        <div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight font-mono">
              ₹{formatNav(endNav)}
            </span>
            <span className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium">Current NAV</span>
          </div>

          {/* Period return pill */}
          <div className="flex items-center gap-1.5 sm:gap-2 mt-1">
            <span
              className={`inline-flex items-center gap-1 px-2 sm:px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-bold ${
                isPositive
                  ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30'
              }`}
            >
              {isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              {isPositive ? '+' : ''}{periodReturn}%
              <span className="font-normal text-[10px] opacity-85">({isPositive ? '+' : ''}₹{periodGain})</span>
            </span>
            <span className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">in {timeframe}</span>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs">
          <button
            onClick={() => setChartMode('nav')}
            className={`px-2.5 sm:px-3 py-1 rounded-xl text-[10px] sm:text-[11px] font-semibold transition-all cursor-pointer ${
              chartMode === 'nav'
                ? 'bg-emerald-600 text-white shadow-sm font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            NAV (₹)
          </button>
          <button
            onClick={() => setChartMode('growthPct')}
            className={`px-2.5 sm:px-3 py-1 rounded-xl text-[10px] sm:text-[11px] font-semibold transition-all cursor-pointer ${
              chartMode === 'growthPct'
                ? 'bg-emerald-600 text-white shadow-sm font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Growth (%)
          </button>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-56 sm:h-72 w-full mt-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 4, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="navAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={fillColor} stopOpacity={0.28} />
                <stop offset="70%" stopColor={fillColor} stopOpacity={0.04} />
                <stop offset="100%" stopColor={fillColor} stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.25} vertical={false} />

            <XAxis
              dataKey="formattedDate"
              stroke="#94a3b8"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
              minTickGap={30}
            />

            <YAxis
              dataKey={chartMode === 'nav' ? 'nav' : 'growthPct'}
              domain={yDomain}
              stroke="#94a3b8"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              tickFormatter={(val) => chartMode === 'nav' ? `₹${Math.round(val)}` : `${val > 0 ? '+' : ''}${Math.round(val)}%`}
            />

            <Tooltip
              cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '3 3' }}
              content={<CustomTooltip />}
            />

            <Area
              type="linear"
              dataKey={chartMode === 'nav' ? 'nav' : 'growthPct'}
              stroke={strokeColor}
              strokeWidth={2.2}
              fill="url(#navAreaGradient)"
              isAnimationActive={false}
              activeDot={{ r: 5, fill: '#ffffff', stroke: strokeColor, strokeWidth: 2.5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Timeframe Chips Selector */}
      <div id="timeframe-chips-bar" className="flex items-center gap-1 sm:gap-1.5 mt-3 pt-2.5 border-t border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar touch-scroll">
        {timeframeOptions.map((tf) => {
          const isActive = timeframe === tf;
          return (
            <button
              key={tf}
              id={`tf-btn-${tf}`}
              onClick={() => setTimeframe(tf)}
              className={`flex-1 min-w-[34px] sm:min-w-0 py-1.5 px-1 sm:px-2 text-[10px] sm:text-xs font-bold rounded-xl transition-all cursor-pointer whitespace-nowrap text-center ${
                isActive
                  ? 'bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950 shadow-md shadow-emerald-500/20 font-extrabold'
                  : 'bg-slate-100 dark:bg-slate-950/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              {tf}
            </button>
          );
        })}
      </div>

      {/* Range Min / Max footer info */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mt-2.5 px-1 font-mono">
        <span>Low: <strong className="text-slate-800 dark:text-slate-200 font-semibold font-mono">₹{formatNav(minNav)}</strong></span>
        <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-sans text-[10px]">
          <Activity className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
          {chartData.length} NAV points
        </span>
        <span>High: <strong className="text-slate-800 dark:text-slate-200 font-semibold font-mono">₹{formatNav(maxNav)}</strong></span>
      </div>
    </div>
  );
};
