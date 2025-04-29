
export enum TaphoammoErrorCodes {
  UNEXPECTED_RESPONSE = 'UNEXPECTED_RESPONSE',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  ORDER_PROCESSING = 'ORDER_PROCESSING',
  KIOSK_PENDING = 'KIOSK_PENDING',
  PRODUCT_NOT_FOUND = 'PRODUCT_NOT_FOUND',
  STOCK_UNAVAILABLE = 'STOCK_UNAVAILABLE',
  TIMEOUT = 'TIMEOUT',
  API_TEMP_DOWN = 'API_TEMP_DOWN'
}

export class TaphoammoError extends Error {
  code: TaphoammoErrorCodes;
  retryCount: number;
  responseTime: number;
  
  constructor(
    message: string, 
    code: TaphoammoErrorCodes,
    retryCount: number = 0,
    responseTime: number = 0
  ) {
    super(message);
    this.name = 'TaphoammoError';
    this.code = code;
    this.retryCount = retryCount;
    this.responseTime = responseTime;
  }
}
