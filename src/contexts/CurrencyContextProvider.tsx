
import React from 'react';
import { CurrencyProvider } from './CurrencyContext';

export const CurrencyContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <CurrencyProvider>{children}</CurrencyProvider>;
};
