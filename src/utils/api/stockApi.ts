
import { BaseApiClient } from './baseClient';
import { SYSTEM_TOKEN, StockInfo } from './config';

export class StockApi extends BaseApiClient {
  async getStock(kioskToken: string): Promise<StockInfo> {
    try {
      // Always use SYSTEM_TOKEN
      const data = await this.callApi('getStock', { 
        kioskToken, 
        userToken: SYSTEM_TOKEN // Luôn sử dụng token cố định
      });
      
      return {
        kiosk_token: kioskToken,
        name: data.name || '',
        stock_quantity: data.stock ? parseInt(data.stock) : 0,
        price: data.price ? parseFloat(data.price) : 0
      };
    } catch (error) {
      console.error('[TaphoaMMO API] Error getting stock:', error);
      throw error;
    }
  }
}

export const stockApi = new StockApi();
