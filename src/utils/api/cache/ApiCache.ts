
type CacheItem<T> = {
  data: T;
  expiry: number;
};

export class ApiCache {
  private static memoryCache: Map<string, CacheItem<any>> = new Map();

  static get<T>(key: string): T | null {
    const item = this.memoryCache.get(key);
    const now = Date.now();
    
    if (item && item.expiry > now) {
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Cache] Hit for ${key}`);
      }
      return item.data;
    }
    
    return null;
  }

  static set<T>(key: string, data: T, ttl: number): void {
    this.memoryCache.set(key, {
      data,
      expiry: Date.now() + ttl
    });
  }

  static clear(): void {
    this.memoryCache.clear();
  }
}
