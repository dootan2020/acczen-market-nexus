
import React, { createContext, useContext, useState, useEffect } from 'react';

type CurrencyContextType = {
  currency: string;
  setCurrency: (currency: string) => void;
  rate: number;
  convert: (amount: number) => number;
};

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrency] = useState('USD');
  const [rate, setRate] = useState(1);

  useEffect(() => {
    // Fetch exchange rates from API
    // This is a placeholder. In a real app, you'd call an API here
    const fetchRates = async () => {
      // Mock rates for demonstration
      const rates = {
        USD: 1,
        EUR: 0.92,
        GBP: 0.78,
      };
      setRate(rates[currency as keyof typeof rates] || 1);
    };

    fetchRates();
  }, [currency]);

  const convert = (amount: number): number => {
    return amount * rate;
  };

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, rate, convert }}>
      {children}
    </CurrencyContext.Provider>
  );
};
