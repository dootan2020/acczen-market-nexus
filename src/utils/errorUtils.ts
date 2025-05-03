
interface ParsedError {
  message: string;
  code?: string;
  action?: string;
}

// Export the interface so we can use it in other files
export type ErrorDetails = ParsedError;

/**
 * Parses various error formats into a consistent, user-friendly structure
 */
export const parseError = (error: any): ParsedError => {
  // If it's already in our format, return as is
  if (error && typeof error === 'object' && 'message' in error) {
    return {
      message: error.message,
      code: error.code || undefined,
      action: error.action || undefined
    };
  }
  
  // Handle Supabase errors
  if (error && error.error_description) {
    return {
      message: error.error_description,
      code: error.code || 'supabase_error'
    };
  }
  
  // Handle API errors (error in response data)
  if (error && error.data && error.data.error) {
    return {
      message: error.data.error,
      code: error.status?.toString() || 'api_error'
    };
  }
  
  // Handle network errors
  if (error && error.name === 'TypeError' && error.message.includes('fetch')) {
    return {
      message: 'Network error. Please check your internet connection.',
      code: 'network_error',
      action: 'retry'
    };
  }
  
  // Handle insufficient funds more specifically
  if (error && error.message && 
     (error.message.toLowerCase().includes('insufficient') || 
      error.message.toLowerCase().includes('balance'))) {
    return {
      message: 'Insufficient balance to complete this purchase.',
      code: 'insufficient_funds',
      action: 'deposit'
    };
  }
  
  // Handle stock/inventory errors
  if (error && error.message && 
     (error.message.toLowerCase().includes('stock') || 
      error.message.toLowerCase().includes('inventory') ||
      error.message.toLowerCase().includes('available'))) {
    return {
      message: 'This product is currently out of stock or unavailable.',
      code: 'out_of_stock',
      action: 'notify'
    };
  }
  
  // Default error handling
  return {
    message: error instanceof Error ? error.message : 'An unexpected error occurred',
    code: 'unknown_error'
  };
};
