
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { 
  corsHeaders, 
  createServerSupabaseClient, 
  TAPHOAMMO_USER_TOKEN,
  checkCircuitBreaker,
  TaphoammoError,
} from "../_shared/utils.ts";

import { createSuccessResponse, createErrorResponse } from "../_shared/response-helpers.ts";
import { 
  fetchOrderByTaphoammoId, 
  verifyOrderAccess, 
  fetchProductsFromTaphoammo,
  updateOrderWithProductKeys,
  getLocalProductKeys
} from "./order-service.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get auth header for user verification
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return createErrorResponse("Missing authorization header", undefined, undefined, 401);
    }

    // Get request data
    const { orderId } = await req.json();
    
    // Validate required parameters
    if (!orderId) {
      return createErrorResponse("Missing order ID", undefined, undefined, 400);
    }

    const supabase = createServerSupabaseClient();
    
    // Get current user from auth header
    const { data: { user }, error: userError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );
    
    if (userError || !user) {
      return createErrorResponse("Authentication failed", undefined, undefined, 401);
    }

    // Check if circuit breaker is open
    const isCircuitOpen = await checkCircuitBreaker(supabase, 'taphoammo');
    if (isCircuitOpen) {
      return createErrorResponse(
        "API temporarily unavailable due to repeated failures. Please try again later.", 
        "API_TEMP_DOWN",
        undefined,
        503
      );
    }

    // Check if the order exists in our database
    const { orderItem, error: orderError } = await fetchOrderByTaphoammoId(supabase, orderId);
      
    // Verify the order belongs to the current user or user is admin
    if (orderItem) {
      const hasAccess = await verifyOrderAccess(supabase, user, orderItem);
      if (!hasAccess) {
        return createErrorResponse(
          "You don't have permission to access this order",
          undefined, 
          undefined,
          403
        );
      }
    }

    try {
      // Fetch products from Taphoammo API
      const { productsData, retries } = await fetchProductsFromTaphoammo(
        orderId, 
        TAPHOAMMO_USER_TOKEN,
        supabase
      );

      // Update order item data if it exists in our database
      if (orderItem && productsData.data) {
        const productKeys = productsData.data.map(item => item.product);
        await updateOrderWithProductKeys(supabase, orderItem, productKeys);
      }

      return createSuccessResponse({ 
        success: true, 
        message: "Order products retrieved successfully",
        products: productsData.data || [],
        retries
      });
      
    } catch (error) {
      // If we have the product keys in our database, use them as fallback
      const localProductKeys = getLocalProductKeys(orderItem);
      if (localProductKeys) {
        return createSuccessResponse({ 
          success: true, 
          message: "Using locally stored product keys due to API error",
          warning: error.message || 'API Error',
          products: localProductKeys,
          cached: true
        });
      }

      // Special handling for specific TaphoammoError types
      if (error instanceof TaphoammoError) {
        return createErrorResponse(
          error.message,
          error.code,
          error.retries
        );
      }

      // Generic error response
      return createErrorResponse(
        "Failed to get order products",
        undefined,
        undefined,
        500
      );
    }

  } catch (error) {
    console.error("Unexpected error:", error);
    
    return createErrorResponse(
      "An unexpected error occurred",
      undefined,
      undefined,
      500
    );
  }
});
