
export type CurrencyCode = 'USD' | 'VND';

export interface ExchangeRate {
  id: string;
  from_currency: CurrencyCode;
  to_currency: CurrencyCode;
  rate: number;
  updated_at: string;
}

export interface CurrencyContextType {
  convertVNDtoUSD: (amount: number) => number;
  convertUSDtoVND: (amount: number) => number;
  formatUSD: (amount: number) => string;
  formatVND: (amount: number) => string;
  isLoading: boolean;
}
