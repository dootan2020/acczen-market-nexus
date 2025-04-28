
import { supabase } from '@/integrations/supabase/client';

interface CacheResult<T> {
  cached: boolean;
  data?: T;
  timestamp?: string;
  cacheId?: string;
}

export class DatabaseCache {
  static async get<T>(key: string): Promise<CacheResult<T>> {
    try {
      const { data, error } = await supabase
        .from('product_cache')
        .select('*')
        .eq('kiosk_token', key)
        .single();
      
      if (error || !data) {
        return { cached: false };
      }
      
      // Check if cache is still valid (within 30 minutes)
      const cacheTime = new Date(data.updated_at).getTime();
      const currentTime = new Date().getTime();
      const expiryTime = 30 * 60 * 1000; // 30 minutes in milliseconds
      
      if (currentTime - cacheTime > expiryTime) {
        console.log(`[DatabaseCache] Cache expired for ${key}`);
        return { cached: false };
      }
      
      return { 
        cached: true, 
        data: data as unknown as T,
        timestamp: data.updated_at,
        cacheId: key
      };
    } catch (error) {
      console.error(`[DatabaseCache] Error getting cache for ${key}:`, error);
      return { cached: false };
    }
  }

  static async set<T>(key: string, data: T, ttl?: number): Promise<void> {
    try {
      const cacheData = {
        kiosk_token: key,
        product_id: key,
        ...data,
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('product_cache')
        .upsert(cacheData, { 
          onConflict: 'kiosk_token',
          ignoreDuplicates: false
        });
      
      if (error) {
        console.error(`[DatabaseCache] Error setting cache for ${key}:`, error);
      }
    } catch (error) {
      console.error(`[DatabaseCache] Error setting cache for ${key}:`, error);
    }
  }

  static async invalidate(key: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('product_cache')
        .delete()
        .eq('kiosk_token', key);
      
      if (error) {
        console.error(`[DatabaseCache] Error invalidating cache for ${key}:`, error);
      }
    } catch (error) {
      console.error(`[DatabaseCache] Error invalidating cache for ${key}:`, error);
    }
  }

  static async clear(): Promise<void> {
    try {
      const { error } = await supabase
        .from('product_cache')
        .delete()
        .neq('kiosk_token', 'DO_NOT_MATCH_ANY_KEY');
        
      if (error) {
        console.error('[DatabaseCache] Error clearing cache:', error);
      }
    } catch (error) {
      console.error('[DatabaseCache] Error clearing cache:', error);
    }
  }
}
