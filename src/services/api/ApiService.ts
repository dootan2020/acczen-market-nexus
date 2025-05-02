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
    };

    if (data) {
      config.body = JSON.stringify(data);
    }

    return this.fetchWithRetry<T>(url, config);
  }

  private async fetchWithRetry<T>(url: string, config: RequestInit, retryCount = 0): Promise<T> {
    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await this.parseResponseData(response);
        
        if (this.shouldRetry(response.status) && retryCount < this.maxRetries) {
          await this.delay(this.retryDelay * Math.pow(2, retryCount));
          return this.fetchWithRetry<T>(url, config, retryCount + 1);
        }
        
        throw new Error(
          JSON.stringify({
            status: response.status,
            statusText: response.statusText,
            data: errorData,
          })
        );
      }
      
      return this.parseResponseData(response);
    } catch (error) {
      if (retryCount < this.maxRetries && this.isNetworkError(error)) {
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
    return !window.navigator.onLine || error instanceof TypeError;
  }

  private shouldRetry(status: number): boolean {
    // Convert string 'true' to boolean true for comparison
    const retryStatuses = [408, 429, 500, 502, 503, 504];
    return retryStatuses.includes(status);
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
