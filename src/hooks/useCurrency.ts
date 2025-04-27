
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
      console.log("Exchange rates fetched:", data);
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
    
    if (!rate) {
      console.warn(`Exchange rate not found for ${fromCurrency} to ${toCurrency}`);
      return fromCurrency === toCurrency ? 1 : 0;
    }
    
    console.log(`Using exchange rate for ${fromCurrency} to ${toCurrency}:`, rate.rate);
    return rate.rate;
  };

  // Convert between currencies
  const convertCurrency = (
    amount: number, 
    fromCurrency: CurrencyCode, 
    toCurrency: CurrencyCode
  ): number => {
    // If same currency, no conversion needed
    if (fromCurrency === toCurrency) return amount;
    
    // Get exchange rate and perform conversion
    const rate = getExchangeRate(fromCurrency, toCurrency);
    const result = amount * rate;
    
    console.log(`Converting ${amount} ${fromCurrency} to ${toCurrency}:`, { 
      rate, 
      result 
    });
    
    return result;
  };

  // Specific conversion methods for easier use
  const convertVNDtoUSD = (amount: number): number => {
    const result = convertCurrency(amount, 'VND', 'USD');
    console.log(`VND to USD conversion: ${amount} VND = ${result} USD`);
    return result;
  };

  const convertUSDtoVND = (amount: number): number => {
    const result = convertCurrency(amount, 'USD', 'VND');
    console.log(`USD to VND conversion: ${amount} USD = ${result} VND`);
    return result;
  };

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
