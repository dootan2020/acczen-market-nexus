
// Add this if it doesn't exist yet or update the existing interface
export interface TaphoammoProduct {
  kiosk_token?: string;
  name?: string;
  stock_quantity: number;
  price: number;
  cached?: boolean;
  cacheId?: string;
  emergency?: boolean;
}
