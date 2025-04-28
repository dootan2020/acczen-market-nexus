
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Cấu hình API
const API_BASE_URL = "https://taphoammo.net/api";
const SYSTEM_TOKEN = "0LP8RN0I7TNX6ROUD3DUS1I3LUJTQUJ4IFK9";
const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 3000, 5000]; // Backoff: 1s, 3s, 5s

interface SyncResult {
  success: boolean;
  updated: number;
  errors: string[];
  apiCalls: number;
  retries: number;
  responseTime: number;
}

// Hàm gọi API với retry logic
async function callWithRetry<T>(fn: () => Promise<T>, retryConfig: {
  retries?: number;
  initialAttempt?: number;
  retryDelays?: number[];
  circuitBreaker?: {
    isOpen: boolean;
    name: string;
  }
} = {}): Promise<{ 
  result: T; 
  retryCount: number;
  responseTime: number;
}> {
  const {
    retries = MAX_RETRIES,
    initialAttempt = 0,
    retryDelays = RETRY_DELAYS,
    circuitBreaker,
  } = retryConfig;

  // Kiểm tra circuit breaker
  if (circuitBreaker?.isOpen) {
    throw new Error(`Circuit breaker for ${circuitBreaker.name} is open. Service may be unavailable.`);
  }

  try {
    const startTime = performance.now();
    const result = await fn();
    const endTime = performance.now();
    
    return {
      result,
      retryCount: initialAttempt,
      responseTime: endTime - startTime
    };
  } catch (error) {
    if (initialAttempt >= retries) {
      throw error;
    }
    
    console.log(`API call failed, retrying (${initialAttempt + 1}/${retries})...`);
    
    // Exponential backoff
    const delay = retryDelays[initialAttempt] || 5000;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return callWithRetry(fn, {
      retries,
      initialAttempt: initialAttempt + 1, 
      retryDelays,
      circuitBreaker
    });
  }
}

// Hàm kiểm tra và lấy thông tin circuit breaker
async function getCircuitBreakerStatus(supabase: any, apiName: string) {
  const { data, error } = await supabase
    .from('api_circuit_breakers')
    .select('*')
    .eq('api_name', apiName)
    .single();

  if (error) {
    console.error('Error fetching circuit breaker status:', error);
    return { isOpen: false, id: null, failureCount: 0 };
  }

  // Tự động đóng circuit breaker nếu đã qua thời gian reset
  if (data.is_open && data.last_failure_time) {
    const lastFailure = new Date(data.last_failure_time);
    const now = new Date();
    const diffSeconds = (now.getTime() - lastFailure.getTime()) / 1000;
    
    if (diffSeconds > data.reset_timeout) {
      await supabase
        .from('api_circuit_breakers')
        .update({ is_open: false, failure_count: 0 })
        .eq('id', data.id);
      
      console.log(`Circuit breaker for ${apiName} auto-closed after ${diffSeconds.toFixed(0)}s`);
      return { isOpen: false, id: data.id, failureCount: 0 };
    }
  }
  
  return { 
    isOpen: data.is_open, 
    id: data.id, 
    failureCount: data.failure_count,
    threshold: data.threshold
  };
}

// Hàm cập nhật circuit breaker khi có lỗi
async function recordApiFailure(supabase: any, apiName: string, error: Error) {
  const { data: circuitBreaker } = await supabase
    .from('api_circuit_breakers')
    .select('*')
    .eq('api_name', apiName)
    .single();

  if (!circuitBreaker) {
    console.error(`Circuit breaker for ${apiName} not found`);
    return;
  }
  
  const newFailureCount = circuitBreaker.failure_count + 1;
  const shouldOpen = newFailureCount >= circuitBreaker.threshold;
  
  await supabase
    .from('api_circuit_breakers')
    .update({
      failure_count: newFailureCount,
      is_open: shouldOpen,
      last_failure_time: shouldOpen ? new Date().toISOString() : circuitBreaker.last_failure_time
    })
    .eq('api_name', apiName);
    
  console.log(`Updated circuit breaker for ${apiName}: failures=${newFailureCount}, open=${shouldOpen}`);
  
  // Log API error
  await supabase
    .from('api_logs')
    .insert({
      api: apiName,
      endpoint: 'sync-inventory',
      status: shouldOpen ? 'circuit-opened' : 'error',
      details: {
        error: error.message,
        failure_count: newFailureCount,
        circuit_opened: shouldOpen
      }
    });
}

