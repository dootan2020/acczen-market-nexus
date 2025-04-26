
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const PAYPAL_API_URL = Deno.env.get('PAYPAL_API_URL') || 'https://api-m.sandbox.paypal.com'
const WEBHOOK_ID = Deno.env.get('PAYPAL_WEBHOOK_ID')
const CLIENT_ID = Deno.env.get('PAYPAL_CLIENT_ID')
const CLIENT_SECRET = Deno.env.get('PAYPAL_CLIENT_SECRET')

// Check if required environment variables are set
function validateEnvironment() {
  const requiredVars = [
    { name: 'PAYPAL_CLIENT_ID', value: CLIENT_ID },
    { name: 'PAYPAL_CLIENT_SECRET', value: CLIENT_SECRET },
    { name: 'PAYPAL_WEBHOOK_ID', value: WEBHOOK_ID },
    { name: 'SUPABASE_URL', value: Deno.env.get('SUPABASE_URL') },
    { name: 'SUPABASE_SERVICE_ROLE_KEY', value: Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') }
  ];
  
  const missingVars = requiredVars
    .filter(v => !v.value)
    .map(v => v.name);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }
}

async function getPayPalAccessToken() {
  const auth = btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)
  
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
    if (!WEBHOOK_ID) {
      throw new Error('PAYPAL_WEBHOOK_ID environment variable is not set');
    }
    
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
  try {
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
  } catch (error) {
    console.error(`Error finding deposit for order ID ${orderId}:`, error);
    return null;
  }
}

async function updateDepositStatus(supabaseClient: any, id: string, status: string, additionalData = {}) {
  try {
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
  } catch (error) {
    console.error(`Error updating deposit ${id} to ${status}:`, error);
    throw error;
  }
}

async function createTransaction(supabaseClient: any, type: 'deposit' | 'refund', amount: number, userId: string, referenceId: string, description: string) {
  try {
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
  } catch (error) {
    console.error(`Error creating ${type} transaction:`, error);
    throw error;
  }
}

async function updateUserBalance(supabaseClient: any, userId: string, amount: number) {
  try {
    const { error } = await supabaseClient.rpc(
      'update_user_balance',
      { user_id: userId, amount }
    );

    if (error) {
      console.error('Error updating user balance:', error);
      throw error;
    }
  } catch (error) {
    console.error(`Error updating balance for user ${userId}:`, error);
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

async function logWebhookEvent(supabase: any, eventType: string, eventData: any, status: 'success' | 'error', errorMessage?: string) {
  try {
    // Store webhook event log
    await supabase
      .from('api_logs')
      .insert({
        api: 'PayPal',
        endpoint: 'webhook',
        status: status,
        details: {
          event_type: eventType,
          event_id: eventData.id,
          error: errorMessage,
          timestamp: new Date().toISOString(),
          data: eventData
        }
      });
  } catch (logError) {
    console.error('Error logging webhook event:', logError);
    // Don't throw - this is a non-critical operation
  }
}

async function getOrderIdFromResource(resource: any) {
  // Try different ways to extract order ID based on event type
  return resource.supplementary_data?.related_ids?.order_id || 
         resource.supplementary_data?.related_ids?.sale_id || 
         resource.id;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  console.log('PayPal webhook received');

  try {
    // Validate environment variables
    validateEnvironment();
    
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
      await logWebhookEvent(
        supabaseClient, 
        event.webhook_event?.event_type, 
        event.webhook_event, 
        'error', 
        'Invalid webhook signature'
      );
      throw new Error('Invalid webhook signature');
    }

    // Extract event data
    const webhookEvent = event.webhook_event;
    const eventType = webhookEvent.event_type;
    await logWebhookEvent(supabaseClient, eventType, webhookEvent, 'success');
    
    // Handle different webhook event types
    switch (eventType) {
      case 'PAYMENT.CAPTURE.COMPLETED': {
        const payment = webhookEvent.resource;
        const orderId = await getOrderIdFromResource(payment);
        
        console.log('Processing completed payment for order:', orderId);
        
        // Find the deposit record
        const deposit = await findDepositByOrderId(supabaseClient, orderId);
        if (!deposit) {
          console.error('Deposit record not found for PayPal order ID:', orderId);
          return new Response(JSON.stringify({ success: false, message: 'Deposit record not found' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          });
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
          paypal_payer_email: payment.payer?.email_address,
          metadata: {
            ...deposit.metadata,
            webhook_processed: new Date().toISOString(),
            payment_details: payment
          }
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
        const orderId = await getOrderIdFromResource(payment);
        
        console.log(`Processing ${eventType.toLowerCase()} for order:`, orderId);
        
        // Find the deposit record
        const deposit = await findDepositByOrderId(supabaseClient, orderId);
        if (!deposit) {
          console.error('Deposit record not found for PayPal order ID:', orderId);
          return new Response(JSON.stringify({ success: false, message: 'Deposit record not found' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          });
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
          
          // Send refund notification
          await sendNotificationEmail(supabaseClient, deposit.user_id, 'payment_refunded', {
            amount: deposit.amount,
            payment_method: 'PayPal',
            transaction_id: orderId,
            date: new Date().toISOString()
          });
        }
        
        // Update deposit status based on event type
        const newStatus = eventType === 'PAYMENT.CAPTURE.REFUNDED' ? 'refunded' : 'failed';
        await updateDepositStatus(supabaseClient, deposit.id, newStatus, {
          metadata: {
            ...deposit.metadata,
            webhook_processed: new Date().toISOString(),
            payment_details: payment
          }
        });
        
        console.log(`Successfully processed ${eventType.toLowerCase()} for deposit:`, deposit.id);
        break;
      }
      
      case 'PAYMENT.CAPTURE.PENDING': {
        const payment = webhookEvent.resource;
        const orderId = await getOrderIdFromResource(payment);
        
        console.log('Processing pending payment for order:', orderId);
        
        // Find the deposit record
        const deposit = await findDepositByOrderId(supabaseClient, orderId);
        if (!deposit) {
          console.error('Deposit record not found for PayPal order ID:', orderId);
          return new Response(JSON.stringify({ success: false, message: 'Deposit record not found' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
          });
        }
        
        // Update deposit with pending reason if available
        const pendingReason = payment.status_details?.reason || 'unknown';
        await updateDepositStatus(supabaseClient, deposit.id, 'pending', {
          metadata: {
            ...deposit.metadata,
            webhook_processed: new Date().toISOString(),
            pending_reason: pendingReason,
            payment_details: payment
          }
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
