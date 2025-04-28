
import { supabase } from '@/integrations/supabase/client';

export class DatabaseCache {
  static async get(kioskToken: string): Promise<{
    cached: boolean;
    data?: {
      stock_quantity: number;
      price: number;
      name?: string;
    };
    cacheId?: string;
  }> {
    try {
      const { data: cache } = await supabase
        .from('inventory_cache')
        .select('*, products(name)')
        .eq('kiosk_token', kioskToken)
        .single();
      
      if (cache && new Date(cache.cached_until) > new Date()) {
        const productName = cache.products?.name || 'Sản phẩm';
        
        return {
          cached: true,
          data: {
            stock_quantity: cache.stock_quantity,
            price: cache.price,
            name: productName
          },
          cacheId: cache.id
        };
      }
      
      return { cached: false };
    } catch (error) {
      console.warn('Error checking database cache:', error);
      return { cached: false };
    }
  }

  static async set(kioskToken: string, data: any): Promise<void> {
    try {
      const { data: product } = await supabase
        .from('products')
        .select('id')
        .eq('kiosk_token', kioskToken)
        .single();
      
      const cacheExpiry = new Date();
      cacheExpiry.setMinutes(cacheExpiry.getMinutes() + 15);
      
      const { data: existingCache } = await supabase
        .from('inventory_cache')
        .select('id')
        .eq('kiosk_token', kioskToken)
        .single();
      
      if (existingCache) {
        await supabase
          .from('inventory_cache')
          .update({
            stock_quantity: data.stock_quantity,
            price: data.price,
            name: data.name,
            last_checked_at: new Date().toISOString(),
            cached_until: cacheExpiry.toISOString(),
            last_sync_status: 'success',
            product_id: product?.id
          })
          .eq('id', existingCache.id);
      } else {
        await supabase
          .from('inventory_cache')
          .insert({
            kiosk_token: kioskToken,
            stock_quantity: data.stock_quantity,
            price: data.price,
            name: data.name,
            cached_until: cacheExpiry.toISOString(),
            product_id: product?.id
          });
      }
    } catch (error) {
      console.error('Error updating database cache:', error);
    }
  }
}
