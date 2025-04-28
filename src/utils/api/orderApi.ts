
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
      
      // Use Supabase Edge Function instead of direct API call
      const { data, error } = await this.callEdgeFunction('taphoammo-api', {
        endpoint: 'buyProducts',
        ...params
      });
      
      if (error) {
        throw new Error(error.message || 'API request failed');
      }
      
      return data;
    } catch (error) {
      console.error('[TaphoaMMO API] Error buying products:', error);
      throw error;
    }
  }

  async getProducts(orderId: string, userToken: string = SYSTEM_TOKEN): Promise<ProductsResponse> {
    try {
      // Always use SYSTEM_TOKEN regardless of provided userToken
      // Use Supabase Edge Function instead of direct API call
      const { data, error } = await this.callEdgeFunction('taphoammo-api', {
        endpoint: 'getProducts',
        orderId,
        userToken: SYSTEM_TOKEN
      });
      
      if (error) {
        throw new Error(error.message || 'API request failed');
      }
      
      return data;
    } catch (error) {
      console.error('[TaphoaMMO API] Error getting products:', error);
      throw error;
    }
  }

  async checkOrderUntilComplete(
    orderId: string, 
    maxTries: number = 5,
    delay: number = 2000
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
        
        // Nếu đơn hàng đã hoàn thành và có dữ liệu
        if (result.success === "true" && result.data && result.data.length > 0) {
          return {
            success: true,
            product_keys: result.data.map(item => item.product),
            data: result.data
          };
        }
        
        // Nếu đơn hàng vẫn đang xử lý
        if (result.success === "false" && result.description === "Order in processing!") {
          tries++;
          
          if (tries >= maxTries) {
            return {
              success: false,
              message: `Đơn hàng vẫn đang xử lý sau ${maxTries} lần thử`
            };
          }
          
          // Chờ một khoảng thời gian trước khi thử lại
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
        
        return {
          success: result.success === "true",
          message: result.description || "Đã kiểm tra trạng thái đơn hàng",
          data: result.data || []
        };
        
      } catch (error: any) {
        tries++;
        
        if (tries >= maxTries) {
          return {
            success: false,
            message: error.message || `Không thể kiểm tra đơn hàng sau ${maxTries} lần thử`
          };
        }
        
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    return {
      success: false,
      message: "Không thể kiểm tra trạng thái đơn hàng"
    };
  }
}

export const orderApi = new OrderApi();
