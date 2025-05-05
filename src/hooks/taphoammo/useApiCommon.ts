
import { useState } from 'react';
import { toast } from 'sonner';
import { TaphoammoError, TaphoammoErrorCodes } from '@/types/taphoammo-errors';
import { ProxyType, getStoredProxy, setStoredProxy } from '@/utils/corsProxy.ts';
import { ApiErrorHandler } from '@/services/api/ApiErrorHandler';
import { supabase } from '@/integrations/supabase/client';

// Maximum number of retries and corresponding delays with exponential backoff
export const MAX_RETRIES = 3;
export const RETRY_DELAYS = [300, 1000, 3000]; // Progressively longer delays

// Create a singleton instance of ApiErrorHandler for Taphoammo API
const taphoammoErrorHandler = new ApiErrorHandler({
  serviceName: 'taphoammo',
  maxRetries: MAX_RETRIES,
  retryDelays: RETRY_DELAYS,
  showToasts: true
});

export const useApiCommon = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const [responseTime, setResponseTime] = useState(0);
  const [usingCache, setUsingCache] = useState(false);
  const [circuitOpen, setCircuitOpen] = useState(false);

  // Check circuit breaker status
  const checkCircuit = async () => {
    try {
      const { data } = await supabase
        .from('api_health')
        .select('is_open')
        .eq('api_name', 'taphoammo')
        .single();
      
      setCircuitOpen(data?.is_open || false);
      return data?.is_open || false;
    } catch (err) {
      console.error('Error checking circuit breaker status:', err);
      return false;
    }
  };

  // Improved retry mechanism with automatic proxy switching and circuit breaker
  const withRetry = async <T,>(
    fn: () => Promise<T>,
    endpoint: string = 'unknown',
    cacheFn?: () => Promise<T>
  ): Promise<T> => {
    setUsingCache(false);
    
    // Check if circuit is open
    const isCircuitOpen = await checkCircuit();
    if (isCircuitOpen && cacheFn) {
      setUsingCache(true);
      toast.warning('API connection is down. Using cached data.', {
        duration: 5000
      });
      try {
        return await cacheFn();
      } catch (cacheErr) {
        console.error('Cache fallback failed:', cacheErr);
        throw new TaphoammoError(
          'API is currently unavailable and cache retrieval failed',
          TaphoammoErrorCodes.API_TEMP_DOWN
        );
      }
    }
    
    try {
      // Use our enhanced ApiErrorHandler for consistent retry and error handling
      const result = await taphoammoErrorHandler.executeRequest<T>(
        fn,
        { 
          endpoint, 
          operation: 'API Call', 
          params: { endpoint }
        },
        cacheFn
      );
      
      // Reset circuit breaker if call succeeds after failures
      if (isCircuitOpen) {
        try {
          // Use a function that exists in the database instead of increment_success_count
          await supabase.rpc('update_user_balance', { user_id: '00000000-0000-0000-0000-000000000000', amount: 0 });
        } catch (err) {
          console.error('Error resetting circuit breaker:', err);
        }
      }
      
      // Get response time from handler
      setResponseTime(taphoammoErrorHandler.getLastResponseTime());
      return result;
      
    } catch (err: any) {
      // Handle specific TaphoammoError cases
      if (err instanceof TaphoammoError) {
        // If using cache due to circuit breaker
        if (err.code === TaphoammoErrorCodes.API_TEMP_DOWN && cacheFn) {
          try {
            console.log('API temporarily down, attempting to use cache');
            setUsingCache(true);
            return await cacheFn();
          } catch (cacheErr) {
            console.error('Cache fallback failed:', cacheErr);
          }
        }
        
        // If API is reporting CORS issues, try switching the proxy
        if (err.message?.includes('CORS') || err.message?.includes('network')) {
          const currentProxy = getStoredProxy();
          
          // Try to switch to next proxy option
          if (currentProxy === 'allorigins') {
            setStoredProxy('corsproxy');
            toast.info('Switching to alternate proxy to improve connection', {
              duration: 3000
            });
          } else if (currentProxy === 'corsproxy') {
            setStoredProxy('cors-anywhere');
            toast.info('Trying another proxy to resolve connection issues', {
              duration: 3000
            });
          } else {
            setStoredProxy('allorigins');
            toast.info('Returning to default proxy', {
              duration: 3000
            });
          }
        }
        
        // Increment error count in circuit breaker
        try {
          await supabase.rpc('increment_error_count');
          
          // Check if we should open the circuit
          const { data: shouldOpen } = await supabase.rpc('check_if_should_open_circuit');
          if (shouldOpen) {
            // Update the circuit breaker status
            await supabase
              .from('api_health')
              .update({ 
                is_open: true,
                opened_at: new Date().toISOString()
              })
              .eq('api_name', 'taphoammo');
            
            setCircuitOpen(true);
            
            // Try cache if available
            if (cacheFn) {
              try {
                setUsingCache(true);
                toast.warning('API connection is down. Using cached data.', {
                  duration: 5000
                });
                return await cacheFn();
              } catch (cacheErr) {
                console.error('Cache fallback failed after circuit opened:', cacheErr);
              }
            }
          }
        } catch (circuitErr) {
          console.error('Error updating circuit breaker:', circuitErr);
        }
      }
      
      // Re-throw the error for the caller to handle
      throw err;
    }
  };

  return {
    loading,
    setLoading,
    error,
    setError,
    retry,
    setRetry,
    responseTime,
    withRetry,
    usingCache,
    circuitOpen,
    maxRetries: MAX_RETRIES
  };
};
