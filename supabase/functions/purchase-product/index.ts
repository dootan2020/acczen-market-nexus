
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { corsHeaders } from "../_shared/cors.ts";

// TaphoaMMO Error types
enum TaphoammoErrorCodes {
  UNEXPECTED_RESPONSE = 'UNEXPECTED_RESPONSE',
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  INSUFFICIENT_FUNDS = 'INSUFFICIENT_FUNDS',
  ORDER_PROCESSING = 'ORDER_PROCESSING',
  KIOSK_PENDING = 'KIOSK_PENDING',
  PRODUCT_NOT_FOUND = 'PRODUCT_NOT_FOUND',
  STOCK_UNAVAILABLE = 'STOCK_UNAVAILABLE',
  TIMEOUT = 'TIMEOUT',
  API_TEMP_DOWN = 'API_TEMP_DOWN',
  NETWORK_ERROR = 'NETWORK_ERROR',
  PROXY_ERROR = 'PROXY_ERROR'
}

// Response interfaces
interface ErrorResponse {
  success: false;
  message: string;
  code: string;
  details?: any;
}

interface SuccessResponse {
  success: true;
  orderId: string;
  taphoammoOrderId: string;
  message: string;
  productKeys?: string[];
  transactionId?: string;
}

// Supabase setup
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const SYSTEM_TOKEN = "0LP8RN0I7TNX6ROUD3DUS1I3LUJTQUJ4IFK9"; // Default system token for TaphoaMMO

