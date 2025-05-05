
import { TaphoammoApiClient } from './TaphoammoApiClient';
import { TaphoammoProductService } from './TaphoammoProductService';
import { TaphoammoOrderService } from './TaphoammoOrderService';
import { toast } from 'sonner';
import { ProxyType } from '@/hooks/taphoammo/useApiCommon';

/**
 * Main service facade for Taphoammo API integration
 * Provides a simple interface for all Taphoammo operations
 */
export class TaphoammoApiService {
  private static instance: TaphoammoApiService;
  
  // Service instances
  private apiClient: TaphoammoApiClient;
  private productService: TaphoammoProductService;
  private orderService: TaphoammoOrderService;
  
  private constructor() {
    // Initialize API client first
    this.apiClient = new TaphoammoApiClient();
    
    // Initialize services with the API client
    this.productService = new TaphoammoProductService(this.apiClient);
    this.orderService = new TaphoammoOrderService(this.apiClient);
  }
  
  /**
   * Get singleton instance
   */
  public static getInstance(): TaphoammoApiService {
    if (!this.instance) {
      this.instance = new TaphoammoApiService();
    }
    return this.instance;
  }
  
  // Forward methods from product service with proper parameters
  public getStock = (kioskToken: string, options: any = {}) => 
    this.productService.getStock(kioskToken, options);
  
  public checkKioskActive = (kioskToken: string, proxyType?: ProxyType) => 
    this.productService.checkKioskActive(kioskToken, proxyType);
  
  public testConnection = (kioskToken: string, proxyType?: ProxyType) => 
    this.productService.testConnection(kioskToken, proxyType);
  
  // Forward methods from order service with proper parameters
  public buyProducts = (kioskToken: string, quantity = 1, userToken?: string, promotion?: string, proxyType?: ProxyType) => 
    this.orderService.buyProducts(kioskToken, quantity, userToken, promotion, proxyType);
  
  public getProducts = (orderId: string, userToken?: string, proxyType?: ProxyType) => 
    this.orderService.getProducts(orderId, userToken, proxyType);
  
  public checkStockAvailability = (kioskToken: string, quantity = 1, proxyType?: ProxyType) => 
    this.orderService.checkStockAvailability(kioskToken, quantity, proxyType);
  
  /**
   * Clear API cache across all services
   */
  public clearCache(): void {
    this.apiClient.clearCache();
    toast.success('Đã xóa cache API thành công');
  }
}

// Export singleton instance and types
export const taphoammoApiService = TaphoammoApiService.getInstance();

export type { 
  TaphoammoProduct 
} from './TaphoammoProductService';

export type { 
  TaphoammoApiOptions 
} from './TaphoammoApiClient';
