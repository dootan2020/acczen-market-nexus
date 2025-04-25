
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// TaphoaMMO API base URL
const API_BASE_URL = "https://taphoammo.net/api";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const endpoint = url.searchParams.get("endpoint");
    
    if (!endpoint) {
      throw new Error("Missing 'endpoint' parameter");
    }
    
    // Get the request body
    let requestBody = {};
    if (req.method === "POST") {
      requestBody = await req.json();
    }
    
    console.log(`[TaphoaMMO API] Request to ${endpoint} with params:`, requestBody);
    
    // Call TaphoaMMO API
    const apiUrl = `${API_BASE_URL}/${endpoint}`;
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    console.log(`[TaphoaMMO API] Response from ${endpoint}:`, data);
    
    // Validate data based on expected format
    if (typeof data !== "object") {
      throw new Error("Invalid API response format");
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
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
