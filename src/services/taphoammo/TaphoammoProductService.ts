
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { TaphoammoApiClient, TaphoammoApiOptions } from './TaphoammoApiClient';
import { TaphoammoError, TaphoammoErrorCodes } from '@/types/taphoammo-errors';
import { ProxyType } from '@/utils/corsProxy';

export interface TaphoammoProduct {
  kiosk_token: string;
  name: string;
  stock_quantity: number;
  price: number;
  description?: string;
  slug?: string;
  sku?: string;
}

/**
 * Service for handling Taphoammo product operations
 */
export class TaphoammoProductService {
  private apiClient: TaphoammoApiClient;
  
  constructor() {
    this.apiClient = new TaphoammoApiClient();
  }
  
  /**
   * Get stock information for a product
   */
  public async getStock(
    kioskToken: string, 
    options: TaphoammoApiOptions = {}
  ): Promise<TaphoammoProduct> {
    try {
      const response = await this.apiClient.executeApiCall<any>(
        'get_product', 
        { kiosk_token: kioskToken },
        options
      );
      
      let product: TaphoammoProduct;
      
      // Handle different response formats
      if (response.data.product) {
        // New API format
        product = response.data.product;
      } else {
        // Old API format or direct response
        product = {
          kiosk_token: kioskToken,
          name: response.data.name || 'Unknown Product',
          stock_quantity: Number(response.data.stock || response.data.stock_quantity) || 0,
          price: Number(response.data.price) || 0
        };
      }
      
      // Log API call to database for monitoring
      await this.logApiCall('getStock', {
        kioskToken,
        result: {
          cached: response.source === 'cache',
          name: product.name,
          stock: product.stock_quantity,
          source: response.source || 'api'
        }
      });
      
      return product;
    } catch (error) {
      console.error('[TaphoammoProductService] getStock error:', error);
      
      // Rethrow as TaphoammoError if it isn't one already
      if (!(error instanceof TaphoammoError)) {
        throw new TaphoammoError(
          error instanceof Error ? error.message : 'Unknown error getting stock',
          TaphoammoErrorCodes.UNEXPECTED_RESPONSE,
          0,
          0
        );
      }
      
      throw error;
    }
  }
  
  /**
   * Check if kiosk is active and available
   */
  public async checkKioskActive(kioskToken: string, proxyType: ProxyType = 'allorigins'): Promise<boolean> {
    try {
      const stockInfo = await this.getStock(kioskToken, {
        forceRefresh: true, // Always get fresh data for active check
        proxyType: proxyType,
        useCache: false
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
   * Test connection to the API
   */
  public async testConnection(kioskToken: string, proxyType: ProxyType = 'allorigins'): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const response = await supabase.functions.invoke('taphoammo-api', {
        body: {
          action: 'test_connection',
          kiosk_token: kioskToken,
          proxy_type: proxyType
        }
      });

      if (response.error) {
        return {
          success: false,
          message: `Lỗi kết nối API: ${response.error.message}`
        };
      }

      return response.data;
    } catch (err) {
      console.error('Test connection error:', err);
      return {
        success: false,
        message: err instanceof Error ? err.message : 'Lỗi không xác định khi kiểm tra kết nối'
      };
    }
  }
  
  /**
   * Clear API cache
   */
  public clearCache(): void {
    this.apiClient.clearCache();
    toast.success('Đã xóa cache API thành công');
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