// Hàm gọi API Taphoammo
async function callTaphoammoApi(supabase: any, endpoint: string, params: Record<string, string | number>) {
  // Kiểm tra circuit breaker
  const circuit = await getCircuitBreakerStatus(supabase, 'taphoammo');
  
  try {
    // Xây dựng URL và headers
    const url = `${API_BASE_URL}/${endpoint}?` + new URLSearchParams(
      Object.entries(params).map(([k, v]) => [k, String(v)])
    ).toString();
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 seconds timeout
    
    // Thực hiện gọi API với retry
    const { result, retryCount, responseTime } = await callWithRetry(
      async () => {
        const response = await fetch(url, {
          headers: {
            "User-Agent": "Digital-Deals-Hub/1.0",
            "Accept": "application/json"
          },
          signal: controller.signal
        });
        
        if (!response.ok) {
          throw new Error(`API request failed with status ${response.status}`);
        }
        
        const text = await response.text();
        try {
          return JSON.parse(text);
        } catch (e) {
          throw new Error(`Invalid JSON response: ${text.substring(0, 100)}...`);
        }
      },
      { circuitBreaker: circuit }
    );
    
    clearTimeout(timeoutId);
    
    // Kiểm tra lỗi API
    if (result.success === "false") {
      throw new Error(result.message || result.description || "API returned error");
    }
    
    // Reset circuit breaker nếu thành công
    if (circuit.failureCount > 0) {
      await supabase
        .from('api_circuit_breakers')
        .update({ failure_count: 0 })
        .eq('api_name', 'taphoammo');
    }
    
    return {
      data: result,
      retryCount,
      responseTime
    };
  } catch (error: any) {
    // Ghi nhận lỗi vào circuit breaker
    await recordApiFailure(supabase, 'taphoammo', error);
    throw error;
  }
}

