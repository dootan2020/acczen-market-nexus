
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// PayPal API configuration
const PAYPAL_BASE_URL = 'https://api-m.sandbox.paypal.com'
const CLIENT_ID = Deno.env.get('PAYPAL_CLIENT_ID')
const CLIENT_SECRET = Deno.env.get('PAYPAL_CLIENT_SECRET')

// Function to get PayPal access token
async function getPayPalAccessToken() {
  const auth = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)
  
  const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Accept-Language': 'en_US',
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  })

  if (!response.ok) {
    throw new Error('Failed to get PayPal access token')
  }

  const data = await response.json()
  return data.access_token
}

// Function to verify PayPal payment
async function verifyPayPalPayment(orderID: string, accessToken: string) {
  const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderID}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`
    }
  })

  if (!response.ok) {
    throw new Error('Failed to verify PayPal payment')
  }

  return await response.json()
}

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Parse request body
    const { orderID, amount, userID } = await req.json()

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken()

    // Verify PayPal payment
    const paymentDetails = await verifyPayPalPayment(orderID, accessToken)

    // Validate payment details
    if (
      paymentDetails.status !== 'COMPLETED' || 
      parseFloat(paymentDetails.purchase_units[0].amount.value) !== amount
    ) {
      throw new Error('Invalid payment')
    }

    // Create deposit record
    const { error: depositError } = await supabase
      .from('deposits')
      .insert({
        user_id: userID,
        amount: amount,
        status: 'completed',
        payment_method: 'PayPal',
        paypal_order_id: orderID,
        paypal_payer_id: paymentDetails.payer.payer_id,
        paypal_payer_email: paymentDetails.payer.email_address
      })

    if (depositError) throw depositError

    return new Response(
      JSON.stringify({ success: true, message: 'Deposit processed successfully' }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error.message 
      }), 
      { 
        status: 400,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    )
  }
})
