
import { orderApi } from './orderApi';
import { stockApi } from './stockApi';
import { SYSTEM_TOKEN } from './config';
import type { ProxyType } from '@/utils/corsProxy';
import { TaphoammoError, TaphoammoErrorCodes } from '@/types/taphoammo-errors';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

// Define response interface to fix TypeScript errors
interface TaphoammoApiResponse {
  success: boolean;
  message: string;
  [key: string]: any; // Allow for other properties
}

class TaphoammoApiClient {
  public readonly stock = stockApi;
  public readonly order = orderApi;

  async testConnection(
    kioskToken: string, 
    proxyType?: ProxyType
  ): Promise<{ success: boolean; message: string }> {
    try {
      console.log(`Testing connection for kiosk token: ${kioskToken}`);
      
      const { data, error } = await supabase.functions.invoke('taphoammo-api', {
        body: {
          action: 'test_connection',
          kioskToken,
          proxy_type: proxyType
        }
      });
      
      if (error) {
        console.error(`Connection test error:`, error);
        throw new Error(error.message);
      }
      
      console.log(`Connection test result:`, data);
      
      return {
        success: data.success,
        message: data.message
      };
    } catch (err: any) {
      console.error(`Connection test exception:`, err);
      return { 
        success: false, 
        message: err instanceof Error ? err.message : 'Unknown error' 
      };
    }
  }
  
  async checkKioskActive(kioskToken: string): Promise<boolean> {
    try {
      console.log(`Checking if kiosk is active: ${kioskToken}`);
      
      const { data, error } = await supabase.functions.invoke('taphoammo-api', {
        body: {
          action: 'check_kiosk_active',
          kioskToken,
          debug: true  // Add debug flag
        }
      });
      
      if (error) {
        console.error(`Kiosk check error:`, error);
        throw new Error(error.message);
      }
      
      console.log(`Kiosk check result:`, data);
      
      return data.active;
    } catch (err: any) {
      // Specific error checking
      if (err instanceof TaphoammoError) {
        if (err.code === TaphoammoErrorCodes.API_TEMP_DOWN || 
            err.code === TaphoammoErrorCodes.KIOSK_PENDING) {
          return false;
        }
      }

      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error(`Kiosk check exception:`, errorMessage);
      
      // Additional error message checking
      if (errorMessage.includes('Kiosk is pending') || 
          errorMessage.includes('tạm thời không khả dụng') ||
          errorMessage.includes('pending')) {
        return false;
      }
      
      console.error("Error checking kiosk:", err);
      throw err;
    }
  }
  
  // Direct method to sync inventory for a specific product
  async syncProductInventory(
    productId: string,
    kioskToken: string,
    forceRefresh: boolean = false
  ): Promise<{
    success: boolean;
    message: string;
    data?: any;
  }> {
    try {
      console.log(`Syncing inventory for product ${productId} with token ${kioskToken}`);
      
      const { data, error } = await supabase.functions.invoke('sync-inventory', {
        body: {
          product_id: productId,
          kiosk_token: kioskToken,
          force_refresh: forceRefresh
        }
      });
      
      if (error) {
        console.error(`Sync inventory error:`, error);
        throw new Error(error.message);
      }
      
      console.log(`Sync inventory result:`, data);
      
      return {
        success: data.success !== false,
        message: data.message || 'Inventory synced successfully',
        data: data
      };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error(`Sync inventory exception:`, errorMessage);
      
      return {
        success: false,
        message: errorMessage
      };
    }
  }
  
  // Method to directly call our edge function
  async fetchTaphoammo<T>(
    endpoint: string, 
    params: Record<string, any> = {}, 
    forceFresh: boolean = false
  ): Promise<T> {
    try {
      console.log(`Fetching from Taphoammo endpoint ${endpoint} with params`, params);
      
      const { data, error } = await supabase.functions.invoke('taphoammo-api', {
        body: {
          action: endpoint,
          force_fresh: forceFresh,
          debug: true,  // Add debug flag
          ...params
        }
      });
      
      if (error) {
        console.error(`Taphoammo API error:`, error);
        throw new Error(error.message);
      }
      
      console.log(`Taphoammo API result:`, data);
      
      return data as T;
    } catch (err) {
      console.error(`Error in fetchTaphoammo (${endpoint}):`, err);
      throw err;
    }
  }
}

export const taphoammoApi = new TaphoammoApiClient();
