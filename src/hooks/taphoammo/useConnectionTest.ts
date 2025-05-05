
import { useState } from 'react';
import { TaphoammoIntegration } from '@/services/taphoammo/TaphoammoIntegration';

// Create a singleton instance of TaphoammoIntegration
const taphoammoIntegration = new TaphoammoIntegration();

export const useConnectionTest = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [results, setResults] = useState<Array<{
    testName: string;
    success: boolean;
    message: string;
    responseTime?: number;
  }>>([]);

  // Test connection without proxy types
  const testConnection = async (kioskToken: string) => {
    setLoading(true);
    setError(null);
    setResults([]);
    
    try {
      // Test direct connection
      const result = await taphoammoIntegration.testProxy(kioskToken);
      setResults([
        {
          testName: 'API Connection',
          ...result
        }
      ]);
      
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
    loading,
    error,
    results
  };
};
