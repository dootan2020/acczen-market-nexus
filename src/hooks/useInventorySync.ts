
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SyncResult {
  success: boolean;
  message?: string;
}

export const useInventorySync = () => {
  const [isSyncing, setIsSyncing] = useState(false);

  const syncProductStock = async (kioskToken: string): Promise<SyncResult> => {
    setIsSyncing(true);
    try {
      // Call the server function to sync inventory for this product
      const { data, error } = await supabase.functions.invoke('sync-inventory', {
        body: JSON.stringify({
          type: 'single',
          kioskToken,
          syncType: 'manual'
        })
      });
      
      if (error) throw error;
      
      if (data.success) {
        return {
          success: true,
          message: data.message || 'Inventory synced successfully'
        };
      } else {
        return {
          success: false,
          message: data.message || 'Failed to sync inventory'
        };
      }
    } catch (error: any) {
      console.error('Error syncing inventory:', error);
      return {
        success: false,
        message: error.message || 'An unexpected error occurred'
      };
    } finally {
      setIsSyncing(false);
    }
  };

  const syncAllInventory = async (): Promise<SyncResult> => {
    setIsSyncing(true);
    try {
      // Call the server function to sync all inventory
      const { data, error } = await supabase.functions.invoke('sync-inventory', {
        body: JSON.stringify({
          type: 'all',
          syncType: 'manual'
        })
      });
      
      if (error) throw error;
      
      if (data.success) {
        return {
          success: true,
          message: data.message || `${data.updated || 0} products synced successfully`
        };
      } else {
        return {
          success: false,
          message: data.message || 'Failed to sync inventory'
        };
      }
    } catch (error: any) {
      console.error('Error syncing all inventory:', error);
      return {
        success: false,
        message: error.message || 'An unexpected error occurred'
      };
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    syncProductStock,
    syncAllInventory,
    isSyncing
  };
};
