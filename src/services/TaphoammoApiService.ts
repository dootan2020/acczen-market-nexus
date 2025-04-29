
import { toast } from 'sonner';

/**
 * Mock implementation of the TaphoammoApiService
 * This is a placeholder for future implementation
 */
export class TaphoammoApiService {
  private static instance: TaphoammoApiService;
  
  private constructor() {
    // Empty constructor
  }
  
  /**
   * Get singleton instance
   */
  public static getInstance(): TaphoammoApiService {
    if (!this.instance) {
      this.instance = new TaphoammoApiService();
    }
    return this.instance;
  }
  
  /**
   * Mock product stock check
   * // TODO: Implement new API logic
   */
  public getStock = async (kioskToken: string, options: any = {}): Promise<any> => {
    console.log('Mock getStock called with token:', kioskToken);
    return Promise.reject(new Error('API integration has been removed'));
  };
  
  /**
   * Mock kiosk check
   * // TODO: Implement new API logic
   */
  public checkKioskActive = async (kioskToken: string): Promise<any> => {
    console.log('Mock checkKioskActive called with token:', kioskToken);
    return Promise.reject(new Error('API integration has been removed'));
  }; 
  
  /**
   * Mock connection test
   * // TODO: Implement new API logic
   */
  public testConnection = async (kioskToken: string, proxyType: string): Promise<any> => {
    console.log('Mock testConnection called with token:', kioskToken, 'proxy:', proxyType);
    return Promise.reject(new Error('API integration has been removed'));
  };
  
  /**
   * Mock product purchase
   * // TODO: Implement new API logic
   */
  public buyProducts = async (kioskToken: string, quantity: number = 1): Promise<any> => {
    console.log('Mock buyProducts called with token:', kioskToken, 'quantity:', quantity);
    return Promise.reject(new Error('API integration has been removed'));
  };
  
  /**
   * Mock get products
   * // TODO: Implement new API logic
   */
  public getProducts = async (orderId: string): Promise<any> => {
    console.log('Mock getProducts called with orderId:', orderId);
    return Promise.reject(new Error('API integration has been removed'));
  };
  
  /**
   * Mock stock availability check
   * // TODO: Implement new API logic
   */
  public checkStockAvailability = async (kioskToken: string, quantity: number = 1): Promise<any> => {
    console.log('Mock checkStockAvailability called with token:', kioskToken, 'quantity:', quantity);
    return Promise.reject(new Error('API integration has been removed'));
  };
  
  /**
   * Mock cache clearing
   */
  public clearCache(): void {
    toast.success('Cache cleared (mock implementation)');
  }
}

// Export singleton instance
export const taphoammoApiService = TaphoammoApiService.getInstance();

// Export type definitions to maintain API compatibility
export interface TaphoammoProduct {
  name: string;
  description?: string;
  price: number;
  stock_quantity: number;
  slug?: string;
  sku?: string;
  kiosk_token?: string;
}

export interface TaphoammoApiOptions {
  proxyType?: string;
  forceRefresh?: boolean;
  useCache?: boolean;
  useMockData?: boolean;
}
