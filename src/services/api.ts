import { AmfiSchemeSummary, SchemeDetailResponse, AiFundAnalysis, AiComparisonResponse } from '../types';

export async function fetchSchemes(params: {
  search?: string;
  category?: string;
  amc?: string;
  fundType?: string;
  popularOnly?: boolean;
  directOnly?: boolean;
  limit?: number;
  offset?: number;
}): Promise<{ total: number; schemes: AmfiSchemeSummary[]; lastUpdated: string }> {
  const query = new URLSearchParams();
  if (params.search) query.set('search', params.search);
  if (params.category) query.set('category', params.category);
  if (params.amc) query.set('amc', params.amc);
  if (params.fundType) query.set('fundType', params.fundType);
  if (params.popularOnly) query.set('popularOnly', 'true');
  if (params.directOnly) query.set('directOnly', 'true');
  if (params.limit) query.set('limit', params.limit.toString());
  if (params.offset) query.set('offset', params.offset.toString());

  const res = await fetch(`/api/amfi/schemes?${query.toString()}`);
  if (!res.ok) {
    throw new Error(`Failed to fetch mutual funds: ${res.statusText}`);
  }
  return res.json();
}

export async function fetchMetadata(): Promise<{
  amcs: string[];
  categories: string[];
  fundTypes: string[];
  totalSchemesCount: number;
}> {
  const res = await fetch('/api/amfi/metadata');
  if (!res.ok) {
    throw new Error('Failed to load AMFI metadata');
  }
  return res.json();
}

export async function fetchSchemeDetail(schemeCode: number): Promise<SchemeDetailResponse> {
  const res = await fetch(`/api/amfi/scheme/${schemeCode}`);
  if (!res.ok) {
    throw new Error(`Failed to load scheme details for code ${schemeCode}`);
  }
  return res.json();
}

export async function fetchComparison(
  schemeCodes: number[],
  timeframe: string = '3Y'
): Promise<{
  funds: { meta: any; metrics: any }[];
  timeline: any[];
  timeframe?: string;
}> {
  const res = await fetch('/api/amfi/compare', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ schemeCodes, timeframe }),
  });
  if (!res.ok) {
    throw new Error('Failed to load comparison data');
  }
  return res.json();
}

export async function generateAiComparison(payload: {
  funds: { meta: any; metrics: any }[];
  userRiskTolerance?: string;
}): Promise<AiComparisonResponse> {
  const res = await fetch('/api/amfi/ai-compare', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error('Failed to run AI Multi-Fund comparison');
  }
  return res.json();
}

export async function generateAiFundAnalysis(payload: {
  schemeMeta: any;
  metrics: any;
  userRiskTolerance?: string;
  investmentHorizon?: string;
}): Promise<AiFundAnalysis> {
  const res = await fetch('/api/amfi/ai-analyze', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    throw new Error('Failed to run AI Fund analysis');
  }
  return res.json();
}

export async function searchTigZigSchemes(query: string): Promise<{ schemeCode: number; schemeName: string }[]> {
  try {
    const res = await fetch(`/api/tigzig/search?q=${encodeURIComponent(query)}`);
    if (res.ok) {
      return res.json();
    }
  } catch (e) {
    // fallback to direct browser fetch if server endpoint is busy
    try {
      const direct = await fetch(`https://api.tigzig.com/mf/v1/search?q=${encodeURIComponent(query)}`);
      if (direct.ok) {
        const data = await direct.json();
        const list = Array.isArray(data) ? data : Array.isArray(data.data) ? data.data : Array.isArray(data.schemes) ? data.schemes : [];
        return list.map((item: any) => ({
          schemeCode: item.scheme_code || item.schemeCode,
          schemeName: item.scheme_name || item.schemeName || item.name
        })).filter((x: any) => x.schemeCode && x.schemeName);
      }
    } catch {}
  }
  return [];
}

// Retain alias for existing callers
export const searchMfApiDirect = searchTigZigSchemes;

export async function fetchRawTigZigScheme(schemeCode: number): Promise<any> {
  try {
    const res = await fetch(`/api/tigzig/nav/${schemeCode}`);
    if (res.ok) {
      return res.json();
    }
  } catch (e) {
    try {
      const direct = await fetch(`https://api.tigzig.com/mf/v1/nav?scheme=${schemeCode}`);
      if (direct.ok) {
        return direct.json();
      }
    } catch {}
  }
  throw new Error(`Could not fetch data for scheme ${schemeCode} from TigZig API`);
}

export const fetchRawMfApiScheme = fetchRawTigZigScheme;

export async function getOrFetchSchemeSummary(item: { schemeCode: number; schemeName: string } | AmfiSchemeSummary): Promise<AmfiSchemeSummary> {
  if ('nav' in item && typeof item.nav === 'number' && item.amc) {
    return item as AmfiSchemeSummary;
  }
  try {
    const detail = await fetchSchemeDetail(item.schemeCode);
    const latestNav = detail.metrics?.latestNav || (detail.data?.length > 0 ? detail.data[detail.data.length - 1].nav : 100);
    const latestDate = detail.metrics?.latestDate || (detail.data?.length > 0 ? detail.data[detail.data.length - 1].date : new Date().toISOString().split('T')[0]);
    
    let fundType: AmfiSchemeSummary['fundType'] = 'Equity';
    const cat = (detail.meta.scheme_category || '').toLowerCase();
    const name = (detail.meta.scheme_name || '').toLowerCase();
    if (cat.includes('debt') || cat.includes('liquid') || cat.includes('gilt') || cat.includes('money market') || cat.includes('bond') || cat.includes('treasury')) {
      fundType = 'Debt';
    } else if (cat.includes('hybrid') || cat.includes('balanced') || cat.includes('multi asset') || cat.includes('arbitrage')) {
      fundType = 'Hybrid';
    } else if (cat.includes('index') || cat.includes('etf') || name.includes('index') || name.includes('etf') || name.includes('nifty') || name.includes('sensex')) {
      fundType = 'Index / ETF';
    } else if (cat.includes('solution') || cat.includes('retirement') || cat.includes('children')) {
      fundType = 'Solution Oriented';
    }

    return {
      schemeCode: item.schemeCode,
      schemeName: detail.meta.scheme_name || item.schemeName,
      isinGrowth: detail.meta.isin_growth || '-',
      isinDiv: detail.meta.isin_div || '-',
      nav: latestNav,
      date: latestDate,
      amc: detail.meta.fund_house || 'Mutual Fund',
      category: detail.meta.scheme_category || 'Mutual Fund Scheme',
      fundType
    };
  } catch (err) {
    return {
      schemeCode: item.schemeCode,
      schemeName: item.schemeName,
      isinGrowth: '-',
      isinDiv: '-',
      nav: 100.0,
      date: new Date().toISOString().split('T')[0],
      amc: 'Mutual Fund',
      category: 'Mutual Fund Scheme',
      fundType: 'Equity'
    };
  }
}

