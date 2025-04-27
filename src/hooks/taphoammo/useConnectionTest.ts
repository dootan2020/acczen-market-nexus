
import { useApiCommon } from './useApiCommon';
import { taphoammoApi } from '@/utils/api/taphoammoApi';
import type { ProxyType } from '@/utils/corsProxy';

export const useConnectionTest = () => {
  const { loading, setLoading, error, setError, retry } = useApiCommon();
  
  const testConnection = async (
    kioskToken: string, 
    userToken: string,
    proxyType: ProxyType
  ): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    setError(null);
    
    try {
      return await taphoammoApi.testConnection(kioskToken, userToken, proxyType);
    } catch (err: any) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      return { 
        success: false, 
        message: `Connection failed: ${errorMsg}` 
      };
    } finally {
      setLoading(false);
    }
  };

  return {
    testConnection,
    loading,
    error,
    retry
  };
};
