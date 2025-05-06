
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
      
      // Call Edge Function to sync stock
      const { data, error } = await supabase.functions.invoke('sync-inventory', {
        body: {
          product_id: productId,
          kiosk_token: kioskToken
        }
      });
      
      if (error) {
        console.error(`Error syncing stock:`, error);
        throw new Error(error.message);
      }
      
      console.log(`Sync result:`, data);
      
      const result = {
        success: true,
        message: 'Stock synchronized successfully',
        data
      };
      
      setSyncResult(result);
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to synchronize stock';
      console.error(`Stock sync error:`, errorMsg);
      setError(errorMsg);
      
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
      
      const { error } = await supabase
        .from('sync_job_queue')
        .insert({
          job_type: 'stock_sync',
          data: {
            product_id: productId,
            kiosk_token: kioskToken
          },
          priority,
          status: 'pending',
          next_attempt_at: new Date().toISOString()
        });
      
      if (error) {
        console.error(`Error queueing stock sync:`, error);
        throw error;
      }
      
      console.log(`Stock sync queued successfully`);
      return true;
    } catch (err) {
      console.error('Error queueing stock sync:', err);
      return false;
    }
  };

  return {
    syncProductStock,
    queueStockSync,
    loading,
    error,
    syncResult
  };
};
