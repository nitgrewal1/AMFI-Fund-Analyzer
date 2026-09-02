import React from 'react';
import { 
  Compass, 
  LineChart, 
  Layers, 
  Briefcase, 
  Calculator 
} from 'lucide-react';
import { ActiveTab } from '../types';

interface AndroidNavBarProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  portfolioCount?: number;
  compareCount?: number;
  isPhoneFrame?: boolean;
}

export const AndroidNavBar: React.FC<AndroidNavBarProps> = ({
  activeTab,
  setActiveTab,
  portfolioCount = 0,
  compareCount = 0,
  isPhoneFrame = false,
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'explore',
      label: 'Explore',
      icon: <Compass className="w-5 h-5" />
    },
    {
      id: 'detail',
      label: 'Analyzer',
      icon: <LineChart className="w-5 h-5" />
    },
    {
      id: 'compare',
      label: 'Compare',
      icon: <Layers className="w-5 h-5" />,
      badge: compareCount > 0 ? compareCount : undefined
    },
    {
      id: 'portfolio',
      label: 'Portfolio',
      icon: <Briefcase className="w-5 h-5" />,
      badge: portfolioCount > 0 ? portfolioCount : undefined
    },
    {
      id: 'calculators',
      label: 'Calculators',
      icon: <Calculator className="w-5 h-5" />
    }
  ];

  const handleNavClick = (tabId: ActiveTab) => {
    setActiveTab(tabId);
    // Instant scroll to top on tap
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      if (document.documentElement) document.documentElement.scrollTop = 0;
      if (document.body) document.body.scrollTop = 0;
    }
  };

  return (
    <nav 
      id="android-bottom-nav-container" 
      aria-label="Bottom Navigation Menu"
      className={`w-full select-none pt-1.5 pb-[max(0.6rem,env(safe-area-inset-bottom))] z-50 bg-white/95 dark:bg-slate-900/95 border-t border-slate-200 dark:border-slate-800/90 shadow-[0_-8px_30px_rgba(0,0,0,0.1)] dark:shadow-[0_-8px_30px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-colors ${
        isPhoneFrame 
          ? 'sticky bottom-0 shrink-0' 
          : 'fixed bottom-0 left-0 right-0'
      }`}
    >
      <div className="flex items-center justify-around w-full max-w-xl mx-auto px-2 sm:px-4">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              id={`nav-tab-${item.id}`}
              onClick={() => handleNavClick(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-1.5 sm:px-3 rounded-2xl transition-all relative cursor-pointer min-w-[58px] sm:min-w-[70px] ${
                isActive 
                  ? 'text-emerald-600 dark:text-emerald-400 font-bold' 
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 active:scale-95'
              }`}
            >
              {/* Material 3 Active Indicator Pill */}
              <div 
                className={`relative flex items-center justify-center px-3 sm:px-5 py-1 rounded-full transition-all duration-200 ${
                  isActive ? 'bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 shadow-sm' : ''
                }`}
              >
                {item.icon}

                {/* Badge if any */}
                {item.badge !== undefined && (
                  <span className="absolute -top-1 -right-1 bg-emerald-500 text-slate-950 text-[10px] font-extrabold w-4 h-4 rounded-full flex items-center justify-center shadow-md animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>

              <span className={`text-[10px] sm:text-[11px] mt-0.5 tracking-tight transition-all whitespace-nowrap ${isActive ? 'font-bold text-emerald-700 dark:text-emerald-300' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Android System Gesture Home Bar Indicator */}
      <div className="w-24 sm:w-28 h-1 bg-slate-300 dark:bg-slate-700/70 rounded-full mx-auto mt-1 opacity-70"></div>
    </nav>
  );
};
