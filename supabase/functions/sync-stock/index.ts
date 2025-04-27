
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
    const { data: apiHealthCheck } = await supabase
      .from('api_health')
      .select('is_open')
      .eq('api_name', 'taphoammo')
      .single();

    // If circuit breaker is open, use cache or return unavailable
    if (apiHealthCheck?.is_open) {
      const { data: cachedProducts } = await supabase
        .from('product_cache')
        .select('*')
        .lte('updated_at', new Date(Date.now() - 30 * 60 * 1000)); // Cache valid for 30 minutes

      if (cachedProducts && cachedProducts.length > 0) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            data: cachedProducts,
            source: 'cache'
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
          message: 'Service temporarily unavailable' 
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

    // Primary API sync logic here
    // This would call the Taphoammo API and update product_cache

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
