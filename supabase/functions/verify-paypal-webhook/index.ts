
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
  
  try {
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
      const errorData = await response.json().catch(() => ({}));
      console.error('PayPal token error:', response.status, errorData);
      throw new Error(`Failed to get PayPal access token: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.access_token;
  } catch (error) {
    console.error('PayPal token fetch error:', error);
    throw new Error(`Error fetching PayPal token: ${error.message}`);
  }
}

async function verifyWebhookSignature(event: any, accessToken: string) {
  try {
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
      const errorData = await response.json().catch(() => ({}));
      console.error('PayPal verification error:', response.status, errorData);
      throw new Error(`Failed to verify webhook signature: ${response.status} ${response.statusText}`);
    }

    const verification = await response.json();
    return verification.verification_status === 'SUCCESS';
  } catch (error) {
    console.error('PayPal verification error:', error);
    throw new Error(`Error verifying PayPal webhook: ${error.message}`);
  }
}

async function findDepositByOrderId(supabaseClient: any, orderId: string) {
  const { data, error } = await supabaseClient
    .from('deposits')
    .select('*')
    .eq('paypal_order_id', orderId)
    .single();

  if (error) {
    console.error('Error finding deposit:', error);
    throw error;
  }

  return data;
}

async function updateDepositStatus(supabaseClient: any, id: string, status: string, additionalData = {}) {
  const { data, error } = await supabaseClient
    .from('deposits')
    .update({
      status,
      updated_at: new Date().toISOString(),
      ...additionalData
    })
    .eq('id', id)
    .select();

  if (error) {
    console.error('Error updating deposit:', error);
    throw error;
  }

  return data;
}

async function createTransaction(supabaseClient: any, type: 'deposit' | 'refund', amount: number, userId: string, referenceId: string, description: string) {
  const { data, error } = await supabaseClient
    .from('transactions')
    .insert({
      type,
      amount,
      user_id: userId,
      reference_id: referenceId,
      description
    });

  if (error) {
    console.error('Error creating transaction:', error);
    throw error;
  }

  return data;
}

async function updateUserBalance(supabaseClient: any, userId: string, amount: number) {
  const { error } = await supabaseClient.rpc(
    'update_user_balance',
    { user_id: userId, amount }
  );

  if (error) {
    console.error('Error updating user balance:', error);
    throw error;
  }
}

async function sendNotificationEmail(supabase: any, userId: string, templateName: string, data: any) {
  try {
    // Call a separate edge function for sending emails
    await supabase.functions.invoke('send-notification-email', {
      body: JSON.stringify({
        user_id: userId,
        template: templateName,
        data
      })
    });
  } catch (error) {
    // Log the error but don't fail the whole process
    console.error('Error sending notification email:', error);
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  console.log('PayPal webhook received');

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const event = await req.json();
    console.log('Event type:', event.webhook_event?.event_type);
    
    // Validate the webhook
    const accessToken = await getPayPalAccessToken();
    const isValid = await verifyWebhookSignature(event, accessToken);

    if (!isValid) {
      console.error('Invalid webhook signature');
      throw new Error('Invalid webhook signature');
    }

    // Extract event data
    const webhookEvent = event.webhook_event;
    const eventType = webhookEvent.event_type;
    
    // Handle different webhook event types
    switch (eventType) {
      case 'PAYMENT.CAPTURE.COMPLETED': {
        const payment = webhookEvent.resource;
        const orderId = payment.supplementary_data?.related_ids?.order_id || 
                         payment.supplementary_data?.related_ids?.sale_id || 
                         payment.id;
        
        console.log('Processing completed payment for order:', orderId);
        
        // Find the deposit record
        const deposit = await findDepositByOrderId(supabaseClient, orderId);
        if (!deposit) {
          console.error('Deposit record not found for PayPal order ID:', orderId);
          throw new Error(`Deposit record not found for PayPal order ID: ${orderId}`);
        }
        
        if (deposit.status === 'completed') {
          console.log('Deposit already marked as completed, skipping processing');
          return new Response(JSON.stringify({ success: true, status: 'already_processed' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
          });
        }
        
        // Update deposit status
        await updateDepositStatus(supabaseClient, deposit.id, 'completed', {
          paypal_payer_id: payment.payer?.payer_id,
          paypal_payer_email: payment.payer?.email_address
        });
        
        // Create transaction record
        await createTransaction(
          supabaseClient,
          'deposit',
          deposit.amount,
          deposit.user_id,
          deposit.id,
          `PayPal deposit (${orderId})`
        );
        
        // Update user balance
        await updateUserBalance(supabaseClient, deposit.user_id, deposit.amount);
        
        // Send email notification
        await sendNotificationEmail(supabaseClient, deposit.user_id, 'deposit_success', {
          amount: deposit.amount,
          payment_method: 'PayPal',
          transaction_id: orderId,
          date: new Date().toISOString()
        });
        
        console.log('Successfully processed PayPal payment for deposit:', deposit.id);
        break;
      }
      
      case 'PAYMENT.CAPTURE.DENIED':
      case 'PAYMENT.CAPTURE.DECLINED': 
      case 'PAYMENT.CAPTURE.REFUNDED': {
        const payment = webhookEvent.resource;
        const orderId = payment.supplementary_data?.related_ids?.order_id || 
                         payment.supplementary_data?.related_ids?.sale_id || 
                         payment.id;
        
        console.log(`Processing ${eventType.toLowerCase()} for order:`, orderId);
        
        // Find the deposit record
        const deposit = await findDepositByOrderId(supabaseClient, orderId);
        if (!deposit) {
          console.error('Deposit record not found for PayPal order ID:', orderId);
          throw new Error(`Deposit record not found for PayPal order ID: ${orderId}`);
        }
        
        // If this is a refund and the deposit was already completed, we need to reverse the balance
        if (eventType === 'PAYMENT.CAPTURE.REFUNDED' && deposit.status === 'completed') {
          // Create refund transaction
          await createTransaction(
            supabaseClient,
            'refund',
            -deposit.amount, // Negative amount to decrease balance
            deposit.user_id,
            deposit.id,
            `PayPal refund (${orderId})`
          );
          
          // Update user balance (subtract the amount)
          await updateUserBalance(supabaseClient, deposit.user_id, -deposit.amount);
        }
        
        // Update deposit status based on event type
        const newStatus = eventType === 'PAYMENT.CAPTURE.REFUNDED' ? 'refunded' : 'failed';
        await updateDepositStatus(supabaseClient, deposit.id, newStatus);
        
        console.log(`Successfully processed ${eventType.toLowerCase()} for deposit:`, deposit.id);
        break;
      }
      
      case 'PAYMENT.CAPTURE.PENDING': {
        const payment = webhookEvent.resource;
        const orderId = payment.supplementary_data?.related_ids?.order_id || 
                         payment.supplementary_data?.related_ids?.sale_id || 
                         payment.id;
        
        console.log('Processing pending payment for order:', orderId);
        
        // Find the deposit record
        const deposit = await findDepositByOrderId(supabaseClient, orderId);
        if (!deposit) {
          console.error('Deposit record not found for PayPal order ID:', orderId);
          throw new Error(`Deposit record not found for PayPal order ID: ${orderId}`);
        }
        
        // Update deposit with pending reason if available
        const pendingReason = payment.status_details?.reason || 'unknown';
        await updateDepositStatus(supabaseClient, deposit.id, 'pending', {
          metadata: { pending_reason: pendingReason }
        });
        
        console.log('Updated deposit to pending status with reason:', pendingReason);
        break;
      }
      
      default:
        console.log('Unhandled event type:', eventType);
        // For unhandled events, we acknowledge receipt but take no action
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
    
  } catch (error) {
    console.error('Error processing webhook:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
})
