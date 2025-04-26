
/**
 * Format currency values using the specific locale and currency
 */
export const formatCurrency = (value: number, currencyCode: string = 'VND'): string => {
  return new Intl.NumberFormat('vi-VN', { 
    style: 'currency', 
    currency: currencyCode,
    maximumFractionDigits: currencyCode === 'VND' ? 0 : 2
  }).format(value);
};

/**
 * Format number with comma separators in Vietnamese format
 */
export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('vi-VN').format(value);
};
