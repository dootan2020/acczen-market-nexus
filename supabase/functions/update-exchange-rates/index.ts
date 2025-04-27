
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    
    if (!supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing Supabase credentials");
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // For this example, we'll use a fixed rate
    // In production, you'd want to fetch this from an external API
    const vndToUsdRate = 0.000041; // approximately 1/24500
    const usdToVndRate = 24500;    // 1 USD = 24500 VND

    // Update VND to USD rate
    const { error: error1 } = await supabase
      .from('exchange_rates')
      .upsert({
        from_currency: 'VND',
        to_currency: 'USD',
        rate: vndToUsdRate
      }, {
        onConflict: 'from_currency,to_currency'
      });

    if (error1) throw error1;

    // Update USD to VND rate
    const { error: error2 } = await supabase
      .from('exchange_rates')
      .upsert({
        from_currency: 'USD',
        to_currency: 'VND',
        rate: usdToVndRate
      }, {
        onConflict: 'from_currency,to_currency'
      });

    if (error2) throw error2;

    // Add a record in the history table
    const { error: error3 } = await supabase
      .from('exchange_rate_history')
      .insert([
        {
          from_currency: 'VND',
          to_currency: 'USD',
          new_rate: vndToUsdRate
        },
        {
          from_currency: 'USD',
          to_currency: 'VND',
          new_rate: usdToVndRate
        }
      ]);

    if (error3) {
      console.error("Error adding to history table:", error3);
      // Continue execution even if history update fails
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        rates: {
          vndToUsd: vndToUsdRate,
          usdToVnd: usdToVndRate
        }
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error updating exchange rates:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
