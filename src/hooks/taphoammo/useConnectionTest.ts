
import { useState } from 'react';
import { taphoammoApi } from '@/utils/api/taphoammoApi';
import { ProxyType } from '@/utils/corsProxy';

interface ConnectionTestResult {
  success: boolean;
  message: string;
  responseTime?: number;
}

export const useConnectionTest = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const testConnection = async (kioskToken: string, proxyType: ProxyType = 'direct'): Promise<ConnectionTestResult> => {
    setLoading(true);
    setError(null);
    
    const startTime = Date.now();
    try {
      // Call the testConnection method from TaphoammoApi
      const result = await taphoammoApi.testConnection(kioskToken, proxyType);
      
      const responseTime = Date.now() - startTime;
      
      return {
        success: result.success,
        message: result.message,
        responseTime
      };
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      
      const responseTime = Date.now() - startTime;
      
      return {
        success: false,
        message: errorMsg,
        responseTime
      };
    } finally {
      setLoading(false);
    }
  };
  
  return {
    testConnection,
    loading,
    error
  };
};
