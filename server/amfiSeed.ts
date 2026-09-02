import { AmfiScheme } from '../src/types';

// Curated popular/trending funds for instant high-speed discovery
export const POPULAR_SCHEME_CODES: number[] = [
  122639, // Parag Parikh Flexi Cap Fund Direct Growth
  120828, // Quant Small Cap Fund Direct Growth
  118778, // Nippon India Small Cap Fund Direct Growth
  118825, // Mirae Asset Large Cap Fund Direct Growth
  118834, // Mirae Asset Large & Midcap Fund Direct Growth
  120166, // Kotak Flexi Cap Fund Direct Growth
  120843, // Quant Flexi Cap Fund Direct Growth
  120841, // Quant Mid Cap Fund Direct Growth
  125354, // Axis Small Cap Fund Direct Growth
  125497, // SBI Small Cap Fund Direct Growth
  145206, // Tata Small Cap Fund Direct Growth
  147946, // Bandhan Small Cap Fund Direct Growth
  118955, // HDFC Flexi Cap Fund Direct Growth
  130503, // HDFC Small Cap Fund Direct Growth
  120722, // ICICI Prudential Focused Fund Direct Growth
  120586, // ICICI Prudential Large Cap Fund (Bluechip) Direct Growth
  119835, // SBI Contra Fund Direct Growth
  119800, // SBI Liquid Fund Direct Growth
  118701, // Nippon India Liquid Fund Direct Growth
  119091, // HDFC Liquid Fund Direct Growth
  120716, // UTI Nifty 50 Index Fund Direct Growth
  149039, // Navi Nifty 50 Index Fund Direct Growth
  152092, // Groww Nifty Total Market Index Fund Direct Growth
  152156, // Zerodha Nifty LargeMidcap 250 Index Direct Growth
  118535, // Franklin India Flexi Cap Fund Direct Growth
  119071, // DSP Midcap Fund Direct Growth
  151895, // Bajaj Finserv Flexi Cap Fund Direct Growth
  150346, // WhiteOak Capital Flexi Cap Fund Direct Growth
  152135, // Helios Flexi Cap Fund Direct Growth
  120847, // Quant ELSS Tax Saver Fund Direct Growth
  119060, // HDFC ELSS - Tax Saver Fund Direct Growth
  120503, // Axis ELSS - Tax Saver Fund Direct Growth
  119721, // SBI Large & Midcap Fund Direct Growth
  119716, // SBI Midcap Fund Direct Growth
  120403, // Invesco India Midcap Fund Direct Growth
  147704, // Motilal Oswal Large and Midcap Fund Direct Growth
  147622  // Motilal Oswal Nifty Midcap 150 Index Direct Growth
];

