import React, { useState, useMemo } from 'react';
import { 
  Calculator, 
  TrendingUp, 
  Coins, 
  Receipt, 
  HelpCircle, 
  ArrowRight,
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

export const CalculatorsView: React.FC = () => {
  const [calcTab, setCalcTab] = useState<'sip' | 'stepup' | 'swp' | 'tax'>('sip');

  // SIP Calculator State
  const [sipMonthly, setSipMonthly] = useState<number>(10000);
  const [sipYears, setSipYears] = useState<number>(10);
  const [sipRate, setSipRate] = useState<number>(13);

  // Step-Up SIP State
  const [stepUpBase, setStepUpBase] = useState<number>(10000);
  const [stepUpPct, setStepUpPct] = useState<number>(10);
  const [stepUpYears, setStepUpYears] = useState<number>(10);
  const [stepUpRate, setStepUpRate] = useState<number>(13);

  // SWP State
  const [swpInitial, setSwpInitial] = useState<number>(5000000);
  const [swpMonthly, setSwpMonthly] = useState<number>(35000);
  const [swpYears, setSwpYears] = useState<number>(15);
  const [swpRate, setSwpRate] = useState<number>(9);

  // Tax Calculator State
  const [taxFundType, setTaxFundType] = useState<'Equity' | 'Debt'>('Equity');
  const [taxHoldingPeriodMonths, setTaxHoldingPeriodMonths] = useState<number>(24);
  const [taxCapitalGain, setTaxCapitalGain] = useState<number>(250000);
  const [taxIncomeSlab, setTaxIncomeSlab] = useState<number>(30); // 30% slab

  // Standard SIP Results & Timeline
  const sipResult = useMemo(() => {
    const months = sipYears * 12;
    const monthlyRate = sipRate / 100 / 12;
    let totalInvested = sipMonthly * months;
    let maturityValue = 0;

    const timeline: { year: number; invested: number; value: number }[] = [];
    let curVal = 0;
    let curInv = 0;

    for (let m = 1; m <= months; m++) {
      curInv += sipMonthly;
      curVal = (curVal + sipMonthly) * (1 + monthlyRate);

      if (m % 12 === 0) {
        timeline.push({
          year: m / 12,
          invested: Math.round(curInv),
          value: Math.round(curVal)
        });
      }
    }

    maturityValue = Math.round(curVal);
    const wealthGain = maturityValue - totalInvested;

    return { totalInvested, maturityValue, wealthGain, timeline };
  }, [sipMonthly, sipYears, sipRate]);

  // Step-Up SIP Results
  const stepUpResult = useMemo(() => {
    let curMonthly = stepUpBase;
    let totalInvested = 0;
    let curVal = 0;
    const monthlyRate = stepUpRate / 100 / 12;
    const timeline: { year: number; invested: number; value: number }[] = [];

    for (let yr = 1; yr <= stepUpYears; yr++) {
      for (let m = 1; m <= 12; m++) {
        totalInvested += curMonthly;
        curVal = (curVal + curMonthly) * (1 + monthlyRate);
      }
      timeline.push({
        year: yr,
        invested: Math.round(totalInvested),
        value: Math.round(curVal)
      });
      curMonthly = Math.round(curMonthly * (1 + stepUpPct / 100));
    }

    return {
      totalInvested: Math.round(totalInvested),
      maturityValue: Math.round(curVal),
      wealthGain: Math.round(curVal - totalInvested),
      timeline
    };
  }, [stepUpBase, stepUpPct, stepUpYears, stepUpRate]);

  // Tax Calculation (Budget 2024-2026 update)
  const taxResult = useMemo(() => {
    let taxableAmount = 0;
    let taxPayable = 0;
    let taxRateStr = '';
    let categoryClassification = '';

    if (taxFundType === 'Equity') {
      // Equity holding > 12 months is LTCG
      const isLTCG = taxHoldingPeriodMonths >= 12;
      if (isLTCG) {
        categoryClassification = 'Long Term Capital Gain (LTCG > 12M)';
        // Section 112A: ₹1.25 Lakh exemption, 12.5% tax above exemption
        const exemption = 125000;
        taxableAmount = Math.max(0, taxCapitalGain - exemption);
        taxPayable = Math.round(taxableAmount * 0.125);
        taxRateStr = '12.5% (Exemption: ₹1.25L)';
      } else {
        categoryClassification = 'Short Term Capital Gain (STCG < 12M)';
        taxableAmount = taxCapitalGain;
        taxPayable = Math.round(taxableAmount * 0.20);
        taxRateStr = '20% Flat (Budget 2024 revised)';
      }
    } else {
      categoryClassification = 'Debt Mutual Fund (Taxed at Slab)';
      taxableAmount = taxCapitalGain;
      taxPayable = Math.round(taxableAmount * (taxIncomeSlab / 100));
      taxRateStr = `${taxIncomeSlab}% (Income Slab Rate)`;
    }

    return {
      categoryClassification,
      taxableAmount,
      taxPayable,
      taxRateStr,
      postTaxGain: Math.round(taxCapitalGain - taxPayable)
    };
  }, [taxFundType, taxHoldingPeriodMonths, taxCapitalGain, taxIncomeSlab]);

  return (
    <div id="calculators-view-container" className="space-y-4 pb-28 sm:pb-28 lg:pb-12">
      {/* Top Header */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-xl space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-teal-500/15 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-teal-500/30 shrink-0">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">Mutual Fund Calculators</h2>
            <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">SIP compounding, Step-Up simulation & Budget tax rules</p>
          </div>
        </div>

        {/* Calculator Tab Switcher */}
        <div className="grid grid-cols-4 gap-1 bg-slate-100 dark:bg-slate-950 p-1 rounded-2xl border border-slate-200 dark:border-slate-800 text-[11px] sm:text-xs">
          <button
            onClick={() => setCalcTab('sip')}
            className={`py-2 rounded-xl font-bold transition-all cursor-pointer ${
              calcTab === 'sip' ? 'bg-emerald-600 text-white shadow' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            SIP
          </button>
          <button
            onClick={() => setCalcTab('stepup')}
            className={`py-2 rounded-xl font-bold transition-all cursor-pointer ${
              calcTab === 'stepup' ? 'bg-purple-600 text-white shadow' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Step-Up
          </button>
          <button
            onClick={() => setCalcTab('swp')}
            className={`py-2 rounded-xl font-bold transition-all cursor-pointer ${
              calcTab === 'swp' ? 'bg-teal-600 text-white shadow' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            SWP
          </button>
          <button
            onClick={() => setCalcTab('tax')}
            className={`py-2 rounded-xl font-bold transition-all cursor-pointer ${
              calcTab === 'tax' ? 'bg-amber-600 text-white shadow' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Tax Calc
          </button>
        </div>
      </div>

      {/* 1. Standard SIP Calculator */}
      {calcTab === 'sip' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">SIP Compounding Growth</h3>

            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between text-slate-700 dark:text-slate-300 font-medium mb-1">
                  <span>Monthly Investment</span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold">₹{sipMonthly.toLocaleString('en-IN')}</span>
                </div>
                <input
                  type="range"
                  min={1000}
                  max={100000}
                  step={1000}
                  value={sipMonthly}
                  onChange={(e) => setSipMonthly(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-700 dark:text-slate-300 font-medium mb-1">
                  <span>Expected Return (p.a)</span>
                  <span className="text-teal-600 dark:text-teal-400 font-bold">{sipRate}%</span>
                </div>
                <input
                  type="range"
                  min={5}
                  max={25}
                  step={0.5}
                  value={sipRate}
                  onChange={(e) => setSipRate(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-slate-700 dark:text-slate-300 font-medium mb-1">
                  <span>Investment Period</span>
                  <span className="text-purple-600 dark:text-purple-400 font-bold">{sipYears} Years</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={35}
                  step={1}
                  value={sipYears}
                  onChange={(e) => setSipYears(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
              </div>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-950/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Total Invested</span>
                <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                  ₹{sipResult.totalInvested.toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Wealth Gained</span>
                <span className="text-xs sm:text-sm font-bold text-teal-600 dark:text-teal-400">
                  +₹{sipResult.wealthGain.toLocaleString('en-IN')}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Maturity Value</span>
                <span className="text-xs sm:text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                  ₹{sipResult.maturityValue.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Chart */}
            <div className="h-56 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sipResult.timeline} margin={{ top: 12, right: 10, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="sipValGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0.02} />
                    </linearGradient>
                    <linearGradient id="sipInvGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.25} vertical={false} />
                  <XAxis dataKey="year" stroke="#94a3b8" fontSize={10} tickLine={false} tickFormatter={(y) => `Yr ${y}`} />
                  <YAxis
                    stroke="#94a3b8"
                    fontSize={10}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(val) => {
                      if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
                      return `₹${Math.round(val / 100000)}L`;
                    }}
                  />
                  <Tooltip
                    cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '3 3' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const pt = payload[0].payload;
                        return (
                          <div className="bg-white/95 dark:bg-slate-950/95 border border-slate-200 dark:border-slate-700/80 p-3 rounded-2xl shadow-xl text-xs min-w-[170px]">
                            <span className="text-slate-500 dark:text-slate-400 font-medium block mb-1.5 pb-1 border-b border-slate-100 dark:border-slate-800">
                              End of Year {pt.year}
                            </span>
                            <div className="flex justify-between text-slate-700 dark:text-slate-300 text-[11px] mb-1">
                              <span className="text-slate-500 dark:text-slate-400">Total Invested:</span>
                              <span className="font-mono font-semibold">₹{pt.invested.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold text-xs">
                              <span>Future Valuation:</span>
                              <span className="font-mono">₹{pt.value.toLocaleString('en-IN')}</span>
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="linear"
                    dataKey="value"
                    stroke="#10b981"
                    strokeWidth={2.2}
                    fill="url(#sipValGradient)"
                    name="Valuation"
                  />
                  <Area
                    type="linear"
                    dataKey="invested"
                    stroke="#6366f1"
                    strokeWidth={1.8}
                    strokeDasharray="4 4"
                    fill="url(#sipInvGradient)"
                    name="Invested"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* 2. Step-Up SIP Calculator */}
      {calcTab === 'stepup' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Step-Up SIP Accelerator</h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-500/30 font-medium">
              +{stepUpPct}% Yearly
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300 font-medium mb-1">
                <span>Initial Monthly SIP</span>
                <span className="text-purple-600 dark:text-purple-400 font-bold">₹{stepUpBase.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min={1000}
                max={50000}
                step={1000}
                value={stepUpBase}
                onChange={(e) => setStepUpBase(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-purple-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300 font-medium mb-1">
                <span>Annual Step-Up (%)</span>
                <span className="text-amber-600 dark:text-amber-400 font-bold">+{stepUpPct}% each year</span>
              </div>
              <input
                type="range"
                min={5}
                max={25}
                step={5}
                value={stepUpPct}
                onChange={(e) => setStepUpPct(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300 font-medium mb-1">
                <span>Time Period</span>
                <span className="text-teal-600 dark:text-teal-400 font-bold">{stepUpYears} Years</span>
              </div>
              <input
                type="range"
                min={1}
                max={25}
                step={1}
                value={stepUpYears}
                onChange={(e) => setStepUpYears(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-950/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Total Invested</span>
              <span className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                ₹{stepUpResult.totalInvested.toLocaleString('en-IN')}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Gains Generated</span>
              <span className="text-xs sm:text-sm font-bold text-purple-600 dark:text-purple-400">
                +₹{stepUpResult.wealthGain.toLocaleString('en-IN')}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Maturity Corpus</span>
              <span className="text-xs sm:text-sm font-extrabold text-emerald-600 dark:text-emerald-400">
                ₹{stepUpResult.maturityValue.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3. SWP Calculator */}
      {calcTab === 'swp' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Systematic Withdrawal Plan (SWP)</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Simulate monthly pension cashflows from corpus</p>

          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300 font-medium mb-1">
                <span>Initial Lumpsum Corpus</span>
                <span className="text-teal-600 dark:text-teal-400 font-bold">₹{swpInitial.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min={500000}
                max={20000000}
                step={500000}
                value={swpInitial}
                onChange={(e) => setSwpInitial(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300 font-medium mb-1">
                <span>Monthly Withdrawal</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">₹{swpMonthly.toLocaleString('en-IN')} / month</span>
              </div>
              <input
                type="range"
                min={5000}
                max={150000}
                step={2500}
                value={swpMonthly}
                onChange={(e) => setSwpMonthly(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 bg-slate-50 dark:bg-slate-950/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Total Withdrawn ({swpYears} Yrs)</span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                ₹{(swpMonthly * swpYears * 12).toLocaleString('en-IN')}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block">Approx. Residual Corpus</span>
              <span className="text-sm font-bold text-teal-600 dark:text-teal-300">
                ₹{Math.max(0, Math.round(swpInitial * 1.3 - (swpMonthly * swpYears * 8))).toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 4. Tax Calculator */}
      {calcTab === 'tax' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-md dark:shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Mutual Fund Tax Calculator</h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/15 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30 font-medium">
              Budget 2024-2026 Rules
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Fund Type Switch */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setTaxFundType('Equity')}
                className={`py-2 rounded-xl font-bold transition-all cursor-pointer ${
                  taxFundType === 'Equity'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                }`}
              >
                Equity Mutual Funds
              </button>
              <button
                onClick={() => setTaxFundType('Debt')}
                className={`py-2 rounded-xl font-bold transition-all cursor-pointer ${
                  taxFundType === 'Debt'
                    ? 'bg-blue-600 text-white shadow'
                    : 'bg-slate-100 dark:bg-slate-950 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-800'
                }`}
              >
                Debt Mutual Funds
              </button>
            </div>

            {/* Holding Period */}
            <div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300 font-medium mb-1">
                <span>Holding Period</span>
                <span className="text-amber-600 dark:text-amber-400 font-bold">{taxHoldingPeriodMonths} Months</span>
              </div>
              <input
                type="range"
                min={1}
                max={60}
                step={1}
                value={taxHoldingPeriodMonths}
                onChange={(e) => setTaxHoldingPeriodMonths(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
              />
            </div>

            {/* Total Capital Gain */}
            <div>
              <div className="flex justify-between text-slate-700 dark:text-slate-300 font-medium mb-1">
                <span>Total Net Profit / Gain (₹)</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">₹{taxCapitalGain.toLocaleString('en-IN')}</span>
              </div>
              <input
                type="range"
                min={10000}
                max={2000000}
                step={10000}
                value={taxCapitalGain}
                onChange={(e) => setTaxCapitalGain(Number(e.target.value))}
                className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>
          </div>

          {/* Tax Computation Breakdown */}
          <div className="bg-slate-50 dark:bg-slate-950/90 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 space-y-2.5 text-xs">
            <div className="flex justify-between text-slate-700 dark:text-slate-300">
              <span className="text-slate-500 dark:text-slate-400">Classification:</span>
              <span className="font-semibold text-slate-900 dark:text-white">{taxResult.categoryClassification}</span>
            </div>
            <div className="flex justify-between text-slate-700 dark:text-slate-300">
              <span className="text-slate-500 dark:text-slate-400">Applicable Tax Rate:</span>
              <span className="font-semibold text-amber-600 dark:text-amber-400">{taxResult.taxRateStr}</span>
            </div>
            <div className="flex justify-between text-slate-700 dark:text-slate-300">
              <span className="text-slate-500 dark:text-slate-400">Taxable Gain:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">₹{taxResult.taxableAmount.toLocaleString('en-IN')}</span>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-baseline">
              <span className="font-bold text-rose-600 dark:text-rose-400">Tax Payable:</span>
              <span className="text-base font-extrabold text-rose-600 dark:text-rose-400">
                ₹{taxResult.taxPayable.toLocaleString('en-IN')}
              </span>
            </div>

            <div className="flex justify-between items-baseline">
              <span className="font-bold text-emerald-600 dark:text-emerald-400">Post-Tax Profit:</span>
              <span className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
                ₹{taxResult.postTaxGain.toLocaleString('en-IN')}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
