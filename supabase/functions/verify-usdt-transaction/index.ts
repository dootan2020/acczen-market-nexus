
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import TronWeb from 'https://esm.sh/tronweb@5.3.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerificationRequest {
  txid: string;
  expected_amount: number;
  user_id: string;
  deposit_id: string;
  wallet_address: string;
}

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
    const requestData: VerificationRequest = await req.json();
    const { txid, expected_amount, user_id, deposit_id, wallet_address } = requestData;
    
    if (!txid || !expected_amount || !user_id || !deposit_id || !wallet_address) {
      return new Response(
        JSON.stringify({ success: false, message: 'Missing required parameters' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Starting verification for transaction ${txid}`);

    // Create or update verification record
    const { data: verification, error: verificationError } = await supabaseClient
      .from('payment_verifications')
      .upsert({
        deposit_id,
        transaction_hash: txid,
        status: 'processing',
        verification_attempts: 1,
        last_checked_at: new Date().toISOString(),
      }, {
        onConflict: 'deposit_id,transaction_hash',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (verificationError) {
      console.error('Error creating verification record:', verificationError);
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to create verification record' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Update verification attempt count if it exists
    if (verification) {
      await supabaseClient
        .from('payment_verifications')
        .update({
          verification_attempts: verification.verification_attempts + 1,
          status: 'processing',
          last_checked_at: new Date().toISOString(),
        })
        .eq('id', verification.id);
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
        await updateVerificationStatus(supabaseClient, deposit_id, txid, 'failed', {
          error: 'Transaction not found',
          checked_at: new Date().toISOString()
        });
        
        return new Response(
          JSON.stringify({ success: false, message: 'Transaction not found' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
        );
      }
      
      // Check if transaction is confirmed
      if (transaction.ret?.[0]?.contractRet !== 'SUCCESS') {
        await updateVerificationStatus(supabaseClient, deposit_id, txid, 'failed', {
          error: 'Transaction was not successful',
          transaction_ret: transaction.ret,
          checked_at: new Date().toISOString()
        });
        
        return new Response(
          JSON.stringify({ success: false, message: 'Transaction was not successful' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
      
      console.log('Transaction found and is successful');
    } catch (error) {
      await updateVerificationStatus(supabaseClient, deposit_id, txid, 'failed', {
        error: `Failed to fetch transaction details: ${error.message}`,
        checked_at: new Date().toISOString()
      });
      
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to fetch transaction details', error: error.message }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Get transaction info from the Tron network using the explorer API for USDT details
    let txData;
    try {
      const response = await fetch(`https://apilist.tronscan.org/api/transaction-info?hash=${txid}`);
      txData = await response.json();
      
      if (!txData.contractData || !txData.trc20TransferInfo) {
        await updateVerificationStatus(supabaseClient, deposit_id, txid, 'failed', {
          error: 'Not a valid USDT TRC20 transaction',
          checked_at: new Date().toISOString()
        });
        
        return new Response(
          JSON.stringify({ success: false, message: 'Not a valid USDT TRC20 transaction' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }
      
      console.log('Got TRC20 transaction data');
    } catch (error) {
      await updateVerificationStatus(supabaseClient, deposit_id, txid, 'failed', {
        error: `Failed to fetch TRC20 data: ${error.message}`,
        checked_at: new Date().toISOString()
      });
      
      return new Response(
        JSON.stringify({ success: false, message: 'Failed to fetch transaction details from explorer' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }
    
    // Find the USDT transfer in the transaction
    const usdtTransfer = txData.trc20TransferInfo.find((transfer: any) => 
      transfer.symbol === 'USDT' && 
      transfer.to_address === wallet_address
    );
    
    if (!usdtTransfer) {
      await updateVerificationStatus(supabaseClient, deposit_id, txid, 'failed', {
        error: 'No USDT transfer to the specified wallet found in this transaction',
        wallet_address,
        transfers: txData.trc20TransferInfo,
        checked_at: new Date().toISOString()
      });
      
      return new Response(
        JSON.stringify({ success: false, message: 'No USDT transfer to the specified wallet found in this transaction' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    // Check amount (USDT has 6 decimals on Tron)
    const amount = parseFloat(usdtTransfer.amount_str) / 1000000;
    
    if (Math.abs(amount - expected_amount) > 0.01) { // Allow for small rounding differences
      await updateVerificationStatus(supabaseClient, deposit_id, txid, 'failed', {
        error: `Amount mismatch. Expected ${expected_amount} USDT but got ${amount} USDT`,
        expected: expected_amount,
        received: amount,
        checked_at: new Date().toISOString()
      });
      
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: `Amount mismatch. Expected ${expected_amount} USDT but got ${amount} USDT` 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }
    
    console.log(`Transaction verified successfully. Amount: ${amount} USDT`);
    
    // Update the verification status to completed
    await updateVerificationStatus(supabaseClient, deposit_id, txid, 'completed', {
      verified_amount: amount,
      transaction_timestamp: txData.timestamp,
      block_number: txData.block,
      sender_address: usdtTransfer.from_address,
      checked_at: new Date().toISOString()
    });
    
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
      console.error('Failed to update deposit:', updateError);
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
      console.error('Failed to create transaction record:', transactionError);
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
      console.error('Failed to update user balance:', balanceError);
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
    console.error('Unhandled error in verify-usdt-transaction:', error);
    return new Response(
      JSON.stringify({ success: false, message: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

async function updateVerificationStatus(
  supabase: any,
  deposit_id: string,
  txid: string,
  status: 'pending' | 'processing' | 'completed' | 'failed',
  verification_data: any
) {
  try {
    await supabase
      .from('payment_verifications')
      .update({
        status,
        verification_data,
        last_checked_at: new Date().toISOString()
      })
      .eq('deposit_id', deposit_id)
      .eq('transaction_hash', txid);
    
    console.log(`Updated verification status to ${status}`);
  } catch (error) {
    console.error('Error updating verification status:', error);
  }
}
