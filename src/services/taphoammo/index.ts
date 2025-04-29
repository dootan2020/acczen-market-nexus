
import { TaphoammoProductService } from './TaphoammoProductService';
import { TaphoammoOrderService } from './TaphoammoOrderService';
import { TaphoammoApiClient } from './TaphoammoApiClient';
import { toast } from 'sonner';

/**
 * Main service facade for Taphoammo API integration
 * Provides a simple interface for all Taphoammo operations
 */
export class TaphoammoApiService {
  private static instance: TaphoammoApiService;
  
  // Service instances
  private productService: TaphoammoProductService;
  private orderService: TaphoammoOrderService;
  private apiClient: TaphoammoApiClient;
  
  private constructor() {
    this.productService = new TaphoammoProductService();
    this.orderService = new TaphoammoOrderService();
    this.apiClient = new TaphoammoApiClient();
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
  
  // Forward methods from product service
  public getStock = this.productService.getStock.bind(this.productService);
  public checkKioskActive = this.productService.checkKioskActive.bind(this.productService); 
  public testConnection = this.productService.testConnection.bind(this.productService);
  
  // Forward methods from order service
  public buyProducts = this.orderService.buyProducts.bind(this.orderService);
  public getProducts = this.orderService.getProducts.bind(this.orderService);
  public checkStockAvailability = this.orderService.checkStockAvailability.bind(this.orderService);
  
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
