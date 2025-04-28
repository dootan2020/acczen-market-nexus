
import { supabase } from '@/integrations/supabase/client';
import { TaphoammoError, TaphoammoErrorCodes } from '@/types/taphoammo-errors';
import { ApiService, ApiOptions } from './api/ApiService';

export interface TaphoammoProduct {
  kiosk_token: string;
  name: string;
  stock_quantity: number;
  price: number;
}

export class TaphoammoApiService {
  private apiService: ApiService;
  
  constructor() {
    this.apiService = ApiService.getInstance();
  }
  
  /**
   * Get stock information for a product
   */
  public async getStock(
    kioskToken: string, 
    options: ApiOptions = {}
  ): Promise<TaphoammoProduct> {
    const { data, error, cached } = await this.apiService.callTaphoammoAPI<TaphoammoProduct>(
      'stock', 
      { kioskToken },
      options
    );
    
    if (error) {
      throw error;
    }
    
    if (!data) {
      throw new TaphoammoError(
        'Không nhận được dữ liệu từ API',
        TaphoammoErrorCodes.UNEXPECTED_RESPONSE,
        0,
        0
      );
    }
    
    // Log API call to database
    this.logApiCall('getStock', {
      kioskToken,
      result: {
        cached: !!cached,
        name: data.name,
        stock: data.stock_quantity
      }
    });
    
    return data;
  }
  
  /**
   * Check if kiosk is active and available
   */
  public async checkKioskActive(kioskToken: string): Promise<boolean> {
    try {
      const stockInfo = await this.getStock(kioskToken, {
        forceRefresh: true // Always get fresh data for active check
      });
      
      // Check quantity and ensure kiosk is operational
      if (!stockInfo || stockInfo.stock_quantity <= 0) {
        return false;
      }
      return true;
    } catch (err: any) {
      // Check if error is due to kiosk unavailability
      if (err instanceof TaphoammoError) {
        if (err.code === TaphoammoErrorCodes.API_TEMP_DOWN || 
            err.code === TaphoammoErrorCodes.KIOSK_PENDING) {
          return false;
        }
      }

      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      // Check if error is related to pending kiosk
      if (errorMessage.includes('Kiosk is pending') || 
          errorMessage.includes('tạm thời không khả dụng') ||
          errorMessage.includes('pending')) {
        return false;
      }
      
      console.error("Lỗi kiểm tra kiosk:", err);
      throw err;
    }
  }
  
  /**
   * Buy products from the API
   */
  public async buyProducts(
    kioskToken: string, 
    quantity: number = 1, 
    userToken: string = 'system',
    promotion?: string
  ): Promise<any> {
    const { data, error } = await this.apiService.callTaphoammoAPI(
      'buyProducts', 
      { 
        kioskToken, 
        userToken, 
        quantity,
        promotion
      },
      {
        useCache: false, // Never cache purchase requests
        maxRetries: 1 // Lower retry count for purchases to avoid duplicate orders
      }
    );
    
    if (error) {
      throw error;
    }
    
    if (!data) {
      throw new TaphoammoError(
        'Không nhận được dữ liệu từ API',
        TaphoammoErrorCodes.UNEXPECTED_RESPONSE,
        0,
        0
      );
    }
    
    // Fix: Add type assertion to data
    const responseData = data as { order_id?: string };
    
    this.logApiCall('buyProducts', {
      kioskToken,
      quantity,
      order_id: responseData.order_id
    });
    
    return data;
  }
  
  /**
   * Get products information from an order
   */
  public async getProducts(
    orderId: string, 
    userToken: string = 'system'
  ): Promise<any> {
    const { data, error } = await this.apiService.callTaphoammoAPI(
      'getProducts', 
      { 
        orderId,
        userToken 
      }
    );
    
    if (error) {
      throw error;
    }
    
    if (!data) {
      throw new TaphoammoError(
        'Không nhận được dữ liệu từ API',
        TaphoammoErrorCodes.UNEXPECTED_RESPONSE,
        0,
        0
      );
    }
    
    this.logApiCall('getProducts', {
      orderId,
      result: data
    });
    
    return data;
  }
  
  /**
   * Log API calls to the database for monitoring and debugging
   */
  private async logApiCall(endpoint: string, details: any): Promise<void> {
    try {
      await supabase.from('api_logs').insert({
        api: 'taphoammo',
        endpoint,
        status: 'success',
        details
      });
    } catch (err) {
      console.error('Error logging API call:', err);
    }
  }
}

// Export singleton instance
export const taphoammoApiService = new TaphoammoApiService();
