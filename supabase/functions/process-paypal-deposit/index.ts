
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// PayPal API configuration
const PAYPAL_BASE_URL = Deno.env.get('PAYPAL_API_URL') || 'https://api-m.sandbox.paypal.com'
const CLIENT_ID = Deno.env.get('PAYPAL_CLIENT_ID')
const CLIENT_SECRET = Deno.env.get('PAYPAL_CLIENT_SECRET')

// Function to get PayPal access token
async function getPayPalAccessToken() {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    throw new Error('PayPal credentials are not configured')
  }
  
  const auth = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)
  
  try {
    const response = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: 'grant_type=client_credentials'
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      console.error('PayPal token error:', response.status, errorText)
      throw new Error(`Failed to get PayPal access token: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    return data.access_token
  } catch (error) {
    console.error('PayPal token fetch error:', error)
    throw new Error(`Error fetching PayPal token: ${error.message}`)
  }
}

// Function to verify PayPal payment
async function verifyPayPalPayment(orderID, accessToken) {
  try {
    const response = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders/${orderID}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      }
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error')
      console.error('PayPal verification error:', response.status, errorText)
      throw new Error(`Failed to verify PayPal payment: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    console.error('PayPal verification error:', error)
    throw new Error(`Error verifying payment with PayPal: ${error.message}`)
  }
}

// Check if a deposit with this PayPal order ID already exists
async function checkExistingDeposit(supabase, orderID) {
  const { data, error } = await supabase
    .from('deposits')
    .select('id, status')
    .eq('paypal_order_id', orderID)
    .maybeSingle()
  
  if (error) {
    console.error('Error checking existing deposit:', error)
    throw new Error(`Database error: ${error.message}`)
  }
  
  return data
}

// Create a new deposit record
async function createDepositRecord(supabase, {
  userID,
  amount,
  orderID,
  payerID,
  payerEmail
}) {
  try {
    const { data, error } = await supabase
      .from('deposits')
      .insert({
        user_id: userID,
        amount: amount,
        status: 'completed',
        payment_method: 'PayPal',
        paypal_order_id: orderID,
        paypal_payer_id: payerID,
        paypal_payer_email: payerEmail,
        metadata: {
          processed_at: new Date().toISOString()
        }
      })
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating deposit record:', error)
    throw new Error(`Failed to create deposit record: ${error.message}`)
  }
}

// Create transaction record and update user balance
async function processDeposit(supabase, deposit) {
  try {
    // Create transaction record
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: deposit.user_id,
        amount: deposit.amount,
        type: 'deposit',
        reference_id: deposit.id,
        description: `PayPal deposit (${deposit.paypal_order_id})`
      })

    if (transactionError) throw transactionError

    // Update user balance
    const { error: balanceError } = await supabase.rpc(
      'update_user_balance',
      {
        user_id: deposit.user_id,
        amount: deposit.amount
      }
    )

    if (balanceError) throw balanceError

    return true
  } catch (error) {
    console.error('Error processing deposit:', error)
    throw new Error(`Failed to process deposit: ${error.message}`)
  }
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
    const { orderID, amount, userID, idempotencyKey } = await req.json()

    // Validate input
    if (!orderID) throw new Error('Missing orderID')
    if (!amount || isNaN(parseFloat(amount))) throw new Error('Invalid amount')
    if (!userID) throw new Error('Missing userID')

    // Check for existing deposit with this PayPal order ID to prevent duplicates
    const existingDeposit = await checkExistingDeposit(supabase, orderID)
    if (existingDeposit) {
      if (existingDeposit.status === 'completed') {
        console.log('Duplicate deposit request detected, returning success')
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Deposit already processed',
            depositId: existingDeposit.id
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }
    }

    // Get PayPal access token
    const accessToken = await getPayPalAccessToken()

    // Verify PayPal payment
    const paymentDetails = await verifyPayPalPayment(orderID, accessToken)

    // Validate payment status and amount
    const paymentAmount = parseFloat(paymentDetails.purchase_units[0].amount.value)
    const requestedAmount = parseFloat(amount)
    
    if (
      paymentDetails.status !== 'COMPLETED' && 
      paymentDetails.status !== 'APPROVED'
    ) {
      throw new Error(`Invalid payment status: ${paymentDetails.status}`)
    }
    
    if (Math.abs(paymentAmount - requestedAmount) > 0.01) {
      throw new Error(`Amount mismatch: Expected $${requestedAmount}, got $${paymentAmount}`)
    }

    // Create deposit record
    const deposit = await createDepositRecord(supabase, {
      userID,
      amount: requestedAmount,
      orderID,
      payerID: paymentDetails.payer?.payer_id,
      payerEmail: paymentDetails.payer?.email_address
    })

    // Process the deposit (create transaction and update balance)
    await processDeposit(supabase, deposit)

    // Send notification email
    try {
      await supabase.functions.invoke('send-notification-email', {
        body: JSON.stringify({
          user_id: userID,
          template: 'deposit_success',
          data: {
            amount: requestedAmount,
            payment_method: 'PayPal',
            transaction_id: orderID,
            date: new Date().toISOString()
          }
        })
      })
    } catch (emailError) {
      console.error('Failed to send notification email:', emailError)
      // Don't fail the entire request if email sending fails
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Deposit processed successfully',
        depositId: deposit.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Deposit processing error:', error)
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error.message 
      }), 
      { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})
