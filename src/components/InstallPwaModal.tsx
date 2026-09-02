import React, { useState } from 'react';
import { 
  Download, 
  Smartphone, 
  CheckCircle2, 
  Sparkles, 
  Layers, 
  X, 
  Share2, 
  ExternalLink,
  ShieldCheck,
  Zap,
  AlertTriangle,
  Copy,
  Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface InstallPwaModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
  onPromptInstall: () => void;
}

export const InstallPwaModal: React.FC<InstallPwaModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
  onPromptInstall
}) => {
  const [copied, setCopied] = useState(false);
  const isInsideIframe = typeof window !== 'undefined' && window.self !== window.top;

  if (!isOpen) return null;

  const handleOpenStandalone = () => {
    window.open(window.location.href, '_blank', 'noopener,noreferrer');
  };

  const handleCopyLink = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden text-slate-900 dark:text-slate-100 flex flex-col max-h-[92vh]"
        >
          {/* Modal Header */}
          <div className="px-5 py-4 bg-slate-50 dark:bg-gradient-to-r dark:from-slate-900 dark:via-indigo-950/40 dark:to-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-violet-600 to-indigo-500 flex items-center justify-center shadow-lg shadow-indigo-900/40 border border-violet-400/30 shrink-0">
                <Smartphone className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                  Install AMFI Mutual Funds
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/15 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-500/30">
                    Standalone App
                  </span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">AMFI Mutual Fund Analyzer & Tracker</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-5 overflow-y-auto space-y-4 text-sm no-scrollbar">
            {/* IFRAME NOTICE: Explaining why Google AI Studio gets installed instead */}
            {isInsideIframe && (
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-amber-800 dark:text-amber-300 text-xs sm:text-sm">
                      Why does Chrome install "Google AI Studio"?
                    </h4>
                    <p className="text-[11px] sm:text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed">
                      You are currently previewing inside Google AI Studio's workspace. If you use your browser's top menu right now, the browser tries to install the host platform (Google AI Studio) rather than this child app.
                    </p>
                  </div>
                </div>

                <div className="pt-2 border-t border-amber-500/20 flex flex-col sm:flex-row gap-2">
                  <button
                    onClick={handleOpenStandalone}
                    className="flex-1 py-2.5 px-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-950/50 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>Open in Dedicated Tab First</span>
                  </button>
                  <button
                    onClick={handleCopyLink}
                    className="py-2.5 px-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-xs border border-slate-300 dark:border-slate-700 flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />}
                    <span>{copied ? 'Link Copied!' : 'Copy Direct URL'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Direct 1-Click Install Button when prompt is available */}
            {deferredPrompt && (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-500/10 to-indigo-500/10 dark:from-violet-900/30 dark:to-indigo-900/20 border border-violet-500/30 dark:border-violet-500/40 text-center space-y-3">
                <div className="w-11 h-11 rounded-full bg-violet-600/15 dark:bg-violet-600/20 text-violet-600 dark:text-violet-400 flex items-center justify-center mx-auto border border-violet-500/30">
                  <Download className="w-5 h-5 animate-bounce" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">Instant 1-Click Install</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    Click below to trigger the Android native WebAPK installer directly.
                  </p>
                </div>
                <button
                  onClick={onPromptInstall}
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-violet-600 via-indigo-600 to-emerald-600 hover:from-violet-500 hover:to-emerald-500 text-white font-bold text-xs sm:text-sm shadow-lg shadow-indigo-950/40 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  Install App Now
                </button>
              </div>
            )}

            {/* Step-by-Step Android Installation */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                How to install on Android & Desktop (Chrome / Brave / Edge):
              </h4>

              <div className="space-y-2">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs">Open Dedicated URL in Browser</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Open this app's direct URL directly in mobile Chrome or Desktop browser (outside of AI Studio).
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <div className="font-semibold text-slate-800 dark:text-slate-200 text-xs">Tap Browser Menu (⋮) or Address Bar Icon</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      Tap the 3 dots in the top-right corner of Chrome on Android, or the Install icon in the Desktop address bar.
                    </div>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-500/30 dark:border-emerald-700/40 flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <div className="font-semibold text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-1.5">
                      Select "Install app" / "Add to Home screen"
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div className="text-[11px] text-slate-700 dark:text-slate-300 mt-0.5 leading-relaxed">
                      Android will package the standalone <strong>AMFI Mutual Funds</strong> app onto your home screen and app drawer with no browser URL bar and offline caching.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* App Features as Native */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80">
              <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Full Screen No URL Bar</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Offline Cached Shell</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Fast Mobile Gestures</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  <span>Real-time AMFI Daily NAV Sync</span>
                </div>
              </div>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="p-4 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={handleOpenStandalone}
              className="text-xs text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1.5 font-semibold cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              Launch in New Tab
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
            >
              Got it
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
