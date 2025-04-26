
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// TaphoaMMO API base URL
const API_BASE_URL = "https://taphoammo.net/api";

// Timeout for fetch requests in milliseconds
const FETCH_TIMEOUT = 15000;

/**
 * Fetch with timeout function
 */
async function fetchWithTimeout(url, options, timeout = FETCH_TIMEOUT) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    throw error;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
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
    let requestData = {};
    
    // Extract common parameters
    const { kioskToken, userToken, quantity, orderId, promotion } = requestBody;
    
    // Validate required parameters based on endpoint
    if (endpoint === 'getStock' || endpoint === 'buyProducts') {
      if (!kioskToken) throw new Error("Missing 'kioskToken' parameter");
      if (!userToken) throw new Error("Missing 'userToken' parameter");
      
      requestData = { kioskToken, userToken };
      
      if (endpoint === 'buyProducts') {
        if (!quantity) throw new Error("Missing 'quantity' parameter");
        requestData.quantity = quantity;
        if (promotion) requestData.promotion = promotion;
      }
    } else if (endpoint === 'getProducts') {
      if (!orderId) throw new Error("Missing 'orderId' parameter");
      if (!userToken) throw new Error("Missing 'userToken' parameter");
      
      requestData = { orderId, userToken };
    }
    
    // Build query string for GET requests
    const queryParams = new URLSearchParams();
    Object.entries(requestData).forEach(([key, value]) => {
      queryParams.append(key, String(value));
    });
    
    // Append query string to URL
    apiUrl = `${apiUrl}?${queryParams.toString()}`;
    
    console.log(`[TaphoaMMO API] Calling external API: ${apiUrl}`);
    
    // Call TaphoaMMO API with timeout
    const response = await fetchWithTimeout(
      apiUrl, 
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Digital-Deals-Hub/1.0",
          "Accept": "application/json",
        },
      },
      FETCH_TIMEOUT
    );
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[TaphoaMMO API] HTTP error ${response.status}: ${errorText}`);
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    // Attempt to read and parse the response as text first
    const responseText = await response.text();
    console.log(`[TaphoaMMO API] Raw response: ${responseText}`);
    
    let data;
    try {
      // Try to parse as JSON
      data = JSON.parse(responseText);
      console.log(`[TaphoaMMO API] Response from ${endpoint}:`, data);
    } catch (parseError) {
      console.error(`[TaphoaMMO API] JSON parse error:`, parseError);
      throw new Error(`Invalid JSON response: ${responseText.substring(0, 100)}...`);
    }
    
    // Validate response format
    if (typeof data !== "object") {
      throw new Error("Invalid API response format");
    }
    
    // Check for API-level error
    if (data.success === "false") {
      throw new Error(data.message || "API returned an error");
    }
    
    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("[TaphoaMMO API] Error:", error.message);
    return new Response(
      JSON.stringify({
        success: "false",
        message: error.message || "Internal server error",
      }),
      {
        status: 400, // Using 400 instead of 500 to make it easier for the client to handle
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
