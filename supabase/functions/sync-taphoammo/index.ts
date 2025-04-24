
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface SyncResult {
  success: boolean;
  updated: number;
  errors: string[];
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const results: SyncResult = {
    success: true,
    updated: 0,
    errors: []
  };

  try {
    // Get all taphoammo mock products
    const { data: products, error: productsError } = await supabaseClient
      .from('taphoammo_mock_products')
      .select('*');

    if (productsError) {
      throw new Error(`Failed to fetch products: ${productsError.message}`);
    }

    // For each product, call the taphoammo API to get latest stock and price
    for (const product of products) {
      try {
        console.log(`Syncing product: ${product.name} (${product.kiosk_token})`);
        
        const { data: response, error: apiError } = await supabaseClient.functions.invoke('mock-taphoammo', {
          body: JSON.stringify({
            kioskToken: product.kiosk_token,
            userToken: 'admin'  // Using admin as a generic token for syncing
          })
        });

        if (apiError) {
          throw new Error(`API call failed for ${product.kiosk_token}: ${apiError.message}`);
        }

        if (response.success === 'false') {
          throw new Error(`API returned error for ${product.kiosk_token}: ${response.message}`);
        }

        // Update product data in database
        const { error: updateError } = await supabaseClient
          .from('taphoammo_mock_products')
          .update({
            price: response.price,
            stock_quantity: response.stock_quantity,
            updated_at: new Date().toISOString()
          })
          .eq('kiosk_token', product.kiosk_token);

        if (updateError) {
          throw new Error(`Failed to update ${product.kiosk_token}: ${updateError.message}`);
        }

        results.updated++;
        console.log(`Successfully synced ${product.name}: ${response.stock_quantity} in stock @ $${response.price}`);
        
      } catch (error) {
        console.error(`Error syncing ${product.kiosk_token}:`, error);
        results.errors.push(`${product.kiosk_token}: ${error.message}`);
      }
    }

    // Also update any linked products in the main products table
    const { data: linkedProducts, error: linkedError } = await supabaseClient
      .from('products')
      .select('id, kiosk_token')
      .not('kiosk_token', 'is', null);

    if (!linkedError && linkedProducts) {
      for (const linkedProduct of linkedProducts) {
        try {
          const { data: mockProduct } = await supabaseClient
            .from('taphoammo_mock_products')
            .select('price, stock_quantity')
            .eq('kiosk_token', linkedProduct.kiosk_token)
            .single();
            
          if (mockProduct) {
            await supabaseClient
              .from('products')
              .update({
                price: mockProduct.price,
                stock_quantity: mockProduct.stock_quantity,
                updated_at: new Date().toISOString()
              })
              .eq('id', linkedProduct.id);
          }
        } catch (error) {
          console.error(`Error updating linked product ${linkedProduct.id}:`, error);
        }
      }
    }

    return new Response(
      JSON.stringify(results),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Sync process failed:', error);
    results.success = false;
    results.errors.push(`Sync process error: ${error.message}`);
    
    return new Response(
      JSON.stringify(results),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
