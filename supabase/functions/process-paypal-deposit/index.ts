
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ProcessPayPalDepositRequest {
  orderID: string;
  amount: number;
  userID: string;
  idempotencyKey?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse request body
    const requestData: ProcessPayPalDepositRequest = await req.json();
    const { orderID, amount, userID, idempotencyKey } = requestData;

    if (!orderID || !amount || !userID) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing required parameters' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Check for idempotency
    if (idempotencyKey) {
      const { data: existingDeposit } = await supabase
        .from('deposits')
        .select('*')
        .eq('paypal_order_id', orderID)
        .single();

      if (existingDeposit) {
        return new Response(
          JSON.stringify({ 
            success: true, 
            message: 'Deposit already processed',
            depositId: existingDeposit.id
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        );
      }
    }

    // Create deposit record
    const { data: deposit, error: depositError } = await supabase
      .from('deposits')
      .insert({
        user_id: userID,
        amount,
        payment_method: 'PayPal',
        status: 'completed',
        paypal_order_id: orderID,
        metadata: {
          order_id: orderID,
          processed_at: new Date().toISOString(),
          source: 'client-side'
        }
      })
      .select()
      .single();

    if (depositError) {
      console.error('Error creating deposit record:', depositError);
      throw new Error(`Failed to create deposit record: ${depositError.message}`);
    }

    // Create transaction record
    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        type: 'deposit',
        amount,
        user_id: userID,
        reference_id: deposit.id,
        description: `PayPal deposit (${orderID})`
      });

    if (transactionError) {
      console.error('Error creating transaction record:', transactionError);
      throw new Error(`Failed to create transaction record: ${transactionError.message}`);
    }

    // Update user balance
    const { error: balanceError } = await supabase.rpc(
      'update_user_balance',
      { user_id: userID, amount }
    );

    if (balanceError) {
      console.error('Error updating user balance:', balanceError);
      throw new Error(`Failed to update user balance: ${balanceError.message}`);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Deposit processed successfully',
        depositId: deposit.id
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    console.error('Error processing PayPal deposit:', error);
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
