
import { orderApi } from './orderApi';
import { SYSTEM_TOKEN } from './config';
import type { ProxyType } from '@/utils/corsProxy';
import { TaphoammoError, TaphoammoErrorCodes } from '@/types/taphoammo-errors';

// Define a stock API object
const stockApi = {
  getStock: async (kioskToken: string, options = {}) => {
    try {
      const data = await taphoammoApi.testConnection(kioskToken);
      if (!data.success) {
        throw new TaphoammoError(
          data.message || 'Failed to get stock information',
          TaphoammoErrorCodes.UNEXPECTED_RESPONSE,
          0,
          0
        );
      }
      
      // Return a minimal product structure that matches what's expected
      return {
        kiosk_token: kioskToken,
        name: data.message.split('Found: ')[1]?.split(' (Stock:')[0] || 'Unknown Product',
        stock_quantity: parseInt(data.message.split('Stock: ')[1]?.split(')')[0] || '0'),
        price: 0, // This would need to be populated from elsewhere if available
      };
    } catch (error) {
      console.error("Error in getStock:", error);
      throw error;
    }
  },
  
  getStockWithCache: async (kioskToken: string, options = {}) => {
    // Implementation that would use caching
    return await stockApi.getStock(kioskToken, options);
  }
};

class TaphoammoApiClient {
  public readonly stock = stockApi;
  public readonly order = orderApi;

  async testConnection(
    kioskToken: string, 
    proxyType?: ProxyType
  ): Promise<{ success: boolean; message: string }> {
    try {
      const data = await this.stock.getStock(kioskToken);
      return { 
        success: true, 
        message: `Connection successful - Found: ${data.name} (Stock: ${data.stock_quantity})` 
      };
    } catch (err: any) {
      return { 
        success: false, 
        message: err instanceof Error ? err.message : 'Unknown error' 
      };
    }
  }
  
  async checkKioskActive(kioskToken: string): Promise<boolean> {
    try {
      const stockInfo = await this.stock.getStock(kioskToken);
      // Kiểm tra số lượng và đảm bảo kiosk hoạt động
      if (!stockInfo || stockInfo.stock_quantity <= 0) {
        return false;
      }
      return true;
    } catch (err: any) {
      // Kiểm tra xem lỗi có phải là do kiosk không khả dụng không
      if (err instanceof TaphoammoError) {
        if (err.code === TaphoammoErrorCodes.API_TEMP_DOWN || 
            err.code === TaphoammoErrorCodes.KIOSK_PENDING) {
          return false;
        }
      }

      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      // Kiểm tra nếu lỗi liên quan đến kiosk pending
      if (errorMessage.includes('Kiosk is pending') || 
          errorMessage.includes('tạm thời không khả dụng') ||
          errorMessage.includes('pending')) {
        return false;
      }
      
      console.error("Lỗi kiểm tra kiosk:", err);
      // Nếu là lỗi khác, vẫn ném ra để gọi hàm xử lý
      throw err;
    }
  }
}

export const taphoammoApi = new TaphoammoApiClient();
