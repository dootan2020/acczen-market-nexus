
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

    // Get the current user or admin user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ success: false, message: 'Không thể xác thực người dùng' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse request body
    const { userId, points, transactionType, referenceId, description } = await req.json();
    
    // Validate input
    if (!userId || !points || !transactionType) {
      return new Response(
        JSON.stringify({ success: false, message: 'Thiếu thông tin bắt buộc' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user is admin when awarding points to other users
    if (userId !== user.id) {
      const { data: adminCheck, error: adminError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();
      
      if (adminError || !adminCheck || adminCheck.role !== 'admin') {
        return new Response(
          JSON.stringify({ success: false, message: 'Không có quyền thực hiện thao tác này' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Call the add_loyalty_points function
    const { data: transactionId, error } = await supabase
      .rpc('add_loyalty_points', {
        p_user_id: userId,
        p_points: points,
        p_transaction_type: transactionType,
        p_reference_id: referenceId,
        p_description: description
      });

    if (error) {
      console.error('Error adding loyalty points:', error);
      return new Response(
        JSON.stringify({ success: false, message: 'Lỗi khi thêm điểm thành viên', error: error.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get updated loyalty info
    const { data: updatedLoyaltyInfo, error: loyaltyError } = await supabase
      .rpc('get_user_loyalty_info', {
        p_user_id: userId
      });

    if (loyaltyError) {
      console.error('Error getting updated user loyalty info:', loyaltyError);
    }

    // Check for tier upgrade
    let tierUpgrade = null;
    if (updatedLoyaltyInfo?.[0]) {
      // Need to get previous tier name to compare
      const { data: pointsHistory, error: historyError } = await supabase
        .from('loyalty_points_transactions')
        .select('created_at')
        .eq('id', transactionId)
        .single();
      
      if (!historyError && pointsHistory) {
        // Get the tier before this transaction
        const { data: previousTierData, error: prevTierError } = await supabase
          .from('profiles')
          .select('current_tier_id')
          .eq('id', userId)
          .single();
          
        if (!prevTierError && previousTierData && previousTierData.current_tier_id) {
          const { data: prevTier, error: tierNameError } = await supabase
            .from('loyalty_tiers')
            .select('name')
            .eq('id', previousTierData.current_tier_id)
            .single();
            
          if (!tierNameError && prevTier && prevTier.name !== updatedLoyaltyInfo[0].current_tier_name) {
            tierUpgrade = {
              previousTier: prevTier.name,
              newTier: updatedLoyaltyInfo[0].current_tier_name
            };
          }
        }
      }
    }

    // Return success response with transaction ID
    return new Response(
      JSON.stringify({
        success: true,
        transactionId,
        loyaltyInfo: updatedLoyaltyInfo?.[0] || null,
        tierUpgrade
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
