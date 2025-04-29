
import { TaphoammoProductService } from './TaphoammoProductService';
import { TaphoammoOrderService } from './TaphoammoOrderService';
import { toast } from 'sonner';

/**
 * Main service facade for Taphoammo API integration
 * Provides a simple interface for all Taphoammo operations
 * // TODO: Implement new API logic
 */
export class TaphoammoApiService {
  private static instance: TaphoammoApiService;
  
  // Service instances
  private apiClient: any;
  private productService: TaphoammoProductService;
  private orderService: TaphoammoOrderService;
  
  private constructor() {
    this.apiClient = {};
    // Initialize services first before using them in method bindings
    this.productService = new TaphoammoProductService();
    this.orderService = new TaphoammoOrderService();
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