// Hàm kiểm tra tồn kho một sản phẩm
async function syncProductStock(
  supabase: any, 
  product: { id: string; kiosk_token: string; name: string; stock_quantity?: number },
  type: 'scheduled' | 'manual' | 'realtime' | 'jit' = 'scheduled'
) {
  try {
    console.log(`[${type}] Syncing stock for product ${product.name} (${product.kiosk_token})`);
    
    // Gọi API để lấy thông tin tồn kho
    const { data: apiData, retryCount, responseTime } = await callTaphoammoApi(
      supabase,
      'getStock',
      {
        kioskToken: product.kiosk_token,
        userToken: SYSTEM_TOKEN
      }
    );
    
    // Định dạng dữ liệu
    const stockInfo = {
      name: apiData.name || product.name,
      stock_quantity: apiData.stock ? parseInt(apiData.stock) : 0,
      price: apiData.price ? parseFloat(apiData.price) : 0
    };
    
    // Lấy thông tin tồn kho hiện tại
    const { data: existingCache } = await supabase
      .from('inventory_cache')
      .select('*')
      .eq('kiosk_token', product.kiosk_token)
      .single();
    
    const oldQuantity = existingCache?.stock_quantity || product.stock_quantity || 0;
    const oldPrice = existingCache?.price || 0;
    const quantityDiff = stockInfo.stock_quantity - oldQuantity;
    const priceDiff = stockInfo.price - oldPrice;
    
    // Cập nhật cache
    let cacheData;
    const cacheExpiry = new Date();
    cacheExpiry.setMinutes(cacheExpiry.getMinutes() + (type === 'jit' ? 5 : 15)); // Cache 5 phút cho JIT, 15 phút cho others
    
    if (existingCache) {
      // Update cache
      const { data: updatedCache, error: updateError } = await supabase
        .from('inventory_cache')
        .update({
          stock_quantity: stockInfo.stock_quantity,
          price: stockInfo.price,
          last_checked_at: new Date().toISOString(),
          cached_until: cacheExpiry.toISOString(),
          last_sync_status: 'success',
          sync_message: null,
          retry_count: 0
        })
        .eq('id', existingCache.id)
        .select()
        .single();
        
      if (updateError) {
        throw new Error(`Failed to update inventory cache: ${updateError.message}`);
      }
      
      cacheData = updatedCache;
    } else {
      // Insert new cache entry
      const { data: newCache, error: insertError } = await supabase
        .from('inventory_cache')
        .insert({
          product_id: product.id,
          kiosk_token: product.kiosk_token,
          stock_quantity: stockInfo.stock_quantity,
          price: stockInfo.price,
          cached_until: cacheExpiry.toISOString()
        })
        .select()
        .single();
        
      if (insertError) {
        throw new Error(`Failed to create inventory cache: ${insertError.message}`);
      }
      
      cacheData = newCache;
    }
    
    // Cập nhật thông tin trong bảng products
    await supabase
      .from('products')
      .update({
        stock_quantity: stockInfo.stock_quantity,
        price: stockInfo.price,
        updated_at: new Date().toISOString()
      })
      .eq('id', product.id);
      
    // Ghi lại lịch sử đồng bộ nếu có sự thay đổi
    if (quantityDiff !== 0 || priceDiff !== 0) {
      await supabase
        .from('inventory_sync_history')
        .insert({
          product_id: product.id,
          kiosk_token: product.kiosk_token,
          old_quantity: oldQuantity,
          new_quantity: stockInfo.stock_quantity,
          old_price: oldPrice,
          new_price: stockInfo.price,
          sync_type: type
        });
        
      // Kiểm tra nếu có sự thay đổi lớn về tồn kho
      const { data: thresholdSettings } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('notification_type', 'large_inventory_change')
        .eq('is_enabled', true)
        .single();
        
      if (thresholdSettings?.threshold_value && 
          Math.abs(quantityDiff) >= thresholdSettings.threshold_value) {
        // Gửi thông báo cho admin
        await supabase
          .from('api_logs')
          .insert({
            api: 'inventory-sync',
            endpoint: 'large-change-alert',
            status: 'alert',
            details: {
              product_id: product.id,
              product_name: product.name,
              old_quantity: oldQuantity, 
              new_quantity: stockInfo.stock_quantity,
              diff_percentage: oldQuantity > 0 ? (quantityDiff / oldQuantity) * 100 : 100
            }
          });
      }
      
      // Gửi thông báo cho người dùng đăng ký nếu hàng đã về
      if (oldQuantity === 0 && stockInfo.stock_quantity > 0) {
        const { data: notifications } = await supabase
          .from('stock_notifications')
          .select('*')
          .eq('product_id', product.id)
          .eq('is_notified', false);
          
        if (notifications && notifications.length > 0) {
          // Đánh dấu đã thông báo
          await supabase
            .from('stock_notifications')
            .update({ is_notified: true, updated_at: new Date().toISOString() })
            .eq('product_id', product.id)
            .eq('is_notified', false);
            
          // Trong thực tế, ở đây sẽ gọi một function khác để gửi email thông báo
          console.log(`Should notify ${notifications.length} users about product ${product.name} back in stock`);
        }
      }
    }
    
    // Trả về kết quả
    return {
      success: true,
      product_id: product.id,
      kiosk_token: product.kiosk_token,
      name: stockInfo.name,
      old_quantity: oldQuantity,
      new_quantity: stockInfo.stock_quantity,
      quantity_diff: quantityDiff,
      old_price: oldPrice,
      new_price: stockInfo.price,
      price_diff: priceDiff,
      retryCount,
      responseTime
    };
  } catch (error: any) {
    console.error(`Error syncing product ${product.kiosk_token}:`, error);
    
    // Ghi nhận lỗi vào cache
    try {
      const { data: existingCache } = await supabase
        .from('inventory_cache')
        .select('*')
        .eq('kiosk_token', product.kiosk_token)
        .single();
        
      if (existingCache) {
        await supabase
          .from('inventory_cache')
          .update({
            last_checked_at: new Date().toISOString(),
            last_sync_status: 'error',
            sync_message: error.message,
            retry_count: existingCache.retry_count + 1
          })
          .eq('id', existingCache.id);
      } else {
        await supabase
          .from('inventory_cache')
          .insert({
            product_id: product.id,
            kiosk_token: product.kiosk_token,
            last_sync_status: 'error',
            sync_message: error.message,
            retry_count: 1
          });
      }
    } catch (cacheError) {
      console.error('Error updating cache with failure:', cacheError);
    }
    
    // Ghi nhận lỗi
    await supabase
      .from('inventory_sync_history')
      .insert({
        product_id: product.id,
        kiosk_token: product.kiosk_token,
        old_quantity: product.stock_quantity || 0,
        new_quantity: product.stock_quantity || 0,
        sync_type: type,
        status: 'error',
        message: error.message
      });
      
    return {
      success: false,
      product_id: product.id,
      kiosk_token: product.kiosk_token,
      error: error.message
    };
  }
}

