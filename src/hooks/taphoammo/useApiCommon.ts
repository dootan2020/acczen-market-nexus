
import { useState } from 'react';
import { toast } from 'sonner';

// Maximum number of retries and corresponding delays
export const MAX_RETRIES = 3;
export const RETRY_DELAYS = [1000, 3000, 5000];

export const useApiCommon = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retry, setRetry] = useState(0);

  const withRetry = async <T,>(
    fn: () => Promise<T>,
    attempt = 0
  ): Promise<T> => {
    try {
      if (attempt > 0) {
        setRetry(attempt);
      }
      
      return await fn();
    } catch (err) {
      if (attempt >= MAX_RETRIES) {
        throw err;
      }
      
      const delay = RETRY_DELAYS[attempt] || 5000;
      console.log(`API call failed, retrying (${attempt + 1}/${MAX_RETRIES}) in ${delay}ms...`);
      toast.info(`API request failed. Retrying (${attempt + 1}/${MAX_RETRIES})...`);
      
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
    withRetry,
    maxRetries: MAX_RETRIES
  };
};
