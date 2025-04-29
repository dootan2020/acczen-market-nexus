
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { 
  corsHeaders, 
  createServerSupabaseClient, 
  TAPHOAMMO_USER_TOKEN, 
  withRetry,
  callTaphoammoApi,
  OrderResponse,
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
    const { kioskToken, quantity = 1, productId, promotion } = await req.json();
    
    // Validate required parameters
    if (!kioskToken) {
      return new Response(
        JSON.stringify({ success: false, message: "Missing kiosk token" }),
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

    // Verify the product exists if productId is provided
    if (productId) {
      const { data: product, error: productError } = await supabase
        .from('products')
        .select('name, price, stock_quantity, kiosk_token')
        .eq('id', productId)
        .single();
        
      if (productError || !product) {
        return new Response(
          JSON.stringify({ success: false, message: "Product not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Verify kiosk token matches
      if (product.kiosk_token !== kioskToken) {
        return new Response(
          JSON.stringify({ success: false, message: "Invalid kiosk token for this product" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Check stock quantity
      if (product.stock_quantity < quantity) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: `Insufficient stock. Requested: ${quantity}, Available: ${product.stock_quantity}` 
          }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }
    
    // Check user balance
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('balance')
      .eq('id', user.id)
      .single();
      
    if (profileError || !profile) {
      return new Response(
        JSON.stringify({ success: false, message: "User profile not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Calculate total price if product is provided
    let totalPrice = 0;
    let productName = '';
    
    if (productId) {
      const { data: product } = await supabase
        .from('products')
        .select('name, price, sale_price')
        .eq('id', productId)
        .single();
        
      if (product) {
        totalPrice = (product.sale_price || product.price) * quantity;
        productName = product.name;
        
        // Check balance
        if (profile.balance < totalPrice) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              message: `Insufficient balance. Required: ${totalPrice}, Available: ${profile.balance}` 
            }),
            { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
    }

    console.log(`Processing purchase for product ${productId} with kiosk token: ${kioskToken}, quantity: ${quantity}`);

    try {
      // Make API call with retry mechanism
      const buyParams: Record<string, string | number> = {
        kioskToken,
        userToken: TAPHOAMMO_USER_TOKEN,
        quantity
      };
      
      if (promotion) {
        buyParams.promotion = promotion;
      }

      const { result: orderData, retries, responseTime } = await withRetry(async () => {
        return await callTaphoammoApi<OrderResponse>('buyProducts', buyParams);
      });

      // Log successful API request
      await logApiRequest(
        supabase, 
        'taphoammo', 
        'buyProducts', 
        'success', 
        formatLogData({ 
          kioskToken, 
          quantity,
          orderId: orderData.order_id,
          status: orderData.status,
          keysCount: orderData.product_keys?.length
        }),
        responseTime
      );
      
      // Reset API health after successful request
      await resetApiHealth(supabase, 'taphoammo');

      // Create a transaction in a database
      if (productId) {
        // Start database transaction
        // 1. Create order
        const { data: order, error: orderError } = await supabase
          .from('orders')
          .insert({
            user_id: user.id,
            total_amount: totalPrice,
            status: 'completed'
          })
          .select('id')
          .single();
          
        if (orderError) {
          console.error("Failed to create order:", orderError);
          // Continue anyway to not block the user, they already paid
        }
        
        // 2. Create order item
        if (order) {
          await supabase
            .from('order_items')
            .insert({
              order_id: order.id,
              product_id: productId,
              quantity: quantity,
              price: totalPrice / quantity,
              total: totalPrice,
              data: {
                taphoammo_order_id: orderData.order_id,
                product_keys: orderData.product_keys || [],
                status: orderData.status
              }
            });
        }
        
        // 3. Deduct user balance
        await supabase
          .from('profiles')
          .update({ balance: profile.balance - totalPrice })
          .eq('id', user.id);
          
        // 4. Create transaction record
        await supabase
          .from('transactions')
          .insert({
            user_id: user.id,
            type: 'purchase',
            amount: -totalPrice,
            description: `Purchase of ${quantity}x ${productName}`,
            reference_id: order?.id
          });
          
        // 5. Update product stock
        await supabase
          .from('products')
          .update({ 
            stock_quantity: supabase.rpc('decrement', { x: quantity }),
            updated_at: new Date().toISOString()
          })
          .eq('id', productId);
          
        // 6. Create inventory sync history
        const { data: productData } = await supabase
          .from('products')
          .select('stock_quantity')
          .eq('id', productId)
          .single();
          
        if (productData) {
          await supabase
            .from('inventory_sync_history')
            .insert({
              product_id: productId,
              kiosk_token: kioskToken,
              old_quantity: productData.stock_quantity + quantity,
              new_quantity: productData.stock_quantity,
              sync_type: 'purchase',
              status: 'success',
              message: `Stock reduced by ${quantity} due to purchase`
            });
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Purchase successful",
          order_id: orderData.order_id,
          status: orderData.status || 'completed',
          product_keys: orderData.product_keys || [],
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
        'buyProducts', 
        'error', 
        formatLogData({ kioskToken, quantity, error: error.message || 'Unknown error' })
      );

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
          message: "Failed to process purchase",
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
