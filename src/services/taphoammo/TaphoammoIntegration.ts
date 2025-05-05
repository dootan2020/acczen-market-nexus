
/**
 * This file serves as integration point for external systems
 * wanting to interact with Taphoammo API
 */
import { TaphoammoApiClient, TaphoammoApiOptions } from './TaphoammoApiClient';
import { TaphoammoProductService } from './TaphoammoProductService';
import { TaphoammoOrderService } from './TaphoammoOrderService';
import { TaphoammoError, TaphoammoErrorCodes } from '@/types/taphoammo-errors';
import { ProxyType } from '@/utils/corsProxy';

export class TaphoammoIntegration {
  private apiClient: TaphoammoApiClient;
  private productService: TaphoammoProductService;
  private orderService: TaphoammoOrderService;
  
  constructor() {
    this.apiClient = new TaphoammoApiClient();
    this.productService = new TaphoammoProductService(this.apiClient);
    this.orderService = new TaphoammoOrderService(this.apiClient);
  }
  
  /**
   * Utilities for admin functionality
   */
  public admin = {
    /**
     * Import products from Taphoammo into local database
     */
    importProducts: async (tokens: string[], options?: TaphoammoApiOptions) => {
      const products = [];
      
      for (const token of tokens) {
        try {
          const product = await this.productService.getStock(token, {
            forceRefresh: true,
            ...(options || {})
          });
          
          products.push({
            ...product,
            imported: true,
            status: 'success'
          });
        } catch (error) {
          console.error(`Error importing product ${token}:`, error);
          products.push({
            kiosk_token: token,
            name: 'Error',
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
            imported: false
          });
        }
      }
      
      return products;
    },
    
    /**
     * Clear API cache
     */
    clearCache: () => {
      this.apiClient.clearCache();
      return { success: true, message: 'Cache cleared successfully' };
    }
  };
  
  /**
   * Get stock information for a product
   */
  public getStock = async (kioskToken: string, options?: TaphoammoApiOptions) => {
    return await this.productService.getStock(kioskToken, options);
  };
  
  /**
   * Buy products from Taphoammo
   */
  public buyProducts = async (
    kioskToken: string,
    quantity: number = 1,
    userToken?: string,
    promotion?: string,
    proxyType: ProxyType = 'allorigins'
  ) => {
    return await this.orderService.buyProducts(kioskToken, quantity, userToken, promotion, proxyType);
  };
  
  /**
   * Get products from an order
   */
  public getProducts = async (
    orderId: string,
    userToken?: string,
    proxyType: ProxyType = 'allorigins'
  ) => {
    return await this.orderService.getProducts(orderId, userToken, proxyType);
  };
  
  /**
   * Check if a kiosk is active
   */
  public checkKioskActive = async (
    kioskToken: string,
    proxyType: ProxyType = 'allorigins'
  ) => {
    try {
      const stockInfo = await this.productService.getStock(kioskToken, { proxyType });
      return stockInfo && stockInfo.stock_quantity > 0;
    } catch (error) {
      if (error instanceof TaphoammoError) {
        if (error.code === TaphoammoErrorCodes.KIOSK_PENDING ||
            error.code === TaphoammoErrorCodes.API_TEMP_DOWN ||
            error.code === TaphoammoErrorCodes.STOCK_UNAVAILABLE) {
          return false;
        }
      }
      
      throw error;
    }
  };
  
  /**
   * Test API connection with different proxy options
   */
  public async testProxy(kioskToken: string, proxyType: ProxyType): Promise<{
    success: boolean;
    message: string;
    responseTime?: number;
  }> {
    const startTime = Date.now();
    
    try {
      const result = await this.productService.testConnection(kioskToken, proxyType);
      const responseTime = Date.now() - startTime;
      
      return {
        ...result,
        responseTime
      };
    } catch (error) {
      const responseTime = Date.now() - startTime;
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        responseTime
      };
    }
  }
  
  /**
   * Check stock availability
   */
  public checkStockAvailability = async (
    kioskToken: string,
    quantity: number = 1,
    proxyType: ProxyType = 'allorigins'
  ) => {
    return await this.orderService.checkStockAvailability(kioskToken, quantity, proxyType);
  };
  
  /**
   * Check order until complete or timeout
   */
  public checkOrderUntilComplete = async (
    orderId: string,
    userToken?: string,
    maxRetries: number = 5,
    delayMs: number = 2000,
    proxyType: ProxyType = 'allorigins'
  ) => {
    return await this.orderService.checkOrderUntilComplete(
      orderId, userToken, maxRetries, delayMs, proxyType
    );
  };
}

// Export common types
export type { TaphoammoApiOptions } from './TaphoammoApiClient';
export type { OrderResponse, ProductsResponse } from './TaphoammoOrderService';
