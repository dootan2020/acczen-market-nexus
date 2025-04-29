
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
    
    // Get request body
    const { userId, amount } = await req.json();
    
    // Validate inputs
    if (!userId || amount === undefined || amount === null) {
      throw new Error('Missing required fields: userId, amount');
    }
    
    if (typeof amount !== 'number' || amount < 0) {
      throw new Error('Invalid amount: must be a positive number');
    }
    
    // Call database function to calculate discount
    const { data, error } = await supabaseClient.rpc('calculate_user_discount', {
      p_user_id: userId,
      p_amount: amount
    });
    
    if (error) {
      throw error;
    }
    
    // Get the user discount percentage
    const { data: userData, error: userError } = await supabaseClient
      .from('profiles')
      .select('discount_percentage')
      .eq('id', userId)
      .single();
      
    if (userError) {
      throw userError;
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        discountAmount: data,
        discountPercentage: userData.discount_percentage,
        originalAmount: amount,
        finalAmount: amount - data
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
