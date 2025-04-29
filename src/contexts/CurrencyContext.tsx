
import { createContext, useContext, ReactNode } from "react";
import { useCurrency } from "@/hooks/useCurrency";
import { CurrencyContextType } from "@/types/currency";

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
  
  // Add the formatVND function
  const formatVND = (amount: number): string => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
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
