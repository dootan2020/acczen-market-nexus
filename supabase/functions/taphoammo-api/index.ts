
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// TaphoaMMO API base URL
const API_BASE_URL = "https://taphoammo.net/api";

// Default user token for all requests (system token)
const SYSTEM_TOKEN = "0LP8RN0I7TNX6ROUD3DUS1I3LUJTQUJ4IFK9";

// Timeout for fetch requests in milliseconds
const FETCH_TIMEOUT = 10000;

// Maximum retries at the edge function level
const MAX_RETRIES = 3;

/**
 * Fetch with timeout function
 */
async function fetchWithTimeout(url: string, options: RequestInit, timeout = FETCH_TIMEOUT) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    console.log(`[TaphoaMMO API] Fetching ${url}`);
    const startTime = Date.now();
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    
    clearTimeout(id);
    const endTime = Date.now();
    console.log(`[TaphoaMMO API] Response received in ${endTime - startTime}ms`);
    
    return response;
  } catch (error: any) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      console.error(`[TaphoaMMO API] Request timeout after ${timeout}ms`);
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    throw error;
  }
}

async function checkCircuitBreakerState(supabase: any): Promise<boolean> {
  try {
    const { data } = await supabase
      .from('api_health')
      .select('*')
      .eq('api_name', 'taphoammo')
      .single();
      
    if (data?.is_open) {
      const openedAt = new Date(data.opened_at).getTime();
      const now = new Date().getTime();
      const recoveryTime = 120000; // 2 minutes
      
      if (now - openedAt > recoveryTime) {
        // Auto-close circuit after recovery time
        await supabase
          .from('api_health')
          .update({
            is_open: false,
            error_count: 0,
            opened_at: null,
            updated_at: new Date().toISOString()
          })
          .eq('api_name', 'taphoammo');
          
        return false;
      }
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('[TaphoaMMO API] Error checking circuit breaker state:', error);
    return false; // Default to closed circuit if we can't check
  }
}

async function recordFailure(supabase: any, error: Error): Promise<void> {
  try {
    // Use RPC functions to safely update the circuit breaker state
    const { data: errorCount } = await supabase.rpc('increment_error_count');
    const { data: shouldOpen } = await supabase.rpc('check_if_should_open_circuit');
    const { data: openedAt } = await supabase.rpc('update_opened_at_if_needed');
    
    await supabase
      .from('api_health')
      .update({
        error_count: errorCount || 1,
        last_error: error.message,
        is_open: shouldOpen || false,
        opened_at: openedAt || null,
        updated_at: new Date().toISOString()
      })
      .eq('api_name', 'taphoammo');
  } catch (err) {
    console.error('[TaphoaMMO API] Error recording failure:', err);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Capture request start time for performance monitoring
    const requestStartTime = Date.now();
    
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Check circuit breaker state
    const isOpen = await checkCircuitBreakerState(supabaseClient);
    
    // If circuit is open, try to use cached data or return error
    if (isOpen) {
      console.warn('[TaphoaMMO API] Circuit breaker open, using cache or returning error');
      
      try {
        // Try to parse request to get kiosk token for cache lookup
        const requestBody = await req.json();
        const { endpoint, kioskToken } = requestBody;
        
        // Only attempt cache lookup for getStock endpoint with kioskToken
        if (endpoint === 'getStock' && kioskToken) {
          const { data } = await supabaseClient
            .from('product_cache')
            .select('*')
            .eq('kiosk_token', kioskToken)
            .single();
            
          if (data) {
            console.log('[TaphoaMMO API] Returning cached data while circuit is open');
            return new Response(
              JSON.stringify({
                ...data,
                cached: true,
                success: "true",
                _circuit: "open",
                _metadata: {
                  source: "cache", 
                  circuit_status: "open"
                }
              }),
              { headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
          }
        }
      } catch (cacheError) {
        console.error('[TaphoaMMO API] Error accessing cache:', cacheError);
      }
      
      // If we get here, we couldn't find cache data
      return new Response(
        JSON.stringify({
          success: "false",
          message: "Service temporarily unavailable. Please try again later.",
          _circuit: "open"
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 503 }
      );
    }
    
    let requestBody = {};
    
    try {
      // Get the request body
      requestBody = await req.json();
      console.log(`[TaphoaMMO API] Request body:`, requestBody);
    } catch (parseError) {
      console.error(`[TaphoaMMO API] Error parsing request body:`, parseError);
      throw new Error("Invalid request body format");
    }
    
    const endpoint = requestBody.endpoint;
    
    if (!endpoint) {
      throw new Error("Missing 'endpoint' parameter");
    }
    
    console.log(`[TaphoaMMO API] Request to ${endpoint} with params:`, requestBody);
    
    // Prepare API URL based on the endpoint
    let apiUrl = `${API_BASE_URL}/${endpoint}`;
    
    // Format request data based on endpoint
    let requestData: Record<string, string | number> = {};
    
    // Extract common parameters
    const { kioskToken, userToken = SYSTEM_TOKEN, quantity, orderId, promotion } = requestBody;
    
    // Validate required parameters based on endpoint
    if (endpoint === 'getStock' || endpoint === 'buyProducts') {
      if (!kioskToken) throw new Error("Missing 'kioskToken' parameter");
      
      requestData = { kioskToken, userToken: SYSTEM_TOKEN };
      
      if (endpoint === 'buyProducts') {
        if (!quantity) throw new Error("Missing 'quantity' parameter");
        requestData.quantity = quantity;
        if (promotion) requestData.promotion = promotion;
      }
    } else if (endpoint === 'getProducts') {
      if (!orderId) throw new Error("Missing 'orderId' parameter");
      
      requestData = { orderId, userToken: SYSTEM_TOKEN };
    }
    
    // Build query string for GET requests
    const queryParams = new URLSearchParams();
    Object.entries(requestData).forEach(([key, value]) => {
      queryParams.append(key, String(value));
    });
    
    // Append query string to URL
    apiUrl = `${apiUrl}?${queryParams.toString()}`;
    
    console.log(`[TaphoaMMO API] Calling external API: ${apiUrl}`);
    
    // Call TaphoaMMO API with timeout and retry logic
    let response;
    let retryCount = 0;
    let lastError;
    
    while (retryCount <= MAX_RETRIES) {
      try {
        response = await fetchWithTimeout(
          apiUrl, 
          {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${Deno.env.get("TAPHOAMMO_API_KEY")}`,
              "Content-Type": "application/json",
              "User-Agent": "Digital-Deals-Hub/1.0",
              "Accept": "application/json",
            },
          },
          FETCH_TIMEOUT
        );
        
        // If successful, break the retry loop
        break;
      } catch (error: any) {
        lastError = error;
        retryCount++;
        console.error(`[TaphoaMMO API] Attempt ${retryCount}/${MAX_RETRIES + 1} failed:`, error);
        
        if (retryCount > MAX_RETRIES) {
          // Record failure in circuit breaker
          await recordFailure(supabaseClient, error);
          throw error; // Reached max retries, propagate the error
        }
        
        // Wait before retrying (exponential backoff)
        const delay = Math.pow(2, retryCount) * 1000; // 2s, 4s, 8s
        console.log(`[TaphoaMMO API] Retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    if (!response || !response.ok) {
      const errorText = await response?.text() || "No response";
      console.error(`[TaphoaMMO API] HTTP error ${response?.status}: ${errorText}`);
      
      const error = new Error(`API request failed with status ${response?.status}: ${errorText}`);
      await recordFailure(supabaseClient, error);
      
      throw error;
    }
    
    // Attempt to read and parse the response as text first
    const responseText = await response.text();
    console.log(`[TaphoaMMO API] Raw response: ${responseText.substring(0, 200)}${responseText.length > 200 ? '...' : ''}`);
    
    let data;
    try {
      // Try to parse as JSON
      data = JSON.parse(responseText);
      console.log(`[TaphoaMMO API] Response from ${endpoint}:`, data);
    } catch (parseError) {
      console.error(`[TaphoaMMO API] JSON parse error:`, parseError);
      
      const error = new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
      await recordFailure(supabaseClient, error);
      
      throw error;
    }
    
    // Validate response format
    if (typeof data !== "object") {
      const error = new Error("Invalid API response format");
      await recordFailure(supabaseClient, error);
      throw error;
    }
    
    // If API indicates failure, record it but still return the response
    if (data.success === "false") {
      const error = new Error(data.message || "API reported failure");
      await recordFailure(supabaseClient, error);
    } else {
      // Update cache for successful getStock requests
      if (endpoint === 'getStock' && kioskToken && data) {
        try {
          await supabaseClient.from('product_cache').upsert({
            kiosk_token: kioskToken,
            product_id: kioskToken,
            name: data.name,
            stock_quantity: data.stock_quantity,
            price: data.price,
            updated_at: new Date().toISOString()
          }, { 
            onConflict: 'kiosk_token',
            ignoreDuplicates: false 
          });
        } catch (cacheError) {
          console.warn('[TaphoaMMO API] Failed to update cache:', cacheError);
        }
      }
    }
    
    // Calculate total response time
    const totalTime = Date.now() - requestStartTime;
    
    // Log the API call
    await supabaseClient.from('api_logs').insert({
      api: 'taphoammo',
      endpoint: endpoint,
      status: data.success === "true" ? "success" : "error",
      response_time: totalTime,
      details: {
        request: { ...requestBody },
        response_success: data.success,
        retries: retryCount
      }
    });
    
    // Add performance metadata to the response
    const responseWithMetadata = {
      ...data,
      _metadata: {
        responseTime: totalTime,
        endpoint,
        timestamp: new Date().toISOString(),
        retries: retryCount
      }
    };
    
    return new Response(JSON.stringify(responseWithMetadata), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: any) {
    console.error("[TaphoaMMO API] Error:", error.message);
    
    // Try to create Supabase client for logging
    try {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      
      // Log the error
      await supabaseClient.from('api_logs').insert({
        api: 'taphoammo',
        endpoint: 'unknown',
        status: 'critical-error',
        details: {
          error: error.message
        }
      });
    } catch (logError) {
      console.error('[TaphoaMMO API] Failed to log error:', logError);
    }
    
    return new Response(
      JSON.stringify({
        success: "false",
        message: error.message || "Internal server error",
        timestamp: new Date().toISOString()
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
