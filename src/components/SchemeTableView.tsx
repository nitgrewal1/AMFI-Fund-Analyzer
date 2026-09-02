import React from 'react';
import { AmfiSchemeSummary } from '../types';
import { formatNav } from '../utils/formatters';
import { 
  Building2, 
  Bookmark, 
  Layers, 
  ArrowRight, 
  ArrowUpDown,
  TrendingUp,
  ExternalLink,
  Briefcase
} from 'lucide-react';

interface SchemeTableViewProps {
  schemes: AmfiSchemeSummary[];
  onSelect: (scheme: AmfiSchemeSummary) => void;
  onAddToCompare?: (scheme: AmfiSchemeSummary) => void;
  comparedCodes?: number[];
  onToggleWatchlist?: (scheme: AmfiSchemeSummary) => void;
  watchlistCodes?: number[];
  onAddToPortfolio?: (scheme: AmfiSchemeSummary) => void;
}

export const SchemeTableView: React.FC<SchemeTableViewProps> = ({
  schemes,
  onSelect,
  onAddToCompare,
  comparedCodes = [],
  onToggleWatchlist,
  watchlistCodes = [],
  onAddToPortfolio
}) => {
  return (
    <div className="w-full bg-white dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-md dark:shadow-xl transition-colors">
      <div className="overflow-x-auto custom-scrollbar">
        <table className="w-full text-left text-xs text-slate-700 dark:text-slate-300">
          <thead className="bg-slate-50 dark:bg-slate-950/80 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <tr>
              <th className="py-3.5 px-4 w-12 text-center">#</th>
              <th className="py-3.5 px-4 min-w-[280px]">Scheme Name & AMC</th>
              <th className="py-3.5 px-3 min-w-[140px]">Category</th>
              <th className="py-3.5 px-3 text-center min-w-[90px]">Plan Type</th>
              <th className="py-3.5 px-4 text-right min-w-[110px]">Current NAV</th>
              <th className="py-3.5 px-3 text-center min-w-[100px]">NAV Date</th>
              <th className="py-3.5 px-4 text-right min-w-[160px]">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-800/60">
            {schemes.map((scheme, idx) => {
              const isWatchlisted = watchlistCodes.includes(scheme.schemeCode);
              const isCompared = comparedCodes.includes(scheme.schemeCode);
              const isDirect = scheme.schemeName.toLowerCase().includes('direct');

              return (
                <tr 
                  key={scheme.schemeCode}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors group cursor-pointer"
                  onClick={() => onSelect(scheme)}
                >
                  {/* Row index / Code */}
                  <td className="py-3 px-4 text-center font-mono text-[11px] text-slate-400 dark:text-slate-500">
                    {idx + 1}
                  </td>

                  {/* Name & AMC */}
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900 dark:text-slate-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1 leading-snug">
                      {scheme.schemeName}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Building2 className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                        {scheme.amc}
                      </span>
                      <span>•</span>
                      <span className="font-mono text-teal-600 dark:text-teal-400">Code: {scheme.schemeCode}</span>
                    </div>
                  </td>

                  {/* Category */}
                  <td className="py-3 px-3">
                    <span className="text-[11px] text-slate-700 dark:text-slate-300 font-medium line-clamp-1">
                      {scheme.category.replace(/Open Ended Schemes\s*\(/i, '').replace(/\)/g, '')}
                    </span>
                  </td>

                  {/* Plan / Type Badge */}
                  <td className="py-3 px-3 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border ${
                        scheme.fundType === 'Equity' 
                          ? 'bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/30'
                          : scheme.fundType === 'Debt'
                          ? 'bg-blue-500/15 text-blue-800 dark:text-blue-300 border-blue-500/30'
                          : scheme.fundType === 'Hybrid'
                          ? 'bg-purple-500/15 text-purple-800 dark:text-purple-300 border-purple-500/30'
                          : 'bg-amber-500/15 text-amber-800 dark:text-amber-300 border-amber-500/30'
                      }`}>
                        {scheme.fundType}
                      </span>
                      {isDirect && (
                        <span className="px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-teal-500/15 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/30">
                          DIR
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Current NAV */}
                  <td className="py-3 px-4 text-right">
                    <div className="font-extrabold text-slate-900 dark:text-white text-sm font-mono">
                      ₹{formatNav(scheme.nav)}
                    </div>
                  </td>

                  {/* Date */}
                  <td className="py-3 px-3 text-center font-mono text-[11px] text-slate-500 dark:text-slate-400">
                    {scheme.date}
                  </td>

                  {/* Action Buttons */}
                  <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1.5">
                      {/* Watchlist */}
                      {onToggleWatchlist && (
                        <button
                          onClick={() => onToggleWatchlist(scheme)}
                          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                            isWatchlisted
                              ? 'bg-amber-500/20 text-amber-500 dark:text-amber-400 border-amber-500/30'
                              : 'bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border-slate-200 dark:border-slate-800'
                          }`}
                          title={isWatchlisted ? "Remove from Watchlist" : "Add to Watchlist"}
                        >
                          <Bookmark className={`w-3.5 h-3.5 ${isWatchlisted ? 'fill-amber-500 dark:fill-amber-400' : ''}`} />
                        </button>
                      )}

                      {/* Compare */}
                      {onAddToCompare && (
                        <button
                          onClick={() => onAddToCompare(scheme)}
                          className={`p-1.5 rounded-lg border transition-all cursor-pointer ${
                            isCompared
                              ? 'bg-purple-600 text-white border-purple-500'
                              : 'bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border-slate-200 dark:border-slate-800'
                          }`}
                          title="Add to Comparison Matrix"
                        >
                          <Layers className="w-3.5 h-3.5" />
                        </button>
                      )}

                      {/* Analyze CTA */}
                      <button
                        onClick={() => onSelect(scheme)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600/10 dark:bg-emerald-600/20 hover:bg-emerald-600 dark:hover:bg-emerald-500 text-emerald-700 dark:text-emerald-300 hover:text-white dark:hover:text-slate-950 font-bold text-[11px] transition-all border border-emerald-500/30 flex items-center gap-1 cursor-pointer"
                      >
                        <span>Analyze</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
