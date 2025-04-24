
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import TronWeb from 'https://esm.sh/tronweb@5.3.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get request body
    const { txid, expected_amount, user_id, deposit_id, wallet_address } = await req.json();
    
    if (!txid || !expected_amount || !user_id || !deposit_id || !wallet_address) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing required parameters' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Setup TronWeb
    const tronWeb = new TronWeb({
      fullHost: 'https://api.trongrid.io',
    });
    
    // Get transaction info from the Tron network
    let transaction;
    try {
      transaction = await tronWeb.trx.getTransaction(txid);
      
      if (!transaction) {
        return new Response(
          JSON.stringify({ success: false, message: 'Transaction not found' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
        );
      }
      
      // Check if transaction is confirmed
      if (transaction.ret[0].contractRet !== 'SUCCESS') {
        return new Response(
          JSON.stringify({ success: false, message: 'Transaction was not successful' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
    } catch (error) {
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to fetch transaction details', error: error.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Get transaction info from the Tron network using the explorer API for USDT details
    const response = await fetch(`https://apilist.tronscan.org/api/transaction-info?hash=${txid}`);
    const txData = await response.json();
    
    if (!txData.contractData || !txData.trc20TransferInfo) {
      return new Response(
        JSON.stringify({ success: false, message: 'Not a valid USDT TRC20 transaction' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Find the USDT transfer in the transaction
    const usdtTransfer = txData.trc20TransferInfo.find((transfer: any) => 
      transfer.symbol === 'USDT' && 
      transfer.to_address === wallet_address
    );
    
    if (!usdtTransfer) {
      return new Response(
        JSON.stringify({ success: false, message: 'No USDT transfer to the specified wallet found in this transaction' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Check amount (USDT has 6 decimals on Tron)
    const amount = parseFloat(usdtTransfer.amount_str) / 1000000;
    
    if (Math.abs(amount - expected_amount) > 0.01) { // Allow for small rounding differences
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `Amount mismatch. Expected ${expected_amount} USDT but got ${amount} USDT` 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Update the deposit record to completed
    const { data: deposit, error: updateError } = await supabaseClient
      .from('deposits')
      .update({ 
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', deposit_id)
      .select()
      .single();
      
    if (updateError) {
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to update deposit', error: updateError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Create a transaction record
    const { data: transaction_record, error: transactionError } = await supabaseClient
      .from('transactions')
      .insert({
        user_id,
        amount: expected_amount,
        type: 'deposit',
        reference_id: deposit_id,
        description: 'USDT deposit'
      })
      .select()
      .single();
      
    if (transactionError) {
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to create transaction record', error: transactionError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Update user balance using RPC function
    const { data: balance_update, error: balanceError } = await supabaseClient.rpc(
      'update_user_balance',
      { user_id, amount: expected_amount }
    );
    
    if (balanceError) {
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to update user balance', error: balanceError.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Transaction verified and deposit processed successfully',
        data: {
          deposit,
          transaction: transaction_record
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
