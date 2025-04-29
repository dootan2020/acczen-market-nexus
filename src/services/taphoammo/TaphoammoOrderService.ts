
import { ProxyType } from '@/utils/corsProxy';

// Define return type for buyProducts method
export interface OrderResponse {
  order_id: string;
  product_keys?: string[];
  success?: string;
  message?: string;
  description?: string;
  status?: string;
}

// Define return type for getProducts method
export interface ProductsResponse {
  success: string;
  data?: Array<{ id: string; product: string }>;
  message?: string;
  description?: string;
}

/**
 * Order service for Taphoammo API
 * This service directly interacts with the Taphoammo API using CORS proxies
 */
export class TaphoammoOrderService {
  private apiClient: any;
  
  constructor() {
    this.apiClient = {};
  }
  
  /**
   * Buy products from Taphoammo
   */
  public async buyProducts(
    kioskToken: string,
    quantity: number = 1,
    userToken: string = '0LP8RN0I7TNX6ROUD3DUS1I3LUJTQUJ4IFK9',
    promotion?: string,
    proxyType: ProxyType = 'allorigins'
  ): Promise<OrderResponse> {
    try {
      // Create the API URL with query parameters
      let apiUrl = `https://taphoammo.net/api/buyProducts?kioskToken=${kioskToken}&userToken=${userToken}&quantity=${quantity}`;
      if (promotion) {
        apiUrl += `&promotion=${promotion}`;
      }
      
      // Get the proxy URL based on the selected proxy type
      const proxyUrl = this.getProxyUrl(apiUrl, proxyType);
      
      // Make the request to the API
      const response = await fetch(proxyUrl);
      const data = await response.json();
      
      // Check if the request was successful
      if (data.success === "false") {
        throw new Error(data.description || data.message || 'Failed to buy products');
      }
      
      return data as OrderResponse;
    } catch (error) {
      console.error('Error buying products:', error);
      throw error;
    }
  }
  
  /**
   * Get products from an order
   */
  public async getProducts(
    orderId: string,
    userToken: string = '0LP8RN0I7TNX6ROUD3DUS1I3LUJTQUJ4IFK9',
    proxyType: ProxyType = 'allorigins'
  ): Promise<ProductsResponse> {
    try {
      // Create the API URL with query parameters
      const apiUrl = `https://taphoammo.net/api/getProducts?orderId=${orderId}&userToken=${userToken}`;
      
      // Get the proxy URL based on the selected proxy type
      const proxyUrl = this.getProxyUrl(apiUrl, proxyType);
      
      // Make the request to the API
      const response = await fetch(proxyUrl);
      const data = await response.json();
      
      // Check if the request was successful
      if (data.success === "false") {
        throw new Error(data.description || data.message || 'Failed to get products');
      }
      
      return data as ProductsResponse;
    } catch (error) {
      console.error('Error getting products:', error);
      throw error;
    }
  }
  
  /**
   * Check stock availability
   */
  public async checkStockAvailability(
    kioskToken: string,
    quantity: number = 1,
    proxyType: ProxyType = 'allorigins'
  ): Promise<{
    available: boolean;
    message?: string;
  }> {
    try {
      // Create the API URL with query parameters
      const apiUrl = `https://taphoammo.net/api/getStock?kioskToken=${kioskToken}`;
      
      // Get the proxy URL based on the selected proxy type
      const proxyUrl = this.getProxyUrl(apiUrl, proxyType);
      
      // Make the request to the API
      const response = await fetch(proxyUrl);
      const data = await response.json();
      
      // Check if the request was successful
      if (data.success === "false") {
        return {
          available: false,
          message: data.description || data.message || 'Failed to check stock availability'
        };
      }
      
      // Check if there is enough stock
      const stockAvailable = parseInt(data.stock || '0');
      if (stockAvailable < quantity) {
        return {
          available: false,
          message: `Insufficient stock. Requested: ${quantity}, Available: ${stockAvailable}`
        };
      }
      
      return {
        available: true,
        message: `Stock available: ${stockAvailable}`
      };
    } catch (error) {
      console.error('Error checking stock availability:', error);
      return {
        available: false,
        message: `Error checking stock: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
  
  /**
   * Get the proxy URL based on the selected proxy type
   */
  private getProxyUrl(apiUrl: string, proxyType: ProxyType): string {
    switch (proxyType) {
      case 'corsproxy':
        return `https://corsproxy.io/?${encodeURIComponent(apiUrl)}`;
      case 'cors-anywhere':
        return `https://cors-anywhere.herokuapp.com/${apiUrl}`;
      case 'allorigins':
      default:
        return `https://api.allorigins.win/raw?url=${encodeURIComponent(apiUrl)}`;
    }
  }
}
