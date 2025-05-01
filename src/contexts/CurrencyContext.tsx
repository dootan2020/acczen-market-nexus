
import { createContext, useContext, ReactNode } from "react";
import { useCurrency } from "@/hooks/useCurrency";
import { CurrencyContextType } from "@/types/currency";
import { formatCurrency } from "@/utils/formatters";

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const currency = useCurrency();
  
  if (process.env.NODE_ENV === 'development') {
    console.log("CurrencyProvider - Exchange rates loaded:", {
      VNDtoUSD: currency.getExchangeRate('VND', 'USD'),
      USDtoVND: currency.getExchangeRate('USD', 'VND'),
      isLoading: currency.isLoading
    });
  }
  
  // Add the formatVND function that uses our updated formatter
  const formatVND = (amount: number): string => {
    return formatCurrency(amount, 'VND');
  };
  
  const value: CurrencyContextType = {
    convertVNDtoUSD: currency.convertVNDtoUSD,
    convertUSDtoVND: currency.convertUSDtoVND,
    formatVND,
    formatUSD: currency.formatUSD,
    isLoading: currency.isLoading,
    error: currency.error,
    getExchangeRate: currency.getExchangeRate,
    convertCurrency: currency.convertCurrency
  };
  
  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrencyContext = () => {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error("useCurrencyContext must be used within a CurrencyProvider");
  }
  return context;
};
