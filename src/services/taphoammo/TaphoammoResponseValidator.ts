
import { TaphoammoError, TaphoammoErrorCodes } from '@/types/taphoammo-errors';

/**
 * Validator for Taphoammo API responses
 */
export class TaphoammoResponseValidator {
  /**
   * Validate API response data
   * @throws TaphoammoError if validation fails
   */
  public validate(method: string, data: any): void {
    // Check if data exists
    if (!data) {
      throw new TaphoammoError(
        'Không nhận được dữ liệu từ API',
        TaphoammoErrorCodes.UNEXPECTED_RESPONSE,
        0,
        0
      );
    }
    
    // Check for API success/failure indication
    if (data && data.success === "false" || data.success === false) {
      throw new TaphoammoError(
        data.message || data.description || 'Unknown API error',
        TaphoammoErrorCodes.UNEXPECTED_RESPONSE,
        0,
        0
      );
    }
    
    // Method-specific validations
    this.validateMethodSpecific(method, data);
  }
  
  /**
   * Method-specific validations
   */
  private validateMethodSpecific(method: string, data: any): void {
    switch (method) {
      case 'get_product':
        if (!data.product && !data.name) {
          throw new TaphoammoError(
            'Không tìm thấy thông tin sản phẩm trong phản hồi API',
            TaphoammoErrorCodes.UNEXPECTED_RESPONSE,
            0,
            0
          );
        }
        break;
        
      // Add other method-specific validations as needed
      
      default:
        // No specific validation for other methods
        break;
    }
  }
}
