import React from 'react';
import { Filter, Check, X, Sparkles, Building2, Layers } from 'lucide-react';

interface FilterDrawerProps {
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
  amcs: string[];
  categories: string[];
  fundTypes: string[];
  onReset: () => void;
}

export const FilterDrawer: React.FC<FilterDrawerProps> = ({
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
  amcs,
  categories,
  fundTypes,
  onReset
}) => {
  const quickCategories = [
    { id: 'All', label: 'All Funds' },
    { id: 'Equity', label: 'Equity' },
    { id: 'Large Cap', label: 'Large Cap' },
    { id: 'Small Cap', label: 'Small Cap' },
    { id: 'Flexi Cap', label: 'Flexi Cap' },
    { id: 'Hybrid', label: 'Hybrid' },
    { id: 'Index', label: 'Index / ETF' },
    { id: 'Debt', label: 'Debt / Liquid' },
    { id: 'ELSS', label: 'Tax Saver ELSS' },
  ];

  const hasActiveFilters = selectedCategory !== '' || selectedAmc !== '' || selectedFundType !== 'All' || directOnly || popularOnly;

  return (
    <div id="filter-drawer-container" className="space-y-3">
      {/* Quick Category Chips Scroll Bar */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
        {quickCategories.map((qc) => {
          const isSelected = qc.id === 'All' 
            ? (selectedCategory === '' && selectedFundType === 'All') 
            : (selectedCategory.toLowerCase().includes(qc.id.toLowerCase()) || selectedFundType.toLowerCase() === qc.id.toLowerCase());

          return (
            <button
              key={qc.id}
              onClick={() => {
                if (qc.id === 'All') {
                  setSelectedCategory('');
                  setSelectedFundType('All');
                } else if (['Equity', 'Debt', 'Hybrid'].includes(qc.id)) {
                  setSelectedFundType(qc.id);
                  setSelectedCategory('');
                } else {
                  setSelectedCategory(qc.id);
                  setSelectedFundType('All');
                }
              }}
              className={`px-3 py-1.5 rounded-2xl whitespace-nowrap font-bold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-emerald-600 dark:bg-emerald-500 text-white dark:text-slate-950 shadow-md shadow-emerald-600/20'
                  : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-800 shadow-sm'
              }`}
            >
              {qc.label}
            </button>
          );
        })}
      </div>

      {/* Secondary Filter Controls Bar */}
      <div className="flex items-center justify-between gap-2 text-xs flex-wrap">
        <div className="flex items-center gap-2">
          {/* Direct Plans Toggle */}
          <button
            onClick={() => setDirectOnly(!directOnly)}
            className={`px-2.5 py-1 rounded-xl font-bold transition-all border cursor-pointer ${
              directOnly
                ? 'bg-teal-500/15 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 border-teal-500/40 shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-slate-200 shadow-sm'
            }`}
          >
            Direct Plans Only
          </button>

          {/* Popular / Top 20 Toggle */}
          <button
            onClick={() => setPopularOnly(!popularOnly)}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-xl font-bold transition-all border cursor-pointer ${
              popularOnly
                ? 'bg-purple-500/15 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border-purple-500/40 shadow-sm'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:text-slate-900 dark:hover:text-slate-200 shadow-sm'
            }`}
          >
            <Sparkles className="w-3 h-3 text-purple-600 dark:text-purple-400" />
            <span>Popular Funds</span>
          </button>
        </div>

        {/* AMC Dropdown */}
        <div className="flex items-center gap-2">
          <select
            value={selectedAmc}
            onChange={(e) => setSelectedAmc(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300 rounded-xl px-2.5 py-1 text-xs focus:outline-none focus:border-emerald-500 max-w-[170px] sm:max-w-[220px] truncate shadow-sm"
          >
            <option value="">All AMCs ({amcs.length})</option>
            {amcs.map((a, i) => (
              <option key={i} value={a}>{a}</option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="p-1 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              title="Reset Filters"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