// TaphoaMMO API helpers
async function callTaphoaMMO(endpoint: string, params: Record<string, any>, proxyType: string = "allorigins") {
  console.log(`Calling TaphoaMMO API endpoint: ${endpoint} with params:`, JSON.stringify(params));
  
  // Use system token regardless of what's provided
  if (params.userToken) {
    params.userToken = SYSTEM_TOKEN;
  }
  
  // Base URL for TaphoaMMO API
  let apiUrl = `https://taphoammo.net/api/${endpoint}?`;
  
  // Convert params to query string
  Object.keys(params).forEach((key, index) => {
    apiUrl += `${index === 0 ? '' : '&'}${key}=${encodeURIComponent(params[key])}`;
  });
  
  console.log(`Full API URL: ${apiUrl}`);
  
  // Get proxy URL based on the proxy type
  let proxyUrl;
  switch (proxyType) {
    case 'corsproxy':
      proxyUrl = `https://corsproxy.io/?${encodeURIComponent(apiUrl)}`;
      break;
    case 'cors-anywhere':
      proxyUrl = `https://cors-anywhere.herokuapp.com/${apiUrl}`;
      break;
    case 'allorigins':
    default:
      proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(apiUrl)}`;
      break;
  }
  
  console.log(`Using proxy URL: ${proxyUrl}`);
  
  try {
    // Call the API
    const response = await fetch(proxyUrl, {
      headers: {
        "User-Agent": "Digital-Deals-Hub/1.0",
        "Accept": "application/json"
      }
    });
    
    // Check if response is OK
    if (!response.ok) {
      console.error(`API returned status: ${response.status}`);
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    // Try to get response as text first
    const responseText = await response.text();
    console.log(`Raw API response: ${responseText.substring(0, 100)}...`);
    
    // Check if the response starts with HTML (common proxy error)
    if (responseText.trim().startsWith('<')) {
      console.error("Received HTML response instead of JSON");
      throw new Error("Proxy returned HTML instead of JSON. API might be unavailable.");
    }
    
    // Parse as JSON
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error("Failed to parse JSON response:", parseError);
      throw new Error(`Failed to parse response as JSON: ${parseError.message}`);
    }
    
    // Check for errors
    if (data.success === "false") {
      throw new Error(data.description || data.message || "API request failed");
    }
    
    return data;
  } catch (error) {
    console.error("Error calling TaphoaMMO API:", error);
    throw error;
  }
}

// Get current stock directly from API
async function getStockFromAPI(kioskToken: string, proxyType: string = "allorigins") {
  try {
    const data = await callTaphoaMMO("getStock", { kioskToken, userToken: SYSTEM_TOKEN }, proxyType);
    
    // Parse stock quantity
    let stockQuantity = 0;
    
    if (data.stock_quantity !== undefined) {
      stockQuantity = Number(data.stock_quantity);
    } else if (data.stock !== undefined) {
      stockQuantity = Number(data.stock);
    } else if (typeof data.message === 'string' && data.message.includes('Stock:')) {
      const match = data.message.match(/Stock:\s*(\d+)/i);
      if (match && match[1]) {
        stockQuantity = Number(match[1]);
      }
    }
    
    return {
      stock_quantity: stockQuantity,
      success: true
    };
  } catch (error) {
    console.error("Error getting stock from API:", error);
    
    // Return a special object to indicate API error
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get stock from API",
      stock_quantity: 0
    };
  }
}

// Get stock from database cache
async function getStockFromCache(kioskToken: string, supabaseAdmin: any) {
  try {
    const { data, error } = await supabaseAdmin
      .from("inventory_cache")
      .select("*")
      .eq("kiosk_token", kioskToken)
      .single();
      
    if (error || !data) {
      throw error || new Error("No cache entry found");
    }
    
    // Check if cache is still valid
    const now = new Date();
    const cachedUntil = new Date(data.cached_until);
    const isValid = now < cachedUntil;
    
    return {
      stock_quantity: data.stock_quantity,
      success: true,
      cached: true,
      valid: isValid,
      last_checked_at: data.last_checked_at
    };
  } catch (error) {
    console.error("Error getting stock from cache:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get stock from cache",
      stock_quantity: 0
    };
  }
}

// Mock TaphoaMMO response for testing when real API is down
function getMockResponse(endpoint: string, params: Record<string, any>) {
  if (endpoint === 'buyProducts') {
    return {
      success: "true",
      order_id: `mock-order-${Date.now()}`,
      message: "Mock purchase successful"
    };
  }
  
  return {
    success: "true",
    message: "Mock response",
    data: []
  };
}

// Main handler
serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase clients
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Get the JWT from the request
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return errorResponse("Unauthorized", "UNAUTHORIZED", 401);
    }
    
    // Get the JWT token from the Authorization header
    const jwt = authHeader.replace("Bearer ", "");
    
    // Verify the JWT token and get the user
    const { data: { user }, error: authError } = await authClient.auth.getUser(jwt);
    
    if (authError || !user) {
      console.error("Auth error:", authError);
      return errorResponse("Unauthorized: Invalid token", "INVALID_TOKEN", 401);
    }
    
    // Get the request body
    const requestData = await req.json();
    console.log("Request data:", requestData);
    
    // Validate request
    if (!requestData.kioskToken) {
      return errorResponse("Invalid request: Missing kioskToken", "INVALID_REQUEST", 400);
    }
    
    const kioskToken = requestData.kioskToken;
    const quantity = requestData.quantity || 1;
    const proxyType = requestData.proxyType || "allorigins";
    const promotion = requestData.promotion;
    
    // Get product details
    const { data: product, error: productError } = await supabaseAdmin
      .from("products")
      .select("id, name, price, sale_price, stock_quantity")
      .eq("kiosk_token", kioskToken)
      .single();
    
    if (productError || !product) {
      console.error("Error fetching product:", productError);
      return errorResponse("Product not found", "PRODUCT_NOT_FOUND", 404);
    }
    
    // Here's where we do the additional stock verification
    console.log("Verifying stock before purchase...");
    
    // Try to get real-time stock from API first
    const apiStock = await getStockFromAPI(kioskToken, proxyType);
    
    let finalStockQuantity;
    
    if (apiStock.success) {
      console.log(`API stock check successful. Stock: ${apiStock.stock_quantity}`);
      finalStockQuantity = apiStock.stock_quantity;
      
      // Update database with the new stock value
      try {
        await supabaseAdmin
          .from('inventory_cache')
          .upsert({
            kiosk_token: kioskToken,
            product_id: product.id,
            stock_quantity: apiStock.stock_quantity,
            last_checked_at: new Date().toISOString(),
            cached_until: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
            last_sync_status: 'success'
          }, {
            onConflict: 'kiosk_token'
          });
          
        await supabaseAdmin
          .from('products')
          .update({
            stock_quantity: apiStock.stock_quantity
          })
          .eq('id', product.id);
      } catch (updateError) {
        console.error("Failed to update stock in database:", updateError);
        // Non-critical error, continue with purchase
      }
    } else {
      // If API check fails, try to get from cache
      console.log("API stock check failed, trying cache...");
      const cacheStock = await getStockFromCache(kioskToken, supabaseAdmin);
      
      if (cacheStock.success) {
        console.log(`Cache stock check successful. Stock: ${cacheStock.stock_quantity}`);
        finalStockQuantity = cacheStock.stock_quantity;
        
        // Check if cache is too old (older than 1 hour)
        const lastChecked = new Date(cacheStock.last_checked_at);
        const now = new Date();
        const diffMinutes = (now.getTime() - lastChecked.getTime()) / (1000 * 60);
        
        if (diffMinutes > 60) {
          console.log(`Warning: Cache is ${diffMinutes.toFixed(0)} minutes old`);
        }
      } else {
        // If both API and cache fail, use product table as last resort
        console.log("Cache stock check failed, using product table value.");
        finalStockQuantity = product.stock_quantity;
      }
    }
    
    // Verify stock
    console.log(`Verifying stock: Required=${quantity}, Available=${finalStockQuantity}`);
    if (finalStockQuantity < quantity) {
      return errorResponse(
        `Insufficient stock. Required: ${quantity}, Available: ${finalStockQuantity}`,
        "INSUFFICIENT_STOCK",
        400
      );
    }
    
    // Get user balance
    const { data: userData, error: userError } = await supabaseAdmin
      .from("profiles")
      .select("balance, discount_percentage")
      .eq("id", user.id)
      .single();
    
    if (userError) {
      console.error("Error fetching user data:", userError);
      return errorResponse("Failed to retrieve user information", "USER_FETCH_ERROR", 500);
    }
    
    // Calculate price
    const productPrice = product.sale_price && Number(product.sale_price) > 0 
      ? Number(product.sale_price) 
      : product.price;
    
    // Apply discount if available
    const discountPercentage = userData.discount_percentage || 0;
    const discountAmount = productPrice * quantity * (discountPercentage / 100);
    const totalPrice = (productPrice * quantity) - discountAmount;
    
    // Check if user has enough balance
    if (userData.balance < totalPrice) {
      return errorResponse(
        `Insufficient balance. Required: ${totalPrice}, Available: ${userData.balance}`,
        "INSUFFICIENT_FUNDS",
        400
      );
    }
    
    // Create order in the database first
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: user.id,
        total_amount: totalPrice,
        status: "pending"
      })
      .select()
      .single();
    
    if (orderError) {
      console.error("Error creating order:", orderError);
      return errorResponse("Failed to create order", "ORDER_CREATION_ERROR", 500);
    }
    
    let taphoammoOrderResult;
    
    try {
      // Call TaphoaMMO API to purchase product
      console.log("Attempting to call TaphoaMMO API");
      taphoammoOrderResult = await callTaphoaMMO("buyProducts", {
        kioskToken,
        userToken: SYSTEM_TOKEN,
        quantity
      }, proxyType);
      
      if (!taphoammoOrderResult || !taphoammoOrderResult.order_id) {
        throw new Error("Invalid response from TaphoaMMO API");
      }
      
      console.log("TaphoaMMO API response:", taphoammoOrderResult);
    } catch (apiError) {
      console.error("TaphoaMMO API error:", apiError);
      
      // Check if this is a critical error or if we should use mock data
      const useMockData = Deno.env.get("USE_MOCK_DATA") === "true";
      
      if (useMockData) {
        console.log("Using mock data due to API error");
        taphoammoOrderResult = getMockResponse("buyProducts", {
          kioskToken,
          userToken: SYSTEM_TOKEN,
          quantity
        });
      } else {
        // Rollback the order
        await supabaseAdmin
          .from("orders")
          .update({ status: "failed" })
          .eq("id", order.id);
        
        return errorResponse(
          apiError instanceof Error ? apiError.message : "Failed to purchase from supplier",
          "API_ERROR",
          500
        );
      }
    }
    
    // Create order item
    const { error: orderItemError } = await supabaseAdmin
      .from("order_items")
      .insert({
        order_id: order.id,
        product_id: product.id,
        quantity,
        price: productPrice,
        total: productPrice * quantity,
        data: {
          kiosk_token: kioskToken,
          taphoammo_order_id: taphoammoOrderResult.order_id
        }
      });
    
    if (orderItemError) {
      console.error("Error creating order item:", orderItemError);
      
      // Don't rollback here, we've already purchased from TaphoaMMO
      // We'll need to handle this case in the admin panel
    }
    
    // Update product stock in our database
    await supabaseAdmin
      .from("products")
      .update({
        stock_quantity: Math.max(0, finalStockQuantity - quantity)
      })
      .eq("id", product.id);
      
    // Also update cache if it exists
    await supabaseAdmin
      .from('inventory_cache')
      .update({
        stock_quantity: Math.max(0, finalStockQuantity - quantity)
      })
      .eq('kiosk_token', kioskToken);
    
    // Update user balance
    const { error: balanceError } = await supabaseAdmin
      .from("profiles")
      .update({
        balance: userData.balance - totalPrice
      })
      .eq("id", user.id);
    
    if (balanceError) {
      console.error("Error updating balance:", balanceError);
      // Don't rollback, but log the error
    }
    
    // Record the transaction
    const { data: transaction, error: transactionError } = await supabaseAdmin
      .from("transactions")
      .insert({
        user_id: user.id,
        amount: totalPrice,
        type: "purchase",
        description: `Purchase of ${quantity} x ${product.name}`,
        reference_id: order.id
      })
      .select()
      .single();
    
    if (transactionError) {
      console.error("Error recording transaction:", transactionError);
      // Don't rollback, but log the error
    }
    
    // Update order status to completed
    await supabaseAdmin
      .from("orders")
      .update({
        status: "completed"
      })
      .eq("id", order.id);
    
    // Try to get product keys immediately (they might not be available yet)
    let productKeys;
    try {
      const productsResult = await callTaphoaMMO("getProducts", {
        orderId: taphoammoOrderResult.order_id,
        userToken: SYSTEM_TOKEN
      }, proxyType);
      
      if (productsResult.success === "true" && productsResult.data && productsResult.data.length > 0) {
        productKeys = productsResult.data.map((item: any) => item.product);
        
        // Update order item with product keys
        await supabaseAdmin
          .from("order_items")
          .update({
            data: {
              kiosk_token: kioskToken,
              taphoammo_order_id: taphoammoOrderResult.order_id,
              product_keys: productKeys
            }
          })
          .eq("order_id", order.id);
      }
    } catch (getProductsError) {
      console.log("Product keys not immediately available:", getProductsError);
      // This is expected sometimes, keys might not be available immediately
    }
    
    return successResponse(
      order.id,
      taphoammoOrderResult.order_id,
      "Purchase successful",
      productKeys,
      transaction?.id
    );
  } catch (error) {
    console.error("Unexpected error:", error);
    return errorResponse(
      error instanceof Error ? error.message : "An unexpected error occurred",
      "UNEXPECTED_ERROR",
      500
    );
  }
});

// Helper functions
function errorResponse(message: string, code: string, status: number = 400, details?: any): Response {
  const body: ErrorResponse = {
    success: false,
    message,
    code,
    details
  };
  
  return new Response(
    JSON.stringify(body),
    { 
      status, 
      headers: { 
        ...corsHeaders,
        "Content-Type": "application/json"
      } 
    }
  );
}

function successResponse(
  orderId: string, 
  taphoammoOrderId: string, 
  message: string,
  productKeys?: string[],
  transactionId?: string
): Response {
  const body: SuccessResponse = {
    success: true,
    orderId,
    taphoammoOrderId,
    message,
    productKeys,
    transactionId
  };
  
  return new Response(
    JSON.stringify(body),
    {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    }
  );
}
