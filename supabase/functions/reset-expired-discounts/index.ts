
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.43.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Create a Supabase client with the service role key
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
    // Check if this is a scheduled invocation or manual (auth check for manual)
    let isAuthenticated = false;
    const authHeader = req.headers.get('Authorization');
    
    if (authHeader) {
      // Manual invocation - verify admin permissions
      const jwt = authHeader.replace('Bearer ', '');
      const { data: { user }, error: authError } = await supabaseClient.auth.getUser(jwt);
      
      if (!authError && user) {
        // Verify user is admin
        const { data: userProfile, error: profileError } = await supabaseClient
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
          
        if (!profileError && userProfile?.role === 'admin') {
          isAuthenticated = true;
        }
      }
      
      if (!isAuthenticated) {
        throw new Error('Unauthorized: Admin privileges required');
      }
    } else {
      // If no auth header, assume it's a scheduled invocation
      // In production, you'd want to add additional security checks here
      console.log('Processing scheduled reset of expired discounts');
    }
    
    // Call the database function to reset expired discounts
    const { data, error } = await supabaseClient.rpc('reset_expired_discounts');
    
    if (error) {
      throw error;
    }
    
    console.log(`Reset ${data} expired temporary discount(s)`);
    
    return new Response(
      JSON.stringify({
        success: true,
        resetCount: data,
        timestamp: new Date().toISOString()
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  } catch (error) {
    console.error('Error resetting expired discounts:', error.message);
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
