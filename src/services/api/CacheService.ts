
import { supabase } from '@/integrations/supabase/client';

// In-memory cache for quick access
const memoryCache: Map<string, { 
  data: any; 
  expiresAt: number;
  createdAt: number;
}> = new Map();

export interface CacheOptions {
  ttl?: number;
  updateDb?: boolean;
}

export class CacheService {
  private defaultTTL = 60000; // 1 minute default TTL
  
  /**
   * Get data from cache, checking memory first then database
   */
  public async get<T>(key: string): Promise<T | null> {
    // First check in-memory cache
    const cachedItem = memoryCache.get(key);
    const now = Date.now();
    
    if (cachedItem && now < cachedItem.expiresAt) {
      return cachedItem.data as T;
    }
    
    // If not in memory or expired, check database
    try {
      const { data, error } = await supabase
        .from('product_cache')
        .select('*')
        .eq('product_id', key)
        .single();
      
      if (error || !data) {
        return null;
      }
      
      // Update memory cache with database data
      const expiresAt = now + this.defaultTTL; // Use default TTL for db items
      
      memoryCache.set(key, {
        data: data,
        expiresAt,
        createdAt: now
      });
      
      return data as T;
    } catch (err) {
      console.error('Error getting from database cache:', err);
      return null;
    }
  }

  /**
   * Store data in cache (both memory and database)
   */
  public async set<T>(key: string, data: T, ttl: number = this.defaultTTL): Promise<void> {
    const now = Date.now();
    const expiresAt = now + ttl;
    
    // Store in memory cache
    memoryCache.set(key, {
      data,
      expiresAt,
      createdAt: now
    });
    
    // Also store in database for persistence
    try {
      await supabase
        .from('product_cache')
        .upsert({
          product_id: key,
          kiosk_token: key,
          data,
          updated_at: new Date(now).toISOString()
        }, {
          onConflict: 'product_id'
        });
    } catch (err) {
      console.error('Error saving to database cache:', err);
    }
  }
  
  /**
   * Clear a specific item from the cache
   */
  public async invalidate(key: string): Promise<void> {
    // Remove from memory
    memoryCache.delete(key);
    
    // Remove from database
    try {
      await supabase
        .from('product_cache')
        .delete()
        .eq('product_id', key);
    } catch (err) {
      console.error('Error invalidating database cache:', err);
    }
  }
  
  /**
   * Clear all expired cache items (good for scheduled cleanup)
   */
  public async cleanupExpired(): Promise<void> {
    const now = Date.now();
    
    // Clean memory cache
    for (const [key, item] of memoryCache.entries()) {
      if (now > item.expiresAt) {
        memoryCache.delete(key);
      }
    }
    
    // We don't need to actively clean database cache as it will be
    // overwritten when new cache items are set
  }
}
