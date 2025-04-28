export enum TaphoammoErrorCodes {
  API_TEMP_DOWN = 'API_TEMP_DOWN',
  NETWORK_ERROR = 'NETWORK_ERROR',
  INVALID_RESPONSE = 'INVALID_RESPONSE',
  UNEXPECTED_RESPONSE = 'UNEXPECTED_RESPONSE',
  KIOSK_PENDING = 'KIOSK_PENDING'
}

export class TaphoammoError extends Error {
  public readonly code: TaphoammoErrorCodes;
  public readonly retryCount: number;
  public readonly responseTime: number;

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
