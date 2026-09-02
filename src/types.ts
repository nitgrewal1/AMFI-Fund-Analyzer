export interface AmfiSchemeSummary {
  schemeCode: number;
  schemeName: string;
  isinGrowth: string;
  isinDiv: string;
  nav: number;
  date: string;
  amc: string;
  category: string;
  fundType: 'Equity' | 'Debt' | 'Hybrid' | 'Index / ETF' | 'Solution Oriented' | 'Other';
}

export type AmfiScheme = AmfiSchemeSummary;

export interface NavDataPoint {
  date: string;
  nav: number;
}

export interface FundMetrics {
  latestNav: number;
  latestDate: string;
  return1M: number;
  return3M: number;
  return6M: number;
  return1Y: number;
  cagr3Y: number;
  cagr5Y: number;
  cagr10Y?: number | null;
  cagr15Y?: number | null;
  cagr20Y?: number | null;
  cagrInception: number;
  volatilityStdDev: number;
  sharpeRatio: number;
  sortinoRatio: number;
  maxDrawdown: number;
  high52W: number;
  low52W: number;
  totalHistoryYears: number;
  dataPointsCount: number;
}

export interface SchemeDetailResponse {
  meta: {
    fund_house: string;
    scheme_type: string;
    scheme_category: string;
    scheme_code: number;
    scheme_name: string;
    isin_growth?: string;
    isin_div?: string;
  };
  data: NavDataPoint[];
  metrics: FundMetrics;
}

export interface AiFundAnalysis {
  verdict: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'CAUTION';
  summary: string;
  keyStrengths: string[];
  riskFactors: string[];
  suitability: string;
  taxationRules: string;
  sipStrategyRecommendation: string;
}

export interface AiComparisonResponse {
  winner: string;
  winnerRationale: string;
  returnsLeader: string;
  riskEfficiencyLeader: string;
  comparativeTableHighlights: { aspect: string; observation: string }[];
  investorRecommendations: {
    conservative: string;
    moderate: string;
    aggressive: string;
  };
  verdictSummary: string;
}

export interface PortfolioHolding {
  id: string;
  schemeCode: number;
  schemeName: string;
  amc: string;
  fundType: string;
  category: string;
  units: number;
  investedAmount: number;
  purchaseNav: number;
  purchaseDate: string;
  currentNav: number;
}

export type ActiveTab = 'explore' | 'detail' | 'compare' | 'portfolio' | 'calculators';
