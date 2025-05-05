
import { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

export const useSyncProducts = () => {
  const [isSyncing, setIsSyncing] = useState(false);
  const { toast } = useToast();

  const syncProducts = async () => {
    setIsSyncing(true);
    
    try {
      // Call the edge function to sync products
      const { data, error } = await supabase.functions.invoke('sync-taphoammo-products', {
        method: 'POST',
        body: { force: true }
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      toast({
        title: 'Products synchronized',
        description: data?.message || 'Products successfully synchronized with TaphoaMMO',
      });
      
      // Return the data for further processing if needed
      return data;
    } catch (error) {
      console.error('Error syncing products:', error);
      toast({
        variant: 'destructive',
        title: 'Sync failed',
        description: error instanceof Error ? error.message : 'Failed to sync products',
      });
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
