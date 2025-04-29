
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { 
  corsHeaders, 
  createServerSupabaseClient, 
  TAPHOAMMO_USER_TOKEN, 
  withRetry,
  callTaphoammoApi,
  StockResponse,
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
    // Get request data
    const { kioskToken, productId } = await req.json();
    
    // Validate required parameters
    if (!kioskToken) {
      return new Response(
        JSON.stringify({ success: false, message: "Missing kiosk token" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createServerSupabaseClient();

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

    console.log(`Syncing stock for product with kiosk token: ${kioskToken}`);
    
    try {
      // Make API call with retry mechanism
      const { result: stockData, retries, responseTime } = await withRetry(async () => {
        return await callTaphoammoApi<StockResponse>('getStock', {
          kioskToken,
          userToken: TAPHOAMMO_USER_TOKEN
        });
      });

      // Log successful API request
      await logApiRequest(
        supabase, 
        'taphoammo', 
        'getStock', 
        'success', 
        formatLogData({ 
          kioskToken, 
          stockQuantity: stockData.stock_quantity, 
          name: stockData.name,
          price: stockData.price
        }),
        responseTime
      );
      
      // Reset API health after successful request
      await resetApiHealth(supabase, 'taphoammo');

      // If no productId provided, just return the stock data
      if (!productId) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            stockInfo: {
              name: stockData.name,
              stock_quantity: stockData.stock_quantity,
              price: stockData.price
            },
            retries
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // If productId provided, update the product in the database
      // Check if the product exists
      const { data: product } = await supabase
        .from('products')
        .select('id, name, stock_quantity, price')
        .eq('id', productId)
        .single();
        
      if (!product) {
        return new Response(
          JSON.stringify({ success: false, message: "Product not found" }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      // Update inventory cache for tracking history
      await supabase.from('inventory_cache').upsert({
        product_id: productId,
        kiosk_token: kioskToken,
        stock_quantity: stockData.stock_quantity || 0,
        price: stockData.price || 0,
        last_checked_at: new Date().toISOString(),
        cached_until: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // Cache for 15 minutes
        last_sync_status: 'success'
      }, {
        onConflict: 'product_id'
      });

      // Update product stock if changed
      if (product.stock_quantity !== stockData.stock_quantity || 
          product.price !== stockData.price) {
        
        // Log stock change
        await supabase.from('inventory_sync_history').insert({
          product_id: productId,
          kiosk_token: kioskToken,
          old_quantity: product.stock_quantity,
          new_quantity: stockData.stock_quantity || 0,
          old_price: product.price,
          new_price: stockData.price || 0,
          sync_type: 'auto',
          status: 'success',
          message: `Stock synchronized from ${product.stock_quantity} to ${stockData.stock_quantity}`
        });
        
        // Update the product
        const { error: updateError } = await supabase
          .from('products')
          .update({
            stock_quantity: stockData.stock_quantity || 0,
            price: stockData.price || 0,
            updated_at: new Date().toISOString(),
            // Update status to out_of_stock if no stock available
            status: stockData.stock_quantity && stockData.stock_quantity > 0 ? 'active' : 'out_of_stock'
          })
          .eq('id', productId);
          
        if (updateError) {
          throw new Error(`Failed to update product: ${updateError.message}`);
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "Stock synchronized successfully",
          stockInfo: {
            name: stockData.name,
            stock_quantity: stockData.stock_quantity,
            price: stockData.price
          },
          updated: product.stock_quantity !== stockData.stock_quantity,
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
        'getStock', 
        'error', 
        formatLogData({ kioskToken, error: error.message || 'Unknown error' })
      );

      // If inventory cache exists, use it as fallback
      if (productId) {
        const { data: cache } = await supabase
          .from('inventory_cache')
          .select('*')
          .eq('product_id', productId)
          .single();
          
        if (cache) {
          // Update cache status
          await supabase
            .from('inventory_cache')
            .update({
              last_sync_status: 'error',
              retry_count: cache.retry_count + 1,
              sync_message: error.message || 'Unknown error',
              last_checked_at: new Date().toISOString()
            })
            .eq('product_id', productId);
            
          return new Response(
            JSON.stringify({ 
              success: true, 
              message: "Using cached data due to API error",
              warning: error.message || 'API Error',
              stockInfo: {
                name: cache.name,
                stock_quantity: cache.stock_quantity,
                price: cache.price
              },
              cached: true,
              cache_updated_at: cache.updated_at
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      // Special handling for specific TaphoammoError types
      if (error instanceof TaphoammoError) {
        // Handle kiosk pending specifically
        if (error.code === TAPHOAMMO_ERROR_CODES.KIOSK_PENDING) {
          // Update product as inactive if we have a productId
          if (productId) {
            await supabase
              .from('products')
              .update({ status: 'inactive', updated_at: new Date().toISOString() })
              .eq('id', productId);
          }
          
          return new Response(
            JSON.stringify({ 
              success: false, 
              message: "Sản phẩm tạm thời không khả dụng",
              error: error.message,
              code: error.code
            }),
            { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }

      // Generic error response
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: "Failed to sync product",
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
