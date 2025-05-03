
export enum TaphoammoErrorCodes {
  NETWORK_ERROR = 'NETWORK_ERROR',
  INVALID_RESPONSE = 'INVALID_RESPONSE',
  API_ERROR = 'API_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  NOT_FOUND = 'NOT_FOUND',
  UNEXPECTED_RESPONSE = 'UNEXPECTED_RESPONSE',
  KIOSK_PENDING = 'KIOSK_PENDING',
  API_TEMP_DOWN = 'API_TEMP_DOWN'
}

export class TaphoammoError extends Error {
  public code: TaphoammoErrorCodes;
  public retryCount: number;
  public responseTime: number;

  constructor(
    message: string, 
    code: TaphoammoErrorCodes = TaphoammoErrorCodes.API_ERROR,
    retryCount = 0,
    responseTime = 0
  ) {
    super(message);
    this.name = 'TaphoammoError';
    this.code = code;
    this.retryCount = retryCount;
    this.responseTime = responseTime;
  }
}
