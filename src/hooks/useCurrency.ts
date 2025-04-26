
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ExchangeRate } from "@/types/currency";

export const useCurrency = () => {
  const { data: exchangeRate, isLoading } = useQuery({
    queryKey: ['exchange-rate', 'VND', 'USD'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exchange_rates')
        .select('*')
        .eq('from_currency', 'VND')
        .eq('to_currency', 'USD')
        .single();

      if (error) throw error;
      return data as ExchangeRate;
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });

  const convertVNDtoUSD = (amount: number): number => {
    if (!exchangeRate?.rate) return 0;
    return amount * exchangeRate.rate;
  };

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
    exchangeRate: exchangeRate?.rate ?? 0,
    convertVNDtoUSD,
    formatUSD,
    formatVND,
    isLoading,
  };
};
