
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { 
  corsHeaders, 
  createServerSupabaseClient, 
  TAPHOAMMO_USER_TOKEN, 
  withRetry,
  callTaphoammoApi,
  ProductsResponse,
  logApiRequest,
  recordApiFailure,
  resetApiHealth,
  checkCircuitBreaker,
  formatLogData,
  TaphoammoError,
  TAPHOAMMO_ERROR_CODES
} from "../_shared/utils.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth header for user verification
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, message: "Missing authorization header" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Get request data
    const { orderId } = await req.json();
    
    // Validate required parameters
    if (!orderId) {
      return new Response(
        JSON.stringify({ success: false, message: "Missing order ID" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createServerSupabaseClient();
    
    // Get current user from auth header
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, message: "Authentication failed" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if circuit breaker is open
    const isCircuitOpen = await checkCircuitBreaker(supabase, 'taphoammo');
    if (isCircuitOpen) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "API temporarily unavailable due to repeated failures. Please try again later." 
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if the order exists in our database
    const { data: orderItem, error: orderError } = await supabase
      .from('order_items')
      .select(`
        id,
        order_id,
        product_id,
        data,
        orders!inner(user_id)
      `)
      .filter('data->taphoammo_order_id', 'eq', orderId)
      .single();
      
    // Verify the order belongs to the current user or user is admin
    if (orderItem) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
        
      const isAdmin = profile?.role === 'admin';
      const isOwner = orderItem.orders.user_id === user.id;
      
      if (!isAdmin && !isOwner) {
        return new Response(
          JSON.stringify({ success: false, message: "You don't have permission to access this order" }),
          { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    console.log(`Getting products for order: ${orderId}`);

    try {
      // Make API call with retry mechanism
      const { result: productsData, retries, responseTime } = await withRetry(async () => {
        return await callTaphoammoApi<ProductsResponse>('getProducts', {
          orderId,
          userToken: TAPHOAMMO_USER_TOKEN
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

      // Update order item data if it exists in our database
      if (orderItem && productsData.data) {
        const productKeys = productsData.data.map(item => item.product);
        
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

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Order products retrieved successfully",
          products: productsData.data || [],
          retries
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
      
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

      // If we have the product keys in our database, use them
      if (orderItem?.data?.product_keys && orderItem.data.product_keys.length > 0) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: "Using locally stored product keys due to API error",
            warning: error.message || 'API Error',
            products: orderItem.data.product_keys.map((key: string) => ({
              id: 'local',
              product: key
            })),
            cached: true
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Special handling for specific TaphoammoError types
      if (error instanceof TaphoammoError) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: error.message,
            code: error.code,
            retries: error.retries
          }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Generic error response
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Failed to get order products",
          error: error.message || 'Unknown error'
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

  } catch (error) {
    console.error("Unexpected error:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: "An unexpected error occurred",
        error: error.message || 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
