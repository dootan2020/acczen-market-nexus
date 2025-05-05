
import { TaphoammoError, TaphoammoErrorCodes } from '@/types/taphoammo-errors';

/**
 * Response validator for Taphoammo API
 * Validates responses from the API and throws appropriate errors
 */
export class TaphoammoResponseValidator {
  /**
   * Validate response from Taphoammo API
   */
  public validate(method: string, data: any): void {
    // Basic validation - check if data exists
    if (!data) {
      throw new TaphoammoError(
        `Invalid response from ${method}: Empty response`,
        TaphoammoErrorCodes.UNEXPECTED_RESPONSE
      );
    }
    
    // For stock endpoint, check for specific error messages
    if (method === 'stock' || method === 'getStock') {
      this.validateStockResponse(data);
    }
    
    // For order endpoint, check for specific error messages
    if (method === 'buyProducts') {
      this.validateOrderResponse(data);
    }
    
    // For getProducts endpoint, check for specific error messages
    if (method === 'getProducts') {
      this.validateGetProductsResponse(data);
    }
  }
  
  /**
   * Validate stock response
   */
  private validateStockResponse(data: any): void {
    // Check for Taphoammo API specific error messages
    if (data.success === "false") {
      if (data.description?.includes('Kiosk is pending')) {
        throw new TaphoammoError(
          'Kiosk is pending approval',
          TaphoammoErrorCodes.KIOSK_PENDING
        );
      }
      
      if (data.description?.includes('temporarily unavailable') || 
          data.description?.includes('tạm thời không khả dụng')) {
        throw new TaphoammoError(
          'API is temporarily unavailable',
          TaphoammoErrorCodes.API_TEMP_DOWN
        );
      }
      
      throw new TaphoammoError(
        data.description || 'Failed to get stock information',
        TaphoammoErrorCodes.UNEXPECTED_RESPONSE
      );
    }
    
    // Check for stock field (for stock response)
    if (data.stock !== undefined && parseInt(data.stock) === 0) {
      throw new TaphoammoError(
        'Product is out of stock',
        TaphoammoErrorCodes.STOCK_UNAVAILABLE
      );
    }
  }
  
  /**
   * Validate order response
   */
  private validateOrderResponse(data: any): void {
    if (data.success === "false") {
      // Handle insufficient funds
      if (data.description?.includes('Insufficient funds') || 
          data.description?.includes('Không đủ tiền')) {
        throw new TaphoammoError(
          'Insufficient funds to complete purchase',
          TaphoammoErrorCodes.INSUFFICIENT_FUNDS
        );
      }
      
      // Handle out of stock
      if (data.description?.includes('out of stock') || 
          data.description?.includes('hết hàng')) {
        throw new TaphoammoError(
          'Product is out of stock',
          TaphoammoErrorCodes.STOCK_UNAVAILABLE
        );
      }
      
      throw new TaphoammoError(
        data.description || 'Failed to purchase product',
        TaphoammoErrorCodes.UNEXPECTED_RESPONSE
      );
    }
    
    // Ensure order_id exists in successful response
    if (!data.order_id) {
      throw new TaphoammoError(
        'Missing order ID in successful response',
        TaphoammoErrorCodes.UNEXPECTED_RESPONSE
      );
    }
  }
  
  /**
   * Validate getProducts response
   */
  private validateGetProductsResponse(data: any): void {
    if (data.success === "false") {
      // Handle order processing
      if (data.description?.includes('Order in processing') || 
          data.description?.includes('Đơn hàng đang xử lý')) {
        throw new TaphoammoError(
          'Order is still processing',
          TaphoammoErrorCodes.ORDER_PROCESSING
        );
      }
      
      throw new TaphoammoError(
        data.description || 'Failed to get products',
        TaphoammoErrorCodes.UNEXPECTED_RESPONSE
      );
    }
  }
}
