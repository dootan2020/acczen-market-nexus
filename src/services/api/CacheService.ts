
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
        .from('cache_items')
        .select('data, expires_at')
        .eq('cache_key', key)
        .single();
      
      if (error || !data) {
        return null;
      }
      
      // Check if database cache is still valid
      const expiresAt = new Date(data.expires_at).getTime();
      
      if (now < expiresAt) {
        // Update memory cache with database data
        memoryCache.set(key, {
          data: data.data,
          expiresAt,
          createdAt: now
        });
        
        return data.data as T;
      }
      
      // Cache expired in database too
      return null;
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
        .from('cache_items')
        .upsert({
          cache_key: key,
          data,
          expires_at: new Date(expiresAt).toISOString(),
          created_at: new Date(now).toISOString()
        }, {
          onConflict: 'cache_key'
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
        .from('cache_items')
        .delete()
        .eq('cache_key', key);
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
    
    // Clean database cache
    try {
      await supabase
        .from('cache_items')
        .delete()
        .lt('expires_at', new Date(now).toISOString());
    } catch (err) {
      console.error('Error cleaning up database cache:', err);
    }
  }
}
