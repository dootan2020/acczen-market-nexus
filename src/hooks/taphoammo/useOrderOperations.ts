
import { useApiCommon } from './useApiCommon';
import { taphoammoApi } from '@/utils/api/taphoammoApi';
import type { ProxyType } from '@/utils/corsProxy';

export const useOrderOperations = () => {
  const { loading, setLoading, error, setError, retry, withRetry } = useApiCommon();

  const buyProducts = async (
    kioskToken: string,
    userToken: string,
    quantity: number,
    proxyType: ProxyType,
    promotion?: string
  ) => {
    setLoading(true);
    setError(null);

    try {
      const data = await withRetry(async () => {
        return await taphoammoApi.order.buyProducts(kioskToken, quantity, userToken, promotion);
      });

      return data;
    } catch (err: any) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error in buyProducts:', errorMsg);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getProducts = async (orderId: string, userToken: string, proxyType: ProxyType) => {
    setLoading(true);
    setError(null);

    try {
      const data = await withRetry(async () => {
        return await taphoammoApi.order.getProducts(orderId, userToken);
      });

      return data;
    } catch (err: any) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    buyProducts,
    getProducts,
    loading,
    error,
    retry
  };
};
