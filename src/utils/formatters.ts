
/**
 * Format currency values using the specific locale and currency
 */
export const formatCurrency = (value: number, currencyCode: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', { 
    style: 'currency', 
    currency: currencyCode,
    maximumFractionDigits: currencyCode === 'USD' ? 2 : 0
  }).format(value);
};

/**
 * Format number with comma separators in US/International format
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US').format(value);
};
