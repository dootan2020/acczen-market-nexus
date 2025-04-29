
import { toast } from 'sonner';
import { TaphoammoApiClient, TaphoammoApiOptions } from './TaphoammoApiClient';
import { TaphoammoProductService } from './TaphoammoProductService';
import { TaphoammoError, TaphoammoErrorCodes } from '@/types/taphoammo-errors';
import { ProxyType } from '@/utils/corsProxy';
import { supabase } from '@/integrations/supabase/client';

/**
 * Service for handling Taphoammo order operations
 */
export class TaphoammoOrderService {
  private apiClient: TaphoammoApiClient;
  private productService: TaphoammoProductService;
  
  constructor() {
    this.apiClient = new TaphoammoApiClient();
    this.productService = new TaphoammoProductService();
  }
  
  /**
   * Buy products from the API
   */
  public async buyProducts(
    kioskToken: string, 
    quantity: number = 1, 
    userToken: string = 'system',
    promotion?: string,
    proxyType: ProxyType = 'allorigins'
  ): Promise<any> {
    try {
      // Always use fresh data for purchases
      const options: TaphoammoApiOptions = {
        proxyType,
        useCache: false,
        forceRefresh: true
      };
      
      const response = await this.apiClient.executeApiCall(
        'buyProducts', 
        { 
          kioskToken, 
          userToken, 
          quantity,
          promotion
        },
        options
      );
      
      // Log purchase for monitoring
      await this.logApiCall('buyProducts', {
        kioskToken,
        quantity,
        order_id: response.data.order_id
      });
      
      return response.data;
    } catch (error) {
      console.error('[TaphoammoOrderService] buyProducts error:', error);
      throw this.enhanceError(error, 'buying products');
    }
  }
  
  /**
   * Get products information from an order
   */
  public async getProducts(
    orderId: string, 
    userToken: string = 'system',
    proxyType: ProxyType = 'allorigins'
  ): Promise<any> {
    try {
      const options: TaphoammoApiOptions = {
        proxyType,
        useCache: true // OK to cache order details
      };
      
      const response = await this.apiClient.executeApiCall(
        'getProducts', 
        { 
          orderId,
          userToken
        },
        options
      );
      
      // Log for monitoring
      await this.logApiCall('getProducts', {
        orderId,
        result: response.data
      });
      
      return response.data;
    } catch (error) {
      console.error('[TaphoammoOrderService] getProducts error:', error);
      throw this.enhanceError(error, 'retrieving products');
    }
  }
  
  /**
   * Check if stock is available for purchase
   */
  public async checkStockAvailability(
    kioskToken: string, 
    quantity: number = 1,
    proxyType: ProxyType = 'allorigins'
  ): Promise<{
    available: boolean;
    message?: string;
    stockData?: any;
  }> {
    try {
      // First check if kiosk is active at all
      const isActive = await this.productService.checkKioskActive(kioskToken, proxyType);
      if (!isActive) {
        return {
          available: false,
          message: "Sản phẩm này tạm thời không khả dụng. Vui lòng thử lại sau hoặc chọn sản phẩm khác."
        };
      }
      
      // Then get stock data to check quantity
      const stockData = await this.productService.getStock(kioskToken, {
        proxyType,
        forceRefresh: true
      });
      
      const available = stockData.stock_quantity >= quantity;
      
      return {
        available,
        message: available ? 
          `Sản phẩm sẵn có (${stockData.stock_quantity} sản phẩm)` : 
          `Không đủ số lượng trong kho (yêu cầu: ${quantity}, có sẵn: ${stockData.stock_quantity})`,
        stockData
      };
    } catch (error) {
      console.error('[TaphoammoOrderService] checkStockAvailability error:', error);
      
      if (error instanceof TaphoammoError) {
        return {
          available: false,
          message: error.message
        };
      }
      
      return {
        available: false,
        message: "Không thể kiểm tra tồn kho: " + (error instanceof Error ? error.message : 'Lỗi không xác định')
      };
    }
  }
  
  /**
   * Enhance error with additional context for better error messages
   */
  private enhanceError(error: any, operation: string): Error {
    if (error instanceof TaphoammoError) {
      return error;
    }
    
    return new TaphoammoError(
      `Lỗi khi ${operation}: ${error.message || 'Unknown error'}`,
      TaphoammoErrorCodes.UNEXPECTED_RESPONSE,
      0,
      0
    );
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
