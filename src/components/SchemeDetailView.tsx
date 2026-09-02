import React, { useState, useEffect } from 'react';
import { AmfiSchemeSummary, SchemeDetailResponse } from '../types';
import { fetchSchemeDetail } from '../services/api';
import { formatNav } from '../utils/formatters';
import { NavChart } from './NavChart';
import { SipBacktestCard } from './SipBacktestCard';
import { AiAnalysisModal } from './AiAnalysisModal';
import { 
  ArrowLeft, 
  Building2, 
  ShieldCheck, 
  Layers, 
  Bookmark, 
  Briefcase, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Info,
  Calendar,
  Zap,
  Check
} from 'lucide-react';

interface SchemeDetailViewProps {
  schemeSummary: AmfiSchemeSummary;
  onBack: () => void;
  onAddToCompare: (scheme: AmfiSchemeSummary) => void;
  isCompared: boolean;
  onToggleWatchlist: (scheme: AmfiSchemeSummary) => void;
  isWatchlisted: boolean;
  onOpenAddPortfolio: (scheme: AmfiSchemeSummary) => void;
  onUpdateSchemeNav?: (code: number, nav: number, date: string) => void;
}

export const SchemeDetailView: React.FC<SchemeDetailViewProps> = ({
  schemeSummary,
  onBack,
  onAddToCompare,
  isCompared,
  onToggleWatchlist,
  isWatchlisted,
  onOpenAddPortfolio,
  onUpdateSchemeNav
}) => {
  const [detailData, setDetailData] = useState<SchemeDetailResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSchemeData(schemeSummary.schemeCode);
  }, [schemeSummary.schemeCode]);

  const loadSchemeData = async (code: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchSchemeDetail(code);
      setDetailData(data);
      if (data && data.data && data.data.length > 0) {
        const latest = data.data[data.data.length - 1];
        if (latest && latest.nav > 0) {
          onUpdateSchemeNav?.(code, latest.nav, latest.date);
        }
      }
    } catch (err: any) {
      console.error('Error fetching scheme detail:', err);
      setError(err.message || 'Failed to load historical NAV');
    } finally {
      setLoading(false);
    }
  };

  const currentNav = detailData?.metrics?.latestNav || (detailData?.data && detailData.data.length > 0 ? detailData.data[detailData.data.length - 1].nav : schemeSummary.nav);
  const currentDate = detailData?.metrics?.latestDate || (detailData?.data && detailData.data.length > 0 ? detailData.data[detailData.data.length - 1].date : schemeSummary.date);

  return (
    <div id="scheme-detail-view" className="space-y-4 pb-28 sm:pb-28 lg:pb-12">
      {/* Top Back Nav & Actions */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <button
          id="btn-back-to-explore"
          onClick={onBack}
          className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold border border-slate-200 dark:border-slate-800 transition-all cursor-pointer active:scale-95 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span>Back to Funds</span>
        </button>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => onToggleWatchlist(schemeSummary)}
            className={`p-2 rounded-2xl border transition-all cursor-pointer ${
              isWatchlisted
                ? 'bg-amber-500/20 text-amber-500 dark:text-amber-400 border-amber-500/30'
                : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border-slate-200 dark:border-slate-800'
            }`}
            title={isWatchlisted ? "Remove from watchlist" : "Add to watchlist"}
          >
            <Bookmark className={`w-4 h-4 ${isWatchlisted ? 'fill-amber-500 dark:fill-amber-400' : ''}`} />
          </button>

          <button
            onClick={() => onAddToCompare(schemeSummary)}
            className={`flex items-center gap-1 px-2.5 sm:px-3 py-2 rounded-2xl text-xs font-bold transition-all border cursor-pointer ${
              isCompared
                ? 'bg-purple-600 text-white border-purple-500 shadow-md shadow-purple-900/30'
                : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 border-slate-200 dark:border-slate-800'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>{isCompared ? 'In Compare' : 'Compare'}</span>
          </button>

          <button
            onClick={() => onOpenAddPortfolio(schemeSummary)}
            className="flex items-center gap-1 px-2.5 sm:px-3.5 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md shadow-emerald-900/30 transition-all border border-emerald-500/30 cursor-pointer active:scale-95"
          >
            <Briefcase className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add to Portfolio</span>
            <span className="sm:hidden">Portfolio</span>
          </button>
        </div>
      </div>

      {/* Scheme Title & Meta Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-xl space-y-3">
        <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1 text-slate-800 dark:text-slate-300 font-semibold">
            <Building2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            {schemeSummary.amc}
          </span>
          <span>•</span>
          <span className="text-teal-600 dark:text-teal-400 font-mono">Code: {schemeSummary.schemeCode}</span>
          {schemeSummary.isinGrowth !== '-' && (
            <>
              <span>•</span>
              <span className="font-mono text-slate-400 dark:text-slate-500">ISIN: {schemeSummary.isinGrowth}</span>
            </>
          )}
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <h1 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white leading-snug">
            {schemeSummary.schemeName}
          </h1>

          {/* Real Live NAV Display */}
          <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-950/80 px-4 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 w-fit">
            <div className="text-right">
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-medium">Live NAV</span>
              <span className="text-base sm:text-lg font-extrabold text-emerald-600 dark:text-emerald-400 font-mono">
                ₹{formatNav(currentNav)}
              </span>
            </div>
            <div className="h-6 w-px bg-slate-200 dark:bg-slate-800"></div>
            <div className="text-left">
              <span className="text-[9px] text-slate-400 dark:text-slate-500 block">As of</span>
              <span className="text-[11px] text-slate-700 dark:text-slate-300 font-mono font-medium">{currentDate}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-500/30">
            {schemeSummary.fundType}
          </span>
          <span className="px-2.5 py-1 rounded-xl text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            {schemeSummary.category.replace(/Open Ended Schemes\s*\(/i, '').replace(/\)/g, '')}
          </span>
          <span className="px-2.5 py-1 rounded-xl text-xs font-medium bg-teal-500/15 dark:bg-teal-500/20 text-teal-800 dark:text-teal-300 border border-teal-500/30">
            AMFI Verified
          </span>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="py-16 flex flex-col items-center justify-center space-y-3 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="w-10 h-10 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">Fetching AMFI historical NAV records & calculating risk ratios...</span>
        </div>
      )}

      {/* Error state */}
      {error && !loading && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-500/30 p-4 rounded-3xl text-rose-700 dark:text-rose-300 text-xs flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => loadSchemeData(schemeSummary.schemeCode)}
            className="px-3 py-1 bg-rose-600 text-white rounded-xl font-bold cursor-pointer"
          >
            Retry
          </button>
        </div>
      )}

      {/* Detail Content */}
      {!loading && detailData && (
        <div className="space-y-6">
          {/* Top Banner: Interactive Historical NAV Chart */}
          <NavChart
            data={detailData.data}
            schemeName={detailData.meta.scheme_name}
            category={detailData.meta.scheme_category}
            schemeCode={detailData.meta.scheme_code}
          />

          {/* Desktop 2-Column Responsive Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Returns & SIP Backtest Simulation (8 cols on lg) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Key Return & Risk Metrics Bento Grid */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-xl space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Annualized Returns & Compounding Performance
                </h3>

                {/* Returns Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-slate-50 dark:bg-slate-950/70 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">1-Year Return</span>
                    <span className={`text-lg font-extrabold ${(detailData.metrics?.return1Y || 0) >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                      {(detailData.metrics?.return1Y || 0) >= 0 ? '+' : ''}{detailData.metrics?.return1Y}%
                    </span>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 block">Absolute 1Y</span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950/70 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">3-Year CAGR</span>
                    <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                      +{detailData.metrics?.cagr3Y}%
                    </span>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 block">Compounded</span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950/70 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">5-Year CAGR</span>
                    <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                      +{detailData.metrics?.cagr5Y}%
                    </span>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 block">Compounded</span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950/70 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">Since Inception</span>
                    <span className="text-lg font-extrabold text-teal-600 dark:text-teal-300">
                      +{detailData.metrics?.cagrInception}%
                    </span>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 block">{detailData.metrics?.totalHistoryYears} Yrs History</span>
                  </div>
                </div>

                {/* Long-Term 10Y / 15Y / 20Y Compounding Track Record */}
                <div className="grid grid-cols-3 gap-3 pt-1">
                  <div className="bg-slate-50 dark:bg-slate-950/70 p-3.5 rounded-2xl border border-purple-200 dark:border-purple-500/20">
                    <span className="text-[10px] text-purple-700 dark:text-purple-300 font-medium block">10-Year CAGR</span>
                    <span className="text-sm sm:text-base font-extrabold text-purple-700 dark:text-purple-300 font-mono">
                      {detailData.metrics?.cagr10Y !== null && detailData.metrics?.cagr10Y !== undefined
                        ? `+${detailData.metrics.cagr10Y}%`
                        : <span className="text-slate-400 dark:text-slate-500 text-[10px] font-sans font-normal italic">&lt; 10Y Old</span>}
                    </span>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 block">Decade Track</span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950/70 p-3.5 rounded-2xl border border-purple-200 dark:border-purple-500/20">
                    <span className="text-[10px] text-purple-700 dark:text-purple-300 font-medium block">15-Year CAGR</span>
                    <span className="text-sm sm:text-base font-extrabold text-purple-700 dark:text-purple-300 font-mono">
                      {detailData.metrics?.cagr15Y !== null && detailData.metrics?.cagr15Y !== undefined
                        ? `+${detailData.metrics.cagr15Y}%`
                        : <span className="text-slate-400 dark:text-slate-500 text-[10px] font-sans font-normal italic">&lt; 15Y Old</span>}
                    </span>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 block">15-Yr Horizon</span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950/70 p-3.5 rounded-2xl border border-purple-200 dark:border-purple-500/20">
                    <span className="text-[10px] text-purple-700 dark:text-purple-300 font-medium block">20-Year CAGR</span>
                    <span className="text-sm sm:text-base font-extrabold text-purple-700 dark:text-purple-300 font-mono">
                      {detailData.metrics?.cagr20Y !== null && detailData.metrics?.cagr20Y !== undefined
                        ? `+${detailData.metrics.cagr20Y}%`
                        : <span className="text-slate-400 dark:text-slate-500 text-[10px] font-sans font-normal italic">&lt; 20Y Old</span>}
                    </span>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 block">20-Yr Wealth</span>
                  </div>
                </div>
              </div>

              {/* Historical SIP Performance Simulation */}
              <SipBacktestCard
                navHistory={detailData.data}
                schemeName={detailData.meta.scheme_name}
              />
            </div>

            {/* Right Column: Factsheet, Volatility Ratios, 52W Gauge, AI Research (4 cols on lg) */}
            <div className="lg:col-span-4 space-y-5 lg:sticky lg:top-24">
              {/* Risk & Volatility Ratios Card */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-xl space-y-4">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  Risk & Volatility Indicators
                </h3>

                <div className="grid grid-cols-2 gap-2.5">
                  <div className="bg-slate-50 dark:bg-slate-950/70 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">Sharpe Ratio</span>
                    <span className="text-sm font-extrabold text-purple-700 dark:text-purple-300 font-mono">
                      {detailData.metrics?.sharpeRatio}
                    </span>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 block">Risk-adj return</span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950/70 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">Sortino Ratio</span>
                    <span className="text-sm font-extrabold text-purple-700 dark:text-purple-300 font-mono">
                      {detailData.metrics?.sortinoRatio}
                    </span>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 block">Downside risk</span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950/70 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">Volatility (Std Dev)</span>
                    <span className="text-sm font-extrabold text-amber-600 dark:text-amber-300 font-mono">
                      {detailData.metrics?.volatilityStdDev}%
                    </span>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 block">Annualized</span>
                  </div>

                  <div className="bg-slate-50 dark:bg-slate-950/70 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">Max Drawdown</span>
                    <span className="text-sm font-extrabold text-rose-600 dark:text-rose-400 font-mono">
                      {detailData.metrics?.maxDrawdown}%
                    </span>
                    <span className="text-[9px] text-slate-400 dark:text-slate-500 block">Peak drop</span>
                  </div>
                </div>

                {/* 52-Week High & Low Gauge */}
                <div className="bg-slate-50 dark:bg-slate-950/70 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500 dark:text-slate-400">52W Low: <strong className="text-slate-800 dark:text-slate-200 font-mono">₹{formatNav(detailData.metrics?.low52W)}</strong></span>
                    <span className="text-slate-500 dark:text-slate-400">52W High: <strong className="text-slate-800 dark:text-slate-200 font-mono">₹{formatNav(detailData.metrics?.high52W)}</strong></span>
                  </div>

                  {(() => {
                    const high = detailData.metrics?.high52W || detailData.metrics?.latestNav || 100;
                    const low = detailData.metrics?.low52W || detailData.metrics?.latestNav || 0;
                    const cur = detailData.metrics?.latestNav || 50;
                    const pct = high > low ? Math.min(100, Math.max(0, ((cur - low) / (high - low)) * 100)) : 50;

                    return (
                      <div className="w-full h-2.5 bg-slate-200 dark:bg-slate-800 rounded-full relative overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 rounded-full"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Gemini AI Research & Suitability Audit */}
              <AiAnalysisModal
                schemeMeta={detailData.meta}
                metrics={detailData.metrics}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
