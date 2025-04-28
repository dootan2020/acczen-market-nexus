
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Xử lý CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Khởi tạo Supabase client
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    // Parse request body
    const { action, email, productId, userId } = await req.json();

    if (action === 'subscribe') {
      if (!email || !productId) {
        return new Response(
          JSON.stringify({ success: false, message: 'Email and productId are required' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      // Kiểm tra sản phẩm tồn tại
      const { data: product, error: productError } = await supabaseClient
        .from('products')
        .select('id, name, stock_quantity')
        .eq('id', productId)
        .single();

      if (productError || !product) {
        return new Response(
          JSON.stringify({ success: false, message: 'Product not found' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
        );
      }

      // Nếu sản phẩm đã có hàng, không cần đăng ký thông báo
      if (product.stock_quantity > 0) {
        return new Response(
          JSON.stringify({
            success: false,
            message: 'Product already in stock',
            inStock: true
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Thêm đăng ký thông báo
      const { data, error } = await supabaseClient
        .from('stock_notifications')
        .insert({
          product_id: productId,
          user_id: userId || null,
          email,
        })
        .select()
        .single();

      if (error) {
        // Kiểm tra lỗi unique constraint
        if (error.code === '23505') {
          return new Response(
            JSON.stringify({ success: true, message: 'Already subscribed to notifications' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        return new Response(
          JSON.stringify({ success: false, message: error.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Successfully subscribed to stock notifications',
          notification: data
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (action === 'check') {
      // Kiểm tra trạng thái đăng ký
      if (!productId) {
        return new Response(
          JSON.stringify({ success: false, message: 'ProductId is required' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      let query = supabaseClient.from('stock_notifications').select('*');
      
      if (email) {
        query = query.eq('email', email);
      } else if (userId) {
        query = query.eq('user_id', userId);
      } else {
        return new Response(
          JSON.stringify({ success: false, message: 'Email or userId is required' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
      
      query = query.eq('product_id', productId);

      const { data, error } = await query;

      if (error) {
        return new Response(
          JSON.stringify({ success: false, message: error.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          subscribed: data && data.length > 0,
          notification: data && data.length > 0 ? data[0] : null
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else if (action === 'unsubscribe') {
      // Hủy đăng ký thông báo
      if (!productId || (!email && !userId)) {
        return new Response(
          JSON.stringify({ success: false, message: 'ProductId and either email or userId are required' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      let query = supabaseClient.from('stock_notifications').delete();
      
      if (email) {
        query = query.eq('email', email);
      } else if (userId) {
        query = query.eq('user_id', userId);
      }
      
      query = query.eq('product_id', productId);

      const { error } = await query;

      if (error) {
        return new Response(
          JSON.stringify({ success: false, message: error.message }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      return new Response(
        JSON.stringify({
          success: true,
          message: 'Successfully unsubscribed from stock notifications'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } else {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid action' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
  } catch (error) {
    console.error('Error processing stock notification:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
