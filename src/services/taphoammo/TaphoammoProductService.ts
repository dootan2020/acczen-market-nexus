
import { TaphoammoApiClient } from './TaphoammoApiClient';
import { TaphoammoError, TaphoammoErrorCodes } from '@/types/taphoammo-errors';
import type { ProxyType } from '@/utils/corsProxy';

export interface TaphoammoProduct {
  kiosk_token: string;
  name: string;
  description?: string;
  stock_quantity: number;
  price: number;
  cached?: boolean;
  emergency?: boolean;
}

export class TaphoammoProductService {
  private apiClient: TaphoammoApiClient;
  
  constructor(apiClient: TaphoammoApiClient) {
    this.apiClient = apiClient;
  }
  
  /**
   * Get stock information for a product
   */
  public async getStock(
    kioskToken: string, 
    options: {
      forceRefresh?: boolean;
      proxyType?: ProxyType;
      useMockData?: boolean;
    } = {}
  ): Promise<TaphoammoProduct> {
    try {
      // If using mock data
      if (options.useMockData) {
        await new Promise(resolve => setTimeout(resolve, 800));
        return {
          kiosk_token: kioskToken,
          name: 'Mock Product ' + kioskToken.substring(0, 5),
          stock_quantity: Math.floor(Math.random() * 10) + 1,
          price: Math.floor(Math.random() * 50000) + 10000,
          cached: false
        };
      }
      
      // Check cache if not forcing refresh
      if (!options.forceRefresh) {
        const cachedProduct = this.apiClient.getCachedProduct(kioskToken);
        if (cachedProduct) {
          return {
            ...cachedProduct,
            cached: true
          };
        }
      }
      
      // Call API to get stock information
      const productData = await this.apiClient.callTaphoaMMO(
        'get_product_info',
        { 
          kioskToken,
          includePrice: true 
        },
        options.proxyType
      );
      
      if (!productData.success) {
        throw new TaphoammoError(
          productData.message || 'Failed to retrieve product information',
          TaphoammoErrorCodes.UNEXPECTED_RESPONSE
        );
      }
      
      // Parse and validate response
      const product: TaphoammoProduct = {
        kiosk_token: kioskToken,
        name: productData.name || 'Unknown Product',
        description: productData.description,
        stock_quantity: productData.stock || 0,
        price: productData.price || 0,
        cached: false
      };
      
      // Update cache
      this.apiClient.cacheProduct(kioskToken, product);
      
      return product;
    } catch (error) {
      console.error(`Error getting stock for ${kioskToken}:`, error);
      throw error;
    }
  }
  
  /**
   * Test connection to TaphoaMMO API
   */
  public async testConnection(
    kioskToken: string,
    proxyType: ProxyType
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const response = await this.apiClient.callTaphoaMMO(
        'ping',
        { kioskToken },
        proxyType
      );
      
      return {
        success: response.success === true,
        message: response.message || 'Connection successful'
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}
