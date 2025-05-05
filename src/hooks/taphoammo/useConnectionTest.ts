
import { useState } from 'react';
import { TaphoammoIntegration } from '@/services/taphoammo/TaphoammoIntegration';
import { ProxyType } from '@/hooks/taphoammo/useApiCommon';

// Create a singleton instance of TaphoammoIntegration
const taphoammoIntegration = new TaphoammoIntegration();

export const useConnectionTest = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Array<{
    proxyType: ProxyType;
    success: boolean;
    message: string;
    responseTime?: number;
  }>>([]);

  // Test connection with different proxy settings
  const testConnection = async (kioskToken: string) => {
    setLoading(true);
    setError(null);
    setResults([]);
    
    const proxyTypes: ProxyType[] = [ProxyType.ALLORIGINS, ProxyType.CORSPROXY, ProxyType.CORS_ANYWHERE];
    const testResults = [];
    
    try {
      for (const proxyType of proxyTypes) {
        try {
          const result = await taphoammoIntegration.testProxy(kioskToken, proxyType);
          testResults.push({
            proxyType,
            ...result
          });
        } catch (err) {
          testResults.push({
            proxyType,
            success: false,
            message: err instanceof Error ? err.message : 'Unknown error',
            responseTime: 0
          });
        }
      }
      
      setResults(testResults);
      return testResults;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Test a specific proxy type
  const testSpecificProxy = async (kioskToken: string, proxyType: ProxyType) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await taphoammoIntegration.testProxy(kioskToken, proxyType);
      
      setResults([{
        proxyType,
        ...result
      }]);
      
      return result;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      
      return {
        success: false,
        message: errorMsg
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    testConnection,
    testSpecificProxy,
    loading,
    error,
    results
  };
};
