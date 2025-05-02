
import React from 'react';
import { CurrencyProvider } from './CurrencyContext';

export const CurrencyContextProvider = ({ children }: { children: React.ReactNode }) => {
  // Wrap the children in a fragment to ensure we return a single element
  return (
    <CurrencyProvider>
      {children}
    </CurrencyProvider>
  );
};

export default CurrencyContextProvider;
