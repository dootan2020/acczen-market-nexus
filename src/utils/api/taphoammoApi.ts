
import { stockApi } from './stockApi';
import { orderApi } from './orderApi';
import { SYSTEM_TOKEN } from './config';
import type { ProxyType } from '@/utils/corsProxy';

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
}

export const taphoammoApi = new TaphoammoApiClient();
