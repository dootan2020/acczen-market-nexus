
import { useState } from 'react';

interface ApiCommonHook {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  retry: () => Promise<void>;
  withRetry: <T>(fn: () => Promise<T>, maxRetries?: number) => Promise<T>;
}

export const useApiCommon = (): ApiCommonHook => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryFn, setRetryFn] = useState<() => Promise<void>>(() => async () => {});
  
  const retry = async () => {
    setError(null);
    await retryFn();
  };
  
  const withRetry = async <T>(fn: () => Promise<T>, maxRetries = 3): Promise<T> => {
    let retries = 0;
    
    const executeWithRetry = async (): Promise<T> => {
      try {
        return await fn();
      } catch (err) {
        retries++;
        
        if (retries >= maxRetries) {
          const errorMsg = err instanceof Error ? err.message : 'Unknown error';
          console.error(`Max retries reached (${retries}/${maxRetries}):`, errorMsg);
          setError(errorMsg);
          throw err;
        }
        
        console.log(`Retry ${retries}/${maxRetries}...`);
        
        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, retries), 8000);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return executeWithRetry();
      }
    };
    
    // Store the retry function to allow manual retry later
    setRetryFn(() => async () => {
      setLoading(true);
      try {
        await executeWithRetry();
        setError(null);
      } catch (err) {
        // Error is already set in executeWithRetry
      } finally {
        setLoading(false);
      }
    });
    
    return executeWithRetry();
  };
  
  return {
    loading,
    setLoading,
    error,
    setError,
    retry,
    withRetry
  };
};
