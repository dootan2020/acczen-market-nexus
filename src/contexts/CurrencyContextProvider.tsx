
import React from 'react';
import { CurrencyProvider } from './CurrencyContext';

export const CurrencyContextProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <CurrencyProvider>
      {children}
    </CurrencyProvider>
  );
};

export default CurrencyContextProvider;
