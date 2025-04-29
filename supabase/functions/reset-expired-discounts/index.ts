
// supabase Edge Function to reset expired discounts

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ExpiredDiscount {
  id: string;
  email: string;
  username: string | null;
  full_name: string | null;
  discount_percentage: number;
  discount_expires_at: string;
}

interface AdminUser {
  id: string;
  email: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders, status: 204 })
  }

  try {
    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      // Supabase API URL - env var exported by default.
      Deno.env.get('SUPABASE_URL') ?? '',
      // Supabase API ANON KEY - env var exported by default.
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )
    
    console.log('Running reset-expired-discounts function...')
    
    // First, identify users with expired discounts (for reporting)
    const { data: expiredDiscounts, error: fetchError } = await supabaseClient
      .from('profiles')
      .select('id, email, username, full_name, discount_percentage, discount_expires_at')
      .gt('discount_percentage', 0)
      .not('discount_expires_at', 'is', null)
      .lt('discount_expires_at', new Date().toISOString());
    
    if (fetchError) {
      console.error('Error fetching expired discounts:', fetchError)
      return new Response(
        JSON.stringify({ success: false, error: fetchError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }
    
    // Call the SQL function to reset expired discounts
    const { data: resetCount, error } = await supabaseClient.rpc('reset_expired_discounts')
    
    if (error) {
      console.error('Error resetting expired discounts:', error)
      return new Response(
        JSON.stringify({ success: false, error: error.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      )
    }
    
    console.log(`Reset ${resetCount} expired discount(s) successfully.`)
    
    // If we reset some discounts, send an email report to admins
    if (resetCount > 0) {
      try {
        // Get admin users for notification
        const { data: admins } = await supabaseClient
          .from('profiles')
          .select('id, email')
          .eq('role', 'admin');
        
        if (admins && admins.length > 0) {
          // Insert email logs for admin notifications
          const emailPromises = admins.map(async (admin: AdminUser) => {
            // Create a report for this admin
            await supabaseClient
              .from('email_logs')
              .insert({
                recipient_email: admin.email,
                email_type: 'discount_expiry_report',
                user_id: admin.id,
                metadata: {
                  reset_count: resetCount,
                  reset_date: new Date().toISOString(),
                  expired_discounts: expiredDiscounts || []
                }
              });
          });
          
          await Promise.all(emailPromises);
          console.log(`Sent report emails to ${admins.length} admin(s).`);
        }
      } catch (emailError) {
        console.error('Error sending admin notifications:', emailError);
        // We don't fail the function if email sending fails
      }
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `Reset ${resetCount} expired discount(s)`,
        count: resetCount,
        expiredDiscounts: expiredDiscounts || []
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
    
  } catch (error) {
    console.error('Unexpected error:', error)
    return new Response(
      JSON.stringify({ success: false, error: 'Internal server error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})
