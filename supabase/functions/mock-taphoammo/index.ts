
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Product {
  kiosk_token: string;
  name: string;
  price: number;
  stock_quantity: number;
}

interface MockOrder {
  order_id: string;
  user_token: string;
  kiosk_token: string;
  quantity: number;
  promotion?: string;
  status: string;
  product_keys: string[];
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    const { method } = req;
    const url = new URL(req.url);
    const path = url.pathname.split('/').pop() || '';

    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1500 + 500));

    switch (path) {
      case 'buyProducts': {
        const { kioskToken, userToken, quantity, promotion } = await req.json();
        
        // Validate product availability
        const { data: product, error: productError } = await supabaseClient
          .from('taphoammo_mock_products')
          .select('*')
          .eq('kiosk_token', kioskToken)
          .single();

        if (productError || !product) {
          return new Response(JSON.stringify({
            success: 'false',
            message: 'Invalid product token'
          }), { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400 
          });
        }

        if (product.stock_quantity < quantity) {
          return new Response(JSON.stringify({
            success: 'false',
            message: 'Insufficient stock'
          }), { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400 
          });
        }

        // Generate order
        const orderId = await supabaseClient.rpc('generate_random_order_id');
        const productKeys = Array.from({ length: quantity }, () => 
          `KEY-${Math.random().toString(36).substring(2, 10).toUpperCase()}`
        );

        const { error: orderError } = await supabaseClient
          .from('taphoammo_mock_orders')
          .insert({
            order_id: orderId,
            user_token: userToken,
            kiosk_token: kioskToken,
            quantity,
            promotion,
            status: 'processing',
            product_keys: productKeys
          });

        if (orderError) {
          console.error('Order creation error:', orderError);
          return new Response(JSON.stringify({
            success: 'false',
            message: 'Order processing failed'
          }), { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500 
          });
        }

        // Update stock
        await supabaseClient
          .from('taphoammo_mock_products')
          .update({ stock_quantity: product.stock_quantity - quantity })
          .eq('kiosk_token', kioskToken);

        return new Response(JSON.stringify({
          success: 'true',
          order_id: orderId,
          message: 'Order in processing!',
          product_keys: productKeys
        }), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'getProducts': {
        const { orderId, userToken } = await req.json();
        
        const { data: order, error: orderError } = await supabaseClient
          .from('taphoammo_mock_orders')
          .select('*')
          .eq('order_id', orderId)
          .eq('user_token', userToken)
          .single();

        if (orderError || !order) {
          return new Response(JSON.stringify({
            success: 'false',
            message: 'Order not found'
          }), { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404 
          });
        }

        const { data: product } = await supabaseClient
          .from('taphoammo_mock_products')
          .select('*')
          .eq('kiosk_token', order.kiosk_token)
          .single();

        return new Response(JSON.stringify({
          success: 'true',
          order_id: order.order_id,
          status: order.status,
          product: {
            name: product.name,
            kiosk_token: product.kiosk_token
          },
          product_keys: order.product_keys
        }), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      case 'getStock': {
        const { kioskToken, userToken } = await req.json();
        
        const { data: product, error: productError } = await supabaseClient
          .from('taphoammo_mock_products')
          .select('*')
          .eq('kiosk_token', kioskToken)
          .single();

        if (productError || !product) {
          return new Response(JSON.stringify({
            success: 'false',
            message: 'Product not found'
          }), { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 404 
          });
        }

        return new Response(JSON.stringify({
          success: 'true',
          kiosk_token: product.kiosk_token,
          name: product.name,
          stock_quantity: product.stock_quantity,
          price: product.price
        }), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      default:
        return new Response(JSON.stringify({
          success: 'false',
          message: 'Invalid endpoint'
        }), { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 404 
        });
    }
  } catch (error) {
    console.error('Taphoammo Mock API Error:', error);
    return new Response(JSON.stringify({
      success: 'false',
      message: 'Internal server error'
    }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500 
    });
  }
})
