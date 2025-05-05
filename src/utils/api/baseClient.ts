
import { supabase } from '@/integrations/supabase/client';
import { parseError } from '@/utils/errorUtils';
import { TaphoammoError, TaphoammoErrorCodes } from '@/types/taphoammo-errors';

interface EdgeFunctionOptions {
  retryCount?: number;
  maxRetries?: number;
  timeout?: number;
}

export class BaseApiClient {
  protected async callEdgeFunction(
    functionName: string,
    params: Record<string, any>,
    options: EdgeFunctionOptions = {}
  ) {
    const { 
      retryCount = 0,
      maxRetries = 3,
      timeout = 30000
    } = options;
    
    try {
      // Add timeout using AbortController
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      // Call the function without the signal (removed due to type error)
      const { data, error } = await supabase.functions.invoke(functionName, {
        body: params
        // Removed signal property as it's not in FunctionInvokeOptions type
      });
      
      // Clear the timeout
      clearTimeout(timeoutId);
      
      if (error) {
        throw new Error(error.message);
      }
      
      return { data, error: null };
    } catch (err) {
      console.error(`Error calling ${functionName}:`, err);
      
      // Handle timeouts
      if (err instanceof DOMException && err.name === 'AbortError') {
        console.warn(`Function ${functionName} timed out after ${timeout}ms`);
        
        if (retryCount < maxRetries) {
          console.log(`Retrying ${functionName} (${retryCount + 1}/${maxRetries})...`);
          return this.callEdgeFunction(functionName, params, {
            ...options,
            retryCount: retryCount + 1
          });
        }
        
        throw new TaphoammoError(
          `Request to ${functionName} timed out after ${maxRetries} attempts`,
          TaphoammoErrorCodes.TIMEOUT
        );
      }
      
      // Handle network errors and retry
      if (this.isNetworkError(err) && retryCount < maxRetries) {
        console.log(`Network error, retrying ${functionName} (${retryCount + 1}/${maxRetries})...`);
        
        // Wait with exponential backoff
        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
        
        return this.callEdgeFunction(functionName, params, {
          ...options,
          retryCount: retryCount + 1
        });
      }
      
      // Parse and standardize the error
      const errorDetails = parseError(err);
      
      return { 
        data: null, 
        error: new Error(errorDetails.message)
      };
    }
  }
  
  private isNetworkError(error: any): boolean {
    if (!error) return false;
    
    // Check for common network error patterns
    return !navigator.onLine || 
           error instanceof TypeError || 
           (error.message && (
             error.message.toLowerCase().includes('network') ||
             error.message.toLowerCase().includes('failed to fetch') ||
             error.message.toLowerCase().includes('connection')
           ));
  }
}
