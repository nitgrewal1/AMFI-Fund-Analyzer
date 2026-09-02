import React, { useState, useEffect, useMemo } from 'react';
import { AmfiSchemeSummary, AiComparisonResponse } from '../types';
import { fetchComparison, generateAiComparison, fetchSchemes, searchMfApiDirect, getOrFetchSchemeSummary } from '../services/api';
import { formatNav } from '../utils/formatters';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  Legend 
} from 'recharts';
import { 
  Layers, 
  Plus, 
  X, 
  TrendingUp, 
  ShieldCheck, 
  Activity, 
  BarChart3,
  Search,
  Check,
  Trophy,
  Sparkles,
  Calculator,
  Calendar,
  ChevronRight,
  ArrowRight,
  Info,
  RotateCcw,
  Zap,
  DollarSign,
  Loader2,
  Trash2,
  Building2,
  Filter
} from 'lucide-react';

interface FundComparisonViewProps {
  comparedFunds: AmfiSchemeSummary[];
  allSchemes: AmfiSchemeSummary[];
  onSelectScheme: (scheme: AmfiSchemeSummary) => void;
  onAddComparedScheme?: (scheme: AmfiSchemeSummary) => void;
  onRemoveComparedScheme: (schemeCode: number) => void;
  onSetComparedFunds?: (funds: AmfiSchemeSummary[]) => void;
  onClearAll?: () => void;
}

const LINE_COLORS = [
  '#10b981', // Emerald
  '#06b6d4', // Cyan
  '#8b5cf6', // Purple
  '#f59e0b', // Amber
  '#ec4899', // Pink
  '#3b82f6', // Blue
];

type ComparisonTimeframe = '6M' | '1Y' | '3Y' | '5Y' | '10Y' | 'MAX';

