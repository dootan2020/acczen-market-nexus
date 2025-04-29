
/**
 * Cache implementation for Taphoammo API responses
 */
export interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresAt: number;
}

export class TaphoammoApiCache {
  private cache: Map<string, CacheItem<any>>;
  private readonly DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
  
  constructor() {
    this.cache = new Map<string, CacheItem<any>>();
  }
  
  /**
   * Get item from cache
   */
  public get<T>(key: string): CacheItem<T> | null {
    // Check if key exists
    const item = this.cache.get(key);
    if (!item) {
      return null;
    }
    
    // Check if item is expired
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    
    return item as CacheItem<T>;
  }
  
  /**
   * Set item in cache
   */
  public set<T>(key: string, value: T, ttl: number = this.DEFAULT_TTL): void {
    this.cache.set(key, {
      data: value,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl
    });
  }
  
  /**
   * Clear entire cache
   */
  public clear(): void {
    this.cache.clear();
  }
  
  /**
   * Check if key exists in cache and is not expired
   */
  public has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) {
      return false;
    }
    
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }
}
