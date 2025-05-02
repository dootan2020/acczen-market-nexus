
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { parseError, ErrorDetails } from '@/utils/errorUtils';

interface ErrorHandlerOptions {
  showToast?: boolean;
  logToConsole?: boolean;
  captureToService?: boolean;
}

export function useErrorHandler(defaultOptions: ErrorHandlerOptions = {}) {
  const [error, setError] = useState<ErrorDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();
  
  const defaultOpts = {
    showToast: true,
    logToConsole: true,
    captureToService: false,
    ...defaultOptions
  };

  const handleError = useCallback((err: unknown, options?: ErrorHandlerOptions) => {
    const opts = { ...defaultOpts, ...options };
    const errorDetails = parseError(err);
    
    setError(errorDetails);
    
    if (opts.showToast) {
      toast({
        title: "Lỗi",
        description: errorDetails.message,
        variant: "destructive",
      });
    }
    
    if (opts.logToConsole) {
      console.error('Error handled by useErrorHandler:', err);
      console.error('Parsed error details:', errorDetails);
    }
    
    if (opts.captureToService) {
      // Here you could send error to a service like Sentry
      // captureException(err);
    }
    
    return errorDetails;
  }, [toast, defaultOpts]);
  
  const clearError = useCallback(() => {
    setError(null);
  }, []);
  
  /**
   * Wraps an async function with error handling and loading state
   */
  const withErrorHandler = useCallback(<T>(
    fn: () => Promise<T>, 
    options?: ErrorHandlerOptions
  ): Promise<T> => {
    setIsLoading(true);
    clearError();
    
    return fn()
      .catch(err => {
        handleError(err, options);
        throw err;
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [handleError, clearError]);

  /**
   * Creates a wrapped version of an existing async function with error handling
   */
  const createErrorHandler = useCallback(<T extends any[], R>(
    fn: (...args: T) => Promise<R>,
    options?: ErrorHandlerOptions
  ) => {
    return async (...args: T): Promise<R> => {
      return withErrorHandler(() => fn(...args), options);
    };
  }, [withErrorHandler]);

  return {
    error,
    isLoading,
    handleError,
    clearError,
    withErrorHandler,
    createErrorHandler
  };
}
