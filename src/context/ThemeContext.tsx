import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Sun, Moon } from 'lucide-react';

export type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const savedTheme = localStorage.getItem('amfi_theme');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        return savedTheme;
      }
      // Check system preference
      if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
        return 'light';
      }
    } catch {}
    return 'dark'; // default to dark
  });

  const applyTheme = useCallback((t: Theme) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.classList.remove('light', 'dark');
    root.classList.add(t);
    root.setAttribute('data-theme', t);
    root.style.colorScheme = t;
    
    // Update theme-color meta tag for mobile browsers and PWA status bar
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', t === 'dark' ? '#020617' : '#ffffff');
    }
    
    try {
      localStorage.setItem('amfi_theme', t);
    } catch {}
  }, []);

  useEffect(() => {
    applyTheme(theme);
  }, [theme, applyTheme]);

  const toggleTheme = useCallback(() => {
    setThemeState((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const setTheme = useCallback((t: Theme) => {
    setThemeState(t);
  }, []);

  const isDark = theme === 'dark';

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

/**
 * Reusable Theme Toggle Switch component
 */
export const ThemeToggle: React.FC<{
  className?: string;
  variant?: 'button' | 'switch' | 'compact' | 'pill';
  showLabel?: boolean;
}> = ({ className = '', variant = 'pill', showLabel = true }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  if (variant === 'switch') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {showLabel && (
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 select-none">
            {isDark ? 'Dark' : 'Light'}
          </span>
        )}
        <button
          id="theme-toggle-switch"
          type="button"
          role="switch"
          aria-checked={!isDark}
          aria-label={isDark ? 'Switch to Light theme' : 'Switch to Dark theme'}
          onClick={toggleTheme}
          className={`relative inline-flex h-7 w-13 shrink-0 items-center rounded-full p-0.5 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-1 cursor-pointer border ${
            isDark
              ? 'bg-slate-800 border-slate-700'
              : 'bg-amber-400 border-amber-300'
          }`}
          title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
        >
          <span
            className={`pointer-events-none inline-flex h-5.5 w-5.5 transform items-center justify-center rounded-full bg-white shadow-md transition-transform duration-200 ease-in-out ${
              isDark ? 'translate-x-0.5 text-slate-800' : 'translate-x-6.5 text-amber-500'
            }`}
          >
            {isDark ? <Moon className="w-3 h-3 text-slate-800" /> : <Sun className="w-3 h-3 text-amber-500" />}
          </span>
        </button>
      </div>
    );
  }

  if (variant === 'compact') {
    return (
      <button
        id="theme-toggle-compact"
        type="button"
        aria-label={isDark ? 'Switch to Light theme' : 'Switch to Dark theme'}
        onClick={toggleTheme}
        className={`p-2 rounded-xl border transition-all cursor-pointer shadow-sm ${
          isDark
            ? 'bg-slate-800/90 hover:bg-slate-700 text-amber-400 border-slate-700/80 hover:border-amber-400/50'
            : 'bg-amber-50 hover:bg-amber-100/90 text-amber-900 border-amber-200/90 hover:border-amber-300'
        } ${className}`}
        title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        {isDark ? (
          <Sun className="w-4 h-4 text-amber-400" />
        ) : (
          <Moon className="w-4 h-4 text-indigo-600" />
        )}
      </button>
    );
  }

  // Default 'pill' variant: A prominent, unmistakable dual-state theme toggle switch
  return (
    <button
      id="theme-toggle-btn"
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-label={isDark ? 'Switch to Light theme' : 'Switch to Dark theme'}
      onClick={toggleTheme}
      className={`group relative inline-flex items-center gap-1.5 p-1 sm:p-1.5 rounded-2xl border transition-all cursor-pointer shadow-sm active:scale-95 select-none ${
        isDark
          ? 'bg-slate-800/95 hover:bg-slate-750 text-slate-200 border-slate-700/80 hover:border-amber-400/40'
          : 'bg-amber-50/90 hover:bg-amber-100 text-amber-900 border-amber-200/80 hover:border-amber-300'
      } ${className}`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      {/* Visual Slider Track */}
      <div className={`flex items-center rounded-xl p-0.5 gap-1 transition-colors ${
        isDark ? 'bg-slate-900/90' : 'bg-amber-200/50'
      }`}>
        <div className={`p-1 rounded-lg transition-all duration-200 flex items-center gap-1 ${
          !isDark ? 'bg-white text-amber-600 shadow-sm font-bold' : 'text-slate-500 hover:text-slate-400'
        }`}>
          <Sun className="w-3.5 h-3.5" />
          <span className="text-[10px] hidden sm:inline leading-none font-bold">Light</span>
        </div>
        <div className={`p-1 rounded-lg transition-all duration-200 flex items-center gap-1 ${
          isDark ? 'bg-slate-800 text-amber-300 shadow-sm font-bold' : 'text-amber-800/60 hover:text-amber-900'
        }`}>
          <Moon className="w-3.5 h-3.5" />
          <span className="text-[10px] hidden sm:inline leading-none font-bold">Dark</span>
        </div>
      </div>
    </button>
  );
};
