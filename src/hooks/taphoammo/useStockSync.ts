
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useStockSync = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [syncResult, setSyncResult] = useState<{
    success: boolean;
    message: string;
    data?: any;
  } | null>(null);

  // Sync product stock with database
  const syncProductStock = async (
    productId: string,
    kioskToken: string
  ): Promise<{
    success: boolean;
    message: string;
    data?: any;
  }> => {
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Syncing stock for product ${productId} with token ${kioskToken}`);
      
      // Call Edge Function to sync stock with detailed parameters
      const { data, error } = await supabase.functions.invoke('sync-inventory', {
        body: {
          product_id: productId,
          kiosk_token: kioskToken,
          trigger_type: 'manual',
          force_refresh: true
        }
      });
      
      if (error) {
        console.error(`Error syncing stock:`, error);
        throw new Error(error.message);
      }
      
      console.log(`Sync result:`, data);
      
      // Verify the response structure
      if (!data) {
        throw new Error('Empty response from sync function');
      }
      
      // Check for successful update
      if (data.success === false) {
        throw new Error(data.message || 'Failed to synchronize stock');
      }
      
      toast.success('Đồng bộ tồn kho thành công', {
        description: `${data.message || 'Dữ liệu tồn kho đã được cập nhật.'}`
      });
      
      const result = {
        success: true,
        message: data.message || 'Stock synchronized successfully',
        data
      };
      
      setSyncResult(result);
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to synchronize stock';
      console.error(`Stock sync error:`, errorMsg);
      setError(errorMsg);
      
      toast.error('Lỗi đồng bộ tồn kho', {
        description: errorMsg
      });
      
      const result = {
        success: false,
        message: errorMsg
      };
      
      setSyncResult(result);
      return result;
    } finally {
      setLoading(false);
    }
  };

  // Queue a sync job for later execution
  const queueStockSync = async (
    productId: string,
    kioskToken: string,
    priority: number = 1
  ): Promise<boolean> => {
    try {
      console.log(`Queueing stock sync for product ${productId} with token ${kioskToken}`);
      
      const now = new Date().toISOString();
      const { error } = await supabase
        .from('sync_job_queue')
        .insert({
          job_type: 'stock_sync',
          data: {
            product_id: productId,
            kiosk_token: kioskToken,
            trigger_type: 'queued'
          },
          priority,
          status: 'pending',
          next_attempt_at: now
        });
      
      if (error) {
        console.error(`Error queueing stock sync:`, error);
        toast.error('Lỗi xếp hàng đợi đồng bộ', {
          description: error.message
        });
        throw error;
      }
      
      console.log(`Stock sync queued successfully`);
      toast.success('Đã thêm vào hàng đợi đồng bộ');
      return true;
    } catch (err) {
      console.error('Error queueing stock sync:', err);
      return false;
    }
  };

  // Check if sync is stale (last checked time is too old)
  const checkSyncFreshness = async (productId: string): Promise<{
    isFresh: boolean;
    lastSynced?: Date | null;
  }> => {
    try {
      const { data, error } = await supabase
        .from('inventory_cache')
        .select('last_checked_at, cached_until')
        .eq('product_id', productId)
        .single();
        
      if (error || !data) {
        return { isFresh: false };
      }
      
      const lastCheckedAt = data.last_checked_at ? new Date(data.last_checked_at) : null;
      const cachedUntil = data.cached_until ? new Date(data.cached_until) : null;
      const now = new Date();
      
      // If cache is still valid or last checked within 15 minutes
      const isFresh = cachedUntil ? now < cachedUntil : false;
      
      return {
        isFresh,
        lastSynced: lastCheckedAt
      };
    } catch (err) {
      console.error('Error checking sync freshness:', err);
      return { isFresh: false };
    }
  };

  return {
    syncProductStock,
    queueStockSync,
    checkSyncFreshness,
    loading,
    error,
    syncResult
  };
};
