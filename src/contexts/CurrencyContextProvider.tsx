
import React from 'react';
import { useCurrencyContext } from './CurrencyContext';

export const CurrencyContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const currencyContextValue = useCurrencyContext();
  
  return (
    <div>
      {children}
    </div>
  );
};