// Rich verified dataset of premier mutual funds across all top AMCs and categories
export const FALLBACK_SEEDED_SCHEMES: AmfiScheme[] = [
  {
    schemeCode: 122639,
    schemeName: "Parag Parikh Flexi Cap Fund - Direct Plan - Growth",
    isinGrowth: "INF879O01027",
    isinDiv: "-",
    nav: 91.1767,
    date: "2026-08-28",
    amc: "PPFAS Mutual Fund",
    category: "Open Ended Schemes(Equity Scheme - Flexi Cap Fund)",
    fundType: "Equity"
  },
  {
    schemeCode: 120828,
    schemeName: "Quant Small Cap Fund - Direct Plan - Growth Option",
    isinGrowth: "INF966L01689",
    isinDiv: "-",
    nav: 321.7711,
    date: "2026-08-28",
    amc: "quant Mutual Fund",
    category: "Open Ended Schemes(Equity Scheme - Small Cap Fund)",
    fundType: "Equity"
  },
  {
    schemeCode: 118778,
    schemeName: "Nippon India Small Cap Fund - Direct Plan - Growth Option",
    isinGrowth: "INF204K01K15",
    isinDiv: "-",
    nav: 210.6366,
    date: "2026-08-28",
    amc: "Nippon India Mutual Fund",
    category: "Open Ended Schemes(Equity Scheme - Small Cap Fund)",
    fundType: "Equity"
  },
  {
    schemeCode: 118825,
    schemeName: "Mirae Asset Large Cap Fund - Direct Plan - Growth",
    isinGrowth: "INF769K01AX2",
    isinDiv: "-",
    nav: 128.735,
    date: "2026-08-28",
    amc: "Mirae Asset Mutual Fund",
    category: "Open Ended Schemes(Equity Schemes - Large Cap Fund)",
    fundType: "Equity"
  },
  {
    schemeCode: 118834,
    schemeName: "Mirae Asset Large & Midcap Fund - Direct Plan - Growth",
    isinGrowth: "INF769K01BI1",
    isinDiv: "-",
    nav: 181.587,
    date: "2026-08-28",
    amc: "Mirae Asset Mutual Fund",
    category: "Open Ended Schemes(Equity Schemes - Large & Mid Cap Fund)",
    fundType: "Equity"
  },
  {
    schemeCode: 120166,
    schemeName: "Kotak Flexi Cap Fund - Direct Plan - Growth",
    isinGrowth: "INF174K01LS2",
    isinDiv: "-",
    nav: 98.091,
    date: "2026-08-28",
    amc: "Kotak Mahindra Mutual Fund",
    category: "Open Ended Schemes(Equity Scheme - Flexi Cap Fund)",
    fundType: "Equity"
  },
  {
    schemeCode: 120843,
    schemeName: "Quant Flexi Cap Fund - Direct Plan - Growth Option",
    isinGrowth: "INF966L01911",
    isinDiv: "-",
    nav: 123.5828,
    date: "2026-08-28",
    amc: "quant Mutual Fund",
    category: "Open Ended Schemes(Equity Scheme - Flexi Cap Fund)",
    fundType: "Equity"
  },
  {
    schemeCode: 120841,
    schemeName: "Quant Mid Cap Fund - Direct Plan - Growth Option",
    isinGrowth: "INF966L01887",
    isinDiv: "-",
    nav: 252.818,
    date: "2026-08-28",
    amc: "quant Mutual Fund",
    category: "Open Ended Schemes(Equity Scheme - Mid Cap Fund)",
    fundType: "Equity"
  },
  {
    schemeCode: 125354,
    schemeName: "Axis Small Cap Fund - Direct Plan - Growth Option",
    isinGrowth: "INF846K01K35",
    isinDiv: "-",
    nav: 138.06,
    date: "2026-08-28",
    amc: "Axis Mutual Fund",
    category: "Open Ended Schemes(Equity Scheme - Small Cap Fund)",
    fundType: "Equity"
  },
  {
    schemeCode: 125497,
    schemeName: "SBI SMALL CAP FUND - Direct Plan - Growth",
    isinGrowth: "INF200K01T51",
    isinDiv: "-",
    nav: 216.2904,
    date: "2026-08-28",
    amc: "SBI Mutual Fund",
    category: "Open Ended Schemes(Equity Scheme - Small Cap Fund)",
    fundType: "Equity"
  },
  {
    schemeCode: 145206,
    schemeName: "Tata Small Cap Fund - Direct Plan - Growth Option",
    isinGrowth: "INF277K011O1",
    isinDiv: "-",
    nav: 44.6932,
    date: "2026-08-28",
    amc: "Tata Mutual Fund",
    category: "Open Ended Schemes(Equity Scheme - Small Cap Fund)",
    fundType: "Equity"
  },
  {
    schemeCode: 147946,
    schemeName: "BANDHAN Small Cap Fund - Direct Plan - Growth",
    isinGrowth: "INF194KB1AL4",
    isinDiv: "-",
    nav: 57.559,
    date: "2026-08-28",
    amc: "Bandhan Mutual Fund",
    category: "Open Ended Schemes(Equity Scheme - Small Cap Fund)",
    fundType: "Equity"
  },
  {
    schemeCode: 118955,
    schemeName: "HDFC Flexi Cap Fund - Direct Plan - Growth Option",
    isinGrowth: "INF179K01UT0",
    isinDiv: "-",
    nav: 2299.733,
    date: "2026-08-28",
    amc: "HDFC Mutual Fund",
    category: "Open Ended Schemes(Equity Scheme - Flexi Cap Fund)",
    fundType: "Equity"
  },
  {
    schemeCode: 130503,
    schemeName: "HDFC Small Cap Fund - Direct Plan - Growth Option",
    isinGrowth: "INF179KA1RW5",
    isinDiv: "-",
    nav: 161.226,
    date: "2026-08-28",
    amc: "HDFC Mutual Fund",
    category: "Open Ended Schemes(Equity Scheme - Small Cap Fund)",
    fundType: "Equity"
  },
  {
    schemeCode: 120722,
    schemeName: "ICICI Prudential Focused Fund - Direct Plan - Growth",
    isinGrowth: "INF109K018N2",
    isinDiv: "-",
    nav: 111.47,
    date: "2026-08-28",
    amc: "ICICI Prudential Mutual Fund",
    category: "Open Ended Schemes(Equity Schemes - Focused Fund)",
    fundType: "Equity"
  },
  {
    schemeCode: 120586,
    schemeName: "ICICI Prudential Large Cap Fund (erstwhile Bluechip Fund) - Direct Plan - Growth",
    isinGrowth: "INF109K016L0",
    isinDiv: "-",
    nav: 120.41,
    date: "2026-08-28",
    amc: "ICICI Prudential Mutual Fund",
    category: "Open Ended Schemes(Equity Scheme - Large Cap Fund)",
    fundType: "Equity"
  },
  {
    schemeCode: 119835,
    schemeName: "SBI CONTRA FUND - Direct Plan - Growth",
    isinGrowth: "INF200K01RA0",
    isinDiv: "-",
    nav: 417.0827,
    date: "2026-08-28",
    amc: "SBI Mutual Fund",
    category: "Open Ended Schemes(Equity Scheme - Contra Fund)",
    fundType: "Equity"
  },
  {
    schemeCode: 119800,
    schemeName: "SBI LIQUID FUND - Direct Plan - Growth",
    isinGrowth: "INF200K01UT4",
    isinDiv: "-",
    nav: 4430.8652,
    date: "2026-08-30",
    amc: "SBI Mutual Fund",
    category: "Open Ended Schemes(Debt Scheme - Liquid Fund)",
    fundType: "Debt"
  },
  {
    schemeCode: 118701,
    schemeName: "Nippon India Liquid Fund - Direct Plan - Growth Option",
    isinGrowth: "INF204K01ZH0",
    isinDiv: "-",
    nav: 6940.3332,
    date: "2026-08-30",
    amc: "Nippon India Mutual Fund",
    category: "Open Ended Schemes(Debt Scheme - Liquid Fund)",
    fundType: "Debt"
  },
  {
    schemeCode: 119091,
    schemeName: "HDFC Liquid Fund - Direct Plan - Growth Option",
    isinGrowth: "INF179KB1HP9",
    isinDiv: "-",
    nav: 5565.3257,
    date: "2026-08-30",
    amc: "HDFC Mutual Fund",
    category: "Open Ended Schemes(Debt Scheme - Liquid Fund)",
    fundType: "Debt"
  },
  {
    schemeCode: 120716,
    schemeName: "UTI Nifty 50 Index Fund - Direct Plan - Growth",
    isinGrowth: "INF789F01XA0",
    isinDiv: "-",
    nav: 170.2276,
    date: "2026-08-28",
    amc: "UTI Mutual Fund",
    category: "Open Ended Schemes(Other Scheme - Index Funds)",
    fundType: "Index / ETF"
  },
  {
    schemeCode: 149039,
    schemeName: "Navi Nifty 50 Index Fund - Direct Plan - Growth",
    isinGrowth: "INF959L01FP2",
    isinDiv: "-",
    nav: 15.9692,
    date: "2026-08-28",
    amc: "Navi Mutual Fund",
    category: "Open Ended Schemes(Other Scheme - Index Funds)",
    fundType: "Index / ETF"
  },
  {
    schemeCode: 152092,
    schemeName: "Groww Nifty Total Market Index Fund - Direct Plan - Growth",
    isinGrowth: "INF666M01HM4",
    isinDiv: "-",
    nav: 14.1969,
    date: "2026-08-28",
    amc: "Groww Mutual Fund",
    category: "Open Ended Schemes(Index Funds - Equity Funds)",
    fundType: "Index / ETF"
  },
  {
    schemeCode: 152156,
    schemeName: "Zerodha Nifty LargeMidcap 250 Index Fund - Direct Plan - Growth Option",
    isinGrowth: "INF0R8F01018",
    isinDiv: "-",
    nav: 14.6074,
    date: "2026-08-28",
    amc: "Zerodha Mutual Fund",
    category: "Open Ended Schemes(Other Scheme - Index Funds)",
    fundType: "Index / ETF"
  },
  {
    schemeCode: 118535,
    schemeName: "Franklin India Flexi Cap Fund - Direct Plan - Growth",
    isinGrowth: "INF090I01FK3",
    isinDiv: "-",
    nav: 1813.5605,
    date: "2026-08-28",
    amc: "Franklin Templeton Mutual Fund",
    category: "Open Ended Schemes(Equity Scheme - Flexi Cap Fund)",
    fundType: "Equity"
  },
  {
    schemeCode: 119071,
    schemeName: "DSP Midcap Fund - Direct Plan - Growth",
    isinGrowth: "INF740K01PX1",
    isinDiv: "-",
    nav: 178.405,
    date: "2026-08-28",
    amc: "DSP Mutual Fund",
    category: "Open Ended Schemes(Equity Scheme - Mid Cap Fund)",
    fundType: "Equity"
  },
  {
    schemeCode: 151895,
    schemeName: "Bajaj Finserv Flexi Cap Fund - Direct Plan - Growth",
    isinGrowth: "INF0QA701342",
    isinDiv: "-",
    nav: 16.609,
    date: "2026-08-28",
    amc: "Bajaj Finserv Mutual Fund",
    category: "Open Ended Schemes(Equity Scheme - Flexi Cap Fund)",
    fundType: "Equity"
  },
  {
    schemeCode: 150346,
    schemeName: "WhiteOak Capital Flexi Cap Fund - Direct Plan - Growth Option",
    isinGrowth: "INF03VN01530",
    isinDiv: "-",
    nav: 19.522,
    date: "2026-08-28",
    amc: "WhiteOak Capital Mutual Fund",
    category: "Open Ended Schemes(Equity Scheme - Flexi Cap Fund)",
    fundType: "Equity"
  },
  {
    schemeCode: 152135,
    schemeName: "Helios Flexi Cap Fund - Direct Plan - Growth",
    isinGrowth: "INF0R8701046",
    isinDiv: "-",
    nav: 16.41,
    date: "2026-08-28",
    amc: "Helios Mutual Fund",
    category: "Open Ended Schemes(Equity Schemes - Flexi Cap Fund)",
    fundType: "Equity"
  },
  {
    schemeCode: 120692,
    schemeName: "ICICI Prudential Corporate Bond Fund - Direct Plan - Growth",
    isinGrowth: "INF109K016B1",
    isinDiv: "-",
    nav: 33.5277,
    date: "2026-08-28",
    amc: "ICICI Prudential Mutual Fund",
    category: "Open Ended Schemes(Debt Scheme - Corporate Bond Fund)",
    fundType: "Debt"
  },
  {
    schemeCode: 119533,
    schemeName: "Aditya Birla Sun Life Corporate Bond Fund - Direct Plan - GROWTH",
    isinGrowth: "INF209K01S38",
    isinDiv: "-",
    nav: 121.714,
    date: "2026-08-28",
    amc: "Aditya Birla Sun Life Mutual Fund",
    category: "Open Ended Schemes(Debt Scheme - Corporate Bond Fund)",
    fundType: "Debt"
  },
  {
    schemeCode: 118987,
    schemeName: "HDFC Corporate Bond Fund - Direct Plan - Growth Option",
    isinGrowth: "INF179K01XD8",
    isinDiv: "-",
    nav: 35.2119,
    date: "2026-08-28",
    amc: "HDFC Mutual Fund",
    category: "Open Ended Schemes(Debt Scheme - Corporate Bond Fund)",
    fundType: "Debt"
  },
  {
    schemeCode: 120505,
    schemeName: "Axis Midcap Fund - Direct Plan - Growth Option",
    isinGrowth: "INF846K01EH3",
    isinDiv: "-",
    nav: 144.91,
    date: "2026-08-28",
    amc: "Axis Mutual Fund",
    category: "Open Ended Schemes(Equity Scheme - Mid Cap Fund)",
    fundType: "Equity"
  },
  {
    schemeCode: 120847,
    schemeName: "Quant ELSS Tax Saver Fund - Direct Plan - Growth Option",
    isinGrowth: "INF966L01986",
    isinDiv: "-",
    nav: 468.1062,
    date: "2026-08-28",
    amc: "quant Mutual Fund",
    category: "Open Ended Schemes(Equity Scheme - ELSS)",
    fundType: "Equity"
  },
  {
    schemeCode: 119060,
    schemeName: "HDFC ELSS - Tax Saver Fund - Direct Plan - Growth Option",
    isinGrowth: "INF179K01YS4",
    isinDiv: "-",
    nav: 1512.855,
    date: "2026-08-28",
    amc: "HDFC Mutual Fund",
    category: "Open Ended Schemes(Equity Schemes - ELSS- Tax Saver Fund)",
    fundType: "Equity"
  },
  {
    schemeCode: 120503,
    schemeName: "Axis ELSS- Tax Saver Fund - Direct Plan - Growth Option",
    isinGrowth: "INF846K01EW2",
    isinDiv: "-",
    nav: 112.6299,
    date: "2026-08-28",
    amc: "Axis Mutual Fund",
    category: "Open Ended Schemes(Equity Schemes - ELSS- Tax Saver Fund)",
    fundType: "Equity"
  },
  {
    schemeCode: 119721,
    schemeName: "SBI LARGE & MIDCAP FUND - Direct Plan - Growth",
    isinGrowth: "INF200K01UJ5",
    isinDiv: "-",
    nav: 715.0686,
    date: "2026-08-28",
    amc: "SBI Mutual Fund",
    category: "Open Ended Schemes(Equity Scheme - Large & Mid Cap Fund)",
    fundType: "Equity"
  },
  {
    schemeCode: 119716,
    schemeName: "SBI MIDCAP FUND - Direct Plan - Growth",
    isinGrowth: "INF200K01TP4",
    isinDiv: "-",
    nav: 276.5422,
    date: "2026-08-28",
    amc: "SBI Mutual Fund",
    category: "Open Ended Schemes(Equity Scheme - Mid Cap Fund)",
    fundType: "Equity"
  },
  {
    schemeCode: 120403,
    schemeName: "Invesco India Midcap Fund - Direct Plan - Growth",
    isinGrowth: "INF205K01MV6",
    isinDiv: "-",
    nav: 245.07,
    date: "2026-08-28",
    amc: "Invesco Mutual Fund",
    category: "Open Ended Schemes(Equity Schemes - Mid Cap Fund)",
    fundType: "Equity"
  },
  {
    schemeCode: 147704,
    schemeName: "Motilal Oswal Large and Midcap Fund - Direct Plan - Growth",
    isinGrowth: "INF247L01999",
    isinDiv: "-",
    nav: 41.7091,
    date: "2026-08-28",
    amc: "Motilal Oswal Mutual Fund",
    category: "Open Ended Schemes(Equity Scheme - Large & Mid Cap Fund)",
    fundType: "Equity"
  },
  {
    schemeCode: 147622,
    schemeName: "Motilal Oswal Nifty Midcap 150 Index Fund - Direct Plan - Growth",
    isinGrowth: "INF247L01916",
    isinDiv: "-",
    nav: 42.6744,
    date: "2026-08-28",
    amc: "Motilal Oswal Mutual Fund",
    category: "Open Ended Schemes(Other Scheme - Index Funds)",
    fundType: "Index / ETF"
  }
];

