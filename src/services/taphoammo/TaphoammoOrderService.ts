import { TaphoammoApiClient, TaphoammoApiOptions } from './TaphoammoApiClient';
import { TaphoammoError, TaphoammoErrorCodes } from '@/types/taphoammo-errors';
import { ProxyType } from '@/utils/corsProxy';

// Define return type for buyProducts method
export interface OrderResponse {
  order_id: string;
  product_keys?: string[];
  success?: string;
  message?: string;
  description?: string;
  status?: string;
}

// Define return type for getProducts method
export interface ProductsResponse {
  success: string;
  data?: Array<{ id: string; product: string }>;
  message?: string;
  description?: string;
}

/**
 * Order service for Taphoammo API
 * Handles all order-related operations
 */
export class TaphoammoOrderService {
  private apiClient: TaphoammoApiClient;
  
  constructor(apiClient?: TaphoammoApiClient) {
    this.apiClient = apiClient || new TaphoammoApiClient();
  }
  
  /**
   * Buy products from Taphoammo
   */
  public async buyProducts(
    kioskToken: string,
    quantity: number = 1,
    userToken: string = '0LP8RN0I7TNX6ROUD3DUS1I3LUJTQUJ4IFK9',
    promotion?: string,
    proxyType: ProxyType = 'allorigins'
  ): Promise<OrderResponse> {
    try {
      const params: Record<string, any> = {
        kioskToken,
        userToken,
        quantity
      };
      
      if (promotion) {
        params.promotion = promotion;
      }
      
      const response = await this.apiClient.executeApiCall<OrderResponse>(
        'buyProducts',
        params,
        { proxyType, useCache: false }
      );
      
      return response.data;
    } catch (error) {
      // Re-throw TaphoammoError as-is
      if (error instanceof TaphoammoError) {
        throw error;
      }
      
      // Wrap other errors
      throw new TaphoammoError(
        `Error buying products: ${error instanceof Error ? error.message : 'Unknown error'}`,
        TaphoammoErrorCodes.UNEXPECTED_RESPONSE
      );
    }
  }
  
  /**
   * Get products from an order
   */
  public async getProducts(
    orderId: string,
    userToken: string = '0LP8RN0I7TNX6ROUD3DUS1I3LUJTQUJ4IFK9',
    proxyType: ProxyType = 'allorigins'
  ): Promise<ProductsResponse> {
    try {
      const response = await this.apiClient.executeApiCall<ProductsResponse>(
        'getProducts',
        { orderId, userToken },
        { proxyType, useCache: false }
      );
      
      return response.data;
    } catch (error) {
      // If order is processing, throw specific error
      if (error instanceof TaphoammoError && 
          error.code === TaphoammoErrorCodes.ORDER_PROCESSING) {
        throw error;
      }
      
      // Re-throw TaphoammoError as-is
      if (error instanceof TaphoammoError) {
        throw error;
      }
      
      // Wrap other errors
      throw new TaphoammoError(
        `Error getting products: ${error instanceof Error ? error.message : 'Unknown error'}`,
        TaphoammoErrorCodes.UNEXPECTED_RESPONSE
      );
    }
  }
  
  /**
   * Check order status and keep polling until products are available
   */
  public async checkOrderUntilComplete(
    orderId: string,
    userToken: string = '0LP8RN0I7TNX6ROUD3DUS1I3LUJTQUJ4IFK9',
    maxRetries: number = 5,
    delayMs: number = 2000,
    proxyType: ProxyType = 'allorigins'
  ): Promise<{
    success: boolean;
    product_keys?: string[];
    message?: string;
  }> {
    let attempt = 0;
    
    while (attempt < maxRetries) {
      try {
        const result = await this.getProducts(orderId, userToken, proxyType);
        
        // If we have product data, return success
        if (result.success === 'true' && result.data && result.data.length > 0) {
          return {
            success: true,
            product_keys: result.data.map(item => item.product)
          };
        }
        
        // If we're still processing, wait and retry
        if (result.success === 'false' && 
            result.description?.includes('Order in processing')) {
          attempt++;
          
          if (attempt >= maxRetries) {
            return {
              success: false,
              message: `Order still processing after ${maxRetries} attempts. Try again later.`
            };
          }
          
          // Wait before next attempt
          await new Promise(resolve => setTimeout(resolve, delayMs));
          continue;
        }
        
        // Any other scenario is a failure
        return {
          success: false,
          message: result.description || 'Failed to retrieve order products'
        };
        
      } catch (error) {
        attempt++;
        
        // If it's specifically an ORDER_PROCESSING error, wait and retry
        if (error instanceof TaphoammoError && 
            error.code === TaphoammoErrorCodes.ORDER_PROCESSING) {
          
          if (attempt >= maxRetries) {
            return {
              success: false,
              message: `Order still processing after ${maxRetries} attempts. Try again later.`
            };
          }
          
          // Wait before next attempt
          await new Promise(resolve => setTimeout(resolve, delayMs));
          continue;
        }
        
        // Other errors are immediate failures
        return {
          success: false,
          message: error instanceof Error ? error.message : 'Unknown error checking order'
        };
      }
    }
    
    return {
      success: false,
      message: 'Maximum retries exceeded when checking order status'
    };
  }
  
  /**
   * Check stock availability
   */
  public async checkStockAvailability(
    kioskToken: string,
    quantity: number = 1,
    proxyType: ProxyType = 'allorigins'
  ): Promise<{
    available: boolean;
    message?: string;
    stock?: number;
  }> {
    try {
      const response = await this.apiClient.executeApiCall(
        'getStock',
        { kioskToken },
        { proxyType }
      );
      
      const data = response.data;
      
      // Parse stock quantity
      const stockAvailable = parseInt(data.stock || '0');
      
      // Check if there is enough stock
      if (stockAvailable < quantity) {
        return {
          available: false,
          message: `Insufficient stock. Required: ${quantity}, Available: ${stockAvailable}`,
          stock: stockAvailable
        };
      }
      
      return {
        available: true,
        message: `Stock available: ${stockAvailable}`,
        stock: stockAvailable
      };
    } catch (error) {
      if (error instanceof TaphoammoError && 
          error.code === TaphoammoErrorCodes.STOCK_UNAVAILABLE) {
        return {
          available: false,
          message: 'Product is out of stock',
          stock: 0
        };
      }
      
      return {
        available: false,
        message: error instanceof Error ? error.message : 'Failed to check stock availability'
      };
    }
  }
}
