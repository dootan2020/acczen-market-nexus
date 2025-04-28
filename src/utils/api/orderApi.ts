
import { BaseApiClient } from './baseClient';
import { SYSTEM_TOKEN, OrderResponse, ProductsResponse } from './config';

export class OrderApi extends BaseApiClient {
  async buyProducts(
    kioskToken: string, 
    quantity: number, 
    userToken: string = SYSTEM_TOKEN, 
    promotion?: string
  ): Promise<OrderResponse> {
    try {
      // Always use SYSTEM_TOKEN regardless of provided userToken
      const params: Record<string, string | number> = {
        kioskToken,
        userToken: SYSTEM_TOKEN, // Luôn sử dụng token cố định
        quantity
      };
      
      if (promotion) {
        params.promotion = promotion;
      }
      
      return await this.callApi('buyProducts', params);
    } catch (error) {
      console.error('[TaphoaMMO API] Error buying products:', error);
      throw error;
    }
  }

  async getProducts(orderId: string, userToken: string = SYSTEM_TOKEN): Promise<ProductsResponse> {
    try {
      // Always use SYSTEM_TOKEN regardless of provided userToken
      return await this.callApi('getProducts', { 
        orderId, 
        userToken: SYSTEM_TOKEN // Luôn sử dụng token cố định
      });
    } catch (error) {
      console.error('[TaphoaMMO API] Error getting products:', error);
      throw error;
    }
  }

  async checkOrderUntilComplete(
    orderId: string, 
    maxTries: number = 3
  ): Promise<{
    success: boolean;
    product_keys?: string[];
    message?: string;
    data?: any[];
  }> {
    let tries = 0;
    
    while (tries < maxTries) {
      try {
        const result = await this.getProducts(orderId);
        
        if (result.success === "true" && result.data && result.data.length > 0) {
          return {
            success: true,
            product_keys: result.data.map(item => item.product),
            data: result.data
          };
        }
        
        if (result.success === "false" && result.description === "Order in processing!") {
          tries++;
          
          if (tries >= maxTries) {
            return {
              success: false,
              message: `Order still processing after ${maxTries} attempts`
            };
          }
          
          await new Promise(resolve => setTimeout(resolve, 2000));
          continue;
        }
        
        return {
          success: result.success === "true",
          message: result.description || "Order status checked",
          data: result.data || []
        };
        
      } catch (error: any) {
        tries++;
        
        if (tries >= maxTries) {
          return {
            success: false,
            message: error.message || `Could not check order after ${maxTries} attempts`
          };
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    return {
      success: false,
      message: "Could not check order status"
    };
  }
}

export const orderApi = new OrderApi();
