
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse request body
    const { kioskToken, userToken, quantity, promotion } = await req.json();

    if (!kioskToken || !userToken || !quantity) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Missing required parameters'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Get auth user from userToken
    const { data: { user }, error: userError } = await supabaseClient.auth.admin.getUserById(
      userToken
    );

    if (userError || !user) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Invalid user token'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Get product from kiosk token
    const { data: product, error: productError } = await supabaseClient
      .from('taphoammo_mock_products')
      .select('*')
      .eq('kiosk_token', kioskToken)
      .single();

    if (productError || !product) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Product not found'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Calculate total cost
    const totalCost = product.price * quantity;

    // Get user balance
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('balance')
      .eq('id', userToken)
      .single();

    if (profileError || !profile) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Could not retrieve user balance'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Check if user has sufficient balance
    if (profile.balance < totalCost) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Insufficient balance'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Call taphoammo API to buy products
    const { data: mockResponse, error: mockError } = await supabaseClient.functions.invoke('mock-taphoammo', {
      body: JSON.stringify({
        kioskToken,
        userToken,
        quantity,
        promotion
      })
    });

    if (mockError) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Error calling taphoammo API'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    if (mockResponse.success === 'false') {
      return new Response(
        JSON.stringify({
          success: false,
          message: mockResponse.message || 'Order processing failed'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Deduct amount from user balance
    const { error: updateError } = await supabaseClient.rpc('update_user_balance', {
      user_id: userToken,
      amount: -totalCost
    });

    if (updateError) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Failed to update user balance'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Create transaction record
    const { error: transactionError } = await supabaseClient
      .from('transactions')
      .insert({
        user_id: userToken,
        type: 'purchase',
        amount: totalCost,
        description: `Purchase of ${product.name} x ${quantity}`,
        reference_id: mockResponse.order_id
      });

    if (transactionError) {
      console.error('Failed to create transaction record:', transactionError);
    }

    // Create order in local database
    const { data: order, error: orderError } = await supabaseClient
      .from('orders')
      .insert({
        user_id: userToken,
        status: 'completed',
        total_amount: totalCost
      })
      .select('id')
      .single();

    if (orderError) {
      console.error('Failed to create order record:', orderError);
    }

    // Create order items
    if (order) {
      await supabaseClient
        .from('order_items')
        .insert({
          order_id: order.id,
          product_id: product.id,
          quantity,
          price: product.price,
          total: totalCost,
          data: {
            kiosk_token: kioskToken,
            taphoammo_order_id: mockResponse.order_id,
            product_keys: mockResponse.product_keys || []
          }
        });
    }

    return new Response(
      JSON.stringify({
        success: true,
        order_id: mockResponse.order_id,
        message: mockResponse.message || 'Order processed successfully',
        product_keys: mockResponse.product_keys || []
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing order:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || 'Internal server error'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
