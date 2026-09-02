/**
 * Utility functions for formatting mutual fund metrics, NAV values, and currency in Indian financial conventions.
 */

/**
 * Format NAV value to four decimal places as standard for Indian Mutual Funds (SEBI/AMFI convention).
 * Example: 210.6366 -> "210.6366"
 */
export function formatNav(nav: number | string | null | undefined, decimals = 4): string {
  if (nav === null || nav === undefined || nav === '') return '--';
  const num = typeof nav === 'number' ? nav : parseFloat(String(nav));
  if (isNaN(num)) return '--';
  return num.toFixed(decimals);
}

/**
 * Format standard currency amounts with Indian numbering system.
 * Example: 154200.5 -> "1,54,200.50"
 */
export function formatCurrency(amount: number | string | null | undefined, decimals = 2): string {
  if (amount === null || amount === undefined || amount === '') return '--';
  const num = typeof amount === 'number' ? amount : parseFloat(String(amount));
  if (isNaN(num)) return '--';
  return num.toLocaleString('en-IN', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals > 0 ? decimals : 0
  });
}

/**
 * Format percentage return with positive sign indicator.
 * Example: 14.85 -> "+14.85%"
 */
export function formatPercentage(val: number | string | null | undefined, decimals = 2): string {
  if (val === null || val === undefined || val === '') return '--';
  const num = typeof val === 'number' ? val : parseFloat(String(val));
  if (isNaN(num)) return '--';
  return `${num >= 0 ? '+' : ''}${num.toFixed(decimals)}%`;
}
