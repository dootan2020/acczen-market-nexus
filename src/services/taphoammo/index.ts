
import { TaphoammoApiClient } from './TaphoammoApiClient';
import { TaphoammoProductService } from './TaphoammoProductService';
import { TaphoammoOrderService } from './TaphoammoOrderService';
import { toast } from 'sonner';

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
  
  public checkKioskActive = (kioskToken: string, proxyType?: string) => 
    this.productService.checkKioskActive(kioskToken, proxyType as any);
  
  public testConnection = (kioskToken: string, proxyType?: string) => 
    this.productService.testConnection(kioskToken, proxyType as any);
  
  // Forward methods from order service with proper parameters
  public buyProducts = (kioskToken: string, quantity = 1, userToken?: string, promotion?: string, proxyType?: string) => 
    this.orderService.buyProducts(kioskToken, quantity, userToken, promotion, proxyType as any);
  
  public getProducts = (orderId: string, userToken?: string, proxyType?: string) => 
    this.orderService.getProducts(orderId, userToken, proxyType as any);
  
  public checkStockAvailability = (kioskToken: string, quantity = 1, proxyType?: string) => 
    this.orderService.checkStockAvailability(kioskToken, quantity, proxyType as any);
  
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
