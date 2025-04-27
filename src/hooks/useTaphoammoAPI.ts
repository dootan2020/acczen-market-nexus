
import { useStockOperations } from './taphoammo/useStockOperations';
import { useOrderOperations } from './taphoammo/useOrderOperations';
import { useConnectionTest } from './taphoammo/useConnectionTest';

export const useTaphoammoAPI = () => {
  const { getStock, checkStockAvailability, loading: stockLoading, error: stockError } = useStockOperations();
  const { buyProducts, getProducts, loading: orderLoading, error: orderError } = useOrderOperations();
  const { testConnection, loading: testLoading, error: testError } = useConnectionTest();
  
  // Combine loading and error states from all hooks
  const loading = stockLoading || orderLoading || testLoading;
  const error = stockError || orderError || testError;
  
  return {
    getStock,
    checkStockAvailability,
    buyProducts,
    getProducts,
    testConnection,
    loading,
    error
  };
};
