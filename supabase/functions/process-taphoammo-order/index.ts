
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// API timeout setting (in milliseconds)
const API_TIMEOUT = 30000; // 30 seconds

// Maximum number of retries
const MAX_RETRIES = 2;

// Helper function for retry with exponential backoff
async function fetchWithRetry(fn, retries = MAX_RETRIES) {
  let lastError;
  
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Set up timeout for API calls
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('API request timed out')), API_TIMEOUT);
      });
      
      // Race between the actual API call and timeout
      const startTime = performance.now();
      const result = await Promise.race([
        fn(),
        timeoutPromise
      ]);
      const responseTime = performance.now() - startTime;
      
      // Return successful result along with metrics
      return { 
        result,
        success: true,
        retries: attempt,
        responseTime
      };
    } catch (error) {
      console.error(`Attempt ${attempt + 1}/${retries + 1} failed:`, error);
      lastError = error;
      
      // If we've used all retries, throw the error
      if (attempt === retries) {
        throw error;
      }
      
      // Exponential backoff delay: 1s, 2s, 4s, etc.
      const delay = Math.pow(2, attempt) * 1000;
      console.log(`Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = performance.now();
  let orderId = null;
  let apiLog = {
    api: 'taphoammo',
    endpoint: 'process-order',
    status: 'started',
    details: {}
  };

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse request body
    const requestBody = await req.json();
    const action = requestBody.action || 'buy_product';

    // Handle different actions
    if (action === 'check_order') {
      return await handleCheckOrder(requestBody, supabaseClient, corsHeaders);
    }
    
    // Default action is buy_product
    const { kioskToken, userToken, quantity, promotion } = requestBody;

    // Update API log with request details
    apiLog.details = {
      kioskToken,
      userToken: userToken.substring(0, 8) + '...', // Only log partial token for security
      quantity,
      hasPromotion: !!promotion
    };

    if (!kioskToken || !userToken || !quantity) {
      apiLog.status = 'invalid-request';
      await logApiCall(supabaseClient, apiLog);
      
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Missing required parameters'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Get auth user from userToken
    const { data: { user }, error: userError } = await supabaseClient.auth.admin.getUserById(
      userToken
    );

    if (userError || !user) {
      apiLog.status = 'auth-error';
      apiLog.details.error = userError?.message;
      await logApiCall(supabaseClient, apiLog);
      
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Invalid user token'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 401 }
      );
    }

    // Get product from kiosk token
    const { data: product, error: productError } = await supabaseClient
      .from('taphoammo_mock_products')
      .select('*')
      .eq('kiosk_token', kioskToken)
      .single();

    if (productError || !product) {
      apiLog.status = 'product-not-found';
      apiLog.details.error = productError?.message;
      await logApiCall(supabaseClient, apiLog);
      
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Product not found'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Calculate total cost
    const totalCost = product.price * quantity;
    apiLog.details.amount = totalCost;

    // Get user balance
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('balance')
      .eq('id', userToken)
      .single();

    if (profileError || !profile) {
      apiLog.status = 'profile-not-found';
      apiLog.details.error = profileError?.message;
      await logApiCall(supabaseClient, apiLog);
      
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Could not retrieve user balance'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Check if user has sufficient balance
    if (profile.balance < totalCost) {
      apiLog.status = 'insufficient-balance';
      apiLog.details.userBalance = profile.balance;
      apiLog.details.requiredAmount = totalCost;
      await logApiCall(supabaseClient, apiLog);
      
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Insufficient balance'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    // Call taphoammo API to buy products with retry logic
    let apiResponse;
    try {
      const { result: mockResponse, success, retries, responseTime } = await fetchWithRetry(async () => {
        const { data, error } = await supabaseClient.functions.invoke('mock-taphoammo', {
          body: JSON.stringify({
            kioskToken,
            userToken,
            quantity,
            promotion
          })
        });
        
        if (error) throw error;
        if (data.success === 'false') throw new Error(data.message || 'Order processing failed');
        return data;
      });
      
      apiResponse = mockResponse;
      apiLog.details.responseTime = responseTime;
      apiLog.details.retries = retries;
      orderId = apiResponse.order_id;
      
    } catch (error) {
      apiLog.status = 'api-error';
      apiLog.details.error = error.message;
      await logApiCall(supabaseClient, apiLog);
      
      return new Response(
        JSON.stringify({
          success: false,
          message: `Error calling taphoammo API: ${error.message}`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    // Start database transaction for updating user balance and creating records
    try {
      // Create order in local database first
      const { data: order, error: orderError } = await supabaseClient
        .from('orders')
        .insert({
          user_id: userToken,
          status: apiResponse.status || 'completed',
          total_amount: totalCost
        })
        .select('id')
        .single();

      if (orderError) {
        throw new Error(`Failed to create order record: ${orderError.message}`);
      }

      // Create order items
      const { error: itemError } = await supabaseClient
        .from('order_items')
        .insert({
          order_id: order.id,
          product_id: product.id,
          quantity,
          price: product.price,
          total: totalCost,
          data: {
            kiosk_token: kioskToken,
            taphoammo_order_id: apiResponse.order_id,
            product_keys: apiResponse.product_keys || []
          }
        });

      if (itemError) {
        throw new Error(`Failed to create order items: ${itemError.message}`);
      }

      // Only deduct from user balance after ensuring order is recorded
      const { error: updateError } = await supabaseClient.rpc('update_user_balance', {
        user_id: userToken,
        amount: -totalCost
      });

      if (updateError) {
        throw new Error(`Failed to update user balance: ${updateError.message}`);
      }

      // Create transaction record
      const { error: transactionError } = await supabaseClient
        .from('transactions')
        .insert({
          user_id: userToken,
          type: 'purchase',
          amount: totalCost,
          description: `Purchase of ${product.name} x ${quantity}`,
          reference_id: apiResponse.order_id
        });

      if (transactionError) {
        console.error('Failed to create transaction record:', transactionError);
      }
      
      // Log successful API call
      apiLog.status = 'success';
      apiLog.details.orderId = apiResponse.order_id;
      apiLog.details.productKeysCount = apiResponse.product_keys?.length || 0;
      await logApiCall(supabaseClient, apiLog);

      return new Response(
        JSON.stringify({
          success: true,
          order_id: apiResponse.order_id,
          message: apiResponse.message || 'Order processed successfully',
          product_keys: apiResponse.product_keys || [],
          status: apiResponse.status || 'completed'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
      
    } catch (error) {
      console.error('Error processing order:', error);
      
      // Log transaction failure
      apiLog.status = 'transaction-error';
      apiLog.details.error = error.message;
      apiLog.details.orderId = orderId;
      await logApiCall(supabaseClient, apiLog);
      
      return new Response(
        JSON.stringify({
          success: false,
          message: error.message || 'Internal server error'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

  } catch (error) {
    console.error('Unhandled error processing order:', error);
    
    // Try to log the error if possible
    try {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );
      
      apiLog.status = 'critical-error';
      apiLog.details.error = error.message;
      await logApiCall(supabaseClient, apiLog);
    } catch (e) {
      console.error('Failed to log critical error:', e);
    }
    
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || 'Internal server error'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});

// Handle check order status
async function handleCheckOrder(requestBody, supabaseClient, corsHeaders) {
  const { orderId } = requestBody;
  
  if (!orderId) {
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Missing order ID'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
  
  try {
    // First check if the order exists in our mock orders
    const { data: mockOrder, error: mockOrderError } = await supabaseClient
      .from('taphoammo_mock_orders')
      .select('*')
      .eq('order_id', orderId)
      .single();
      
    if (mockOrderError) {
      return new Response(
        JSON.stringify({
          success: false,
          message: `Order not found: ${mockOrderError.message}`
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }
    
    // If order is already completed, just return the current status
    if (mockOrder.status === 'completed') {
      return new Response(
        JSON.stringify({
          success: true,
          status: 'completed',
          message: 'Order is already completed',
          product_keys: mockOrder.product_keys || []
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // If order is still processing, make a call to the mock API to check status
    const { data, error } = await supabaseClient.functions.invoke('mock-taphoammo', {
      body: JSON.stringify({
        action: 'check_order',
        orderId
      })
    });
    
    if (error) {
      throw new Error(`Error checking order status: ${error.message}`);
    }
    
    // If the API returns that the order is now completed
    if (data.status === 'completed') {
      // Update the mock order in our database
      const { error: updateError } = await supabaseClient
        .from('taphoammo_mock_orders')
        .update({
          status: 'completed',
          product_keys: data.product_keys || []
        })
        .eq('order_id', orderId);
        
      if (updateError) {
        console.error('Error updating mock order:', updateError);
      }
      
      // Update the actual order items
      const { data: orderItems, error: orderItemsError } = await supabaseClient
        .from('order_items')
        .select('id, data, order_id')
        .eq('data->taphoammo_order_id', orderId);
        
      if (!orderItemsError && orderItems.length > 0) {
        const orderItem = orderItems[0];
        const updatedData = {
          ...orderItem.data,
          product_keys: data.product_keys || []
        };
        
        // Update order item with product keys
        const { error: updateItemError } = await supabaseClient
          .from('order_items')
          .update({ data: updatedData })
          .eq('id', orderItem.id);
          
        if (updateItemError) {
          console.error('Error updating order item:', updateItemError);
        }
        
        // Update order status
        const { error: updateOrderError } = await supabaseClient
          .from('orders')
          .update({ status: 'completed' })
          .eq('id', orderItem.order_id);
          
        if (updateOrderError) {
          console.error('Error updating order status:', updateOrderError);
        }
      }
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        status: data.status || 'processing',
        message: data.message || 'Order status checked successfully',
        product_keys: data.product_keys || []
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
    
  } catch (error) {
    console.error('Error checking order status:', error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || 'Error checking order status'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
}

// Helper function to log API calls
async function logApiCall(supabaseClient, logData) {
  try {
    const { error } = await supabaseClient
      .from('api_logs')
      .insert({
        ...logData,
        response_time: performance.now() - (logData.startTime || performance.now())
      });
      
    if (error) {
      console.error('Failed to log API call:', error);
    }
  } catch (e) {
    console.error('Error logging API call:', e);
  }
}
