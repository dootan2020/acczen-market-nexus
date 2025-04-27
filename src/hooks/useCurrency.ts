
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ExchangeRate, CurrencyCode } from "@/types/currency";

export const useCurrency = () => {
  const { data: exchangeRates, isLoading } = useQuery({
    queryKey: ['exchange-rates'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exchange_rates')
        .select('*')
        .or('from_currency.eq.VND,from_currency.eq.USD');

      if (error) throw error;
      return data as ExchangeRate[];
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });

  // Find exchange rate for a specific currency pair
  const getExchangeRate = (fromCurrency: CurrencyCode, toCurrency: CurrencyCode): number => {
    if (!exchangeRates) return 0;
    
    const rate = exchangeRates.find(
      r => r.from_currency === fromCurrency && r.to_currency === toCurrency
    );
    
    return rate ? rate.rate : 0;
  };

  // Convert between VND and USD
  const convertCurrency = (
    amount: number, 
    fromCurrency: CurrencyCode, 
    toCurrency: CurrencyCode
  ): number => {
    const rate = getExchangeRate(fromCurrency, toCurrency);
    return amount * rate;
  };

  // Specific conversion methods for easier use
  const convertVNDtoUSD = (amount: number): number => 
    convertCurrency(amount, 'VND', 'USD');

  const convertUSDtoVND = (amount: number): number => 
    convertCurrency(amount, 'USD', 'VND');

  // Formatting methods
  const formatUSD = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatVND = (amount: number): string => {
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
    getExchangeRate,
    convertCurrency
  };
};

