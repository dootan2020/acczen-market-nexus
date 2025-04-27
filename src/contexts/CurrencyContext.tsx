
import { createContext, useContext, ReactNode } from "react";
import { useCurrency } from "@/hooks/useCurrency";
import { CurrencyContextType } from "@/types/currency";

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const currency = useCurrency();
  
  console.log("CurrencyProvider - Exchange rates loaded:", {
    VNDtoUSD: currency.getExchangeRate('VND', 'USD'),
    USDtoVND: currency.getExchangeRate('USD', 'VND'),
    isLoading: currency.isLoading
  });
  
  return (
    <CurrencyContext.Provider value={currency}>
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
