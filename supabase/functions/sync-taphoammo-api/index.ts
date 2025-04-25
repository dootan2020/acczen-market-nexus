
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Base URL for TaphoaMMO API
const TAPHOAMMO_API_BASE = 'https://taphoammo.net/api'

// Available API endpoints
const API_ENDPOINTS = {
  BUY: '/buyProducts',
  GET_PRODUCTS: '/getProducts',
  GET_STOCK: '/getStock'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    // Parse the request body
    const requestData = await req.json();
    const { endpoint, params } = requestData;
    
    // Validate the requested endpoint
    if (!Object.values(API_ENDPOINTS).includes(endpoint)) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `Invalid endpoint: ${endpoint}. Available endpoints: ${Object.values(API_ENDPOINTS).join(', ')}` 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Construct the full API URL with parameters
    let apiUrl = `${TAPHOAMMO_API_BASE}${endpoint}`;
    const urlParams = new URLSearchParams();
    
    // Add parameters to URL
    for (const [key, value] of Object.entries(params)) {
      if (value) {
        urlParams.append(key, String(value));
      }
    }
    
    // Append URL parameters
    if (urlParams.toString()) {
      apiUrl += `?${urlParams.toString()}`;
    }
    
    console.log(`Making request to TaphoaMMO API: ${apiUrl}`);
    
    // Set start time for response time logging
    const startTime = performance.now();
    
    // Make the API request to TaphoaMMO
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
    
    // Calculate response time
    const responseTime = performance.now() - startTime;
    
    // Parse the response
    let data;
    let status;
    
    try {
      data = await response.json();
      status = response.ok ? 'success' : 'error';
    } catch (error) {
      data = { success: false, message: 'Failed to parse API response' };
      status = 'error';
      console.error('Error parsing API response:', error);
    }
    
    // Log the API call
    try {
      const supabaseClient = Deno.env.get('SUPABASE_URL') && Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') 
        ? createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
          )
        : null;
      
      if (supabaseClient) {
        await supabaseClient
          .from('api_logs')
          .insert({
            api: 'taphoammo',
            endpoint: endpoint.replace('/', ''), // Remove leading slash
            status,
            response_time: responseTime,
            details: {
              url: apiUrl,
              // Mask sensitive data
              params: { 
                ...params,
                userToken: params.userToken ? '***masked***' : undefined,
                kioskToken: params.kioskToken ? '***masked***' : undefined,
              },
              statusCode: response.status,
              responseBody: data
            }
          });
      }
    } catch (logError) {
      console.error('Failed to log API call:', logError);
    }
    
    // Return the API response to the client
    return new Response(
      JSON.stringify(data),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error processing request:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Internal server error',
        error: error.message
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

function createClient(supabaseUrl, supabaseKey) {
  // Simple client for logging - this would typically import from supabase-js
  return {
    from: (table) => ({
      insert: async (data) => {
        try {
          const response = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${supabaseKey}`,
              'apikey': supabaseKey,
            },
            body: JSON.stringify(data),
          });
          
          if (!response.ok) {
            throw new Error(`Failed to insert log: ${response.statusText}`);
          }
          
          return { error: null };
        } catch (error) {
          return { error };
        }
      }
    })
  };
}
