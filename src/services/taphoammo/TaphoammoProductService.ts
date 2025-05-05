
import { TaphoammoApiClient, TaphoammoApiOptions } from './TaphoammoApiClient';
import { TaphoammoError, TaphoammoErrorCodes } from '@/types/taphoammo-errors';
import { ProxyType } from '@/utils/corsProxy';

// Define product interface
export interface TaphoammoProduct {
  kiosk_token: string;
  name: string;
  stock_quantity: number;
  price: number;
  description?: string;
  cached?: boolean;
  cacheTimestamp?: number;
}

/**
 * Product service for Taphoammo API
 * Handles all product-related operations
 */
export class TaphoammoProductService {
  private apiClient: TaphoammoApiClient;
  
  constructor(apiClient?: TaphoammoApiClient) {
    this.apiClient = apiClient || new TaphoammoApiClient();
  }
  
  /**
   * Get stock information for a product
   */
  public async getStock(
    kioskToken: string,
    options: TaphoammoApiOptions = {}
  ): Promise<TaphoammoProduct> {
    try {
      const response = await this.apiClient.executeApiCall(
        'getStock',
        { kioskToken },
        options
      );
      
      const data = response.data;
      
      // Extract stock information from response
      // The API returns data in a specific format that needs parsing
      const stockInfo: TaphoammoProduct = {
        kiosk_token: kioskToken,
        name: this.extractProductName(data),
        stock_quantity: this.extractStockQuantity(data),
        price: 0, // The getStock endpoint doesn't return price information
        cached: response.source === 'cache',
        cacheTimestamp: response.source === 'cache' ? response.timestamp : undefined
      };
      
      return stockInfo;
    } catch (error) {
      // Re-throw TaphoammoError as-is
      if (error instanceof TaphoammoError) {
        throw error;
      }
      
      // Wrap other errors
      throw new TaphoammoError(
        `Error getting stock for ${kioskToken}: ${error instanceof Error ? error.message : 'Unknown error'}`,
        TaphoammoErrorCodes.UNEXPECTED_RESPONSE
      );
    }
  }
  
  /**
   * Test connection to Taphoammo API
   */
  public async testConnection(
    kioskToken: string,
    proxyType: ProxyType = 'allorigins'
  ): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const stockInfo = await this.getStock(kioskToken, { 
        proxyType, 
        forceRefresh: true
      });
      
      return {
        success: true,
        message: `Connection successful. Product: ${stockInfo.name} (Stock: ${stockInfo.stock_quantity})`
      };
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Check if a kiosk is active
   */
  public async checkKioskActive(
    kioskToken: string,
    proxyType: ProxyType = 'allorigins'
  ): Promise<boolean> {
    try {
      const stockInfo = await this.getStock(kioskToken, { proxyType });
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
  }
  
  /**
   * Extract product name from API response
   */
  private extractProductName(data: any): string {
    // Try to extract from different response formats
    if (data.name) {
      return data.name;
    }
    
    if (data.message && typeof data.message === 'string') {
      // Format: "Found: Product Name (Stock: 10)"
      const match = data.message.match(/Found: ([^(]+)/);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
    
    return 'Unknown Product';
  }
  
  /**
   * Extract stock quantity from API response
   */
  private extractStockQuantity(data: any): number {
    // Try to extract from different response formats
    if (data.stock_quantity !== undefined) {
      return parseInt(data.stock_quantity.toString());
    }
    
    if (data.stock !== undefined) {
      return parseInt(data.stock.toString());
    }
    
    if (data.message && typeof data.message === 'string') {
      // Format: "Found: Product Name (Stock: 10)"
      const match = data.message.match(/Stock: (\d+)/);
      if (match && match[1]) {
        return parseInt(match[1]);
      }
    }
    
    return 0;
  }
}
