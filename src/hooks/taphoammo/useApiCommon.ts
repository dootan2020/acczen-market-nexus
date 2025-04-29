
import { useState } from 'react';
import { toast } from 'sonner';
import { TaphoammoError, TaphoammoErrorCodes } from '@/types/taphoammo-errors';
import { ProxyType, getStoredProxy, setStoredProxy } from '@/utils/corsProxy';

// Maximum number of retries and corresponding delays with exponential backoff
export const MAX_RETRIES = 3;
export const RETRY_DELAYS = [300, 1000, 3000]; // Starting with smaller delay

export const useApiCommon = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);
  const [responseTime, setResponseTime] = useState(0);

  // Improved retry mechanism with automatic proxy switching
  const withRetry = async <T,>(
    fn: () => Promise<T>,
    attempt = 0
  ): Promise<T> => {
    try {
      if (attempt > 0) {
        setRetry(attempt);
      }
      
      const startTime = Date.now();
      const result = await fn();
      const endTime = Date.now();
      setResponseTime(endTime - startTime);
      
      return result;
    } catch (err: any) {
      // Handle specific TaphoammoError cases
      if (err instanceof TaphoammoError) {
        // Some errors shouldn't be retried
        if (
          err.code === TaphoammoErrorCodes.KIOSK_PENDING ||
          err.code === TaphoammoErrorCodes.API_TEMP_DOWN
        ) {
          throw err;
        }
      }
      
      if (attempt >= MAX_RETRIES) {
        // If we've exhausted retries, try switching proxy for next request
        const currentProxy = getStoredProxy();
        
        // Switch to next proxy option if CORS-related error
        if (err.message?.includes('CORS') || err.message?.includes('network')) {
          // Try to switch to next proxy option
          if (currentProxy === 'allorigins') {
            setStoredProxy('corsproxy');
            console.log('Switching proxy to corsproxy for next request');
          } else if (currentProxy === 'corsproxy') {
            setStoredProxy('cors-anywhere');
            console.log('Switching proxy to cors-anywhere for next request');
          } else {
            setStoredProxy('allorigins');
            console.log('Switching back to allorigins proxy for next request');
          }
          
          toast.info('Đang chuyển sang proxy khác để cải thiện kết nối');
        }
        
        throw err;
      }
      
      const delay = RETRY_DELAYS[attempt] || 3000;
      console.log(`API call failed, retrying (${attempt + 1}/${MAX_RETRIES}) in ${delay}ms...`);
      
      // Only show toast for user-visible retries
      if (attempt > 0) {
        toast.info(`API request failed. Retrying (${attempt + 1}/${MAX_RETRIES})...`);
      }
      
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return withRetry(fn, attempt + 1);
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
    maxRetries: MAX_RETRIES
  };
};
