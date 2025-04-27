
export class TaphoammoError extends Error {
  code: string;
  retryCount: number;
  elapsed: number;

  constructor(message: string, code: string, retryCount: number, elapsed: number) {
    super(message);
    this.name = 'TaphoammoError';
    this.code = code;
    this.retryCount = retryCount;
    this.elapsed = elapsed;
  }
}

export const TaphoammoErrorCodes = {
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  API_TEMP_DOWN: 'API_TEMP_DOWN',
  UNEXPECTED_RESPONSE: 'UNEXPECTED_RESPONSE'
} as const;
