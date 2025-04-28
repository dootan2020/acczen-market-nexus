
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS headers for all responses
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const requestStartTime = Date.now();
    
    // Create Supabase client
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Parse request
    const { user_id, product_id, quantity, transaction_type } = await req.json();
    
    if (!user_id || !product_id || !quantity || !transaction_type) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Missing required parameters'
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Get product and user info
    const { data: product, error: productError } = await supabaseClient
      .from('products')
      .select('*')
      .eq('id', product_id)
      .single();
    
    if (productError || !product) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Product not found'
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    const { data: user, error: userError } = await supabaseClient
      .from('profiles')
      .select('balance')
      .eq('id', user_id)
      .single();
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'User not found'
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Calculate total cost
    const totalCost = product.price * quantity;
    
    // Check if user has enough balance
    if (user.balance < totalCost) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Insufficient balance'
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }
    
    // Begin transaction processing
    
    // 1. Generate a unique transaction ID
    const transactionId = crypto.randomUUID();
    
    // 2. Lock user balance record to prevent race conditions
    const { data: lockResult, error: lockError } = await supabaseClient.rpc(
      'begin_transaction',
      { p_user_id: user_id, p_transaction_id: transactionId }
    );
    
    if (lockError) {
      console.error('Error locking user record:', lockError);
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Could not start transaction, please try again'
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    try {
      // 3. Process the transaction based on type
      let apiResponseData = null;
      
      if (transaction_type === 'purchase') {
        // Call the API to make the purchase (example for TaphoaMMO)
        if (product.kiosk_token) {
          const { data: apiResponse, error: apiError } = await supabaseClient.functions.invoke(
            'taphoammo-api',
            {
              body: JSON.stringify({
                endpoint: 'buyProducts',
                kioskToken: product.kiosk_token,
                quantity
              })
            }
          );
          
          if (apiError || (apiResponse && apiResponse.success === "false")) {
            throw new Error(apiError?.message || apiResponse?.message || 'API call failed');
          }
          
          apiResponseData = apiResponse;
        } else {
          // Handle non-API product purchase
          console.log('Processing non-API product purchase');
        }
      }
      
      // 4. Create order
      const { data: order, error: orderError } = await supabaseClient
        .from('orders')
        .insert({
          user_id,
          status: 'completed',
          total_amount: totalCost
        })
        .select('id')
        .single();
      
      if (orderError) {
        throw new Error(`Failed to create order record: ${orderError.message}`);
      }
      
      // 5. Create order items
      const { error: itemError } = await supabaseClient
        .from('order_items')
        .insert({
          order_id: order.id,
          product_id,
          quantity,
          price: product.price,
          total: totalCost,
          data: {
            kiosk_token: product.kiosk_token,
            api_response: apiResponseData
          }
        });
      
      if (itemError) {
        throw new Error(`Failed to create order items: ${itemError.message}`);
      }
      
      // 6. Deduct from user balance
      const { error: updateError } = await supabaseClient.rpc(
        'update_user_balance',
        { user_id, amount: -totalCost }
      );
      
      if (updateError) {
        throw new Error(`Failed to update user balance: ${updateError.message}`);
      }
      
      // 7. Create transaction record
      const { error: transactionError } = await supabaseClient
        .from('transactions')
        .insert({
          user_id,
          type: transaction_type,
          amount: -totalCost,
          description: `Purchase of ${product.name} x ${quantity}`,
          reference_id: order.id,
          transaction_id: transactionId
        });
      
      if (transactionError) {
        console.error('Failed to create transaction record:', transactionError);
      }
      
      // 8. Commit transaction
      const { error: commitError } = await supabaseClient.rpc(
        'commit_transaction',
        { p_transaction_id: transactionId }
      );
      
      if (commitError) {
        throw new Error(`Failed to commit transaction: ${commitError.message}`);
      }
      
      // Transaction successful
      const responseTime = Date.now() - requestStartTime;
      
      return new Response(
        JSON.stringify({
          success: true,
          order_id: order.id,
          transaction_id: transactionId,
          api_response: apiResponseData,
          message: 'Transaction processed successfully',
          processing_time_ms: responseTime
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
      
    } catch (error) {
      console.error('Transaction processing error:', error);
      
      // Rollback transaction in case of error
      try {
        await supabaseClient.rpc(
          'rollback_transaction',
          { p_transaction_id: transactionId }
        );
      } catch (rollbackError) {
        console.error('Error rolling back transaction:', rollbackError);
      }
      
      return new Response(
        JSON.stringify({
          success: false,
          message: error instanceof Error ? error.message : 'Transaction processing failed',
          transaction_id: transactionId
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Unhandled error in transaction processing:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : 'Internal server error'
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