// All 52 Official SEBI-Registered Mutual Fund Houses in India
export const ALL_SEBI_AMCS: string[] = [
  '360 ONE Mutual Fund',
  'Abakkus Mutual Fund',
  'Aditya Birla Sun Life Mutual Fund',
  'AlphaGrep Mutual Fund',
  'Angel One Mutual Fund',
  'Axis Mutual Fund',
  'Bajaj Finserv Mutual Fund',
  'Bandhan Mutual Fund',
  'Bank of India Mutual Fund',
  'Baroda BNP Paribas Mutual Fund',
  'Canara Robeco Mutual Fund',
  'Capitalmind Mutual Fund',
  'Choice Mutual Fund',
  'DSP Mutual Fund',
  'Edelweiss Mutual Fund',
  'Franklin Templeton Mutual Fund',
  'Groww Mutual Fund',
  'HDFC Mutual Fund',
  'Helios Mutual Fund',
  'HSBC Mutual Fund',
  'ICICI Prudential Mutual Fund',
  'IL&FS Mutual Fund (IDF)',
  'Invesco Mutual Fund',
  'ITI Mutual Fund',
  'Jio BlackRock Mutual Fund',
  'JM Financial Mutual Fund',
  'Kotak Mahindra Mutual Fund',
  'LIC Mutual Fund',
  'Mahindra Manulife Mutual Fund',
  'Mirae Asset Mutual Fund',
  'Motilal Oswal Mutual Fund',
  'Navi Mutual Fund',
  'Nippon India Mutual Fund',
  'NJ Mutual Fund',
  'Old Bridge Mutual Fund',
  'PGIM India Mutual Fund',
  'PPFAS Mutual Fund',
  'Quant Mutual Fund',
  'Quantum Mutual Fund',
  'Samco Mutual Fund',
  'SBI Mutual Fund',
  'Shriram Mutual Fund',
  'Sundaram Mutual Fund',
  'Tata Mutual Fund',
  'Taurus Mutual Fund',
  'The Wealth Company Mutual Fund',
  'Trust Mutual Fund',
  'Unifi Capital Mutual Fund',
  'Union Mutual Fund',
  'UTI Mutual Fund',
  'WhiteOak Capital Mutual Fund',
  'Zerodha Mutual Fund'
];
