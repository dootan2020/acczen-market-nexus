
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const PAYPAL_API_URL = Deno.env.get('PAYPAL_API_URL') || 'https://api-m.sandbox.paypal.com'
const WEBHOOK_ID = Deno.env.get('PAYPAL_WEBHOOK_ID')

async function getPayPalAccessToken() {
  const auth = btoa(`${Deno.env.get('PAYPAL_CLIENT_ID')}:${Deno.env.get('PAYPAL_CLIENT_SECRET')}`)
  
  const response = await fetch(`${PAYPAL_API_URL}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Authorization': `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials'
  })

  if (!response.ok) {
    throw new Error('Failed to get PayPal access token')
  }

  const data = await response.json()
  return data.access_token
}

async function verifyWebhookSignature(event: any, accessToken: string) {
  const response = await fetch(`${PAYPAL_API_URL}/v1/notifications/verify-webhook-signature`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      auth_algo: event.auth_algo,
      cert_url: event.cert_url,
      transmission_id: event.transmission_id,
      transmission_sig: event.transmission_sig,
      transmission_time: event.transmission_time,
      webhook_id: WEBHOOK_ID,
      webhook_event: event.webhook_event
    })
  })

  if (!response.ok) {
    throw new Error('Failed to verify webhook signature')
  }

  const verification = await response.json()
  return verification.verification_status === 'SUCCESS'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const event = await req.json()
    const accessToken = await getPayPalAccessToken()
    const isValid = await verifyWebhookSignature(event, accessToken)

    if (!isValid) {
      throw new Error('Invalid webhook signature')
    }

    // Handle different webhook event types
    switch (event.webhook_event.event_type) {
      case 'PAYMENT.CAPTURE.COMPLETED': {
        const payment = event.webhook_event.resource
        
        // Update deposit status
        const { error: updateError } = await supabaseClient
          .from('deposits')
          .update({
            status: 'completed',
            paypal_payer_id: payment.payer.payer_id,
            paypal_payer_email: payment.payer.email_address
          })
          .eq('paypal_order_id', payment.id)

        if (updateError) throw updateError
        
        break
      }
      case 'PAYMENT.CAPTURE.DENIED':
      case 'PAYMENT.CAPTURE.DECLINED': {
        const payment = event.webhook_event.resource
        
        // Update deposit status to failed
        const { error: updateError } = await supabaseClient
          .from('deposits')
          .update({ status: 'failed' })
          .eq('paypal_order_id', payment.id)

        if (updateError) throw updateError
        
        break
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error) {
    console.error('Error:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
