
type CacheItem<T> = {
  value: T;
  expiry: number;
};

export class ApiCache {
  private static cache: Map<string, CacheItem<any>> = new Map();

  static get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value;
  }

  static set<T>(key: string, value: T, ttl: number): void {
    const expiry = Date.now() + ttl;
    this.cache.set(key, { value, expiry });
  }

  static clear(): void {
    this.cache.clear();
  }

  static has(key: string): boolean {
    if (!this.cache.has(key)) return false;
    
    const item = this.cache.get(key);
    if (item && Date.now() > item.expiry) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }
}
