import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { parseError, ErrorDetails } from '@/utils/errorUtils';

interface ErrorHandlerOptions {
  showToast?: boolean;
  logToConsole?: boolean;
  captureToService?: boolean;
  redirectOnAuthError?: boolean;
  retryOperation?: boolean;
  fallbackValue?: any;
}

export function useErrorHandler(defaultOptions: ErrorHandlerOptions = {}) {
  const [error, setError] = useState<ErrorDetails | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();
  
  const defaultOpts = {
    showToast: true,
    logToConsole: true,
    captureToService: false,
    redirectOnAuthError: true,
    retryOperation: false,
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
    
    // Handle authentication errors
    if (opts.redirectOnAuthError && isAuthError(errorDetails)) {
      console.log('Authentication error detected, redirecting to login...');
      // Use setTimeout to avoid immediate redirect that prevents error message from being shown
      setTimeout(() => {
        window.location.href = '/login';
      }, 2000);
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
        const opts = { ...defaultOpts, ...options };
        const errorDetails = handleError(err, opts);
        
        // If a fallback value is provided and error is not critical, return it
        if (opts.fallbackValue !== undefined) {
          console.log('Using fallback value due to error:', opts.fallbackValue);
          return opts.fallbackValue as T;
        }
        
        throw err;
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [handleError, clearError, defaultOpts]);

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

  /**
   * Handle a function with retry capability
   */
  const withRetry = useCallback(async <T>(
    fn: () => Promise<T>,
    options?: ErrorHandlerOptions & { maxRetries?: number, retryDelay?: number }
  ): Promise<T> => {
    const opts = { ...defaultOpts, ...options };
    const maxRetries = opts.maxRetries || 3;
    const retryDelay = opts.retryDelay || 1000;
    
    let lastError: unknown;
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        
        // If this was the last attempt, handle the error and break
        if (attempt === maxRetries) {
          handleError(error, { ...opts, retryOperation: false });
          break;
        }
        
        // Otherwise, wait and retry
        console.log(`Attempt ${attempt + 1} failed, retrying in ${retryDelay}ms...`);
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }
    
    // If we get here, all retries failed
    throw lastError;
  }, [handleError, defaultOpts]);

  return {
    error,
    isLoading,
    handleError,
    clearError,
    withErrorHandler,
    createErrorHandler,
    withRetry
  };
}

/**
 * Check if an error is related to authentication
 */
function isAuthError(error: ErrorDetails): boolean {
  const authErrorCodes = ['UNAUTHENTICATED', 'INVALID_CREDENTIALS', 'SESSION_EXPIRED', 'UNAUTHORIZED'];
  
  // Check for known auth error codes
  if (error.code && authErrorCodes.includes(error.code)) {
    return true;
  }
  
  // Check for 401/403 status codes
  if (error.statusCode === 401 || error.statusCode === 403) {
    return true;
  }
  
  // Check for auth-related error messages
  const errorMsg = error.message.toLowerCase();
  return errorMsg.includes('auth') && 
    (errorMsg.includes('unauthorized') || 
     errorMsg.includes('unauthenticated') || 
     errorMsg.includes('session') || 
     errorMsg.includes('login') || 
     errorMsg.includes('permission'));
}
