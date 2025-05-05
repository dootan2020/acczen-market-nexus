
import { orderApi } from './orderApi';
import { stockApi } from './stockApi';
import { SYSTEM_TOKEN } from './config';
import type { ProxyType } from '@/utils/corsProxy';
import { TaphoammoError, TaphoammoErrorCodes } from '@/types/taphoammo-errors';
import { supabase } from '@/integrations/supabase/client';

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
      const { data, error } = await supabase.functions.invoke('taphoammo-api', {
        body: {
          action: 'test_connection',
          kioskToken,
          proxy_type: proxyType
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      return {
        success: data.success,
        message: data.message
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
      const { data, error } = await supabase.functions.invoke('taphoammo-api', {
        body: {
          action: 'check_kiosk_active',
          kioskToken
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
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
  
  // Method to directly call our edge function
  async fetchTaphoammo<T>(
    endpoint: string, 
    params: Record<string, any> = {}, 
    forceFresh: boolean = false
  ): Promise<T> {
    try {
      const { data, error } = await supabase.functions.invoke('taphoammo-api', {
        body: {
          action: endpoint,
          force_fresh: forceFresh,
          ...params
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      return data as T;
    } catch (err) {
      console.error(`Error in fetchTaphoammo (${endpoint}):`, err);
      throw err;
    }
  }
}

export const taphoammoApi = new TaphoammoApiClient();
