
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

    // Parse request if available
    const reqData = req.method === "POST" ? await req.json() : {};
    const userId = reqData.userId || user.id;
    
    // Check if user has admin role when querying other users
    if (userId !== user.id) {
      const { data: adminCheck, error: adminError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (adminError || !adminCheck || adminCheck.role !== 'admin') {
        return new Response(
          JSON.stringify({ success: false, message: 'Không có quyền truy cập thông tin này' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Update user tier first (in case there was no active trigger yet)
    const { error: updateTierError } = await supabase
      .rpc('update_user_loyalty_tier', {
        user_id: userId
      });

    if (updateTierError) {
      console.error('Error updating user tier:', updateTierError);
      return new Response(
        JSON.stringify({ success: false, message: 'Lỗi khi cập nhật cấp độ thành viên', error: updateTierError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user's loyalty info
    const { data: loyaltyInfo, error: loyaltyError } = await supabase
      .rpc('get_user_loyalty_info', {
        p_user_id: userId
      });

    if (loyaltyError) {
      console.error('Error getting user loyalty info:', loyaltyError);
      return new Response(
        JSON.stringify({ success: false, message: 'Lỗi khi truy vấn thông tin thành viên', error: loyaltyError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get recent transactions
    const { data: recentTransactions, error: transactionsError } = await supabase
      .from('loyalty_points_transactions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (transactionsError) {
      console.error('Error getting recent transactions:', transactionsError);
    }

    // Get all loyalty tiers for reference
    const { data: allTiers, error: tiersError } = await supabase
      .from('loyalty_tiers')
      .select('*')
      .order('min_points', { ascending: true });

    if (tiersError) {
      console.error('Error getting loyalty tiers:', tiersError);
    }

    // Return success response with user loyalty info
    return new Response(
      JSON.stringify({
        success: true,
        loyaltyInfo: loyaltyInfo?.[0] || null,
        recentTransactions: recentTransactions || [],
        allTiers: allTiers || []
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
