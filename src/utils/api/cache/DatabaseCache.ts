
import { supabase } from '@/integrations/supabase/client';

export class DatabaseCache {
  static async get(kioskToken: string) {
    try {
      const { data, error } = await supabase
        .from('inventory_cache')
        .select('*, products(name)')
        .eq('kiosk_token', kioskToken)
        .single();

      if (error || !data) {
        return { cached: false, data: null };
      }

      // Check if cache is still valid
      const cachedUntil = new Date(data.cached_until);
      const now = new Date();

      if (cachedUntil > now) {
        const productName = data.products?.name || `Product ${data.product_id?.substring(0, 8) || ''}`;
        
        return {
          cached: true,
          data: {
            kiosk_token: data.kiosk_token,
            name: productName,
            stock_quantity: data.stock_quantity,
            price: data.price,
            cached: true,
            cacheId: data.id
          }
        };
      } else {
        return { cached: false, data: null };
      }
    } catch (err) {
      console.error('Error fetching from database cache:', err);
      return { cached: false, data: null };
    }
  }

  static async set(kioskToken: string, data: any, expiryMinutes = 15) {
    try {
      const expiryDate = new Date();
      expiryDate.setMinutes(expiryDate.getMinutes() + expiryMinutes);

      const { error } = await supabase
        .from('inventory_cache')
        .upsert({
          kiosk_token: kioskToken,
          stock_quantity: data.stock_quantity,
          price: data.price,
          cached_until: expiryDate.toISOString(),
          last_checked_at: new Date().toISOString()
        }, { 
          onConflict: 'kiosk_token' 
        });

      if (error) {
        console.error('Error updating database cache:', error);
      }

      return !error;
    } catch (err) {
      console.error('Error setting database cache:', err);
      return false;
    }
  }
}
