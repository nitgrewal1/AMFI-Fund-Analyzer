import React, { useState } from 'react';
import { AiFundAnalysis, FundMetrics } from '../types';
import { generateAiFundAnalysis } from '../services/api';
import { 
  Sparkles, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  HelpCircle,
  FileText,
  TrendingUp,
  Scale,
  RefreshCw,
  Zap,
  Info
} from 'lucide-react';

interface AiAnalysisModalProps {
  schemeMeta: any;
  metrics: FundMetrics;
  onClose?: () => void;
}

export const AiAnalysisModal: React.FC<AiAnalysisModalProps> = ({
  schemeMeta,
  metrics,
  onClose
}) => {
  const [analysis, setAnalysis] = useState<AiFundAnalysis | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [riskAppetite, setRiskAppetite] = useState<string>('Moderate to High');
  const [horizon, setHorizon] = useState<string>('5+ Years');
  const [error, setError] = useState<string | null>(null);

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await generateAiFundAnalysis({
        schemeMeta,
        metrics,
        userRiskTolerance: riskAppetite,
        investmentHorizon: horizon
      });
      setAnalysis(res);
    } catch (err: any) {
      setError(err.message || 'Could not complete AI analysis');
    } finally {
      setLoading(false);
    }
  };

  const getVerdictBadge = (verdict: string) => {
    switch (verdict) {
      case 'STRONG_BUY':
        return {
          bg: 'bg-emerald-500/10 dark:bg-emerald-500/20 border-emerald-500/30 dark:border-emerald-500/40 text-emerald-700 dark:text-emerald-400',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
          label: 'Strong Buy'
        };
      case 'BUY':
        return {
          bg: 'bg-teal-500/10 dark:bg-teal-500/20 border-teal-500/30 dark:border-teal-500/40 text-teal-700 dark:text-teal-300',
          icon: <CheckCircle2 className="w-5 h-5 text-teal-600 dark:text-teal-300" />,
          label: 'Buy / Accumulate'
        };
      case 'HOLD':
        return {
          bg: 'bg-amber-500/10 dark:bg-amber-500/20 border-amber-500/30 dark:border-amber-500/40 text-amber-700 dark:text-amber-300',
          icon: <HelpCircle className="w-5 h-5 text-amber-600 dark:text-amber-300" />,
          label: 'Hold & Monitor'
        };
      default:
        return {
          bg: 'bg-rose-500/10 dark:bg-rose-500/20 border-rose-500/30 dark:border-rose-500/40 text-rose-700 dark:text-rose-400',
          icon: <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />,
          label: 'Exercise Caution'
        };
    }
  };

  return (
    <div id="ai-analysis-card" className="w-full bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-xl space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-purple-950/40">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
              Gemini AI Fund Research
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-purple-500/15 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30 font-medium">
                Gemini 3.7 Flash
              </span>
            </h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Institutional-grade risk & suitability audit</p>
          </div>
        </div>

        {analysis && (
          <button
            onClick={runAnalysis}
            disabled={loading}
            className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors cursor-pointer"
            title="Re-run AI Analysis"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-purple-600 dark:text-purple-400' : ''}`} />
          </button>
        )}
      </div>

      {!analysis && !loading && (
        <div className="bg-slate-50 dark:bg-slate-950/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 space-y-3">
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            Generate an AI audit of <strong className="text-slate-900 dark:text-white">{schemeMeta.scheme_name}</strong> evaluating its Sharpe ratio ({metrics.sharpeRatio}), 3Y CAGR ({metrics.cagr3Y}%), max drawdown ({metrics.maxDrawdown}%), and volatility against your risk tolerance.
          </p>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>
              <label className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">Your Risk Appetite</label>
              <select
                value={riskAppetite}
                onChange={(e) => setRiskAppetite(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:border-purple-500 shadow-sm"
              >
                <option>Conservative (Capital Preservation)</option>
                <option>Moderate to High (Growth)</option>
                <option>Aggressive (Max Long-Term Wealth)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] text-slate-500 dark:text-slate-400 block mb-1">Horizon</label>
              <select
                value={horizon}
                onChange={(e) => setHorizon(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-slate-800 dark:text-slate-200 text-xs focus:outline-none focus:border-purple-500 shadow-sm"
              >
                <option>1 - 3 Years</option>
                <option>3 - 5 Years</option>
                <option>5+ Years</option>
                <option>10+ Years (Retirement)</option>
              </select>
            </div>
          </div>

          <button
            onClick={runAnalysis}
            className="w-full py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-purple-900/30 transition-all cursor-pointer"
          >
            <Zap className="w-4 h-4" />
            Analyze with Gemini AI
          </button>
        </div>
      )}

      {loading && (
        <div className="py-8 flex flex-col items-center justify-center space-y-3 bg-slate-50 dark:bg-slate-950/40 rounded-2xl border border-slate-200 dark:border-slate-800/80">
          <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs text-purple-700 dark:text-purple-300 font-medium animate-pulse">
            Analyzing AMFI historical NAV patterns & risk ratios...
          </span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {analysis && !loading && (
        <div className="space-y-3.5 pt-1">
          {/* Verdict Banner */}
          {(() => {
            const vInfo = getVerdictBadge(analysis.verdict);
            return (
              <div className={`flex items-center justify-between p-3.5 rounded-2xl border ${vInfo.bg}`}>
                <div className="flex items-center gap-2.5">
                  {vInfo.icon}
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Analyst Rating</span>
                    <span className="text-sm font-bold">{vInfo.label}</span>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold px-2 py-1 bg-white dark:bg-slate-900/60 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
                  {analysis.verdict}
                </span>
              </div>
            );
          })()}

          {/* Summary */}
          <div className="bg-slate-50 dark:bg-slate-950/60 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            <p className="font-medium text-slate-900 dark:text-slate-200">{analysis.summary}</p>
          </div>

          {/* Strengths & Risks Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Key Strengths */}
            <div className="bg-emerald-500/10 dark:bg-emerald-950/20 border border-emerald-500/20 p-3 rounded-2xl">
              <h4 className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5 mb-2">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Key Fund Strengths
              </h4>
              <ul className="space-y-1.5 text-[11px] text-slate-700 dark:text-slate-300">
                {analysis.keyStrengths.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Risk Factors */}
            <div className="bg-amber-500/10 dark:bg-amber-950/20 border border-amber-500/20 p-3 rounded-2xl">
              <h4 className="text-xs font-bold text-amber-700 dark:text-amber-400 flex items-center gap-1.5 mb-2">
                <AlertTriangle className="w-3.5 h-3.5" />
                Risk Considerations
              </h4>
              <ul className="space-y-1.5 text-[11px] text-slate-700 dark:text-slate-300">
                {analysis.riskFactors.map((r, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-amber-600 dark:text-amber-400 font-bold">•</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Suitability & SIP Strategy */}
          <div className="bg-slate-50 dark:bg-slate-950/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
            <div>
              <span className="text-[11px] font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1">
                <Scale className="w-3.5 h-3.5" />
                Investor Suitability
              </span>
              <p className="text-[11px] text-slate-700 dark:text-slate-300 mt-0.5">{analysis.suitability}</p>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80">
              <span className="text-[11px] font-bold text-teal-700 dark:text-teal-300 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                Recommended SIP Blueprint
              </span>
              <p className="text-[11px] text-slate-700 dark:text-slate-300 mt-0.5">{analysis.sipStrategyRecommendation}</p>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80">
              <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" />
                Taxation Rules (Finance Act)
              </span>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 font-mono">{analysis.taxationRules}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
