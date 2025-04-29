
/**
 * This file serves as integration point for external systems
 * wanting to interact with Taphoammo API
 */
import { TaphoammoApiClient, TaphoammoApiOptions } from './TaphoammoApiClient';
import { TaphoammoProductService } from './TaphoammoProductService';
import { TaphoammoOrderService } from './TaphoammoOrderService';

export class TaphoammoIntegration {
  private apiClient: TaphoammoApiClient;
  private productService: TaphoammoProductService;
  private orderService: TaphoammoOrderService;
  
  constructor() {
    this.apiClient = new TaphoammoApiClient();
    this.productService = new TaphoammoProductService();
    this.orderService = new TaphoammoOrderService();
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
    }
  };
  
  /**
   * Test API connection with different proxy options
   */
  public async testProxy(kioskToken: string, proxyType: string): Promise<{
    success: boolean;
    message: string;
    responseTime?: number;
  }> {
    const startTime = Date.now();
    
    try {
      const result = await this.productService.testConnection(kioskToken, proxyType as any);
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
}
