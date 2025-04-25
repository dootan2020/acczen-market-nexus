
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
  apiCalls: number;
  retries: number;
  responseTime: number;
}

// Retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 3000, 5000]; // Exponential backoff: 1s, 3s, 5s

// Function to perform API call with retry logic
async function callWithRetry(fn: () => Promise<any>, retries = MAX_RETRIES, attempt = 0): Promise<any> {
  try {
    const startTime = performance.now();
    const result = await fn();
    const endTime = performance.now();
    return { 
      result, 
      retryCount: attempt,
      responseTime: endTime - startTime
    };
  } catch (error) {
    if (attempt >= retries) {
      throw error;
    }
    
    console.log(`API call failed, retrying (${attempt + 1}/${retries})...`);
    // Exponential backoff
    const delay = RETRY_DELAYS[attempt] || 5000;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return callWithRetry(fn, retries, attempt + 1);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = performance.now();
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  const results: SyncResult = {
    success: true,
    updated: 0,
    errors: [],
    apiCalls: 0,
    retries: 0,
    responseTime: 0
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
        
        results.apiCalls++;
        const { result: response, retryCount, responseTime } = await callWithRetry(async () => {
          const { data, error } = await supabaseClient.functions.invoke('mock-taphoammo', {
            body: JSON.stringify({
              kioskToken: product.kiosk_token,
              userToken: 'admin'  // Using admin as a generic token for syncing
            })
          });
          
          if (error) throw error;
          if (response?.success === 'false') throw new Error(response.message || 'API returned error');
          return data;
        });

        // Update metrics
        results.retries += retryCount;
        
        // Log successful sync with response time
        console.log(`Successfully synced ${product.name} after ${retryCount} retries in ${responseTime.toFixed(2)}ms`);

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
        
      } catch (error) {
        console.error(`Error syncing ${product.kiosk_token}:`, error);
        results.errors.push(`${product.kiosk_token}: ${error.message}`);
        
        // Log error to a separate table for monitoring
        try {
          await supabaseClient
            .from('api_logs')
            .insert({
              api: 'taphoammo',
              endpoint: 'sync',
              status: 'error',
              details: {
                product_id: product.id,
                kiosk_token: product.kiosk_token,
                error: error.message
              }
            });
        } catch (logError) {
          console.error('Failed to log API error:', logError);
        }
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

    // Calculate total response time
    const endTime = performance.now();
    results.responseTime = endTime - startTime;

    // Log successful sync to monitoring table
    try {
      await supabaseClient
        .from('api_logs')
        .insert({
          api: 'taphoammo',
          endpoint: 'sync-all',
          status: 'success',
          response_time: results.responseTime,
          details: {
            updated: results.updated,
            errors: results.errors.length,
            api_calls: results.apiCalls,
            retries: results.retries
          }
        });
    } catch (logError) {
      console.error('Failed to log successful sync:', logError);
    }

    // If there were errors after retries, notify admin
    if (results.errors.length > 0) {
      try {
        // Get admin emails
        const { data: admins } = await supabaseClient
          .from('profiles')
          .select('email')
          .eq('role', 'admin');
          
        if (admins && admins.length > 0) {
          // Send notification email to admins
          await supabaseClient.functions.invoke('send-notification-email', {
            body: {
              to: admins.map(admin => admin.email),
              subject: 'TaphoAmmo API Sync Errors',
              message: `There were ${results.errors.length} errors during product sync:\n\n${results.errors.join('\n')}`
            }
          });
        }
      } catch (emailError) {
        console.error('Failed to send admin notification:', emailError);
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
    
    // Log critical error
    try {
      await supabaseClient
        .from('api_logs')
        .insert({
          api: 'taphoammo',
          endpoint: 'sync-all',
          status: 'critical-error',
          details: {
            error: error.message
          }
        });
    } catch (logError) {
      console.error('Failed to log critical error:', logError);
    }
    
    return new Response(
      JSON.stringify(results),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
