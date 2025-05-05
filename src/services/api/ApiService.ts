
export class ApiService {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private maxRetries: number;
  private retryDelay: number;

  constructor(
    baseUrl: string,
    defaultHeaders: Record<string, string> = {},
    maxRetries = 3,
    retryDelay = 1000
  ) {
    this.baseUrl = baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...defaultHeaders,
    };
    this.maxRetries = maxRetries;
    this.retryDelay = retryDelay;
  }

  async get<T>(endpoint: string, params?: Record<string, string>, headers?: Record<string, string>): Promise<T> {
    const url = this.buildUrl(endpoint, params);
    return this.request<T>('GET', url, undefined, headers);
  }

  async post<T>(endpoint: string, data?: any, headers?: Record<string, string>): Promise<T> {
    const url = this.buildUrl(endpoint);
    return this.request<T>('POST', url, data, headers);
  }

  async put<T>(endpoint: string, data?: any, headers?: Record<string, string>): Promise<T> {
    const url = this.buildUrl(endpoint);
    return this.request<T>('PUT', url, data, headers);
  }

  async patch<T>(endpoint: string, data?: any, headers?: Record<string, string>): Promise<T> {
    const url = this.buildUrl(endpoint);
    return this.request<T>('PATCH', url, data, headers);
  }

  async delete<T>(endpoint: string, headers?: Record<string, string>): Promise<T> {
    const url = this.buildUrl(endpoint);
    return this.request<T>('DELETE', url, undefined, headers);
  }

  private buildUrl(endpoint: string, params?: Record<string, string>): string {
    const url = new URL(endpoint, this.baseUrl);
    
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }
    
    return url.toString();
  }

  private async request<T>(
    method: string,
    url: string,
    data?: any,
    additionalHeaders?: Record<string, string>
  ): Promise<T> {
    const headers = {
      ...this.defaultHeaders,
      ...additionalHeaders,
    };

    const config: RequestInit = {
      method,
      headers,
      credentials: 'include',
      // Add CORS mode to help with CORS issues
      mode: 'cors',
    };

    if (data) {
      config.body = JSON.stringify(data);
    }

    return this.fetchWithRetry<T>(url, config);
  }

  private async fetchWithRetry<T>(url: string, config: RequestInit, retryCount = 0): Promise<T> {
    try {
      // Add a timeout to prevent hanging requests
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout
      
      const response = await fetch(url, {
        ...config,
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        const errorData = await this.parseResponseData(response);
        
        // Enhanced error handling with more detailed error information
        const error = new Error();
        Object.assign(error, {
          status: response.status,
          statusText: response.statusText,
          data: errorData,
          url: url,
          method: config.method,
          timestamp: new Date().toISOString(),
          isNetworkError: false,
          isApiError: true
        });

        // Handle specific HTTP status codes
        switch (response.status) {
          case 401: // Unauthorized
          case 403: // Forbidden
            error.name = 'AuthenticationError';
            break;
          case 404: // Not Found
            error.name = 'NotFoundError';
            break;
          case 400: // Bad Request
            error.name = 'ValidationError';
            break;
          case 429: // Too Many Requests
            error.name = 'RateLimitError';
            break;
          case 500: // Internal Server Error
          case 502: // Bad Gateway
          case 503: // Service Unavailable
          case 504: // Gateway Timeout
            error.name = 'ServerError';
            break;
          default:
            error.name = 'ApiError';
        }
        
        if (this.shouldRetry(response.status) && retryCount < this.maxRetries) {
          console.warn(`Retrying ${config.method} request to ${url} - attempt ${retryCount + 1}/${this.maxRetries}`);
          await this.delay(this.retryDelay * Math.pow(2, retryCount));
          return this.fetchWithRetry<T>(url, config, retryCount + 1);
        }
        
        throw error;
      }
      
      return this.parseResponseData(response);
    } catch (error: any) {
      // Enhance error object with additional information
      if (error instanceof Error) {
        Object.assign(error, {
          isNetworkError: this.isNetworkError(error),
          isApiError: false,
          url: url,
          method: config.method,
          timestamp: new Date().toISOString(),
          retryCount
        });
      }

      // Handle CORS errors specifically
      if (error.message && error.message.includes('CORS')) {
        console.error('CORS error detected:', error);
        error.name = 'CORSError';
        
        // Try using a CORS proxy if this is the first attempt
        if (retryCount === 0) {
          console.warn('Attempting to use CORS proxy for request');
          const corsProxyUrl = `https://corsproxy.io/?${encodeURIComponent(url)}`;
          return this.fetchWithRetry<T>(corsProxyUrl, config, retryCount + 1);
        }
      }
      
      // Handle Timeout
      if (error.name === 'AbortError') {
        error.name = 'TimeoutError';
        error.message = `Request timed out after 30 seconds: ${url}`;
      }
      
      if (retryCount < this.maxRetries && this.isNetworkError(error)) {
        console.warn(`Retrying request due to network error - attempt ${retryCount + 1}/${this.maxRetries}`);
        await this.delay(this.retryDelay * Math.pow(2, retryCount));
        return this.fetchWithRetry<T>(url, config, retryCount + 1);
      }
      
      throw error;
    }
  }

  private async parseResponseData(response: Response): Promise<any> {
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    return response.text();
  }

  private isNetworkError(error: any): boolean {
    // Check for offline status or network-related errors
    return !window.navigator.onLine || 
           error instanceof TypeError || 
           (error.message && (
             error.message.includes('NetworkError') || 
             error.message.includes('Failed to fetch') ||
             error.message.includes('Network request failed') ||
             error.message.includes('timeout')
           ));
  }

  private shouldRetry(status: number): boolean {
    // Retry on specific HTTP status codes
    const retryStatuses = [408, 429, 500, 502, 503, 504];
    return retryStatuses.includes(status);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
