
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface TransactionOptions {
  showToasts?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export const useSecureTransaction = (options: TransactionOptions = {}) => {
  const { showToasts = true } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const { user } = useAuth();
  
  /**
   * Process a purchase transaction safely using the edge function
   */
  const processPurchase = async (productId: string, quantity = 1) => {
    if (!user) {
      const error = new Error('You must be logged in to make a purchase');
      setError(error);
      if (options.onError) options.onError(error);
      if (showToasts) toast.error('You must be logged in to make a purchase');
      return null;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('process-transaction', {
        body: JSON.stringify({
          user_id: user.id,
          product_id: productId,
          quantity,
          transaction_type: 'purchase'
        })
      });
      
      if (error) throw error;
      
      if (!data.success) {
        throw new Error(data.message || 'Transaction failed');
      }
      
      // Store transaction ID for reference
      setTransactionId(data.transaction_id);
      
      if (showToasts) {
        toast.success('Purchase successful', {
          description: `Order ID: ${data.order_id}`
        });
      }
      
      if (options.onSuccess) options.onSuccess(data);
      
      return data;
    } catch (err: any) {
      const error = err instanceof Error ? err : new Error(err.message || 'Transaction failed');
      setError(error);
      
      if (showToasts) {
        toast.error('Purchase failed', {
          description: error.message
        });
      }
      
      if (options.onError) options.onError(error);
      return null;
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Check if user has sufficient balance for a purchase
   */
  const checkBalance = async (price: number, quantity = 1): Promise<{
    sufficient: boolean;
    balance: number;
    required: number;
    remaining: number;
  }> => {
    if (!user) {
      throw new Error('You must be logged in to check balance');
    }
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', user.id)
        .single();
      
      if (error) throw error;
      
      const totalRequired = price * quantity;
      const remaining = data.balance - totalRequired;
      
      return {
        sufficient: remaining >= 0,
        balance: data.balance,
        required: totalRequired,
        remaining
      };
    } catch (err) {
      console.error('Error checking balance:', err);
      throw err;
    }
  };
  
  return {
    processPurchase,
    checkBalance,
    loading,
    error,
    transactionId
  };
};
