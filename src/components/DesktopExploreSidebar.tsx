import React from 'react';
import { 
  Building2, 
  Layers, 
  Sparkles, 
  Check, 
  X, 
  Filter, 
  Flame, 
  ShieldCheck, 
  ArrowUpDown,
  Compass,
  Zap
} from 'lucide-react';

interface DesktopExploreSidebarProps {
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  selectedAmc: string;
  setSelectedAmc: (amc: string) => void;
  selectedFundType: string;
  setSelectedFundType: (ft: string) => void;
  directOnly: boolean;
  setDirectOnly: (val: boolean) => void;
  popularOnly: boolean;
  setPopularOnly: (val: boolean) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  amcs: string[];
  categories: string[];
  fundTypes: string[];
  totalCount: number;
  filteredCount: number;
  onReset: () => void;
}

export const DesktopExploreSidebar: React.FC<DesktopExploreSidebarProps> = ({
  selectedCategory,
  setSelectedCategory,
  selectedAmc,
  setSelectedAmc,
  selectedFundType,
  setSelectedFundType,
  directOnly,
  setDirectOnly,
  popularOnly,
  setPopularOnly,
  sortBy,
  setSortBy,
  amcs,
  categories,
  fundTypes,
  totalCount,
  filteredCount,
  onReset
}) => {
  const topAmcs = [
    'SBI Mutual Fund',
    'HDFC Mutual Fund',
    'ICICI Prudential Mutual Fund',
    'Nippon India Mutual Fund',
    'Kotak Mahindra Mutual Fund',
    'Axis Mutual Fund',
    'Mirae Asset Mutual Fund',
    'PPFAS Mutual Fund',
    'Quant Mutual Fund',
    'UTI Mutual Fund',
    'Tata Mutual Fund',
    'DSP Mutual Fund',
    'Bajaj Finserv Mutual Fund',
    'Aditya Birla Sun Life Mutual Fund'
  ];

  const categoryPresets = [
    { id: 'All', label: 'All Mutual Funds', count: totalCount },
    { id: 'Large Cap', label: 'Large Cap Equity', icon: '🏛️' },
    { id: 'Mid Cap', label: 'Mid Cap Equity', icon: '🚀' },
    { id: 'Small Cap', label: 'Small Cap Equity', icon: '⚡' },
    { id: 'Flexi Cap', label: 'Flexi / Multi Cap', icon: '🌐' },
    { id: 'ELSS', label: 'ELSS Tax Saver (80C)', icon: '🛡️' },
    { id: 'Index', label: 'Index & ETFs (Nifty/Sensex)', icon: '📈' },
    { id: 'Hybrid', label: 'Hybrid & Balanced', icon: '⚖️' },
    { id: 'Debt', label: 'Debt & Liquid Funds', icon: '💰' },
    { id: 'Solution Oriented', label: 'Retirement & Children', icon: '🎯' },
  ];

  const hasFilters = selectedCategory !== '' || selectedAmc !== '' || selectedFundType !== 'All' || directOnly || popularOnly;

  return (
    <aside 
      id="desktop-explore-sidebar" 
      className="w-72 2xl:w-80 shrink-0 bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 space-y-5 sticky top-24 self-start max-h-[calc(100vh-120px)] overflow-y-auto custom-scrollbar shadow-md dark:shadow-xl backdrop-blur transition-colors"
    >
      {/* Header & Reset */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <Filter className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">Filters & Slicing</h3>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              {filteredCount.toLocaleString('en-IN')} of {totalCount.toLocaleString('en-IN')} schemes
            </span>
          </div>
        </div>

        {hasFilters && (
          <button
            onClick={onReset}
            className="text-xs text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 font-medium px-2 py-1 rounded-lg hover:bg-rose-500/10 transition-colors cursor-pointer"
          >
            Reset
          </button>
        )}
      </div>

      {/* Plan Type Quick Filters */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
          Plan & Curated Lists
        </span>
        <div className="grid grid-cols-2 gap-2 text-xs">
          <button
            onClick={() => setDirectOnly(!directOnly)}
            className={`p-2.5 rounded-2xl border text-left font-semibold transition-all flex items-center justify-between cursor-pointer ${
              directOnly
                ? 'bg-teal-500/15 dark:bg-teal-500/20 border-teal-500/30 dark:border-teal-500/40 text-teal-700 dark:text-teal-300 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span>Direct Plans</span>
            {directOnly && <Check className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />}
          </button>

          <button
            onClick={() => setPopularOnly(!popularOnly)}
            className={`p-2.5 rounded-2xl border text-left font-semibold transition-all flex items-center justify-between cursor-pointer ${
              popularOnly
                ? 'bg-purple-500/15 dark:bg-purple-500/20 border-purple-500/30 dark:border-purple-500/40 text-purple-700 dark:text-purple-300 shadow-sm'
                : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800/80 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <span className="flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              Curated
            </span>
            {popularOnly && <Check className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />}
          </button>
        </div>
      </div>

      {/* Broad Fund Class (Equity / Debt / Hybrid) */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
          Asset Class
        </span>
        <div className="grid grid-cols-4 gap-1.5 text-xs">
          {['All', 'Equity', 'Debt', 'Hybrid'].map((type) => (
            <button
              key={type}
              onClick={() => {
                setSelectedFundType(type);
                if (type !== 'All') setSelectedCategory('');
              }}
              className={`py-2 px-1 rounded-xl text-center font-bold text-[11px] transition-all border cursor-pointer ${
                selectedFundType === type
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-950/60 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border-slate-200 dark:border-slate-800'
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Category Categories Hierarchy */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
          Scheme Categories
        </span>
        <div className="space-y-1 max-h-56 overflow-y-auto pr-1 custom-scrollbar text-xs">
          {categoryPresets.map((cat) => {
            const isSelected = cat.id === 'All'
              ? (selectedCategory === '' && selectedFundType === 'All')
              : selectedCategory.toLowerCase().includes(cat.id.toLowerCase());

            return (
              <button
                key={cat.id}
                onClick={() => {
                  if (cat.id === 'All') {
                    setSelectedCategory('');
                    setSelectedFundType('All');
                  } else {
                    setSelectedCategory(cat.id);
                  }
                }}
                className={`w-full text-left px-3 py-2 rounded-xl transition-all flex items-center justify-between text-xs font-medium cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 font-bold border border-emerald-500/30'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <span className="flex items-center gap-2 truncate">
                  {cat.icon && <span>{cat.icon}</span>}
                  <span className="truncate">{cat.label}</span>
                </span>
                {isSelected && <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* AMC / Fund House Selector */}
      <div className="space-y-2">
        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center justify-between">
          <span>Asset Management Company</span>
          {selectedAmc && (
            <button
              onClick={() => setSelectedAmc('')}
              className="text-[10px] text-rose-500 dark:text-rose-400 hover:underline cursor-pointer"
            >
              Clear AMC
            </button>
          )}
        </span>

        <select
          value={selectedAmc}
          onChange={(e) => setSelectedAmc(e.target.value)}
          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
        >
          <option value="">All AMCs / Fund Houses ({amcs.length})</option>
          {amcs.map((amc) => (
            <option key={amc} value={amc}>
              {amc}
            </option>
          ))}
        </select>

        {/* Quick Top AMC Tags */}
        <div className="flex flex-wrap gap-1 pt-1">
          {topAmcs.slice(0, 6).map((amc) => (
            <button
              key={amc}
              onClick={() => setSelectedAmc(selectedAmc === amc ? '' : amc)}
              className={`px-2 py-1 rounded-lg text-[10px] font-semibold transition-all border cursor-pointer ${
                selectedAmc === amc
                  ? 'bg-indigo-500/15 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-500/30 dark:border-indigo-500/40'
                  : 'bg-slate-100 dark:bg-slate-950/40 text-slate-600 dark:text-slate-500 hover:text-slate-900 dark:hover:text-slate-300 border-slate-200 dark:border-slate-800/60'
              }`}
            >
              {amc.replace('Mutual Fund', '').trim()}
            </button>
          ))}
        </div>
      </div>

      {/* Sorting Options */}
      <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
          Sort Results By
        </span>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500 font-medium"
        >
          <option value="default">Default (AMFI Catalog)</option>
          <option value="nav_desc">Highest NAV First</option>
          <option value="nav_asc">Lowest NAV First</option>
          <option value="name_asc">Scheme Name (A - Z)</option>
          <option value="amc_asc">AMC Name (A - Z)</option>
          <option value="code_asc">Scheme Code</option>
        </select>
      </div>

      {/* Data Source Footnote */}
      <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-500/20 text-[11px] text-emerald-800 dark:text-emerald-400/90 flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
        <span>Data source: <strong>AMFI Official Direct Feed</strong></span>
      </div>
    </aside>
  );
};
