
import { 
  supabaseClient,
  corsHeaders, 
  callTaphoammoApi,
  logApiRequest,
  recordApiFailure,
  resetApiHealth,
  formatLogData,
  withRetry,
  ProductsResponse
} from "../_shared/utils.ts";

/**
 * Fetches an order by its Taphoammo order ID
 */
export async function fetchOrderByTaphoammoId(supabase: any, taphoammoOrderId: string) {
  const { data: orderItem, error } = await supabase
    .from('order_items')
    .select(`
      id,
      order_id,
      product_id,
      data,
      orders!inner(user_id)
    `)
    .filter('data->taphoammo_order_id', 'eq', taphoammoOrderId)
    .single();
    
  return { orderItem, error };
}

/**
 * Verifies if the user has permission to access this order
 */
export async function verifyOrderAccess(supabase: any, user: any, orderItem: any) {
  if (!orderItem) return true; // No order in DB means we'll check the API directly
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();
    
  const isAdmin = profile?.role === 'admin';
  const isOwner = orderItem.orders.user_id === user.id;
  
  return isAdmin || isOwner;
}

/**
 * Fetches products for an order from the Taphoammo API
 */
export async function fetchProductsFromTaphoammo(
  orderId: string,
  userToken: string,
  supabase: any
) {
  console.log(`Getting products for order: ${orderId}`);

  try {
    // Make API call with retry mechanism
    const { result: productsData, retries, responseTime } = await withRetry(async () => {
      return await callTaphoammoApi<ProductsResponse>('getProducts', {
        orderId,
        userToken
      });
    });

    // Log successful API request
    await logApiRequest(
      supabase, 
      'taphoammo', 
      'getProducts', 
      'success', 
      formatLogData({ 
        orderId,
        productsCount: productsData.data?.length
      }),
      responseTime
    );
    
    // Reset API health after successful request
    await resetApiHealth(supabase, 'taphoammo');

    return {
      success: true,
      productsData,
      retries
    };
  } catch (error) {
    // Log API failure for circuit breaker
    await recordApiFailure(supabase, 'taphoammo', error);
    
    // Log failed API request
    await logApiRequest(
      supabase, 
      'taphoammo', 
      'getProducts', 
      'error', 
      formatLogData({ orderId, error: error.message || 'Unknown error' })
    );

    throw error;
  }
}

/**
 * Updates the order item in database with product keys
 */
export async function updateOrderWithProductKeys(
  supabase: any, 
  orderItem: any, 
  productKeys: string[]
) {
  if (!orderItem) return;
  
  // Get current data and merge with new product_keys
  const currentData = orderItem.data || {};
  const updatedData = {
    ...currentData,
    product_keys: productKeys
  };
  
  await supabase
    .from('order_items')
    .update({ data: updatedData })
    .eq('id', orderItem.id);
}

/**
 * Gets locally cached product keys for an order if available
 */
export function getLocalProductKeys(orderItem: any) {
  if (orderItem?.data?.product_keys && orderItem.data.product_keys.length > 0) {
    return orderItem.data.product_keys.map((key: string) => ({
      id: 'local',
      product: key
    }));
  }
  return null;
}
