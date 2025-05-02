
import React from 'react';
import { CurrencyProvider } from './CurrencyContext';

export const CurrencyContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Simply pass through the children to CurrencyProvider without any additional wrappers
  return <CurrencyProvider>{children}</CurrencyProvider>;
};
