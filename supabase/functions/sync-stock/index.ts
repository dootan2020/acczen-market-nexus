import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    // Check circuit breaker state first
    const { data: apiHealthCheck, error: healthCheckError } = await supabase
      .from('api_health')
      .select('is_open, opened_at, error_count')
      .eq('api_name', 'taphoammo')
      .single();

    if (healthCheckError) {
      console.error('Error checking API health:', healthCheckError);
      // Continue with caution
    }

    // If circuit breaker is open, use cache or return unavailable
    if (apiHealthCheck?.is_open) {
      console.log('Circuit breaker is open, using cached data if available');
      
      // Get cached products that aren't too old (within 30 minutes)
      const thirtyMinutesAgo = new Date();
      thirtyMinutesAgo.setMinutes(thirtyMinutesAgo.getMinutes() - 30);
      
      const { data: cachedProducts, error: cacheError } = await supabase
        .from('product_cache')
        .select('*')
        .gte('updated_at', thirtyMinutesAgo.toISOString());

      if (cacheError) {
        console.error('Cache retrieval error:', cacheError);
      }

      if (cachedProducts && cachedProducts.length > 0) {
        console.log(`Returning ${cachedProducts.length} cached products`);
        return new Response(
          JSON.stringify({ 
            success: true, 
            data: cachedProducts,
            source: 'cache',
            cache_date: cachedProducts[0].updated_at
          }),
          { 
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json' 
            } 
          }
        );
      }

      // If no valid cache, return temporary unavailable
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Service temporarily unavailable. We are working to restore service as soon as possible.' 
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          },
          status: 503 
        }
      );
    }

    // Attempt to connect to Taphoammo API
    try {
      // Get the request body for specific product info
      let requestData = {};
      try {
        requestData = await req.json();
      } catch (e) {
        // No body or invalid JSON, continue with default params
      }
      
      const kioskToken = requestData.kioskToken || '';
      const apiKey = Deno.env.get('TAPHOAMMO_API_KEY') || '';
      
      if (!apiKey) {
        throw new Error('API key not configured');
      }
      
      let url = 'https://taphoammo.net/api/getProducts';
      if (kioskToken) {
        url = `https://taphoammo.net/api/getStock?kioskToken=${kioskToken}`;
      }

      const apiStartTime = Date.now();
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
          'User-Agent': 'DigitalDealsHub/1.0'
        },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      });

      const apiLatency = Date.now() - apiStartTime;
      
      if (!response.ok) {
        // Record the failure in api_health
        await recordApiFailure(supabase, `HTTP error: ${response.status}`, apiLatency);
        throw new Error(`API returned status ${response.status}`);
      }
      
      const rawText = await response.text();
      let data;
      
      try {
        data = JSON.parse(rawText);
      } catch (e) {
        await recordApiFailure(supabase, `JSON parse error: ${e.message}`, apiLatency);
        throw new Error(`Invalid JSON response: ${rawText.substring(0, 100)}...`);
      }

      // Check if API response indicates failure
      if (data.success === "false") {
        await recordApiFailure(supabase, data.message || "API returned failure", apiLatency);
        throw new Error(data.message || "API returned failure");
      }

      // Get product data
      let products = [];
      if (kioskToken && data.name && data.stock) {
        // Single product response
        products = [{
          kiosk_token: kioskToken,
          name: data.name,
          stock_quantity: parseInt(data.stock) || 0,
          price: parseFloat(data.price) || 0
        }];
      } else if (data.products && Array.isArray(data.products)) {
        // Multiple products response
        products = data.products.map(p => ({
          kiosk_token: p.id,
          name: p.name,
          stock_quantity: parseInt(p.stock_quantity) || 0,
          price: parseFloat(p.price) || 0
        }));
      }

      // Update cache with fresh data
      if (products.length > 0) {
        for (const product of products) {
          const { error: upsertError } = await supabase
            .from('product_cache')
            .upsert({
              product_id: product.kiosk_token,
              kiosk_token: product.kiosk_token,
              name: product.name,
              price: product.price,
              stock_quantity: product.stock_quantity,
              updated_at: new Date().toISOString()
            }, { onConflict: 'product_id' });
          
          if (upsertError) {
            console.error('Error updating cache:', upsertError);
          }
        }
        
        // Reset circuit breaker on success
        await supabase
          .from('api_health')
          .update({
            is_open: false,
            error_count: 0,
            updated_at: new Date().toISOString()
          })
          .eq('api_name', 'taphoammo');
          
        // Log successful API call
        await supabase.from('api_logs').insert({
          api: 'taphoammo',
          endpoint: kioskToken ? 'getStock' : 'getProducts',
          status: 'success',
          response_time: apiLatency,
          details: {
            products_count: products.length
          }
        });
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          data: products,
          source: 'api',
          latency: apiLatency
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          } 
        }
      );
    } catch (error) {
      console.error('API error:', error);
      
      // Try to get data from cache as fallback
      const { data: cachedProducts, error: cacheError } = await supabase
        .from('product_cache')
        .select('*');

      if (!cacheError && cachedProducts && cachedProducts.length > 0) {
        // Mark cache as outdated by including the age in the response
        return new Response(
          JSON.stringify({ 
            success: true, 
            data: cachedProducts,
            source: 'cache_fallback',
            message: 'API unavailable, showing cached data'
          }),
          { 
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json' 
            } 
          }
        );
      }
      
      // No data available at all
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Service temporarily unavailable. Please try again later.' 
        }),
        { 
          headers: { 
            ...corsHeaders, 
            'Content-Type': 'application/json' 
          },
          status: 503 
        }
      );
    }
  } catch (error) {
    console.error('Stock sync error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error.message 
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 500 
      }
    );
  }
});

async function recordApiFailure(
  supabase: any, 
  errorMessage: string, 
  responseTime: number
) {
  try {
    // Log the failure
    await supabase.from('api_logs').insert({
      api: 'taphoammo',
      endpoint: 'sync',
      status: 'error',
      response_time: responseTime,
      details: { error: errorMessage }
    });
    
    // Update the circuit breaker
    const { data, error } = await supabase
      .from('api_health')
      .update({
        error_count: supabase.rpc('increment_error_count'),
        last_error: errorMessage,
        is_open: supabase.rpc('check_if_should_open_circuit'),
        opened_at: supabase.rpc('update_opened_at_if_needed'),
        updated_at: new Date().toISOString()
      })
      .eq('api_name', 'taphoammo')
      .select('is_open, error_count');
      
    if (error) {
      console.error('Failed to update circuit breaker:', error);
    } else if (data && data[0].is_open) {
      console.log('Circuit breaker opened after', data[0].error_count, 'errors');
      
      // We would trigger notification here in a production system
      // For now we'll just log it
      console.warn('ALERT: Taphoammo API circuit breaker opened');
    }
  } catch (e) {
    console.error('Failed to record API failure:', e);
  }
}
