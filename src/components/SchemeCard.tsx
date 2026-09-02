import React from 'react';
import { AmfiSchemeSummary } from '../types';
import { formatNav } from '../utils/formatters';
import { 
  TrendingUp, 
  LineChart, 
  Layers, 
  Sparkles, 
  Bookmark, 
  ArrowRight,
  ShieldCheck,
  Building2
} from 'lucide-react';

interface SchemeCardProps {
  scheme: AmfiSchemeSummary;
  onSelect: (scheme: AmfiSchemeSummary) => void;
  onAddToCompare?: (scheme: AmfiSchemeSummary) => void;
  isCompared?: boolean;
  onToggleWatchlist?: (scheme: AmfiSchemeSummary) => void;
  isWatchlisted?: boolean;
}

export const SchemeCard: React.FC<SchemeCardProps> = ({
  scheme,
  onSelect,
  onAddToCompare,
  isCompared = false,
  onToggleWatchlist,
  isWatchlisted = false
}) => {
  // Category color styling
  const getFundTypeBadge = (type: string) => {
    switch (type) {
      case 'Equity':
        return 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30';
      case 'Debt':
        return 'bg-blue-500/15 text-blue-800 dark:text-blue-300 border-blue-500/30';
      case 'Hybrid':
        return 'bg-purple-500/15 text-purple-800 dark:text-purple-300 border-purple-500/30';
      case 'Index / ETF':
        return 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30';
      default:
        return 'bg-slate-500/15 text-slate-700 dark:text-slate-300 border-slate-500/30';
    }
  };

  const isDirect = scheme.schemeName.toLowerCase().includes('direct');

  return (
    <div
      id={`scheme-card-${scheme.schemeCode}`}
      className="w-full bg-white dark:bg-slate-900/90 hover:bg-slate-50 dark:hover:bg-slate-800/90 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 rounded-3xl p-4 transition-all duration-200 shadow-sm dark:shadow-md group relative overflow-hidden"
    >
      {/* Top row: AMC & Badges */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <Building2 className="w-3 h-3 text-slate-400 dark:text-slate-500" />
            {scheme.amc}
          </span>
          {isDirect && (
            <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-teal-500/15 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/30">
              DIRECT
            </span>
          )}
        </div>

        {/* Watchlist & Compare Quick Buttons */}
        <div className="flex items-center gap-1">
          {onToggleWatchlist && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleWatchlist(scheme);
              }}
              className={`p-1.5 rounded-xl transition-all cursor-pointer ${
                isWatchlisted
                  ? 'bg-amber-500/20 text-amber-500 dark:text-amber-400 border border-amber-500/30'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title={isWatchlisted ? "Remove from watchlist" : "Add to watchlist"}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isWatchlisted ? 'fill-amber-500 dark:fill-amber-400' : ''}`} />
            </button>
          )}

          {onAddToCompare && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToCompare(scheme);
              }}
              className={`p-1.5 rounded-xl text-[11px] font-medium transition-all cursor-pointer ${
                isCompared
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="Compare Fund"
            >
              <Layers className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Scheme Title */}
      <h3 
        onClick={() => onSelect(scheme)}
        className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 cursor-pointer leading-snug"
      >
        {scheme.schemeName}
      </h3>

      {/* Category Pill */}
      <div className="flex items-center gap-2 mt-2">
        <span className={`px-2 py-0.5 rounded-lg text-[10px] font-medium border ${getFundTypeBadge(scheme.fundType)}`}>
          {scheme.fundType}
        </span>
        <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
          {scheme.category.replace(/Open Ended Schemes\s*\(/i, '').replace(/\)/g, '')}
        </span>
      </div>

      {/* NAV and Actions Footer */}
      <div className="flex items-center justify-between mt-3.5 pt-2.5 border-t border-slate-100 dark:border-slate-800/80">
        <div>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Current NAV</span>
          <div className="flex items-baseline gap-1">
            <span className="text-base font-extrabold text-slate-900 dark:text-white font-mono">₹{formatNav(scheme.nav)}</span>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">({scheme.date})</span>
          </div>
        </div>

        {/* View Details Action */}
        <button
          onClick={() => onSelect(scheme)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600/10 dark:bg-emerald-600/20 hover:bg-emerald-600 dark:hover:bg-emerald-500 text-emerald-700 dark:text-emerald-300 hover:text-white dark:hover:text-slate-950 font-semibold text-xs transition-all border border-emerald-500/30 cursor-pointer"
        >
          <span>Analyze</span>
          <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>
    </div>
  );
};
