
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle OPTIONS request for CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, message: 'Thiếu thông tin xác thực' }),
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
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, message: 'Không thể xác thực người dùng' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { orderAmount } = await req.json();
    
    if (!orderAmount || typeof orderAmount !== 'number') {
      return new Response(
        JSON.stringify({ success: false, message: 'Thiếu hoặc sai định dạng tổng tiền đơn hàng' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Call the calculate_loyalty_discount function
    const { data, error } = await supabase
      .rpc('calculate_loyalty_discount', {
        user_id: user.id,
        order_amount: orderAmount
      });

    if (error) {
      console.error('Error calculating loyalty discount:', error);
      return new Response(
        JSON.stringify({ success: false, message: 'Lỗi khi tính toán giảm giá', error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user's loyalty info
    const { data: loyaltyInfo, error: loyaltyError } = await supabase
      .rpc('get_user_loyalty_info', {
        p_user_id: user.id
      });

    if (loyaltyError) {
      console.error('Error getting user loyalty info:', loyaltyError);
    }

    // Return success response with calculated discount
    return new Response(
      JSON.stringify({
        success: true,
        discount: data,
        loyaltyInfo: loyaltyInfo?.[0] || null,
        potentialPoints: Math.floor(orderAmount)
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ success: false, message: 'Lỗi không xác định', error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
