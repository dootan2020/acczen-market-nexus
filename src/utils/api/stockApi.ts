
import { BaseApiClient } from './baseClient';
import { SYSTEM_TOKEN, StockInfo } from './config';
import { ProxyType } from '@/utils/corsProxy';

export class StockApi extends BaseApiClient {
  async getStock(kioskToken: string, userToken: string = SYSTEM_TOKEN): Promise<StockInfo> {
    try {
      // Always use SYSTEM_TOKEN regardless of provided userToken
      const data = await this.callApi('getStock', { 
        kioskToken, 
        userToken: SYSTEM_TOKEN 
      });
      
      return {
        kiosk_token: kioskToken,
        name: data.name || '',
        stock_quantity: data.stock ? parseInt(data.stock) : 0,
        price: data.price ? parseFloat(data.price) : 0
      };
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[TaphoaMMO API] Error getting stock:', error);
      }
      throw error;
    }
  }
}

export const stockApi = new StockApi();
