
import { stockApi } from './stockApi';
import { orderApi } from './orderApi';
import { SYSTEM_TOKEN } from './config';
import type { ProxyType } from '@/utils/corsProxy';
import { TaphoammoError, TaphoammoErrorCodes } from '@/types/taphoammo-errors';

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
      // Kiểm tra xem lỗi có phải là do kiosk pending không
      if (err instanceof TaphoammoError && err.code === TaphoammoErrorCodes.API_TEMP_DOWN) {
        return false;
      }

      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      // Kiểm tra nếu lỗi liên quan đến kiosk pending
      if (errorMessage.includes('Kiosk is pending') || 
          errorMessage.includes('tạm thời không khả dụng') ||
          errorMessage.includes('pending')) {
        return false;
      }
      
      // Ném lại lỗi nếu không phải do kiosk pending
      throw err;
    }
  }
}

export const taphoammoApi = new TaphoammoApiClient();
