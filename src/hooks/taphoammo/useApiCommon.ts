
import { useState } from 'react';
import { toast } from 'sonner';
import { TaphoammoError, TaphoammoErrorCodes } from '@/types/taphoammo-errors';
import { ProxyType, getStoredProxy, setStoredProxy } from '@/utils/corsProxy';
import { ApiErrorHandler } from '@/services/api/ApiErrorHandler';

// Maximum number of retries and corresponding delays with exponential backoff
export const MAX_RETRIES = 3;
export const RETRY_DELAYS = [300, 1000, 3000]; // Starting with smaller delay

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

  // Improved retry mechanism with automatic proxy switching
  const withRetry = async <T,>(
    fn: () => Promise<T>,
    endpoint: string = 'unknown',
    cacheFn?: () => Promise<T>
  ): Promise<T> => {
    setUsingCache(false);
    
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
      
      setResponseTime(Date.now() - Date.now()); // Will be updated by ApiErrorHandler
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
            toast.info('Đang chuyển sang proxy khác để cải thiện kết nối');
          } else if (currentProxy === 'corsproxy') {
            setStoredProxy('cors-anywhere');
            toast.info('Đang thử proxy khác để khắc phục lỗi kết nối');
          } else {
            setStoredProxy('allorigins');
            toast.info('Đang quay lại proxy mặc định');
          }
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
    maxRetries: MAX_RETRIES
  };
};
