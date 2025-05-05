
import { BaseApiClient } from './baseClient';
import { TaphoammoError, TaphoammoErrorCodes } from '@/types/taphoammo-errors';
import { supabase } from '@/integrations/supabase/client';

export class StockApi extends BaseApiClient {
  async getStock(kioskToken: string, options = {}) {
    try {
      const { data, error } = await supabase.functions.invoke('taphoammo-api', {
        body: {
          action: 'getStock',
          kioskToken,
          ...options
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (!data.success) {
        throw new TaphoammoError(
          data.message || 'Failed to get stock information',
          TaphoammoErrorCodes.UNEXPECTED_RESPONSE
        );
      }
      
      return {
        kiosk_token: kioskToken,
        name: data.name || 'Unknown Product',
        stock_quantity: data.stock_quantity || 0,
        price: data.price || 0,
      };
    } catch (error) {
      console.error("Error in getStock:", error);
      throw error;
    }
  }
  
  async getStockWithCache(kioskToken: string, options = {}) {
    try {
      const { data, error } = await supabase.functions.invoke('taphoammo-api', {
        body: {
          action: 'getStockWithCache',
          kioskToken,
          ...options
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      return {
        kiosk_token: kioskToken,
        name: data.name || 'Unknown Product',
        stock_quantity: data.stock_quantity || 0,
        price: data.price || 0,
        cached: data.cached || false
      };
    } catch (error) {
      console.error("Error in getStockWithCache:", error);
      throw error;
    }
  }
}

export const stockApi = new StockApi();
