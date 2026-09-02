import React, { useState, useEffect, useCallback, useTransition, useMemo, useRef } from 'react';
import { AmfiSchemeSummary, ActiveTab, PortfolioHolding } from './types';
import { fetchSchemes, fetchMetadata } from './services/api';
import { AndroidHeader } from './components/AndroidHeader';
import { AndroidNavBar } from './components/AndroidNavBar';
import { SchemeCard } from './components/SchemeCard';
import { SchemeTableView } from './components/SchemeTableView';
import { DesktopExploreSidebar } from './components/DesktopExploreSidebar';
import { SchemeDetailView } from './components/SchemeDetailView';
import { FundComparisonView } from './components/FundComparisonView';
import { PortfolioView } from './components/PortfolioView';
import { CalculatorsView } from './components/CalculatorsView';
import { FilterDrawer } from './components/FilterDrawer';
import { InstallPwaModal } from './components/InstallPwaModal';
import { 
  Search, 
  TrendingUp, 
  Activity, 
  Sparkles, 
  Layers, 
  Briefcase, 
  Bookmark, 
  Compass, 
  Flame, 
  RefreshCw, 
  ChevronRight,
  ShieldCheck,
  Building2,
  X,
  LayoutGrid,
  Table2,
  ArrowUpDown,
  SlidersHorizontal
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('explore');
  const [isPhoneFrame, setIsPhoneFrame] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();
  const mainScrollRef = useRef<HTMLDivElement | null>(null);

  // Reliable instant scroll to top on tab/view transitions
  const scrollToTop = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    }
    if (mainScrollRef.current) {
      mainScrollRef.current.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    }
  }, []);

  const handleTabChange = useCallback((newTab: ActiveTab) => {
    setActiveTab(newTab);
    scrollToTop();
    // Subsequent frame tick to guarantee view rendered at top
    setTimeout(scrollToTop, 15);
    setTimeout(scrollToTop, 80);
  }, [scrollToTop]);

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedAmc, setSelectedAmc] = useState<string>('');
  const [selectedFundType, setSelectedFundType] = useState<string>('All');
  const [directOnly, setDirectOnly] = useState<boolean>(true);
  const [popularOnly, setPopularOnly] = useState<boolean>(false);
  const [sortBy, setSortBy] = useState<string>('default');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Data States
  const [schemes, setSchemes] = useState<AmfiSchemeSummary[]>([]);
  const [totalSchemes, setTotalSchemes] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [amcs, setAmcs] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [fundTypes, setFundTypes] = useState<string[]>([]);

  // Selected Scheme for Detail View
  const [selectedScheme, setSelectedScheme] = useState<AmfiSchemeSummary | null>(null);

  // Standalone App Detection (WebAPK / Installed PWA / Trusted Web Activity)
  const [isStandalone, setIsStandalone] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return (
      window.matchMedia('(display-mode: standalone)').matches ||
      window.matchMedia('(display-mode: window-controls-overlay)').matches ||
      (window.navigator as any).standalone === true ||
      document.referrer.includes('android-app://')
    );
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia('(display-mode: standalone)');
    const checkStandalone = () => {
      setIsStandalone(
        mql.matches ||
        (window.navigator as any).standalone === true ||
        document.referrer.includes('android-app://')
      );
    };
    mql.addEventListener('change', checkStandalone);
    return () => mql.removeEventListener('change', checkStandalone);
  }, []);

  // PWA Install State
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallModalOpen, setIsInstallModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      console.log('beforeinstallprompt captured!');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handlePromptInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User response to the install prompt: ${outcome}`);
      setDeferredPrompt(null);
      setIsInstallModalOpen(false);
    }
  };

  // Keyboard shortcut: Press / to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && (e.target as HTMLElement).tagName !== 'INPUT' && (e.target as HTMLElement).tagName !== 'TEXTAREA') {
        e.preventDefault();
        handleTabChange('explore');
        const searchInput = document.getElementById('main-search-input');
        if (searchInput) searchInput.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTabChange]);

  // Comparison List (Strictly empty by default on every app reload/session)
  const [comparedSchemes, setComparedSchemes] = useState<AmfiSchemeSummary[]>([]);

  // Purge any legacy comparison keys from browser storage on startup
  useEffect(() => {
    try {
      localStorage.removeItem('amfi_compared_schemes');
      localStorage.removeItem('amfi_compared');
      localStorage.removeItem('amfi_compare');
      localStorage.removeItem('amfi_comparison');
      localStorage.removeItem('compared_funds');
      localStorage.removeItem('comparison_schemes');
      sessionStorage.removeItem('amfi_compared_schemes');
      sessionStorage.removeItem('amfi_compare');
    } catch {}
  }, []);

  // Watchlist & Portfolio (Persisted in localStorage, empty by default)
  const [watchlistItems, setWatchlistItems] = useState<AmfiSchemeSummary[]>(() => {
    try {
      const savedItems = localStorage.getItem('amfi_watchlist_items');
      if (savedItems) {
        const parsed = JSON.parse(savedItems);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    } catch {
      return [];
    }
  });

  const watchlistCodes = useMemo(() => watchlistItems.map((s) => s.schemeCode), [watchlistItems]);

  const [portfolio, setPortfolio] = useState<PortfolioHolding[]>(() => {
    try {
      const savedUserPortfolio = localStorage.getItem('amfi_user_portfolio');
      if (savedUserPortfolio) {
        const parsed = JSON.parse(savedUserPortfolio);
        if (Array.isArray(parsed)) return parsed;
      }
      const legacySaved = localStorage.getItem('amfi_portfolio');
      if (legacySaved) {
        const parsed = JSON.parse(legacySaved);
        if (Array.isArray(parsed)) {
          // Filter out legacy mock demo items with dummy ids '1' and '2'
          const userOnly = parsed.filter((item: any) => item.id !== '1' && item.id !== '2');
          return userOnly;
        }
      }
      return [];
    } catch {
      return [];
    }
  });

  // Save watchlist & portfolio
  useEffect(() => {
    localStorage.setItem('amfi_watchlist_items', JSON.stringify(watchlistItems));
    localStorage.setItem('amfi_watchlist', JSON.stringify(watchlistCodes));
  }, [watchlistItems, watchlistCodes]);

  useEffect(() => {
    localStorage.setItem('amfi_user_portfolio', JSON.stringify(portfolio));
    localStorage.setItem('amfi_portfolio', JSON.stringify(portfolio));
  }, [portfolio]);

  // Load Metadata once
  useEffect(() => {
    fetchMetadata()
      .then((data) => {
        setAmcs(data.amcs || []);
        setCategories(data.categories || []);
        setFundTypes(data.fundTypes || []);
      })
      .catch((err) => console.error('Error fetching metadata:', err));
  }, []);

  // Fetch schemes based on filters
  const [displayLimit, setDisplayLimit] = useState<number>(200);

  const loadSchemes = useCallback(async (isRefresh = false, customLimit?: number) => {
    if (isRefresh) setIsRefreshing(true);
    else setLoading(true);

    try {
      const data = await fetchSchemes({
        search: searchQuery,
        category: selectedCategory,
        amc: selectedAmc,
        fundType: selectedFundType !== 'All' ? selectedFundType : undefined,
        popularOnly,
        directOnly,
        limit: customLimit || displayLimit,
      });

      setSchemes(data.schemes || []);
      setTotalSchemes(data.total || 0);
      setLastUpdated(data.lastUpdated);

      // Auto select first scheme if none selected
      if (!selectedScheme && data.schemes && data.schemes.length > 0) {
        setSelectedScheme(data.schemes[0]);
      }
    } catch (err) {
      console.error('Error loading schemes:', err);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [searchQuery, selectedCategory, selectedAmc, selectedFundType, popularOnly, directOnly, selectedScheme, displayLimit]);

  useEffect(() => {
    const handler = setTimeout(() => {
      loadSchemes(false, 200);
      setDisplayLimit(200);
    }, 250);
    return () => clearTimeout(handler);
  }, [searchQuery, selectedCategory, selectedAmc, selectedFundType, popularOnly, directOnly]);

  const handleLoadMore = async () => {
    const nextLimit = Math.min(displayLimit + 150, 500);
    setDisplayLimit(nextLimit);
    await loadSchemes(false, nextLimit);
  };

  // Sorting
  const sortedSchemes = useMemo(() => {
    const list = [...schemes];
    switch (sortBy) {
      case 'nav_desc':
        return list.sort((a, b) => b.nav - a.nav);
      case 'nav_asc':
        return list.sort((a, b) => a.nav - b.nav);
      case 'name_asc':
        return list.sort((a, b) => a.schemeName.localeCompare(b.schemeName));
      case 'amc_asc':
        return list.sort((a, b) => a.amc.localeCompare(b.amc));
      case 'code_asc':
        return list.sort((a, b) => a.schemeCode - b.schemeCode);
      default:
        return list;
    }
  }, [schemes, sortBy]);

  // Handler functions
  const handleSelectScheme = (scheme: AmfiSchemeSummary) => {
    setSelectedScheme(scheme);
    handleTabChange('detail');
  };

  const handleToggleWatchlist = (scheme: AmfiSchemeSummary) => {
    setWatchlistItems((prev) => {
      if (prev.some((s) => s.schemeCode === scheme.schemeCode)) {
        return prev.filter((s) => s.schemeCode !== scheme.schemeCode);
      } else {
        return [scheme, ...prev];
      }
    });
  };

  const handleToggleCompare = (scheme: AmfiSchemeSummary) => {
    setComparedSchemes((prev) => {
      if (prev.some((s) => s.schemeCode === scheme.schemeCode)) {
        return prev.filter((s) => s.schemeCode !== scheme.schemeCode);
      } else {
        if (prev.length >= 6) return prev;
        return [...prev, scheme];
      }
    });
  };

  const handleRemoveCompared = (schemeCode: number) => {
    setComparedSchemes((prev) => prev.filter((s) => s.schemeCode !== schemeCode));
  };

  const handleUpdateSchemeNav = useCallback((code: number, nav: number, date: string) => {
    if (!code || !nav || isNaN(nav) || nav <= 0) return;
    setSchemes((prev) => prev.map((s) => s.schemeCode === code ? { ...s, nav, date } : s));
    setSelectedScheme((prev) => prev && prev.schemeCode === code ? { ...prev, nav, date } : prev);
    setWatchlistItems((prev) => prev.map((s) => s.schemeCode === code ? { ...s, nav, date } : s));
    setComparedSchemes((prev) => prev.map((s) => s.schemeCode === code ? { ...s, nav, date } : s));
  }, []);

  const handleAddPortfolioHolding = (holdingData: Omit<PortfolioHolding, 'id'>) => {
    const newHolding: PortfolioHolding = {
      ...holdingData,
      id: Date.now().toString(),
    };
    setPortfolio((prev) => [newHolding, ...prev]);
  };

  const handleRemovePortfolioHolding = (id: string) => {
    setPortfolio((prev) => prev.filter((h) => h.id !== id));
  };

  // Reset Filters
  const handleResetFilters = () => {
    setSelectedCategory('');
    setSelectedAmc('');
    setSelectedFundType('All');
    setDirectOnly(true);
    setPopularOnly(false);
    setSearchQuery('');
    setSortBy('default');
    scrollToTop();
  };

  // Watchlisted Schemes list (always preserves all pinned funds)
  const watchlistedSchemes = watchlistItems;

  return (
    <div className={`min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col items-center justify-start p-0 sm:p-4 lg:p-6 font-sans selection:bg-emerald-500 selection:text-slate-950 transition-colors ${
      isStandalone || isPhoneFrame ? 'pb-20 sm:pb-24' : 'pb-6 sm:pb-8'
    }`}>
      {/* Container Wrapper: Mobile Frame or Full Monitor Desktop Layout */}
      <div
        id="app-shell-container"
        className={`w-full transition-all duration-300 ${
          isPhoneFrame
            ? 'max-w-[430px] my-0 sm:my-4 rounded-[42px] border-[8px] border-slate-300 dark:border-slate-800 shadow-[0_0_50px_rgba(0,0,0,0.15)] dark:shadow-[0_0_50px_rgba(0,0,0,0.8)] overflow-hidden bg-white dark:bg-slate-950 ring-1 ring-slate-200 dark:ring-slate-700/50 flex flex-col h-[92vh] sm:h-[860px] relative'
            : 'max-w-[1700px] rounded-none sm:rounded-3xl border-0 sm:border border-slate-200 dark:border-slate-800/80 shadow-lg dark:shadow-2xl bg-white dark:bg-slate-950 relative'
        }`}
      >
        {/* Adaptive Header with Desktop Navigation & Mobile Status */}
        <AndroidHeader
          title={
            activeTab === 'explore'
              ? 'AMFI Mutual Funds'
              : activeTab === 'detail'
              ? 'Fund Deep Dive'
              : activeTab === 'compare'
              ? 'Fund Comparison'
              : activeTab === 'portfolio'
              ? 'My Portfolio'
              : 'Financial Tools'
          }
          subtitle="Real-time AMFI India NAV Engine"
          isPhoneFrame={isPhoneFrame}
          setIsPhoneFrame={setIsPhoneFrame}
          onRefresh={() => loadSchemes(true)}
          isRefreshing={isRefreshing}
          onInstallClick={() => setIsInstallModalOpen(true)}
          canInstall={true}
          activeTab={activeTab}
          setActiveTab={handleTabChange}
          portfolioCount={portfolio.length}
          compareCount={comparedSchemes.length}
          totalSchemes={totalSchemes}
          isStandalone={isStandalone}
          onSearchClick={() => {
            handleTabChange('explore');
            const searchInput = document.getElementById('main-search-input');
            if (searchInput) searchInput.focus();
          }}
        />

        {/* Live Indian Financial Market Ticker Banner */}
        <div id="amfi-live-ticker" className="bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800/80 px-4 sm:px-6 py-2 flex items-center justify-between text-[11px] overflow-x-auto no-scrollbar gap-4 text-slate-600 dark:text-slate-300 shrink-0">
          <div className="flex items-center gap-2 flex-shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="font-bold text-slate-800 dark:text-slate-200">AMFI INDIA LIVE FEED:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-mono font-bold">{totalSchemes.toLocaleString('en-IN')} Schemes Online</span>
          </div>

          <div className="flex items-center gap-5 flex-shrink-0 text-slate-500 dark:text-slate-400 font-mono text-[10px] sm:text-[11px]">
            <span>SOURCE: <strong className="text-emerald-600 dark:text-emerald-400">AMFI Official Direct</strong></span>
            <span>NIFTY 50: <strong className="text-emerald-600 dark:text-emerald-400">24,852.15 (+0.42%)</strong></span>
            <span>SENSEX: <strong className="text-emerald-600 dark:text-emerald-400">81,332.72 (+0.38%)</strong></span>
            <span>NIFTY MIDCAP 150: <strong className="text-emerald-600 dark:text-emerald-400">21,940.60 (+0.68%)</strong></span>
            <span>NIFTY SMALLCAP 250: <strong className="text-emerald-600 dark:text-emerald-400">18,320.10 (+0.81%)</strong></span>
          </div>
        </div>

        {/* Main Body Content Area */}
        <main 
          ref={mainScrollRef}
          className={`p-3 sm:p-6 pb-28 sm:pb-32 lg:pb-32 ${
            isPhoneFrame 
              ? 'flex-1 overflow-y-auto min-h-0 touch-scroll' 
              : 'min-h-[calc(100vh-140px)]'
          }`}
        >
          <AnimatePresence mode="wait">
            {/* 1. EXPLORE & DISCOVER TAB */}
            {activeTab === 'explore' && (
              <motion.div
                key="explore"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
                className="space-y-5"
              >
                {/* Desktop 2-Column or Mobile Layout */}
                <div className={`flex ${!isPhoneFrame ? 'flex-col lg:flex-row' : 'flex-col'} items-start gap-6`}>
                  {/* Desktop Left Filter Sidebar (Visible on desktop screens when not in phone frame) */}
                  {!isPhoneFrame && (
                    <div className="hidden lg:block">
                      <DesktopExploreSidebar
                        selectedCategory={selectedCategory}
                        setSelectedCategory={setSelectedCategory}
                        selectedAmc={selectedAmc}
                        setSelectedAmc={setSelectedAmc}
                        selectedFundType={selectedFundType}
                        setSelectedFundType={setSelectedFundType}
                        directOnly={directOnly}
                        setDirectOnly={setDirectOnly}
                        popularOnly={popularOnly}
                        setPopularOnly={setPopularOnly}
                        sortBy={sortBy}
                        setSortBy={setSortBy}
                        amcs={amcs}
                        categories={categories}
                        fundTypes={fundTypes}
                        totalCount={totalSchemes}
                        filteredCount={schemes.length}
                        onReset={handleResetFilters}
                      />
                    </div>
                  )}

                  {/* Main Content Area */}
                  <div className="flex-1 w-full space-y-4 min-w-0">
                    {/* Search Bar & Desktop Controls Bar */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                      {/* Search Bar */}
                      <div className="relative flex-1">
                        <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
                        <input
                          id="main-search-input"
                          type="text"
                          placeholder="Search 10,000+ funds by name, AMC (SBI, HDFC, Quant, Parag Parikh), code..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl pl-11 pr-10 py-3 text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-emerald-500 shadow-inner"
                        />
                        {searchQuery && (
                          <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3.5 top-3.5 p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      {/* View Mode Toggle (Grid vs High-Density Table on Desktop) */}
                      {!isPhoneFrame && (
                        <div className="hidden sm:flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 shrink-0">
                          <button
                            onClick={() => setViewMode('grid')}
                            className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                              viewMode === 'grid'
                                ? 'bg-emerald-500 text-slate-950 shadow-sm font-bold'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                            }`}
                            title="Card Grid View"
                          >
                            <LayoutGrid className="w-4 h-4" />
                            <span className="hidden md:inline">Cards</span>
                          </button>
                          <button
                            onClick={() => setViewMode('table')}
                            className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                              viewMode === 'table'
                                ? 'bg-emerald-500 text-slate-950 shadow-sm font-bold'
                                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                            }`}
                            title="High Density Table View"
                          >
                            <Table2 className="w-4 h-4" />
                            <span className="hidden md:inline">Matrix Table</span>
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Mobile Filter Drawer (Visible on Mobile / Phone Frame mode, hidden on Desktop sidebar mode) */}
                    {(isPhoneFrame || true) && (
                      <div className={!isPhoneFrame ? 'lg:hidden' : ''}>
                        <FilterDrawer
                          selectedCategory={selectedCategory}
                          setSelectedCategory={setSelectedCategory}
                          selectedAmc={selectedAmc}
                          setSelectedAmc={setSelectedAmc}
                          selectedFundType={selectedFundType}
                          setSelectedFundType={setSelectedFundType}
                          directOnly={directOnly}
                          setDirectOnly={setDirectOnly}
                          popularOnly={popularOnly}
                          setPopularOnly={setPopularOnly}
                          amcs={amcs}
                          categories={categories}
                          fundTypes={fundTypes}
                          onReset={handleResetFilters}
                        />
                      </div>
                    )}

                    {/* Active Filter Pills Bar */}
                    {(selectedCategory || selectedAmc || selectedFundType !== 'All' || !directOnly || popularOnly || searchQuery) && (
                      <div className="flex items-center gap-1.5 flex-wrap text-xs pt-1">
                        <span className="text-slate-500 dark:text-slate-400 text-[11px] font-semibold">Active:</span>
                        {searchQuery && (
                          <span className="px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 flex items-center gap-1">
                            "{searchQuery}"
                            <button onClick={() => setSearchQuery('')}><X className="w-3 h-3 text-slate-400 hover:text-slate-800 dark:hover:text-white" /></button>
                          </span>
                        )}
                        {selectedCategory && (
                          <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 flex items-center gap-1 font-medium">
                            {selectedCategory}
                            <button onClick={() => setSelectedCategory('')}><X className="w-3 h-3 text-emerald-600 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-white" /></button>
                          </span>
                        )}
                        {selectedAmc && (
                          <span className="px-2 py-0.5 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border border-indigo-500/30 flex items-center gap-1 font-medium">
                            {selectedAmc}
                            <button onClick={() => setSelectedAmc('')}><X className="w-3 h-3 text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-white" /></button>
                          </span>
                        )}
                        {selectedFundType !== 'All' && (
                          <span className="px-2 py-0.5 rounded-lg bg-purple-500/10 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30 flex items-center gap-1 font-medium">
                            {selectedFundType}
                            <button onClick={() => setSelectedFundType('All')}><X className="w-3 h-3 text-purple-600 dark:text-purple-400 hover:text-purple-900 dark:hover:text-white" /></button>
                          </span>
                        )}
                      </div>
                    )}

                    {/* Watchlist Quick Shelf if any */}
                    {watchlistedSchemes.length > 0 && (
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between px-1">
                          <h3 className="text-xs font-bold text-amber-500 dark:text-amber-400 flex items-center gap-1.5">
                            <Bookmark className="w-3.5 h-3.5 fill-amber-500 dark:fill-amber-400 text-amber-500 dark:text-amber-400" />
                            My Pinned Watchlist ({watchlistedSchemes.length})
                          </h3>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
                          {watchlistedSchemes.map((scheme) => (
                            <SchemeCard
                              key={`wl-${scheme.schemeCode}`}
                              scheme={scheme}
                              onSelect={handleSelectScheme}
                              onAddToCompare={handleToggleCompare}
                              isCompared={comparedSchemes.some((s) => s.schemeCode === scheme.schemeCode)}
                              onToggleWatchlist={handleToggleWatchlist}
                              isWatchlisted={true}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Results Count Header */}
                    <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 px-1 pt-2">
                      <span className="font-semibold text-slate-700 dark:text-slate-300">
                        {loading
                          ? 'Searching AMFI Registry...'
                          : selectedAmc
                          ? `Showing ${sortedSchemes.length} of ${totalSchemes} Schemes for ${selectedAmc}`
                          : `Showing ${sortedSchemes.length} of ${totalSchemes} Mutual Fund Schemes`}
                      </span>
                      {popularOnly && (
                        <span className="text-[11px] font-bold text-purple-600 dark:text-purple-400 flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5" /> Curated Top Performers
                        </span>
                      )}
                    </div>

                    {/* Loading Skeleton */}
                    {loading && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
                          <div key={n} className="bg-slate-100 dark:bg-slate-900/60 rounded-3xl p-4 border border-slate-200 dark:border-slate-800 animate-pulse space-y-3 h-40">
                            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
                            <div className="h-5 bg-slate-200 dark:bg-slate-800 rounded w-4/5"></div>
                            <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
                            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded mt-4"></div>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Schemes Display: Card Grid View or Desktop Data Matrix Table View */}
                    {!loading && sortedSchemes.length > 0 && (
                      <>
                        {viewMode === 'grid' || isPhoneFrame ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3.5">
                            {sortedSchemes.map((scheme) => (
                              <SchemeCard
                                key={scheme.schemeCode}
                                scheme={scheme}
                                onSelect={handleSelectScheme}
                                onAddToCompare={handleToggleCompare}
                                isCompared={comparedSchemes.some((s) => s.schemeCode === scheme.schemeCode)}
                                onToggleWatchlist={handleToggleWatchlist}
                                isWatchlisted={watchlistCodes.includes(scheme.schemeCode)}
                              />
                            ))}
                          </div>
                        ) : (
                          <SchemeTableView
                            schemes={sortedSchemes}
                            onSelect={handleSelectScheme}
                            onAddToCompare={handleToggleCompare}
                            comparedCodes={comparedSchemes.map((s) => s.schemeCode)}
                            onToggleWatchlist={handleToggleWatchlist}
                            watchlistCodes={watchlistCodes}
                          />
                        )}

                        {/* Load More Schemes Button */}
                        {sortedSchemes.length < totalSchemes && (
                          <div className="flex justify-center pt-3 pb-6">
                            <button
                              onClick={handleLoadMore}
                              className="px-6 py-3 rounded-2xl bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 text-emerald-600 dark:text-emerald-400 font-semibold text-xs transition-all shadow-md hover:border-emerald-500/50 flex items-center gap-2 cursor-pointer"
                            >
                              <span>Load More Schemes ({totalSchemes - sortedSchemes.length} remaining)</span>
                            </button>
                          </div>
                        )}
                      </>
                    )}

                    {/* Empty State */}
                    {!loading && sortedSchemes.length === 0 && (
                      <div className="bg-slate-50 dark:bg-slate-900 rounded-3xl p-10 border border-slate-200 dark:border-slate-800 text-center space-y-4 max-w-lg mx-auto">
                        <Compass className="w-12 h-12 text-slate-400 dark:text-slate-500 mx-auto" />
                        <h4 className="text-base font-bold text-slate-900 dark:text-white">No Matching Schemes Found</h4>
                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                          Try searching with different keywords, relaxing the AMC filter, or switching between Equity, Debt, and Hybrid categories.
                        </p>
                        <button
                          onClick={handleResetFilters}
                          className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md shadow-emerald-950/20 cursor-pointer"
                        >
                          Reset All Filters
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 2. DETAIL & ANALYZER TAB */}
            {activeTab === 'detail' && (
              <motion.div
                key="detail"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                {selectedScheme ? (
                  <SchemeDetailView
                    schemeSummary={selectedScheme}
                    onBack={() => handleTabChange('explore')}
                    onAddToCompare={handleToggleCompare}
                    isCompared={comparedSchemes.some((s) => s.schemeCode === selectedScheme.schemeCode)}
                    onToggleWatchlist={handleToggleWatchlist}
                    isWatchlisted={watchlistCodes.includes(selectedScheme.schemeCode)}
                    onOpenAddPortfolio={(s) => {
                      handleTabChange('portfolio');
                    }}
                    onUpdateSchemeNav={handleUpdateSchemeNav}
                  />
                ) : (
                  <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 border border-slate-200 dark:border-slate-800 text-center space-y-4 max-w-lg mx-auto shadow-sm">
                    <Activity className="w-12 h-12 text-emerald-500 dark:text-emerald-400 mx-auto" />
                    <h4 className="text-base font-bold text-slate-900 dark:text-white">Select a Mutual Fund Scheme</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Browse schemes in the Explore terminal or pick from your watchlist to analyze historical NAV charts, CAGR, Sharpe ratios, and SIP backtesting.
                    </p>
                    <button
                      onClick={() => handleTabChange('explore')}
                      className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs cursor-pointer shadow-lg shadow-emerald-950/20 transition-all active:scale-95"
                    >
                      Browse Schemes
                    </button>
                  </div>
                )}
              </motion.div>
            )}

            {/* 3. COMPARE TAB */}
            {activeTab === 'compare' && (
              <motion.div
                key="compare"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                <FundComparisonView
                  comparedFunds={comparedSchemes}
                  allSchemes={schemes}
                  onSelectScheme={handleSelectScheme}
                  onAddComparedScheme={handleToggleCompare}
                  onRemoveComparedScheme={handleRemoveCompared}
                  onSetComparedFunds={(funds) => setComparedSchemes(funds)}
                  onClearAll={() => setComparedSchemes([])}
                />
              </motion.div>
            )}

            {/* 4. PORTFOLIO TRACKER TAB */}
            {activeTab === 'portfolio' && (
              <motion.div
                key="portfolio"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                <PortfolioView
                  holdings={portfolio}
                  onAddHolding={handleAddPortfolioHolding}
                  onRemoveHolding={handleRemovePortfolioHolding}
                  allSchemes={schemes}
                  onSelectScheme={handleSelectScheme}
                />
              </motion.div>
            )}

            {/* 5. CALCULATORS TAB */}
            {activeTab === 'calculators' && (
              <motion.div
                key="calculators"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.18 }}
              >
                <CalculatorsView />
              </motion.div>
            )}
          </AnimatePresence>
        </main>

        {/* Persistent Android Material 3 Bottom Navigation Bar (Rendered ONLY in App / Phone Shell Mode) */}
        {(isStandalone || isPhoneFrame) && (
          <AndroidNavBar
            activeTab={activeTab}
            setActiveTab={handleTabChange}
            portfolioCount={portfolio.length}
            compareCount={comparedSchemes.length}
            isPhoneFrame={isPhoneFrame}
          />
        )}

        {/* PWA / Desktop / Android APK Installation Modal */}
        <InstallPwaModal
          isOpen={isInstallModalOpen}
          onClose={() => setIsInstallModalOpen(false)}
          deferredPrompt={deferredPrompt}
          onPromptInstall={handlePromptInstall}
        />
      </div>
    </div>
  );
}

