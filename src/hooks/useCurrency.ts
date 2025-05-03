
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ExchangeRate, CurrencyCode } from "@/types/currency";

// Create a cache for exchange rate conversions
const conversionCache: Record<string, number> = {};

export const useCurrency = () => {
  // Use React Query for automatic caching, retries, and stale-time management
  const { data: exchangeRates, isLoading, error } = useQuery({
    queryKey: ['exchange-rates'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('exchange_rates')
          .select('*')
          .or('from_currency.eq.VND,from_currency.eq.USD');

        if (error) throw error;
        
        if (process.env.NODE_ENV === 'development') {
          console.log("Exchange rates fetched successfully:", data);
        }
        
        return data as ExchangeRate[];
      } catch (err) {
        console.error("Error fetching exchange rates:", err);
        // Return fallback values to prevent app from crashing
        return [
          { id: "fallback1", from_currency: "VND", to_currency: "USD", rate: 0.000041, updated_at: new Date().toISOString() },
          { id: "fallback2", from_currency: "USD", to_currency: "VND", rate: 24400, updated_at: new Date().toISOString() }
        ] as ExchangeRate[];
      }
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
    // Add auto-refresh every hour without user intervention
    refetchInterval: 1000 * 60 * 60,
  });

  // Find exchange rate for a specific currency pair with better error handling
  const getExchangeRate = (fromCurrency: CurrencyCode, toCurrency: CurrencyCode): number => {
    // If same currency, conversion rate is 1
    if (fromCurrency === toCurrency) return 1;
    
    // If no exchange rates yet, use fallback values to prevent NaN/0
    if (!exchangeRates) {
      // Fallback values during loading
      if (fromCurrency === 'VND' && toCurrency === 'USD') return 0.000041; // ~24,400 VND = 1 USD
      if (fromCurrency === 'USD' && toCurrency === 'VND') return 24400;
      return 1;
    }
    
    const rate = exchangeRates.find(
      r => r.from_currency === fromCurrency && r.to_currency === toCurrency
    );
    
    if (!rate) {
      if (process.env.NODE_ENV === 'development') {
        console.warn(`Exchange rate not found for ${fromCurrency} to ${toCurrency}`);
      }
      
      // Use fallback values if rate not found
      if (fromCurrency === 'VND' && toCurrency === 'USD') return 0.000041;
      if (fromCurrency === 'USD' && toCurrency === 'VND') return 24400;
      return fromCurrency === toCurrency ? 1 : 0;
    }
    
    return rate.rate;
  };

  // Convert between currencies with memoization
  const convertCurrency = (
    amount: number, 
    fromCurrency: CurrencyCode, 
    toCurrency: CurrencyCode
  ): number => {
    // Handle edge cases
    if (isNaN(amount) || amount === null) return 0;
    
    // If same currency, no conversion needed
    if (fromCurrency === toCurrency) return amount;
    
    // Generate a cache key
    const cacheKey = `${amount}-${fromCurrency}-${toCurrency}`;
    
    // Check if result is already in cache
    if (conversionCache[cacheKey] !== undefined) {
      return conversionCache[cacheKey];
    }
    
    // Get exchange rate and perform conversion
    const rate = getExchangeRate(fromCurrency, toCurrency);
    const result = amount * rate;
    
    // Store in cache
    conversionCache[cacheKey] = result;
    
    return result;
  };

  // Specific conversion methods for easier use
  const convertVNDtoUSD = (amount: number): number => {
    return convertCurrency(amount, 'VND', 'USD');
  };

  const convertUSDtoVND = (amount: number): number => {
    return convertCurrency(amount, 'USD', 'VND');
  };

  // Formatting methods with consistent rounding
  const formatUSD = (amount: number): string => {
    // Handle edge cases for better UX
    if (isNaN(amount) || amount === null) return '$0.00';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  const formatVND = (amount: number): string => {
    // Handle edge cases for better UX
    if (isNaN(amount) || amount === null) return '0 ₫';
    
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return {
    convertVNDtoUSD,
    convertUSDtoVND,
    formatUSD,
    formatVND,
    isLoading,
    error,
    getExchangeRate,
    convertCurrency
  };
};
