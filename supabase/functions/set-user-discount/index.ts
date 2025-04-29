
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create a Supabase client with the Auth context of the function
const supabaseClient = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
);

serve(async (req: Request) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the JWT token from the request
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }
    
    const jwt = authHeader.replace('Bearer ', '');
    
    // Verify the JWT and get the user ID
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(jwt);
    if (authError || !user) {
      throw new Error('Invalid JWT or user not found');
    }
    
    // Check if user is admin
    const { data: adminCheck, error: adminCheckError } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
    
    if (adminCheckError || adminCheck?.role !== 'admin') {
      throw new Error('Only admins can update user discounts');
    }
    
    // Get request body
    const { userId, discountPercentage, discountNote } = await req.json();
    
    // Validate inputs
    if (!userId || discountPercentage === undefined || discountPercentage === null) {
      throw new Error('Missing required fields: userId, discountPercentage');
    }
    
    if (typeof discountPercentage !== 'number' || discountPercentage < 0 || discountPercentage > 100) {
      throw new Error('Invalid discount percentage: must be a number between 0 and 100');
    }
    
    // Call database function to update discount
    const { data, error } = await supabaseClient.rpc('admin_update_user_discount', {
      p_user_id: userId,
      p_discount_percentage: discountPercentage,
      p_discount_note: discountNote || null
    });
    
    if (error) {
      throw error;
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        discountHistoryId: data
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error:', error.message);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
