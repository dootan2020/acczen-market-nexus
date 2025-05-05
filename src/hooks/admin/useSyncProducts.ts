
import { useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// This hook manages the product synchronization with the external API
export const useSyncProducts = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  
  // Function to trigger the API sync process
  const syncProducts = async (options?: { selectedProductIds?: string[] }) => {
    try {
      setIsSyncing(true);
      
      // Call the edge function or backend API to perform the sync
      const { data, error } = await supabase.functions.invoke('sync-taphoammo', {
        body: { 
          selectedProductIds: options?.selectedProductIds || [],
          syncAll: !options?.selectedProductIds || options.selectedProductIds.length === 0
        }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      // Handle the successful response
      toast.success(
        data?.syncedCount 
          ? `Successfully synced ${data.syncedCount} products` 
          : 'Products synchronization triggered successfully'
      );
      
      return data;
    } catch (error) {
      // Handle errors
      console.error('Error syncing products:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to sync products with API');
      throw error;
    } finally {
      setIsSyncing(false);
    }
  };
  
  return {
    syncProducts,
    isSyncing
  };
};
