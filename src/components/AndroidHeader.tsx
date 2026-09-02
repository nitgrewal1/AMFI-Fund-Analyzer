import React, { useState, useEffect } from 'react';
import { 
  Wifi, 
  Battery, 
  Smartphone, 
  Monitor, 
  RefreshCw, 
  Search,
  Sparkles,
  TrendingUp,
  Download,
  Compass,
  LineChart,
  Layers,
  Briefcase,
  Calculator,
  Activity,
  Maximize2,
  ExternalLink
} from 'lucide-react';
import { ActiveTab } from '../types';
import { ThemeToggle } from '../context/ThemeContext';

interface AndroidHeaderProps {
  title?: string;
  subtitle?: string;
  isPhoneFrame: boolean;
  setIsPhoneFrame: (val: boolean) => void;
  onRefresh?: () => void;
  isRefreshing?: boolean;
  onSearchClick?: () => void;
  onInstallClick?: () => void;
  canInstall?: boolean;
  activeTab?: ActiveTab;
  setActiveTab?: (tab: ActiveTab) => void;
  portfolioCount?: number;
  compareCount?: number;
  totalSchemes?: number;
  isStandalone?: boolean;
}

export const AndroidHeader: React.FC<AndroidHeaderProps> = ({
  title = 'AMFI Mutual Funds',
  subtitle = 'Powered by TigZig API',
  isPhoneFrame,
  setIsPhoneFrame,
  onRefresh,
  isRefreshing = false,
  onSearchClick,
  onInstallClick,
  canInstall = true,
  activeTab = 'explore',
  setActiveTab,
  portfolioCount = 0,
  compareCount = 0,
  totalSchemes = 0,
  isStandalone = false
}) => {
  const [timeStr, setTimeStr] = useState<string>('09:41');

  useEffect(() => {
    const updateTime = () => {
      const d = new Date();
      const hours = d.getHours().toString().padStart(2, '0');
      const mins = d.getMinutes().toString().padStart(2, '0');
      setTimeStr(`${hours}:${mins}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  const navTabs: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'explore', label: 'Explore & Search', icon: <Compass className="w-4 h-4" /> },
    { id: 'detail', label: 'Fund Deep Dive', icon: <LineChart className="w-4 h-4" /> },
    { id: 'compare', label: 'Comparison Matrix', icon: <Layers className="w-4 h-4" />, badge: compareCount > 0 ? compareCount : undefined },
    { id: 'portfolio', label: 'Portfolio Tracker', icon: <Briefcase className="w-4 h-4" />, badge: portfolioCount > 0 ? portfolioCount : undefined },
    { id: 'calculators', label: 'Financial Tools', icon: <Calculator className="w-4 h-4" /> },
  ];

  return (
    <header id="android-header-container" className="w-full bg-white dark:bg-slate-900 text-slate-900 dark:text-white select-none sticky top-0 z-40 shadow-sm dark:shadow-xl border-b border-slate-200 dark:border-slate-800 transition-colors">
      {/* Mobile Only: Android Status Bar */}
      {isPhoneFrame && (
        <div id="android-status-bar" className="px-5 py-1.5 flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 border-b border-slate-200 dark:border-slate-800/60 bg-slate-100/90 dark:bg-slate-950/80 backdrop-blur">
          <div className="flex items-center gap-2">
            <span className="font-semibold tracking-wider text-emerald-600 dark:text-emerald-400">{timeStr}</span>
            <span className="inline-block px-1.5 py-0.2 text-[10px] font-medium bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 rounded-full border border-emerald-500/30">
              AMFI LIVE
            </span>
          </div>

          <div className="flex items-center gap-2.5 text-slate-600 dark:text-slate-300">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400">5G</span>
            <Wifi className="w-3.5 h-3.5" />
            <div className="flex items-center gap-1">
              <span className="text-[10px] font-medium">98%</span>
              <Battery className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 fill-emerald-600 dark:fill-emerald-400" />
            </div>
          </div>
        </div>
      )}

      {/* Main Header / Navigation Bar */}
      <div id="main-header-bar" className="px-3 sm:px-6 py-2.5 sm:py-3 flex items-center justify-between bg-white/95 dark:bg-slate-900/95 backdrop-blur gap-2 sm:gap-4 overflow-hidden">
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1 sm:flex-initial">
          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-md shadow-emerald-950/20 border border-emerald-400/30 shrink-0">
            <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="text-xs sm:text-base md:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight leading-none truncate">
                AMFI Mutual Funds
              </h1>
              <span className="hidden sm:inline-flex text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-bold uppercase tracking-wider shrink-0">
                Official Feed
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
              <span className="truncate">Live Daily NAV via <strong>AMFI India Direct</strong></span>
            </p>
          </div>
        </div>

        {/* Desktop Navigation Tabs (Hidden on mobile phone frame, visible on desktop) */}
        {!isPhoneFrame && setActiveTab && (
          <nav className="hidden lg:flex items-center gap-1 bg-slate-100 dark:bg-slate-950/70 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner">
            {navTabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all relative cursor-pointer ${
                    isActive
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/60'
                  }`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {tab.badge !== undefined && (
                    <span className={`px-1.5 py-0.2 text-[10px] font-bold rounded-full ${
                      isActive ? 'bg-slate-950 text-emerald-300' : 'bg-emerald-500 text-slate-950'
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        )}

        {/* Action Controls & Mode Switcher */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Theme Toggle Button (Light / Dark Switch) */}
          <ThemeToggle />

          {/* Quick Search trigger */}
          {onSearchClick && (
            <button
              id="btn-quick-search"
              onClick={onSearchClick}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5 border border-slate-200 dark:border-slate-700/60 text-xs cursor-pointer"
              title="Search Mutual Funds (Press / to search)"
            >
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
              <span className="hidden xl:inline text-slate-500 dark:text-slate-400">Search funds...</span>
            </button>
          )}

          {/* Refresh AMFI Data */}
          {onRefresh && (
            <button
              id="btn-refresh-amfi"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-50 transition-all border border-slate-200 dark:border-slate-700/60 flex items-center gap-1.5 text-xs cursor-pointer"
              title="Sync Latest AMFI Records"
            >
              <RefreshCw className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isRefreshing ? 'animate-spin text-emerald-500' : ''}`} />
              <span className="hidden sm:inline">Sync</span>
            </button>
          )}

          {/* Open in Standalone Tab */}
          <button
            id="btn-open-standalone-tab"
            onClick={() => window.open(window.location.href, '_blank', 'noopener,noreferrer')}
            className="p-2 sm:px-3 sm:py-2 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 transition-all border border-slate-200 dark:border-slate-700/60 flex items-center gap-1.5 text-xs cursor-pointer"
            title="Open in dedicated standalone browser tab"
          >
            <ExternalLink className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden lg:inline">Open Standalone</span>
          </button>

          {/* Install Web App / Android APK */}
          {onInstallClick && (
            <button
              id="btn-install-pwa"
              onClick={onInstallClick}
              className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-indigo-950/20 transition-all border border-violet-400/30 cursor-pointer"
              title="Install Desktop App / Android APK"
            >
              <Download className="w-3.5 h-3.5 text-violet-200" />
              <span className="hidden md:inline">Install App</span>
            </button>
          )}

          {/* Switch Phone Shell / Desktop Full Monitor Mode */}
          <button
            id="btn-toggle-view-mode"
            onClick={() => setIsPhoneFrame(!isPhoneFrame)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 dark:bg-emerald-600/20 hover:bg-emerald-500/20 dark:hover:bg-emerald-600/30 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all shadow-sm cursor-pointer"
            title={isPhoneFrame ? "Switch to Full Desktop Monitor Mode" : "Switch to Android Mobile Shell Preview"}
          >
            {isPhoneFrame ? (
              <>
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Monitor View</span>
              </>
            ) : (
              <>
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden lg:inline">Phone Frame</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Webpage Mode Top Navigation Bar for Mobile & Tablet (Only on Webpage, replaced bottom menu) */}
      {!isPhoneFrame && !isStandalone && setActiveTab && (
        <nav 
          id="webpage-top-nav-bar"
          aria-label="Webpage Navigation Tabs"
          className="lg:hidden flex items-center gap-1.5 px-3 py-2 bg-slate-50/95 dark:bg-slate-950/95 border-t border-slate-200 dark:border-slate-800/80 overflow-x-auto no-scrollbar scroll-smooth"
        >
          {navTabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`webpage-nav-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500 text-slate-950 shadow-sm font-bold'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className={`px-1.5 py-0.2 text-[9px] font-bold rounded-full ${
                    isActive ? 'bg-slate-950 text-emerald-300' : 'bg-emerald-500 text-slate-950'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      )}
    </header>
  );
};


