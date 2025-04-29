
import { ProxyType } from '@/utils/corsProxy';

/**
 * Product service for Taphoammo API
 * // TODO: Implement new API logic
 */
export class TaphoammoProductService {
  private apiClient: any;
  
  constructor() {
    this.apiClient = {};
  }
  
  /**
   * Get stock information for a kiosk token
   */
  public async getStock(
    kioskToken: string, 
    options: {
      forceRefresh?: boolean;
      proxyType?: ProxyType;
      useMockData?: boolean;
    } = {}
  ): Promise<TaphoammoProduct> {
    console.log('Mock getStock called, API integration has been removed');
    throw new Error('API integration has been removed');
  }
  
  /**
   * Check if a kiosk is active
   */
  public async checkKioskActive(
    kioskToken: string, 
    proxyType: ProxyType = 'allorigins'
  ): Promise<{
    active: boolean;
    message?: string;
  }> {
    console.log('Mock checkKioskActive called, API integration has been removed');
    throw new Error('API integration has been removed');
  }
  
  /**
   * Test connection to the API
   */
  public async testConnection(
    kioskToken: string,
    proxyType: ProxyType = 'allorigins'
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    console.log('Mock testConnection called, API integration has been removed');
    return {
      success: false,
      message: 'API integration has been removed'
    };
  }
}

/**
 * Interface for Taphoammo product data
 */
export interface TaphoammoProduct {
  id?: string;
  name: string;
  description?: string;
  price: number;
  stock_quantity: number;
  slug?: string;
  sku?: string;
  kiosk_token?: string;
}

