
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
  
  // Forward methods from product service
  public getStock = () => this.productService.getStock();
  public checkKioskActive = () => this.productService.checkKioskActive(); 
  public testConnection = () => this.productService.testConnection();
  
  // Forward methods from order service
  public buyProducts = () => this.orderService.buyProducts();
  public getProducts = () => this.orderService.getProducts();
  public checkStockAvailability = () => this.orderService.checkStockAvailability();
  
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
