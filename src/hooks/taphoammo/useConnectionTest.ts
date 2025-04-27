
import { useApiCommon } from './useApiCommon';
import { taphoammoApi } from '@/utils/api/taphoammoApi';
import type { ProxyType } from '@/utils/corsProxy';

export const useConnectionTest = () => {
  const { loading, setLoading, error, setError, retry, withRetry } = useApiCommon();

  const testConnection = async (
    kioskToken: string, 
    userToken: string,
    proxyType: ProxyType
  ): Promise<{ success: boolean; message: string }> => {
    setLoading(true);
    setError(null);

    try {
      const result = await withRetry(async () => {
        return await taphoammoApi.testConnection(kioskToken, userToken, proxyType);
      });

      return result;
    } catch (err: any) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error in testConnection:', errorMsg);
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
    retry
  };
};