export const FundComparisonView: React.FC<FundComparisonViewProps> = ({
  comparedFunds,
  allSchemes,
  onSelectScheme,
  onAddComparedScheme,
  onRemoveComparedScheme,
  onSetComparedFunds,
  onClearAll
}) => {
  const [timeframe, setTimeframe] = useState<ComparisonTimeframe>('3Y');
  const [chartMode, setChartMode] = useState<'base100' | 'wealth10k' | 'nav'>('base100');
  const [loading, setLoading] = useState<boolean>(false);
  const [comparisonData, setComparisonData] = useState<{ funds: any[]; timeline: any[] } | null>(null);
  
  // Add Fund Modal state
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [searchResults, setSearchResults] = useState<(AmfiSchemeSummary | { schemeCode: number; schemeName: string })[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [addingCode, setAddingCode] = useState<number | null>(null);
  const [searchCategory, setSearchCategory] = useState<string>('All');

  // SIP comparison state
  const [sipMonthlyAmount, setSipMonthlyAmount] = useState<number>(10000);
  const [sipHorizonYears, setSipHorizonYears] = useState<number>(5);

  // AI Comparison state
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiComparison, setAiComparison] = useState<AiComparisonResponse | null>(null);
  const [aiRiskTolerance, setAiRiskTolerance] = useState<string>('Moderate');
  const [aiError, setAiError] = useState<string | null>(null);

  // Load comparison data whenever comparedFunds or timeframe changes
  useEffect(() => {
    if (comparedFunds && comparedFunds.length > 0) {
      loadComparison();
    } else {
      setComparisonData(null);
    }
    // Reset AI analysis when fund selection changes
    setAiComparison(null);
  }, [comparedFunds, timeframe]);

  const loadComparison = async () => {
    if (!comparedFunds || comparedFunds.length === 0) {
      setComparisonData(null);
      return;
    }
    setLoading(true);
    try {
      const res = await fetchComparison(comparedFunds.map(f => f.schemeCode), timeframe);
      setComparisonData(res);
    } catch (err) {
      console.error('Error fetching comparison:', err);
    } finally {
      setLoading(false);
    }
  };

  // Search logic for Add Fund Modal (queries both local memory and AMFI live catalog)
  useEffect(() => {
    if (!showAddModal) return;

    let isMounted = true;
    const term = searchTerm.trim();

    if (!term) {
      // Show from allSchemes filtered by category
      let initialList = allSchemes;
      if (searchCategory !== 'All') {
        initialList = allSchemes.filter(s => 
          s.fundType.toLowerCase() === searchCategory.toLowerCase() ||
          s.category.toLowerCase().includes(searchCategory.toLowerCase())
        );
      }
      const available = initialList.filter(s => !comparedFunds.some(f => f.schemeCode === s.schemeCode));
      setSearchResults(available.slice(0, 30));
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const handler = setTimeout(async () => {
      try {
        // 1. Search in local loaded schemes
        const localMatches = allSchemes.filter(s =>
          (s.schemeName.toLowerCase().includes(term.toLowerCase()) ||
           s.amc.toLowerCase().includes(term.toLowerCase()) ||
           s.schemeCode.toString().includes(term)) &&
          !comparedFunds.some(f => f.schemeCode === s.schemeCode)
        );

        // 2. Search live via AMFI API
        let remoteMatches: { schemeCode: number; schemeName: string }[] = [];
        try {
          const apiRes = await fetchSchemes({ search: term, limit: 30 });
          if (apiRes && apiRes.schemes && apiRes.schemes.length > 0) {
            remoteMatches = apiRes.schemes;
          }
        } catch (e) {
          // fallback to search
          try {
            remoteMatches = await searchMfApiDirect(term);
          } catch {}
        }

        if (isMounted) {
          // Deduplicate by schemeCode
          const combinedMap = new Map<number, any>();
          localMatches.forEach(s => combinedMap.set(s.schemeCode, s));
          remoteMatches.forEach(s => {
            if (!combinedMap.has(s.schemeCode) && !comparedFunds.some(f => f.schemeCode === s.schemeCode)) {
              combinedMap.set(s.schemeCode, s);
            }
          });

          setSearchResults(Array.from(combinedMap.values()).slice(0, 35));
        }
      } catch (err) {
        console.error('Error during fund search:', err);
      } finally {
        if (isMounted) setIsSearching(false);
      }
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(handler);
    };
  }, [searchTerm, searchCategory, showAddModal, comparedFunds, allSchemes]);

  const handleAddFund = async (item: AmfiSchemeSummary | { schemeCode: number; schemeName: string }) => {
    if (comparedFunds.some(f => f.schemeCode === item.schemeCode)) {
      setShowAddModal(false);
      return;
    }
    if (comparedFunds.length >= 6) {
      alert('You can compare up to 6 mutual funds at a time.');
      return;
    }

    setAddingCode(item.schemeCode);
    try {
      const fullSummary = await getOrFetchSchemeSummary(item);
      if (onAddComparedScheme) {
        onAddComparedScheme(fullSummary);
      } else if (onSetComparedFunds) {
        onSetComparedFunds([...comparedFunds, fullSummary]);
      }
      setShowAddModal(false);
      setSearchTerm('');
    } catch (err) {
      console.error('Error adding fund to comparison:', err);
    } finally {
      setAddingCode(null);
    }
  };

  const handleRemoveFund = (schemeCode: number) => {
    onRemoveComparedScheme(schemeCode);
    if (onSetComparedFunds) {
      onSetComparedFunds(comparedFunds.filter(f => f.schemeCode !== schemeCode));
    }
    // Update comparisonData immediately
    if (comparisonData) {
      const updatedFunds = comparisonData.funds.filter(
        f => f.meta.scheme_code !== schemeCode && String(f.meta.scheme_code) !== String(schemeCode)
      );
      if (updatedFunds.length === 0) {
        setComparisonData(null);
      } else {
        setComparisonData({
          ...comparisonData,
          funds: updatedFunds
        });
      }
    }
  };

  const handleClearAll = () => {
    if (onClearAll) {
      onClearAll();
    } else if (onSetComparedFunds) {
      onSetComparedFunds([]);
    }
    setComparisonData(null);
  };

  const handleApplyPreset = async (presetList: { code: number; name: string }[]) => {
    setLoading(true);
    try {
      const fullList: AmfiSchemeSummary[] = [];
      for (const item of presetList) {
        const local = allSchemes.find(s => s.schemeCode === item.code);
        if (local) {
          fullList.push(local);
        } else {
          const fetched = await getOrFetchSchemeSummary({ schemeCode: item.code, schemeName: item.name });
          fullList.push(fetched);
        }
      }
      if (onSetComparedFunds) {
        onSetComparedFunds(fullList);
      }
    } catch (err) {
      console.error('Error applying preset:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAiComparison = async () => {
    if (!comparisonData || comparisonData.funds.length < 2) return;
    setAiLoading(true);
    setAiError(null);
    try {
      const result = await generateAiComparison({
        funds: comparisonData.funds,
        userRiskTolerance: aiRiskTolerance
      });
      setAiComparison(result);
    } catch (err: any) {
      console.error('Error running AI comparison:', err);
      setAiError(err.message || 'Failed to complete AI comparison');
    } finally {
      setAiLoading(false);
    }
  };

  // Helper to determine best in metric row
  const getBestInRow = (
    metricKey: string,
    funds: any[],
    direction: 'higher' | 'lower' = 'higher'
  ) => {
    const validValues = funds
      .map((f, idx) => ({ idx, val: f.metrics?.[metricKey] }))
      .filter(item => item.val !== undefined && item.val !== null && !isNaN(item.val));

    if (validValues.length === 0) return -1;

    let best = validValues[0];
    for (let i = 1; i < validValues.length; i++) {
      if (direction === 'higher' && validValues[i].val > best.val) {
        best = validValues[i];
      } else if (direction === 'lower' && validValues[i].val < best.val) {
        best = validValues[i];
      }
    }
    return best.idx;
  };

  // Formatted chart points according to chartMode
  const formattedTimeline = useMemo(() => {
    if (!comparisonData || !comparisonData.timeline || !comparedFunds || comparedFunds.length === 0) return [];

    // Client-side forward-fill tracker to ensure gapless rendering
    const lastSeenVal: Record<string, number> = {};
    const lastSeenNav: Record<string, number> = {};

    return comparisonData.timeline.map(item => {
      const point: any = { date: item.date };
      comparedFunds.forEach(fund => {
        const sCode = fund.schemeCode.toString();
        const rawVal = item[sCode] ?? item[fund.schemeCode];
        const rawNav = item[`${sCode}_nav`] ?? item[`${fund.schemeCode}_nav`];

        if (typeof rawVal === 'number' && !isNaN(rawVal) && isFinite(rawVal)) {
          lastSeenVal[sCode] = rawVal;
        }
        if (typeof rawNav === 'number' && !isNaN(rawNav) && isFinite(rawNav)) {
          lastSeenNav[sCode] = rawNav;
        }

        const effectiveVal = (typeof rawVal === 'number' && !isNaN(rawVal)) ? rawVal : lastSeenVal[sCode];
        const effectiveNav = (typeof rawNav === 'number' && !isNaN(rawNav)) ? rawNav : lastSeenNav[sCode];

        if (chartMode === 'base100') {
          point[sCode] = effectiveVal !== undefined ? effectiveVal : null;
        } else if (chartMode === 'wealth10k') {
          point[sCode] = effectiveVal !== undefined ? Number((effectiveVal * 100).toFixed(0)) : null;
        } else if (chartMode === 'nav') {
          point[sCode] = effectiveNav !== undefined ? effectiveNav : null;
        }
      });
      return point;
    });
  }, [comparisonData, chartMode, comparedFunds]);

  return (
    <div id="fund-comparison-view" className="space-y-4 pb-28 sm:pb-28 lg:pb-14">
      {/* Top Banner & Action Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-xl flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-purple-500/15 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-500/30 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>Mutual Fund Comparison Matrix</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 font-mono font-semibold">
                {comparedFunds.length} / 6 Funds
              </span>
            </h2>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">Side-by-side historical NAV trajectories, multi-period CAGRs & risk ratios</p>
          </div>
        </div>

        <div className="flex items-center gap-2 justify-end">
          {comparedFunds.length > 0 && (
            <button
              id="btn-clear-comparison"
              onClick={handleClearAll}
              className="flex items-center gap-1 px-3 py-2 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-rose-100 dark:hover:bg-rose-950/40 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-300 dark:hover:border-rose-800/50 text-slate-600 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-700 transition-all cursor-pointer active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear All</span>
            </button>
          )}

          {comparedFunds.length < 6 && (
            <button
              id="btn-add-comparison-fund"
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 dark:shadow-purple-900/40 transition-all cursor-pointer hover:scale-105 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Add Fund ({comparedFunds.length}/6)</span>
            </button>
          )}
        </div>
      </div>

      {/* Selected Fund Badges Bar with Cross Icons */}
      {comparedFunds.length > 0 && (
        <div className="flex flex-wrap gap-2 items-center">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Selected:
          </span>
          {comparedFunds.map((fund, idx) => (
            <div
              key={fund.schemeCode}
              className="flex items-center gap-2 px-3 py-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm transition-all hover:border-slate-300 dark:hover:border-slate-700"
            >
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: LINE_COLORS[idx % LINE_COLORS.length] }}
              />
              <div className="text-left cursor-pointer" onClick={() => onSelectScheme(fund)}>
                <span className="text-xs font-bold text-slate-800 dark:text-white max-w-[140px] sm:max-w-[200px] truncate block hover:text-purple-600 dark:hover:text-purple-300">
                  {fund.schemeName}
                </span>
                <span className="text-[10px] text-slate-400 dark:text-slate-400 block font-mono">
                  NAV: ₹{fund.nav ? formatNav(fund.nav) : '--'}
                </span>
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveFund(fund.schemeCode);
                }}
                className="p-1.5 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors ml-1 cursor-pointer"
                title={`Remove ${fund.schemeName} from comparison`}
                aria-label={`Remove ${fund.schemeName}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Empty State when no funds are selected */}
      {comparedFunds.length === 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-10 border border-slate-200 dark:border-slate-800 text-center space-y-4 max-w-lg mx-auto shadow-md dark:shadow-xl">
          <div className="w-14 h-14 rounded-3xl bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30 flex items-center justify-center mx-auto">
            <Layers className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">No Mutual Funds in Comparison</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              Add 2 to 6 mutual funds to compare historical CAGR, Sharpe ratios, volatility, drawdown, and run AI head-to-head evaluation.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              id="btn-add-funds-empty"
              onClick={() => setShowAddModal(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-md shadow-purple-600/30 dark:shadow-purple-950/50 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Search & Add Funds</span>
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="py-16 flex flex-col items-center justify-center space-y-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <div className="w-10 h-10 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-purple-600 dark:text-purple-300 font-medium">Aligning historical NAV records from AMFI across peers...</span>
        </div>
      )}

      {/* Comparative NAV Trajectory Chart */}
      {!loading && comparisonData && formattedTimeline.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                Historical NAV Trajectory Comparison
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {chartMode === 'base100' && 'Normalized compound growth indexed to Base ₹100'}
                {chartMode === 'wealth10k' && 'Growth of initial ₹10,000 lumpsum over selected period'}
                {chartMode === 'nav' && 'Actual historical NAV values per unit'}
              </p>
            </div>

            {/* Mode Selector */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl border border-slate-200 dark:border-slate-800">
              <button
                onClick={() => setChartMode('base100')}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                  chartMode === 'base100' ? 'bg-purple-600 text-white shadow' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Base ₹100
              </button>
              <button
                onClick={() => setChartMode('wealth10k')}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                  chartMode === 'wealth10k' ? 'bg-purple-600 text-white shadow' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                ₹10,000 Invested
              </button>
              <button
                onClick={() => setChartMode('nav')}
                className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition-all cursor-pointer ${
                  chartMode === 'nav' ? 'bg-purple-600 text-white shadow' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                Raw NAV
              </button>
            </div>
          </div>

          {/* Chart Rendering */}
          <div className="h-64 sm:h-80 w-full mt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={formattedTimeline} margin={{ top: 12, right: 10, left: -5, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.25} vertical={false} />
                <XAxis
                  dataKey="date"
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  axisLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                  minTickGap={35}
                  tickFormatter={(val) => {
                    if (!val) return '';
                    const parts = val.split('-');
                    if (parts.length === 3) {
                      const year = parts[0].slice(2);
                      const monthIndex = parseInt(parts[1], 10) - 1;
                      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                      const month = months[monthIndex] || parts[1];
                      return timeframe === '6M' || timeframe === '1Y' ? `${parts[2]} ${month}` : `${month} '${year}`;
                    }
                    return val;
                  }}
                />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  domain={[
                    (dataMin: number) => {
                      if (chartMode === 'base100') return Math.floor(Math.min(95, dataMin * 0.96));
                      if (chartMode === 'wealth10k') return Math.floor(Math.min(9500, dataMin * 0.95));
                      return Math.floor(Math.max(0, dataMin * 0.95));
                    },
                    (dataMax: number) => {
                      if (chartMode === 'base100') return Math.ceil(dataMax * 1.05);
                      if (chartMode === 'wealth10k') return Math.ceil(dataMax * 1.05);
                      return Math.ceil(dataMax * 1.05);
                    }
                  ]}
                  tickFormatter={(val) => {
                    if (chartMode === 'wealth10k') {
                      return `₹${(val / 1000).toFixed(0)}k`;
                    }
                    if (chartMode === 'base100') {
                      return `${Math.round(val)}`;
                    }
                    return `₹${Math.round(val)}`;
                  }}
                />
                <Tooltip
                  cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '3 3' }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-white/95 dark:bg-slate-950/95 border border-slate-200 dark:border-slate-700/90 p-3 rounded-2xl shadow-2xl backdrop-blur text-xs z-50 min-w-[210px]">
                          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-1.5 mb-2">
                            <span className="text-slate-600 dark:text-slate-400 font-medium text-[11px]">{label}</span>
                            <span className="text-[10px] text-purple-700 dark:text-purple-300 font-mono font-semibold px-2 py-0.5 rounded-md bg-purple-50 dark:bg-purple-950/80 border border-purple-200 dark:border-purple-800/50">
                              {chartMode === 'base100' ? 'Base ₹100' : chartMode === 'wealth10k' ? '₹10k Invested' : 'NAV (₹)'}
                            </span>
                          </div>
                          <div className="space-y-1.5">
                            {payload.map((entry: any, i: number) => {
                              const f = comparedFunds.find(c => c.schemeCode.toString() === entry.dataKey);
                              const name = f ? f.schemeName : `Fund ${entry.dataKey}`;
                              return (
                                <div key={i} className="flex items-center justify-between gap-4">
                                  <div className="flex items-center gap-1.5 max-w-[140px]">
                                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
                                    <span className="text-slate-700 dark:text-slate-300 truncate font-medium text-[11px]">{name}</span>
                                  </div>
                                  <span className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                                    {chartMode === 'wealth10k'
                                      ? `₹${entry.value?.toLocaleString('en-IN')}`
                                      : chartMode === 'base100'
                                      ? `${entry.value}`
                                      : `₹${formatNav(entry.value)}`}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {comparedFunds.map((fund, idx) => (
                  <Line
                    key={fund.schemeCode}
                    type="linear"
                    dataKey={fund.schemeCode.toString()}
                    stroke={LINE_COLORS[idx % LINE_COLORS.length]}
                    strokeWidth={2.4}
                    dot={false}
                    connectNulls={true}
                    isAnimationActive={false}
                    name={fund.schemeName}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Timeframe Chips Bar */}
          <div className="flex items-center justify-between gap-1 pt-2 border-t border-slate-200 dark:border-slate-800">
            {(['6M', '1Y', '3Y', '5Y', '10Y', 'MAX'] as ComparisonTimeframe[]).map((tf) => {
              const isActive = timeframe === tf;
              return (
                <button
                  key={tf}
                  onClick={() => setTimeframe(tf)}
                  className={`flex-1 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 dark:shadow-purple-900/40 scale-105'
                      : 'bg-slate-100 dark:bg-slate-950/60 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {tf}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Complete Returns & CAGR Comparison Matrix Table */}
      {!loading && comparisonData && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-xl space-y-3 overflow-x-auto">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Returns & Multi-Year CAGR Comparison Matrix
            </h3>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
              <Trophy className="w-3 h-3 text-amber-500 dark:text-amber-400" /> Best in metric highlighted
            </span>
          </div>

          <table className="w-full text-left text-xs min-w-[620px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <th className="pb-3 font-bold w-[140px]">Period</th>
                {comparisonData.funds.map((f, idx) => {
                  const sCode = Number(f.meta.scheme_code);
                  return (
                    <th key={idx} className="pb-3 font-semibold">
                      <div className="flex items-center justify-between gap-1.5 bg-slate-50 dark:bg-slate-950/60 p-2 rounded-xl border border-slate-200 dark:border-slate-800/80">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: LINE_COLORS[idx % LINE_COLORS.length] }} />
                          <span className="truncate max-w-[130px] font-bold text-slate-800 dark:text-slate-200 block" title={f.meta.scheme_name}>
                            {f.meta.scheme_name}
                          </span>
                        </div>
                        <button
                          onClick={() => handleRemoveFund(sCode)}
                          className="p-1 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/20 rounded-md transition-colors flex-shrink-0 cursor-pointer"
                          title="Remove from comparison"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-200">
              {/* 1-Month Return */}
              {(() => {
                const bestIdx = getBestInRow('return1M', comparisonData.funds);
                return (
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 text-slate-500 dark:text-slate-400 font-medium">1-Month Return</td>
                    {comparisonData.funds.map((f, idx) => {
                      const val = f.metrics?.return1M;
                      const isBest = idx === bestIdx;
                      return (
                        <td key={idx} className="py-2.5 font-bold font-mono">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md ${
                            isBest ? 'bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30' : (val || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                          }`}>
                            {(val || 0) >= 0 ? '+' : ''}{val}%
                            {isBest && <Trophy className="w-3 h-3 text-amber-500 dark:text-amber-400" />}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })()}

              {/* 3-Month Return */}
              {(() => {
                const bestIdx = getBestInRow('return3M', comparisonData.funds);
                return (
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 text-slate-500 dark:text-slate-400 font-medium">3-Month Return</td>
                    {comparisonData.funds.map((f, idx) => {
                      const val = f.metrics?.return3M;
                      const isBest = idx === bestIdx;
                      return (
                        <td key={idx} className="py-2.5 font-bold font-mono">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md ${
                            isBest ? 'bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30' : (val || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                          }`}>
                            {(val || 0) >= 0 ? '+' : ''}{val}%
                            {isBest && <Trophy className="w-3 h-3 text-amber-500 dark:text-amber-400" />}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })()}

              {/* 6-Month Return */}
              {(() => {
                const bestIdx = getBestInRow('return6M', comparisonData.funds);
                return (
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 text-slate-500 dark:text-slate-400 font-medium">6-Month Return</td>
                    {comparisonData.funds.map((f, idx) => {
                      const val = f.metrics?.return6M;
                      const isBest = idx === bestIdx;
                      return (
                        <td key={idx} className="py-2.5 font-bold font-mono">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md ${
                            isBest ? 'bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30' : (val || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                          }`}>
                            {(val || 0) >= 0 ? '+' : ''}{val}%
                            {isBest && <Trophy className="w-3 h-3 text-amber-500 dark:text-amber-400" />}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })()}

              {/* 1-Year Return */}
              {(() => {
                const bestIdx = getBestInRow('return1Y', comparisonData.funds);
                return (
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 text-slate-500 dark:text-slate-400 font-medium">1-Year Return</td>
                    {comparisonData.funds.map((f, idx) => {
                      const val = f.metrics?.return1Y;
                      const isBest = idx === bestIdx;
                      return (
                        <td key={idx} className="py-2.5 font-bold font-mono">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md ${
                            isBest ? 'bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30' : (val || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
                          }`}>
                            {(val || 0) >= 0 ? '+' : ''}{val}%
                            {isBest && <Trophy className="w-3 h-3 text-amber-500 dark:text-amber-400" />}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })()}

              {/* 3-Year CAGR */}
              {(() => {
                const bestIdx = getBestInRow('cagr3Y', comparisonData.funds);
                return (
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors bg-slate-50/50 dark:bg-slate-950/30">
                    <td className="py-2.5 text-slate-800 dark:text-slate-300 font-bold flex items-center gap-1">
                      <span>3-Year CAGR</span>
                    </td>
                    {comparisonData.funds.map((f, idx) => {
                      const val = f.metrics?.cagr3Y;
                      const isBest = idx === bestIdx;
                      return (
                        <td key={idx} className="py-2.5 font-extrabold font-mono">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md ${
                            isBest ? 'bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30' : 'text-emerald-600 dark:text-emerald-400'
                          }`}>
                            +{val}%
                            {isBest && <Trophy className="w-3 h-3 text-amber-500 dark:text-amber-400" />}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })()}

              {/* 5-Year CAGR */}
              {(() => {
                const bestIdx = getBestInRow('cagr5Y', comparisonData.funds);
                return (
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors bg-slate-50/50 dark:bg-slate-950/30">
                    <td className="py-2.5 text-slate-800 dark:text-slate-300 font-bold flex items-center gap-1">
                      <span>5-Year CAGR</span>
                    </td>
                    {comparisonData.funds.map((f, idx) => {
                      const val = f.metrics?.cagr5Y;
                      const isBest = idx === bestIdx;
                      return (
                        <td key={idx} className="py-2.5 font-extrabold font-mono">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md ${
                            isBest ? 'bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30' : 'text-emerald-600 dark:text-emerald-400'
                          }`}>
                            +{val}%
                            {isBest && <Trophy className="w-3 h-3 text-amber-500 dark:text-amber-400" />}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })()}

              {/* 10-Year CAGR */}
              {(() => {
                const bestIdx = getBestInRow('cagr10Y', comparisonData.funds);
                return (
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors bg-purple-50/50 dark:bg-purple-950/10">
                    <td className="py-2.5 text-purple-700 dark:text-purple-300 font-bold flex items-center gap-1">
                      <span>10-Year CAGR</span>
                    </td>
                    {comparisonData.funds.map((f, idx) => {
                      const val = f.metrics?.cagr10Y;
                      const isBest = idx === bestIdx && val !== null;
                      return (
                        <td key={idx} className="py-2.5 font-extrabold font-mono">
                          {val !== null && val !== undefined ? (
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md ${
                              isBest ? 'bg-purple-500/15 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30' : 'text-purple-600 dark:text-purple-400'
                            }`}>
                              +{val}%
                              {isBest && <Trophy className="w-3 h-3 text-amber-500 dark:text-amber-400" />}
                            </span>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500 text-[10px] font-normal italic">
                              &lt; 10Y Old
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })()}

              {/* 15-Year CAGR */}
              {(() => {
                const bestIdx = getBestInRow('cagr15Y', comparisonData.funds);
                return (
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors bg-purple-50/50 dark:bg-purple-950/10">
                    <td className="py-2.5 text-purple-700 dark:text-purple-300 font-bold flex items-center gap-1">
                      <span>15-Year CAGR</span>
                    </td>
                    {comparisonData.funds.map((f, idx) => {
                      const val = f.metrics?.cagr15Y;
                      const isBest = idx === bestIdx && val !== null;
                      return (
                        <td key={idx} className="py-2.5 font-extrabold font-mono">
                          {val !== null && val !== undefined ? (
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md ${
                              isBest ? 'bg-purple-500/15 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30' : 'text-purple-600 dark:text-purple-400'
                            }`}>
                              +{val}%
                              {isBest && <Trophy className="w-3 h-3 text-amber-500 dark:text-amber-400" />}
                            </span>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500 text-[10px] font-normal italic">
                              &lt; 15Y Old
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })()}

              {/* 20-Year CAGR */}
              {(() => {
                const bestIdx = getBestInRow('cagr20Y', comparisonData.funds);
                return (
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors bg-purple-50/50 dark:bg-purple-950/10">
                    <td className="py-2.5 text-purple-700 dark:text-purple-300 font-bold flex items-center gap-1">
                      <span>20-Year CAGR</span>
                    </td>
                    {comparisonData.funds.map((f, idx) => {
                      const val = f.metrics?.cagr20Y;
                      const isBest = idx === bestIdx && val !== null;
                      return (
                        <td key={idx} className="py-2.5 font-extrabold font-mono">
                          {val !== null && val !== undefined ? (
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md ${
                              isBest ? 'bg-purple-500/15 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30' : 'text-purple-600 dark:text-purple-400'
                            }`}>
                              +{val}%
                              {isBest && <Trophy className="w-3 h-3 text-amber-500 dark:text-amber-400" />}
                            </span>
                          ) : (
                            <span className="text-slate-400 dark:text-slate-500 text-[10px] font-normal italic">
                              &lt; 20Y Old
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })()}

              {/* Since Inception CAGR */}
              {(() => {
                const bestIdx = getBestInRow('cagrInception', comparisonData.funds);
                return (
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 text-teal-700 dark:text-teal-300 font-bold">Since Inception</td>
                    {comparisonData.funds.map((f, idx) => {
                      const val = f.metrics?.cagrInception;
                      const isBest = idx === bestIdx;
                      return (
                        <td key={idx} className="py-2.5 font-bold font-mono">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md ${
                            isBest ? 'bg-teal-500/15 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/30' : 'text-teal-600 dark:text-teal-400'
                          }`}>
                            +{val}%
                          </span>
                          <span className="text-[9px] text-slate-400 dark:text-slate-500 block font-sans font-normal">
                            {f.metrics?.totalHistoryYears} Yrs Track Record
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })()}
            </tbody>
          </table>
        </div>
      )}

      {/* Financial & Risk Ratios Matrix Table */}
      {!loading && comparisonData && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-xl space-y-3 overflow-x-auto">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
              Key Financial & Risk Ratios Matrix
            </h3>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Risk-Adjusted Efficiency</span>
          </div>

          <table className="w-full text-left text-xs min-w-[620px]">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <th className="pb-3 font-bold w-[140px]">Metric / Ratio</th>
                {comparisonData.funds.map((f, idx) => {
                  const sCode = Number(f.meta.scheme_code);
                  return (
                    <th key={idx} className="pb-3 font-semibold">
                      <div className="flex items-center justify-between gap-1.5 bg-slate-50 dark:bg-slate-950/60 p-2 rounded-xl border border-slate-200 dark:border-slate-800/80">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: LINE_COLORS[idx % LINE_COLORS.length] }} />
                          <span className="truncate max-w-[130px] font-bold text-slate-800 dark:text-slate-200 block" title={f.meta.scheme_name}>
                            {f.meta.scheme_name}
                          </span>
                        </div>
                        <button
                          onClick={() => handleRemoveFund(sCode)}
                          className="p-1 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/20 rounded-md transition-colors flex-shrink-0 cursor-pointer"
                          title="Remove from comparison"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-200">
              {/* Sharpe Ratio */}
              {(() => {
                const bestIdx = getBestInRow('sharpeRatio', comparisonData.funds, 'higher');
                return (
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 text-slate-700 dark:text-slate-300 font-semibold">
                      <span>Sharpe Ratio</span>
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 block">Higher is better</span>
                    </td>
                    {comparisonData.funds.map((f, idx) => {
                      const isBest = idx === bestIdx;
                      return (
                        <td key={idx} className="py-2.5 font-bold font-mono">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md ${
                            isBest ? 'bg-purple-500/15 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30' : 'text-slate-800 dark:text-slate-300'
                          }`}>
                            {f.metrics?.sharpeRatio}
                            {isBest && <Trophy className="w-3 h-3 text-amber-500 dark:text-amber-400" />}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })()}

              {/* Sortino Ratio */}
              {(() => {
                const bestIdx = getBestInRow('sortinoRatio', comparisonData.funds, 'higher');
                return (
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 text-slate-700 dark:text-slate-300 font-semibold">
                      <span>Sortino Ratio</span>
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 block">Downside protection</span>
                    </td>
                    {comparisonData.funds.map((f, idx) => {
                      const isBest = idx === bestIdx;
                      return (
                        <td key={idx} className="py-2.5 font-bold font-mono">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md ${
                            isBest ? 'bg-purple-500/15 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30' : 'text-slate-800 dark:text-slate-300'
                          }`}>
                            {f.metrics?.sortinoRatio}
                            {isBest && <Trophy className="w-3 h-3 text-amber-500 dark:text-amber-400" />}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })()}

              {/* Volatility (Std Dev) */}
              {(() => {
                const bestIdx = getBestInRow('volatilityStdDev', comparisonData.funds, 'lower');
                return (
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 text-slate-700 dark:text-slate-300 font-semibold">
                      <span>Annualized Volatility</span>
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 block">Lower is steadier</span>
                    </td>
                    {comparisonData.funds.map((f, idx) => {
                      const isBest = idx === bestIdx;
                      return (
                        <td key={idx} className="py-2.5 font-bold font-mono">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md ${
                            isBest ? 'bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30' : 'text-slate-800 dark:text-slate-300'
                          }`}>
                            {f.metrics?.volatilityStdDev}%
                            {isBest && <ShieldCheck className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />}
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })()}

              {/* Max Drawdown */}
              {(() => {
                const bestIdx = getBestInRow('maxDrawdown', comparisonData.funds, 'higher');
                return (
                  <tr className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-2.5 text-slate-700 dark:text-slate-300 font-semibold">
                      <span>Max Drawdown</span>
                      <span className="text-[9px] text-slate-400 dark:text-slate-500 block">Deepest historical dip</span>
                    </td>
                    {comparisonData.funds.map((f, idx) => {
                      const isBest = idx === bestIdx;
                      return (
                        <td key={idx} className="py-2.5 font-bold font-mono">
                          <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md ${
                            isBest ? 'bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30' : 'text-rose-600 dark:text-rose-400'
                          }`}>
                            {f.metrics?.maxDrawdown}%
                          </span>
                        </td>
                      );
                    })}
                  </tr>
                );
              })()}

              {/* 52-Week Range */}
              <tr>
                <td className="py-2.5 text-slate-500 dark:text-slate-400 font-medium">52-Week Range</td>
                {comparisonData.funds.map((f, idx) => (
                  <td key={idx} className="py-2.5 text-slate-700 dark:text-slate-300 font-mono text-[11px]">
                    <div>L: ₹{formatNav(f.metrics?.low52W)}</div>
                    <div>H: ₹{formatNav(f.metrics?.high52W)}</div>
                  </td>
                ))}
              </tr>

              {/* Fund House / AMC */}
              <tr>
                <td className="py-2.5 text-slate-500 dark:text-slate-400 font-medium">Fund House (AMC)</td>
                {comparisonData.funds.map((f, idx) => (
                  <td key={idx} className="py-2.5 text-slate-600 dark:text-slate-400 text-[11px]">
                    {f.meta.fund_house || 'Mutual Fund'}
                  </td>
                ))}
              </tr>

              {/* Category */}
              <tr>
                <td className="py-2.5 text-slate-500 dark:text-slate-400 font-medium">Category</td>
                {comparisonData.funds.map((f, idx) => (
                  <td key={idx} className="py-2.5 text-slate-600 dark:text-slate-400 text-[11px]">
                    {f.meta.scheme_category?.replace(/Open Ended Schemes\s*\(/i, '').replace(/\)/g, '') || 'Equity'}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Head-to-Head SIP Value Projection Tool */}
      {!loading && comparisonData && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <Calculator className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">SIP Growth Head-to-Head Calculator</h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Simulate monthly SIP accumulation across compared peers</p>
              </div>
            </div>

            {/* Quick SIP inputs */}
            <div className="flex items-center gap-2">
              <select
                value={sipMonthlyAmount}
                onChange={(e) => setSipMonthlyAmount(parseInt(e.target.value, 10))}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value={5000}>₹5,000 / mo</option>
                <option value={10000}>₹10,000 / mo</option>
                <option value={20000}>₹20,000 / mo</option>
                <option value={50000}>₹50,000 / mo</option>
              </select>

              <select
                value={sipHorizonYears}
                onChange={(e) => setSipHorizonYears(parseInt(e.target.value, 10))}
                className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-800 dark:text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value={3}>3 Years</option>
                <option value={5}>5 Years</option>
                <option value={10}>10 Years</option>
                <option value={15}>15 Years</option>
              </select>
            </div>
          </div>

          {/* SIP Results Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {comparisonData.funds.map((fund, idx) => {
              const sCode = Number(fund.meta.scheme_code);
              const rate = fund.metrics?.cagr5Y || fund.metrics?.cagr3Y || fund.metrics?.cagrInception || 12;
              const r = rate / 100 / 12;
              const n = sipHorizonYears * 12;
              const totalInvested = sipMonthlyAmount * n;
              const expectedCorpus = Math.round(sipMonthlyAmount * ((Math.pow(1 + r, n) - 1) / r) * (1 + r));
              const wealthGain = expectedCorpus - totalInvested;

              return (
                <div
                  key={idx}
                  className="bg-slate-50 dark:bg-slate-950/70 rounded-2xl p-4 border border-slate-200 dark:border-slate-800/80 space-y-2 relative overflow-hidden group"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: LINE_COLORS[idx % LINE_COLORS.length] }} />
                      <span className="text-xs font-bold text-slate-900 dark:text-white truncate">{fund.meta.scheme_name}</span>
                    </div>
                    <button
                      onClick={() => handleRemoveFund(sCode)}
                      className="p-1 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/20 rounded-md transition-colors cursor-pointer"
                      title="Remove from comparison"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-baseline">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">Total Corpus</span>
                    <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                      ₹{expectedCorpus.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>Invested: ₹{totalInvested.toLocaleString('en-IN')}</span>
                    <span className="text-teal-600 dark:text-teal-300 font-semibold">+₹{wealthGain.toLocaleString('en-IN')}</span>
                  </div>

                  <div className="text-[9px] text-slate-400 dark:text-slate-500">
                    Based on historical CAGR of <strong>{rate}%</strong> over {sipHorizonYears} years
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Gemini AI Comparative Analysis */}
      {!loading && comparisonData && comparisonData.funds.length >= 2 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-purple-200 dark:border-purple-500/30 shadow-md dark:shadow-2xl space-y-4 bg-gradient-to-b from-purple-50/50 to-white dark:from-purple-950/20 dark:to-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-2xl bg-purple-500/15 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-500/30">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  Gemini AI Head-to-Head Verdict & Research
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-purple-100 dark:bg-purple-500/30 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/40">
                    AI Powered
                  </span>
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">Objective risk-adjusted alpha, rolling consistency & investor fit</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={aiRiskTolerance}
                onChange={(e) => setAiRiskTolerance(e.target.value)}
                className="bg-slate-50 dark:bg-slate-950 border border-purple-200 dark:border-purple-500/30 rounded-xl px-3 py-1.5 text-xs text-purple-900 dark:text-purple-200 focus:outline-none focus:border-purple-400 cursor-pointer"
              >
                <option value="Conservative">Risk Profile: Conservative</option>
                <option value="Moderate">Risk Profile: Moderate</option>
                <option value="Aggressive">Risk Profile: Aggressive</option>
              </select>

              <button
                id="btn-run-ai-comparison"
                onClick={handleRunAiComparison}
                disabled={aiLoading}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-purple-600/30 dark:shadow-purple-900/40 disabled:opacity-50 cursor-pointer transition-all hover:scale-105"
              >
                {aiLoading ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Evaluating...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>{aiComparison ? 'Re-Evaluate' : 'Run AI Comparison'}</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* AI Output Box */}
          {aiComparison && (
            <div className="space-y-3 pt-2">
              {/* Crown Winner Card */}
              <div className="bg-purple-50/70 dark:bg-slate-950/80 rounded-2xl p-4 border border-purple-200 dark:border-purple-500/40 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-500 dark:text-amber-400" />
                    <span className="text-xs font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider">Overall AI Recommendation</span>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                    TOP PICK
                  </span>
                </div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">{aiComparison.winner}</h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{aiComparison.winnerRationale}</p>
              </div>

              {/* Leaders Breakdown */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <TrendingUp className="w-3.5 h-3.5" /> Multi-Year Returns Leader
                  </span>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{aiComparison.returnsLeader}</p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-1">
                  <span className="text-[10px] font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" /> Risk-Adjusted Efficiency Leader
                  </span>
                  <p className="text-xs font-bold text-slate-900 dark:text-white">{aiComparison.riskEfficiencyLeader}</p>
                </div>
              </div>

              {/* Aspect Comparison Notes */}
              {aiComparison.comparativeTableHighlights?.length > 0 && (
                <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Detailed Head-to-Head Observations</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {aiComparison.comparativeTableHighlights.map((item, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80">
                        <strong className="text-[11px] text-purple-700 dark:text-purple-300 block">{item.aspect}</strong>
                        <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">{item.observation}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Tailored Recommendations by Profile */}
              {aiComparison.investorRecommendations && (
                <div className="bg-slate-50 dark:bg-slate-950/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Which One Should You Choose?</span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                      <span className="text-teal-600 dark:text-teal-400 font-bold block text-[11px]">Conservative Investor</span>
                      <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-1">{aiComparison.investorRecommendations.conservative}</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold block text-[11px]">Moderate Investor</span>
                      <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-1">{aiComparison.investorRecommendations.moderate}</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
                      <span className="text-purple-600 dark:text-purple-400 font-bold block text-[11px]">Aggressive Growth</span>
                      <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-1">{aiComparison.investorRecommendations.aggressive}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Summary Conclusion */}
              {aiComparison.verdictSummary && (
                <p className="text-xs text-slate-600 dark:text-slate-400 italic bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-200 dark:border-slate-800/60">
                  💡 {aiComparison.verdictSummary}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal to Search & Add Fund to Comparison */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 dark:bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg p-5 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-500/15 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Add Mutual Fund to Comparison</h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Search from 18,500+ mutual fund schemes live via AMFI India</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setSearchTerm('');
                }}
                className="p-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Category Quick Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
              {['All', 'Equity', 'Small Cap', 'Flexi Cap', 'Large Cap', 'Index / ETF', 'Debt', 'Hybrid'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSearchCategory(cat)}
                  className={`px-2.5 py-1 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all cursor-pointer ${
                    searchCategory === cat
                      ? 'bg-purple-600 text-white shadow'
                      : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Search Input Box */}
            <div className="relative">
              <Search className="w-4 h-4 text-purple-600 dark:text-purple-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search scheme name (e.g. Parag Parikh, SBI Small Cap, Quant, HDFC, Axis)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 focus:border-purple-500 rounded-2xl pl-10 pr-10 py-2.5 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none transition-all"
                autoFocus
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-0.5 cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Schemes List with Live Results */}
            <div className="max-h-80 overflow-y-auto space-y-2 pr-1 custom-scrollbar min-h-[160px]">
              {isSearching && (
                <div className="py-8 flex flex-col items-center justify-center space-y-2 text-xs text-purple-600 dark:text-purple-300">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-600 dark:text-purple-400" />
                  <span>Searching real-time AMFI scheme database...</span>
                </div>
              )}

              {!isSearching && searchResults.map(item => {
                const isAdding = addingCode === item.schemeCode;
                const hasNav = 'nav' in item && typeof item.nav === 'number' && item.nav > 0;
                const amcText = 'amc' in item ? item.amc : 'Mutual Fund';
                const catText = 'category' in item ? item.category.replace(/Open Ended Schemes\s*\(/i, '').replace(/\)/g, '') : 'Scheme';

                return (
                  <div
                    key={item.schemeCode}
                    onClick={() => !isAdding && handleAddFund(item)}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/70 hover:bg-slate-100 dark:hover:bg-slate-800/90 border border-slate-200 dark:border-slate-800/90 hover:border-purple-500/50 cursor-pointer transition-all flex items-center justify-between gap-3 group"
                  >
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-300 line-clamp-1">
                        {item.schemeName}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                        <span className="flex items-center gap-1 font-medium">
                          <Building2 className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                          {amcText}
                        </span>
                        <span>•</span>
                        <span className="text-slate-500 font-mono">Code: {item.schemeCode}</span>
                        {hasNav && (
                          <>
                            <span>•</span>
                            <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                              ₹{formatNav((item as AmfiSchemeSummary).nav)}
                            </span>
                          </>
                        )}
                        <span className="px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-[9px] text-purple-700 dark:text-purple-300 font-medium">
                          {catText}
                        </span>
                      </div>
                    </div>

                    <div className="p-2 rounded-xl bg-purple-500/15 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 group-hover:bg-purple-600 group-hover:text-white transition-all flex-shrink-0">
                      {isAdding ? (
                        <Loader2 className="w-4 h-4 animate-spin text-purple-600 dark:text-white" />
                      ) : (
                        <Plus className="w-4 h-4" />
                      )}
                    </div>
                  </div>
                );
              })}

              {!isSearching && searchResults.length === 0 && (
                <div className="py-10 text-center space-y-2">
                  <p className="text-xs text-slate-500 dark:text-slate-400">No mutual fund schemes found matching &quot;{searchTerm}&quot;</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">Try searching for the AMC name (e.g. &quot;Nippon&quot;, &quot;Quant&quot;, &quot;HDFC&quot;) or scheme code.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
