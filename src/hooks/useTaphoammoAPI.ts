
import { useStockOperations } from './taphoammo/useStockOperations';
import { useOrderOperations } from './taphoammo/useOrderOperations';
import { useConnectionTest } from './taphoammo/useConnectionTest';

export const useTaphoammoAPI = () => {
  const { getStock, checkStockAvailability } = useStockOperations();
  const { buyProducts, getProducts } = useOrderOperations();
  const { testConnection } = useConnectionTest();
  
  return {
    getStock,
    checkStockAvailability,
    buyProducts,
    getProducts,
    testConnection
  };
};
