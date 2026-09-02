import React, { useState, useMemo, useEffect } from 'react';
import { PortfolioHolding, AmfiSchemeSummary } from '../types';
import { searchMfApiDirect, getOrFetchSchemeSummary, fetchSchemes } from '../services/api';
import { formatNav } from '../utils/formatters';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  Tooltip as RechartsTooltip 
} from 'recharts';
import { 
  Briefcase, 
  Plus, 
  Trash2, 
  TrendingUp, 
  TrendingDown, 
  PieChart as PieIcon,
  X,
  Search,
  CheckCircle,
  Building2,
  DollarSign,
  Calendar,
  Loader2
} from 'lucide-react';

interface PortfolioViewProps {
  holdings: PortfolioHolding[];
  onAddHolding: (holding: Omit<PortfolioHolding, 'id'>) => void;
  onRemoveHolding: (id: string) => void;
  allSchemes: AmfiSchemeSummary[];
  onSelectScheme: (scheme: AmfiSchemeSummary) => void;
}

const PIE_COLORS = ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ec4899', '#64748b'];

export const PortfolioView: React.FC<PortfolioViewProps> = ({
  holdings,
  onAddHolding,
  onRemoveHolding,
  allSchemes,
  onSelectScheme
}) => {
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [selectedScheme, setSelectedScheme] = useState<AmfiSchemeSummary | null>(null);
  const [units, setUnits] = useState<string>('100');
  const [purchaseNav, setPurchaseNav] = useState<string>('');
  const [purchaseDate, setPurchaseDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [schemeSearch, setSchemeSearch] = useState<string>('');
  const [searchResults, setSearchResults] = useState<(AmfiSchemeSummary | { schemeCode: number; schemeName: string })[]>([]);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [resolvingCode, setResolvingCode] = useState<number | null>(null);

  // Live AMFI search when user queries in portfolio modal
  useEffect(() => {
    if (!schemeSearch.trim()) {
      setSearchResults(allSchemes.slice(0, 10));
      return;
    }

    let isMounted = true;
    setIsSearching(true);
    const handler = setTimeout(async () => {
      try {
        const localMatches = allSchemes.filter(s =>
          s.schemeName.toLowerCase().includes(schemeSearch.toLowerCase()) ||
          s.amc.toLowerCase().includes(schemeSearch.toLowerCase()) ||
          s.schemeCode.toString().includes(schemeSearch.trim())
        );

        let remoteMatches: { schemeCode: number; schemeName: string }[] = [];
        try {
          remoteMatches = await searchMfApiDirect(schemeSearch);
        } catch {
          try {
            const apiRes = await fetchSchemes({ search: schemeSearch, limit: 15 });
            remoteMatches = apiRes.schemes;
          } catch {}
        }

        if (isMounted) {
          const map = new Map<number, any>();
          localMatches.forEach(s => map.set(s.schemeCode, s));
          remoteMatches.forEach(r => {
            if (!map.has(r.schemeCode)) {
              map.set(r.schemeCode, r);
            }
          });
          setSearchResults(Array.from(map.values()).slice(0, 20));
        }
      } catch (err) {
        console.error('Error searching schemes for portfolio:', err);
      } finally {
        if (isMounted) setIsSearching(false);
      }
    }, 200);

    return () => {
      isMounted = false;
      clearTimeout(handler);
    };
  }, [schemeSearch, allSchemes]);

  // Portfolio Totals & Metrics
  const portfolioSummary = useMemo(() => {
    let totalInvested = 0;
    let totalCurrent = 0;

    const typeBreakdownMap = new Map<string, number>();

    holdings.forEach(h => {
      // Find latest NAV from live master list
      const liveScheme = allSchemes.find(s => s.schemeCode === h.schemeCode);
      const currentNav = liveScheme ? liveScheme.nav : h.currentNav;

      const currentVal = h.units * currentNav;
      const investedVal = h.investedAmount || (h.units * h.purchaseNav);

      totalInvested += investedVal;
      totalCurrent += currentVal;

      const fundType = h.fundType || 'Equity';
      typeBreakdownMap.set(fundType, (typeBreakdownMap.get(fundType) || 0) + currentVal);
    });

    const totalGain = totalCurrent - totalInvested;
    const totalGainPercent = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0;

    const pieData = Array.from(typeBreakdownMap.entries()).map(([name, value]) => ({
      name,
      value: Math.round(value),
      percentage: totalCurrent > 0 ? Number(((value / totalCurrent) * 100).toFixed(1)) : 0
    }));

    return {
      totalInvested: Math.round(totalInvested),
      totalCurrent: Math.round(totalCurrent),
      totalGain: Math.round(totalGain),
      totalGainPercent: Number(totalGainPercent.toFixed(2)),
      pieData
    };
  }, [holdings, allSchemes]);

  const handleOpenAdd = (scheme?: AmfiSchemeSummary) => {
    if (scheme) {
      setSelectedScheme(scheme);
      setPurchaseNav(scheme.nav.toString());
    } else {
      setSelectedScheme(allSchemes[0] || null);
      if (allSchemes[0]) setPurchaseNav(allSchemes[0].nav.toString());
    }
    setShowAddModal(true);
  };

  const handleSaveHolding = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScheme) return;

    const u = parseFloat(units);
    const pNav = parseFloat(purchaseNav) || selectedScheme.nav;
    if (isNaN(u) || u <= 0 || isNaN(pNav) || pNav <= 0) return;

    onAddHolding({
      schemeCode: selectedScheme.schemeCode,
      schemeName: selectedScheme.schemeName,
      amc: selectedScheme.amc,
      fundType: selectedScheme.fundType,
      category: selectedScheme.category,
      units: u,
      investedAmount: Math.round(u * pNav),
      purchaseNav: pNav,
      purchaseDate,
      currentNav: selectedScheme.nav
    });

    setShowAddModal(false);
    setSchemeSearch('');
  };

  return (
    <div id="portfolio-view" className="space-y-4 pb-28 sm:pb-28 lg:pb-12">
      {/* Portfolio Overview Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-xl space-y-4">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">My Mutual Funds Portfolio</h2>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">AMFI Live Valuation & Asset Allocation</p>
            </div>
          </div>

          <button
            id="btn-add-holding"
            onClick={() => handleOpenAdd()}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-900/30 transition-all cursor-pointer active:scale-95 ml-auto sm:ml-0"
          >
            <Plus className="w-4 h-4" />
            <span>Add Investment</span>
          </button>
        </div>

        {/* Big Balance Banner */}
        <div className="bg-slate-50 dark:bg-slate-950/80 rounded-2xl p-4 border border-slate-200 dark:border-slate-800">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">Current Portfolio Value</span>
              <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                ₹{portfolioSummary.totalCurrent.toLocaleString('en-IN')}
              </span>
            </div>

            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">Invested Amount</span>
              <span className="text-lg sm:text-xl font-bold text-slate-700 dark:text-slate-300">
                ₹{portfolioSummary.totalInvested.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="col-span-2 sm:col-span-1 border-t sm:border-t-0 border-slate-200 dark:border-slate-800/80 pt-2 sm:pt-0">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium block">Total P&L</span>
              <div className="flex items-center gap-1.5">
                {portfolioSummary.totalGain >= 0 ? (
                  <TrendingUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-rose-600 dark:text-rose-400" />
                )}
                <span className={`text-base font-extrabold ${portfolioSummary.totalGain >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                  {portfolioSummary.totalGain >= 0 ? '+' : ''}₹{portfolioSummary.totalGain.toLocaleString('en-IN')}
                  <span className="text-xs font-bold ml-1">({portfolioSummary.totalGainPercent}%)</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Asset Allocation Donut Chart */}
        {portfolioSummary.pieData.length > 0 && (
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-300 mb-2 flex items-center gap-1.5">
              <PieIcon className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              Asset Class Allocation
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 items-center gap-4">
              <div className="h-40 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={portfolioSummary.pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={38}
                      outerRadius={65}
                      paddingAngle={4}
                    >
                      {portfolioSummary.pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          return (
                            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 p-2 rounded-xl text-xs shadow-lg">
                              <span className="font-bold text-slate-900 dark:text-white">{data.name}</span>: ₹{data.value.toLocaleString('en-IN')} ({data.percentage}%)
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div className="space-y-1.5 text-xs">
                {portfolioSummary.pieData.map((entry, idx) => (
                  <div key={idx} className="flex items-center justify-between text-slate-700 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }} />
                      <span>{entry.name}</span>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white">{entry.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Holdings List */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white px-1">
          Holdings Breakdown ({holdings.length})
        </h3>

        {holdings.length === 0 ? (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 text-center space-y-3 shadow-sm">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 flex items-center justify-center mx-auto">
              <Briefcase className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-white">No Holdings Added Yet</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              Add your mutual funds with purchase NAV to track real-time valuations against latest AMFI NAV updates.
            </p>
            <button
              onClick={() => handleOpenAdd()}
              className="px-4 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all inline-flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Add First Scheme
            </button>
          </div>
        ) : (
          holdings.map((h) => {
            const liveScheme = allSchemes.find(s => s.schemeCode === h.schemeCode);
            const curNav = liveScheme ? liveScheme.nav : h.currentNav;
            const curVal = Math.round(h.units * curNav);
            const invVal = h.investedAmount || Math.round(h.units * h.purchaseNav);
            const gain = curVal - invVal;
            const gainPct = invVal > 0 ? Number(((gain / invVal) * 100).toFixed(2)) : 0;

            return (
              <div
                key={h.id}
                className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-md space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                      <Building2 className="w-3 h-3 text-slate-400 dark:text-slate-500" />
                      {h.amc}
                    </span>
                    <h4 
                      onClick={() => liveScheme && onSelectScheme(liveScheme)}
                      className="text-xs font-bold text-slate-900 dark:text-white hover:text-emerald-600 dark:hover:text-emerald-400 cursor-pointer transition-colors line-clamp-1 mt-0.5"
                    >
                      {h.schemeName}
                    </h4>
                  </div>

                  <button
                    onClick={() => onRemoveHolding(h.id)}
                    className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                    title="Delete holding"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-800/80 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Units & Buy NAV</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">{h.units} @ ₹{h.purchaseNav}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Current NAV</span>
                    <span className="font-bold text-slate-900 dark:text-white font-mono">₹{formatNav(curNav)}</span>
                  </div>

                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Current Value</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">₹{curVal.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100 dark:border-slate-800/80">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">Invested: ₹{invVal.toLocaleString('en-IN')}</span>
                  <span className={`font-bold flex items-center gap-1 ${gain >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                    {gain >= 0 ? '+' : ''}₹{gain.toLocaleString('en-IN')} ({gainPct}%)
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Holding Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-md p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Add Mutual Fund Holding</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveHolding} className="space-y-3 text-xs">
              {/* Scheme Search / Select */}
              <div>
                <label className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">Select Scheme</label>
                <div className="relative mb-2">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    placeholder="Search schemes..."
                    value={schemeSearch}
                    onChange={(e) => setSchemeSearch(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {schemeSearch && (
                  <div className="max-h-48 overflow-y-auto space-y-1 bg-slate-50 dark:bg-slate-950 p-2 rounded-xl border border-slate-200 dark:border-slate-800 mb-2">
                    {isSearching ? (
                      <div className="p-3 text-center text-slate-500 dark:text-slate-400 flex items-center justify-center gap-2">
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500" />
                        <span>Searching AMFI India live catalog...</span>
                      </div>
                    ) : searchResults.length === 0 ? (
                      <div className="p-3 text-center text-slate-400 dark:text-slate-500">No mutual funds found</div>
                    ) : (
                      searchResults.map((s) => {
                        const hasNav = 'nav' in s && typeof s.nav === 'number';
                        const isResolving = resolvingCode === s.schemeCode;
                        return (
                          <div
                            key={s.schemeCode}
                            onClick={async () => {
                              try {
                                setResolvingCode(s.schemeCode);
                                const fullScheme = await getOrFetchSchemeSummary(s);
                                setSelectedScheme(fullScheme);
                                setPurchaseNav(fullScheme.nav.toString());
                                setSchemeSearch('');
                              } catch (e) {
                                console.error('Failed to resolve scheme:', e);
                              } finally {
                                setResolvingCode(null);
                              }
                            }}
                            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-slate-800 dark:text-slate-200 flex items-center justify-between transition-colors"
                          >
                            <div className="min-w-0 pr-2">
                              <span className="truncate block font-medium text-xs">{s.schemeName}</span>
                              <span className="text-[10px] text-slate-500 dark:text-slate-400">Code: {s.schemeCode}</span>
                            </div>
                            <div className="shrink-0 text-right">
                              {isResolving ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-500 inline" />
                              ) : hasNav ? (
                                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold font-mono">₹{formatNav(s.nav)}</span>
                              ) : (
                                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono">AMFI</span>
                              )}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                )}

                {selectedScheme && (
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-500/30 text-emerald-800 dark:text-emerald-300 font-medium">
                    <span className="block font-bold">{selectedScheme.schemeName}</span>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400/80 font-mono">Live NAV: ₹{formatNav(selectedScheme.nav)} • {selectedScheme.amc}</span>
                  </div>
                )}
              </div>

              {/* Units and Buy NAV */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">Units Bought</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={units}
                    onChange={(e) => setUnits(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">Purchase NAV (₹)</label>
                  <input
                    type="number"
                    step="any"
                    required
                    value={purchaseNav}
                    onChange={(e) => setPurchaseNav(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">Purchase Date</label>
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Estimated Investment</span>
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  ₹{Math.round((parseFloat(units) || 0) * (parseFloat(purchaseNav) || 0)).toLocaleString('en-IN')}
                </span>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-lg shadow-emerald-900/30 cursor-pointer"
              >
                Save Holding
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
