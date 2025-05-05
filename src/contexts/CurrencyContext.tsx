
import React, { createContext, useContext, useState, useEffect } from 'react';
import { useCurrency } from '@/hooks/useCurrency';
import { CurrencyContextType } from '@/types/currency';

// Create the context with default values
const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

// Export a hook for using the context
export const useCurrencyContext = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrencyContext must be used within a CurrencyProvider');
  }
  return context;
};

// Provider component
export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Use the actual currency hook that contains the logic
  const {
    convertVNDtoUSD,
    convertUSDtoVND,
    formatUSD,
    formatVND,
    isLoading,
    error,
    getExchangeRate,
    convertCurrency
  } = useCurrency();

  // Create a single value object to pass to the context
  const value: CurrencyContextType = {
    convertVNDtoUSD,
    convertUSDtoVND,
    formatUSD,
    formatVND,
    isLoading,
    error,
    getExchangeRate,
    convertCurrency
  };

  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
};
