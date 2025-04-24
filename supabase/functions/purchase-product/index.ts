
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, message: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get the current user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, message: 'Authentication failed' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { items } = await req.json();
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid items data' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Fetch product details for all items
    const productIds = items.map(item => item.id);
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .in('id', productIds);

    if (productsError || !products) {
      console.error('Error fetching products:', productsError);
      return new Response(
        JSON.stringify({ success: false, message: 'Error fetching product details' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create a map of products for easier lookup
    const productsMap = new Map(products.map(p => [p.id, p]));

    // Validate stock availability and calculate total
    let totalAmount = 0;
    const orderItems = [];

    for (const item of items) {
      const product = productsMap.get(item.id);
      
      if (!product) {
        return new Response(
          JSON.stringify({ success: false, message: `Product not found: ${item.id}` }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (product.stock_quantity < item.quantity) {
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: `Insufficient stock for: ${product.name}. Available: ${product.stock_quantity}` 
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      const itemPrice = product.sale_price || product.price;
      const itemTotal = itemPrice * item.quantity;
      totalAmount += itemTotal;
      
      orderItems.push({
        product_id: product.id,
        quantity: item.quantity,
        price: itemPrice,
        total: itemTotal,
        data: { product_name: product.name }
      });
    }

    // Check user balance
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('balance')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      console.error('Error fetching user profile:', profileError);
      return new Response(
        JSON.stringify({ success: false, message: 'Error fetching user balance' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (profile.balance < totalAmount) {
      return new Response(
        JSON.stringify({ success: false, message: 'Insufficient balance' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Start transaction
    // Note: We'll create an order, update stock, and update user balance
    let createdOrder = null;

    // 1. Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        total_amount: totalAmount,
        status: 'completed'
      })
      .select()
      .single();

    if (orderError || !order) {
      console.error('Error creating order:', orderError);
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to create order' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    createdOrder = order;

    // 2. Create order items
    const orderItemsWithOrderId = orderItems.map(item => ({
      ...item,
      order_id: order.id
    }));

    const { error: orderItemsError } = await supabase
      .from('order_items')
      .insert(orderItemsWithOrderId);

    if (orderItemsError) {
      console.error('Error creating order items:', orderItemsError);
      // Ideally we would rollback the order here
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to create order items' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 3. Update product stock quantities
    for (const item of items) {
      const product = productsMap.get(item.id);
      const newStockQuantity = product.stock_quantity - item.quantity;
      
      const { error: updateError } = await supabase
        .from('products')
        .update({ 
          stock_quantity: newStockQuantity,
          status: newStockQuantity === 0 ? 'out_of_stock' : product.status
        })
        .eq('id', item.id);
      
      if (updateError) {
        console.error(`Error updating stock for product ${item.id}:`, updateError);
        // Ideally we would rollback the transaction here
        return new Response(
          JSON.stringify({ success: false, message: 'Failed to update product stock' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // 4. Update user balance
    const newBalance = profile.balance - totalAmount;
    const { error: updateBalanceError } = await supabase
      .from('profiles')
      .update({ balance: newBalance })
      .eq('id', user.id);

    if (updateBalanceError) {
      console.error('Error updating user balance:', updateBalanceError);
      // Ideally we would rollback the transaction here
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to update your balance' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 5. Create a transaction record
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        amount: totalAmount,
        type: 'purchase',
        reference_id: order.id,
        description: `Purchase of ${items.length} product(s)`
      });

    if (transactionError) {
      console.error('Error creating transaction record:', transactionError);
      // Not critical, so we don't return an error
    }

    // Return success response with order details
    return new Response(
      JSON.stringify({
        success: true,
        message: 'Purchase completed successfully',
        order: {
          id: createdOrder.id,
          total: totalAmount,
          items: orderItems.length
        }
      }),
      { 
        status: 200, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'An unexpected error occurred' }),
      { 
        status: 500, 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  }
});