// Hàm để xử lý đồng bộ hóa theo lịch trình
async function performScheduledSync(
  supabase: any, 
  syncType: string = 'standard',
  limit: number = 50
) {
  const startTime = performance.now();
  
  // Lấy cấu hình đồng bộ
  const { data: configData } = await supabase
    .from('sync_configuration')
    .select('*')
    .eq('name', syncType === 'standard' ? 'Standard sync' : syncType === 'priority' ? 'High-priority products sync' : 'Low-stock products sync')
    .single();
    
  if (!configData || !configData.is_active) {
    console.log(`Sync configuration for ${syncType} is not active`);
    return {
      success: false,
      message: `Sync configuration for ${syncType} is not active`
    };
  }
  
  // Lấy danh sách sản phẩm cần đồng bộ
  let productsQuery = supabase
    .from('products')
    .select('id, name, kiosk_token, stock_quantity')
    .not('kiosk_token', 'is', null)
    .limit(limit);
    
  // Áp dụng điều kiện lọc tùy theo loại đồng bộ
  if (syncType === 'priority') {
    productsQuery = productsQuery.order('updated_at', { ascending: true });
  } else if (syncType === 'low-stock') {
    productsQuery = productsQuery.lt('stock_quantity', 10).gt('stock_quantity', 0);
  }
  
  const { data: products, error: productsError } = await productsQuery;
  
  if (productsError) {
    console.error('Error fetching products:', productsError);
    return {
      success: false,
      message: `Error fetching products: ${productsError.message}`
    };
  }
  
  if (!products || products.length === 0) {
    return {
      success: true,
      message: 'No products to sync',
      updated: 0,
      errors: [],
      apiCalls: 0,
      retries: 0,
      responseTime: performance.now() - startTime
    };
  }
  
  // Kết quả đồng bộ
  const result: SyncResult = {
    success: true,
    updated: 0,
    errors: [],
    apiCalls: 0,
    retries: 0,
    responseTime: 0
  };
  
  // Đồng bộ từng sản phẩm
  for (const product of products) {
    try {
      result.apiCalls++;
      
      if (!product.kiosk_token) {
        console.log(`Skipping product ${product.id} - no kiosk token`);
        continue;
      }
      
      const syncResult = await syncProductStock(supabase, product, 'scheduled');
      
      if (syncResult.success) {
        result.updated++;
        if (syncResult.retryCount) {
          result.retries += syncResult.retryCount;
        }
      } else {
        result.errors.push(`${product.kiosk_token}: ${syncResult.error}`);
      }
    } catch (error: any) {
      result.errors.push(`${product.kiosk_token}: ${error.message}`);
    }
  }
  
  // Ghi nhận kết quả đồng bộ
  const endTime = performance.now();
  result.responseTime = endTime - startTime;
  
  await supabase
    .from('api_logs')
    .insert({
      api: 'inventory-sync',
      endpoint: `scheduled-sync-${syncType}`,
      status: result.errors.length === 0 ? 'success' : 'partial',
      response_time: result.responseTime,
      details: {
        total: products.length,
        updated: result.updated,
        errors: result.errors.length,
        api_calls: result.apiCalls,
        retries: result.retries
      }
    });
    
  return result;
}

// API handler
serve(async (req) => {
  // Xử lý CORS
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Khởi tạo Supabase client
  const supabaseClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  try {
    // Parse request body
    let requestBody;
    let syncType = 'standard';
    let productId = null;
    let kioskToken = null;
    
    try {
      requestBody = await req.json();
      syncType = requestBody.type || 'standard';
      productId = requestBody.productId || null;
      kioskToken = requestBody.kioskToken || null;
    } catch (e) {
      // Default to scheduled sync if no body
      syncType = 'standard';
    }
    
    // Đồng bộ một sản phẩm cụ thể
    if (productId || kioskToken) {
      let query = supabaseClient.from('products').select('*');
      
      if (productId) {
        query = query.eq('id', productId);
      } else if (kioskToken) {
        query = query.eq('kiosk_token', kioskToken);
      }
      
      const { data: product, error: productError } = await query.single();
      
      if (productError || !product) {
        return new Response(
          JSON.stringify({ success: false, message: 'Product not found' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
        );
      }
      
      const syncResult = await syncProductStock(
        supabaseClient, 
        product,
        requestBody.syncType || 'manual'
      );
      
      return new Response(
        JSON.stringify(syncResult),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Đồng bộ theo lịch trình
    const result = await performScheduledSync(
      supabaseClient, 
      syncType,
      requestBody?.limit || 50
    );
    
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Sync process failed:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});
