
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const SYSTEM_TOKEN = "0LP8RN0I7TNX6ROUD3DUS1I3LUJTQUJ4IFK9"; // Default system token for TaphoaMMO

// TaphoaMMO API helpers
async function callTaphoaMMO(endpoint: string, params: Record<string, any>, proxyType: string = "allorigins") {
  console.log(`[TaphoaMMO API] Calling ${endpoint} with params:`, JSON.stringify({ ...params, userToken: undefined }));
  
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
  
  try {
    // Call the API with timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
    
    const response = await fetch(proxyUrl, { signal: controller.signal });
    clearTimeout(timeoutId);
    
    // Check if response is OK
    if (!response.ok) {
      console.error(`API returned status: ${response.status}`);
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    // Try to get response as text first
    const responseText = await response.text();
    console.log(`Raw API response (first 200 chars): ${responseText.substring(0, 200)}...`);
    
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
    
    return data;
  } catch (error) {
    console.error("Error calling TaphoaMMO API:", error);
    throw error;
  }
}

// Main handler
serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase clients
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Get request body
    const requestData = await req.json();
    
    // Check if the request is an authenticated request
    let userId: string | null = null;
    const authHeader = req.headers.get("authorization");
    
    if (authHeader) {
      try {
        const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(
          authHeader.replace("Bearer ", "")
        );
        
        if (!authError && user) {
          userId = user.id;
        }
      } catch (authError) {
        console.error("Error authenticating user:", authError);
      }
    }
    
    // Check the circuit breaker
    const { data: circuitData } = await supabase
      .from("api_health")
      .select("is_open, opened_at, half_open, consecutive_success")
      .eq("api_name", "taphoammo")
      .single();
    
    // If the circuit is open, check if it's time to try half-open
    if (circuitData?.is_open && !circuitData?.half_open) {
      const openedAt = new Date(circuitData.opened_at);
      const now = new Date();
      const timeElapsed = now.getTime() - openedAt.getTime();
      
      // After 5 minutes, try half-open
      if (timeElapsed > 5 * 60 * 1000) {
        await supabase.rpc("set_circuit_half_open", { api_name_param: "taphoammo" });
        console.log("Setting circuit to half-open state");
      } else {
        // If the circuit is still fully open, use database cache if available
        if (requestData.action === "getStockWithCache" || requestData.action === "getStock") {
          const { data: cacheData } = await supabase
            .from("inventory_cache")
            .select("*")
            .eq("kiosk_token", requestData.kioskToken)
            .single();
          
          if (cacheData) {
            console.log("Circuit is open, using cached data for:", requestData.kioskToken);
            return new Response(
              JSON.stringify({
                success: true,
                kiosk_token: requestData.kioskToken,
                name: cacheData.name || "Unknown Product",
                stock_quantity: cacheData.stock_quantity,
                price: cacheData.price,
                cached: true,
                emergency: true,
                source: "emergency_cache",
                message: "Circuit breaker is open, using cached data"
              }),
              { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }
        
        // If no cache available, return error
        return new Response(
          JSON.stringify({
            success: false,
            message: "API is temporarily unavailable. Please try again later.",
            source: "circuit_breaker"
          }),
          { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }
    
    // Handle different API actions
    const action = requestData.action;
    const proxyType = requestData.proxy_type || "allorigins";
    
    // Log API call
    const apiLogEntry = {
      api: "taphoammo",
      endpoint: action,
      status: "pending",
      details: {
        params: { ...requestData, userToken: undefined }, // Don't log tokens
        user_id: userId
      }
    };
    
    const { data: apiLog } = await supabase
      .from("api_logs")
      .insert(apiLogEntry)
      .select()
      .single();
    
    const startTime = Date.now();
    let responseData;
    
    try {
      switch (action) {
        case "getStock":
          responseData = await handleGetStock(requestData, supabase, proxyType);
          break;
          
        case "getStockWithCache":
          responseData = await handleGetStockWithCache(requestData, supabase, proxyType);
          break;
          
        case "buyProducts":
          responseData = await handleBuyProducts(requestData, supabase, proxyType);
          break;
          
        case "getProducts":
          responseData = await handleGetProducts(requestData, supabase, proxyType);
          break;
          
        case "test_connection":
          responseData = await handleTestConnection(requestData, supabase, proxyType);
          break;
          
        case "check_kiosk_active":
          responseData = await handleCheckKioskActive(requestData, supabase, proxyType);
          break;
          
        default:
          throw new Error(`Unknown action: ${action}`);
      }
      
      // Record response time
      const responseTime = Date.now() - startTime;
      
      // Update API log
      await supabase
        .from("api_logs")
        .update({
          status: "success",
          response_time: responseTime,
          details: {
            ...apiLog?.details,
            response_time: responseTime
          }
        })
        .eq("id", apiLog?.id);
      
      // If circuit is half-open, increment consecutive success
      if (circuitData?.half_open) {
        const { data: successCount } = await supabase.rpc(
          "increment_consecutive_success", 
          { api_name_param: "taphoammo" }
        );
        
        // If we have 3 consecutive successes, reset circuit
        if (successCount >= 3) {
          await supabase
            .from("api_health")
            .update({
              is_open: false,
              half_open: false,
              error_count: 0,
              consecutive_success: 0,
              last_error: null
            })
            .eq("api_name", "taphoammo");
          
          console.log("Circuit breaker reset after consecutive successes");
        }
      }
      
      return new Response(
        JSON.stringify(responseData),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
      
    } catch (error) {
      // Record error in API log
      const responseTime = Date.now() - startTime;
      await supabase
        .from("api_logs")
        .update({
          status: "error",
          response_time: responseTime,
          details: {
            ...apiLog?.details,
            error: error instanceof Error ? error.message : "Unknown error",
            response_time: responseTime
          }
        })
        .eq("id", apiLog?.id);
      
      // Update circuit breaker
      await supabase.rpc("increment_error_count");
      
      // Check if we should open the circuit
      const { data: shouldOpen } = await supabase.rpc("check_if_should_open_circuit");
      if (shouldOpen) {
        await supabase
          .from("api_health")
          .update({
            is_open: true,
            opened_at: new Date().toISOString(),
            last_error: error instanceof Error ? error.message : "Unknown error"
          })
          .eq("api_name", "taphoammo");
        
        console.log("Circuit breaker opened due to consecutive errors");
      }
      
      // If circuit is half-open, reset to fully open
      if (circuitData?.half_open) {
        await supabase.rpc("reset_circuit_half_open", { api_name_param: "taphoammo" });
      }
      
      throw error;
    }
  } catch (error) {
    console.error("Error handling request:", error);
    
    // Provide more detailed error info
    const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
    const errorDetails = error instanceof Error && error.stack ? error.stack : "No stack trace available";
    
    return new Response(
      JSON.stringify({
        success: false,
        message: errorMessage,
        details: errorDetails
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

// Action handlers
async function handleGetStock(requestData: any, supabase: any, proxyType: string) {
  const { kioskToken } = requestData;
  
  if (!kioskToken) {
    throw new Error("Missing kioskToken");
  }
  
  console.log(`[GetStock] Getting stock info for ${kioskToken}`);
  
  // Check for mock mode
  if (requestData.debug_mock === "true") {
    const { data: mockProduct } = await supabase
      .from("taphoammo_mock_products")
      .select("*")
      .eq("kiosk_token", kioskToken)
      .single();
    
    if (mockProduct) {
      return {
        success: true,
        kiosk_token: kioskToken,
        name: mockProduct.name,
        stock_quantity: mockProduct.stock_quantity,
        price: mockProduct.price,
        source: "mock"
      };
    }
  }
  
  // Call TaphoaMMO API
  const apiResponse = await callTaphoaMMO("getStock", { kioskToken }, proxyType);
  
  // Parse response with more reliable methods
  let stockQuantity = 0;
  let productName = "Unknown Product";
  let productPrice = 0;
  
  // Enhanced parsing logic to extract stock information
  if (apiResponse.stock !== undefined) {
    // Direct stock field
    stockQuantity = parseInt(String(apiResponse.stock), 10);
  } else if (apiResponse.stock_quantity !== undefined) {
    // Alternative stock field
    stockQuantity = parseInt(String(apiResponse.stock_quantity), 10);
  } else if (apiResponse.message && typeof apiResponse.message === 'string') {
    // Format: "Found: Product Name (Stock: 10)" or similar
    const stockMatch = apiResponse.message.match(/Stock:?\s*(\d+)/i);
    if (stockMatch && stockMatch[1]) {
      stockQuantity = parseInt(stockMatch[1], 10);
    }
    
    // Try to extract product name
    const namePattern = /Found:?\s*([^(]+)/i;
    const nameMatch = apiResponse.message.match(namePattern);
    if (nameMatch && nameMatch[1]) {
      productName = nameMatch[1].trim();
    }
  }
  
  // Extract price if available
  if (apiResponse.price !== undefined) {
    productPrice = parseFloat(String(apiResponse.price));
  }
  
  // Update cache in database
  try {
    await supabase
      .from("inventory_cache")
      .upsert({
        kiosk_token: kioskToken,
        stock_quantity: stockQuantity,
        price: productPrice,
        name: productName,
        last_checked_at: new Date().toISOString(),
        cached_until: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
        last_sync_status: "success"
      }, {
        onConflict: "kiosk_token"
      });
  } catch (cacheError) {
    console.error("Failed to update inventory cache:", cacheError);
  }
  
  return {
    success: true,
    kiosk_token: kioskToken,
    name: productName,
    stock_quantity: stockQuantity,
    price: productPrice,
    source: "api"
  };
}

async function handleGetStockWithCache(requestData: any, supabase: any, proxyType: string) {
  const { kioskToken, forceRefresh } = requestData;
  
  if (!kioskToken) {
    throw new Error("Missing kioskToken");
  }
  
  // Check cache first (unless forceFresh is true)
  if (!forceRefresh) {
    const { data: cachedStock } = await supabase
      .from("inventory_cache")
      .select("*")
      .eq("kiosk_token", kioskToken)
      .single();
    
    if (cachedStock) {
      const now = new Date();
      const cacheUntil = new Date(cachedStock.cached_until);
      
      // If cache is still valid, return it
      if (now < cacheUntil) {
        console.log(`[GetStockWithCache] Using valid cache for ${kioskToken}`);
        return {
          success: true,
          kiosk_token: kioskToken,
          name: cachedStock.name || "Unknown Product",
          stock_quantity: cachedStock.stock_quantity,
          price: cachedStock.price,
          cached: true,
          cache_time: cachedStock.last_checked_at,
          source: "cache"
        };
      }
    }
  }
  
  try {
    // Get fresh data
    console.log(`[GetStockWithCache] Getting fresh data for ${kioskToken}`);
    const freshData = await handleGetStock(requestData, supabase, proxyType);
    
    return {
      ...freshData,
      cached: false
    };
  } catch (error) {
    console.error(`[GetStockWithCache] Error getting fresh data:`, error);
    
    // If we can't get fresh data, try to use expired cache as fallback
    const { data: expiredCache } = await supabase
      .from("inventory_cache")
      .select("*")
      .eq("kiosk_token", kioskToken)
      .single();
    
    if (expiredCache) {
      console.log(`[GetStockWithCache] Using expired cache for ${kioskToken}`);
      return {
        success: true,
        kiosk_token: kioskToken,
        name: expiredCache.name || "Unknown Product",
        stock_quantity: expiredCache.stock_quantity,
        price: expiredCache.price,
        cached: true,
        cache_time: expiredCache.last_checked_at,
        emergency: true,
        source: "emergency_cache",
        error: error instanceof Error ? error.message : "Unknown error"
      };
    }
    
    // No cache available, re-throw error
    throw error;
  }
}

async function handleBuyProducts(requestData: any, supabase: any, proxyType: string) {
  const { kioskToken, quantity, promotion } = requestData;
  
  if (!kioskToken) {
    throw new Error("Missing kioskToken");
  }
  
  // Check for mock mode
  if (requestData.debug_mock === "true") {
    const { data: mockProduct } = await supabase
      .from("taphoammo_mock_products")
      .select("*")
      .eq("kiosk_token", kioskToken)
      .single();
    
    if (mockProduct) {
      // Create mock order
      const orderId = `MOCK-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      
      await supabase
        .from("taphoammo_mock_orders")
        .insert({
          order_id: orderId,
          kiosk_token: kioskToken,
          user_token: SYSTEM_TOKEN,
          quantity: quantity || 1,
          promotion: promotion || null,
          status: "processing"
        });
      
      // Update mock product stock
      await supabase
        .from("taphoammo_mock_products")
        .update({
          stock_quantity: Math.max(0, mockProduct.stock_quantity - (quantity || 1))
        })
        .eq("kiosk_token", kioskToken);
      
      return {
        success: "true",
        order_id: orderId,
        message: "Mock order created successfully",
        source: "mock"
      };
    }
  }
  
  // Call TaphoaMMO API
  const params: any = {
    kioskToken,
    userToken: SYSTEM_TOKEN,
    quantity: quantity || 1
  };
  
  if (promotion) {
    params.promotion = promotion;
  }
  
  return await callTaphoaMMO("buyProducts", params, proxyType);
}

async function handleGetProducts(requestData: any, supabase: any, proxyType: string) {
  const { orderId } = requestData;
  
  if (!orderId) {
    throw new Error("Missing orderId");
  }
  
  // Check for mock mode
  if (requestData.debug_mock === "true") {
    const { data: mockOrder } = await supabase
      .from("taphoammo_mock_orders")
      .select("*")
      .eq("order_id", orderId)
      .single();
    
    if (mockOrder) {
      // Simulate processing delay
      if (mockOrder.status === "processing") {
        // 30% chance to complete the order
        if (Math.random() < 0.3) {
          // Generate mock product keys
          const productKeys = Array.from(
            { length: mockOrder.quantity }, 
            (_, i) => `MOCK-KEY-${orderId}-${i+1}`
          );
          
          // Update mock order
          await supabase
            .from("taphoammo_mock_orders")
            .update({
              status: "completed",
              product_keys: productKeys
            })
            .eq("order_id", orderId);
          
          return {
            success: "true",
            data: productKeys.map((key, i) => ({ id: i.toString(), product: key })),
            message: "Mock order completed",
            source: "mock"
          };
        }
        
        return {
          success: "false",
          description: "Order in processing!",
          source: "mock"
        };
      }
      
      // If order is already completed, return product keys
      if (mockOrder.status === "completed" && mockOrder.product_keys) {
        return {
          success: "true",
          data: mockOrder.product_keys.map((key: string, i: number) => ({ 
            id: i.toString(), 
            product: key 
          })),
          source: "mock"
        };
      }
    }
  }
  
  // Call TaphoaMMO API
  return await callTaphoaMMO("getProducts", { 
    orderId, 
    userToken: SYSTEM_TOKEN 
  }, proxyType);
}

async function handleTestConnection(requestData: any, supabase: any, proxyType: string) {
  const { kioskToken } = requestData;
  
  if (!kioskToken) {
    throw new Error("Missing kioskToken");
  }
  
  try {
    // Try to get stock
    const stockResult = await handleGetStock(requestData, supabase, proxyType);
    
    return {
      success: true,
      message: `Connection successful. Product: ${stockResult.name} (Stock: ${stockResult.stock_quantity})`
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Unknown error"
    };
  }
}

async function handleCheckKioskActive(requestData: any, supabase: any, proxyType: string) {
  const { kioskToken } = requestData;
  
  if (!kioskToken) {
    throw new Error("Missing kioskToken");
  }
  
  try {
    // Try to get stock
    const stockResult = await handleGetStock(requestData, supabase, proxyType);
    
    return {
      success: true,
      active: stockResult.stock_quantity > 0,
      stock_quantity: stockResult.stock_quantity
    };
  } catch (error) {
    return {
      success: false,
      active: false,
      message: error instanceof Error ? error.message : "Unknown error"
    };
  }
}
