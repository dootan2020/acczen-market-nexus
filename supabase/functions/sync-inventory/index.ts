
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders } from "../_shared/cors.ts";

// Set up Supabase client
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const SYSTEM_TOKEN = "0LP8RN0I7TNX6ROUD3DUS1I3LUJTQUJ4IFK9";

// Function to call TaphoaMMO API with a CORS proxy
async function fetchStockData(kioskToken: string, proxyType: string = "allorigins") {
  console.log(`Fetching stock data for kiosk token: ${kioskToken}`);
  
  // Construct the API URL
  let apiUrl = `https://taphoammo.net/api/getStock?kioskToken=${kioskToken}&userToken=${SYSTEM_TOKEN}`;
  
  // Get proxy URL based on the proxy type
  let proxyUrl;
  switch (proxyType) {
    case 'corsproxy':
      proxyUrl = `https://corsproxy.io/?${encodeURIComponent(apiUrl)}`;
      break;
    case 'cors-anywhere':
      proxyUrl = `https://cors-anywhere.herokuapp.com/${apiUrl}`;
      break;
    case 'allorigins':
    default:
      proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(apiUrl)}`;
      break;
  }
  
  console.log(`Using proxy URL: ${proxyUrl}`);
  
  try {
    const response = await fetch(proxyUrl, {
      headers: { 
        "User-Agent": "Digital-Deals-Hub/1.0"
      }
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    // Parse response as text first to check for HTML
    const responseText = await response.text();
    console.log(`Response text: ${responseText.substring(0, 200)}...`); // Log first 200 chars
    
    // Check if the response is HTML (common proxy error)
    if (responseText.trim().startsWith('<')) {
      throw new Error("Received HTML instead of JSON. API might be unavailable.");
    }
    
    // Parse as JSON
    let data;
    try {
      data = JSON.parse(responseText);
      console.log(`Parsed data: ${JSON.stringify(data)}`);
    } catch (parseError) {
      console.error(`JSON parse error: ${parseError}`);
      throw new Error(`Failed to parse JSON response: ${parseError.message}`);
    }
    
    // Check for API errors
    if (data.success === "false") {
      throw new Error(data.message || data.description || "API returned error");
    }
    
    // Extract stock quantity and price using reliable methods
    let stockQuantity = 0;
    let price = 0;
    
    // Try to get stock from various fields
    if (data.stock_quantity !== undefined) {
      stockQuantity = Number(data.stock_quantity);
    } else if (data.stock !== undefined) {
      stockQuantity = Number(data.stock);
    } else if (typeof data.message === 'string' && data.message.includes('Stock:')) {
      const match = data.message.match(/Stock:\s*(\d+)/i);
      if (match && match[1]) {
        stockQuantity = Number(match[1]);
      }
    }
    
    // Get price if available
    if (data.price !== undefined) {
      price = Number(data.price);
    }
    
    console.log(`Extracted stock: ${stockQuantity}, price: ${price}`);
    
    return {
      success: true,
      stock_quantity: stockQuantity,
      price: price || 0,
      name: data.name || null
    };
  } catch (error) {
    console.error(`Error fetching stock for ${kioskToken}:`, error);
    throw error;
  }
}

// Update a single product's stock
async function updateProductStock(
  supabase: any,
  product: { id: string, kiosk_token: string, name: string, stock_quantity?: number }
) {
  console.log(`Updating stock for product ${product.name} (${product.kiosk_token})`);
  
  try {
    // Fetch current stock data from TaphoaMMO
    const stockData = await fetchStockData(product.kiosk_token);
    
    // Store the previous values for comparison
    const oldQuantity = product.stock_quantity || 0;
    const newQuantity = stockData.stock_quantity;
    let oldPrice = 0;
    
    console.log(`Stock comparison - Old: ${oldQuantity}, New: ${newQuantity}`);
    
    // Check if we already have a cache entry for this product
    const { data: existingCache, error: cacheError } = await supabase
      .from('inventory_cache')
      .select('*')
      .eq('kiosk_token', product.kiosk_token)
      .maybeSingle();
      
    if (cacheError) {
      console.error(`Error checking cache: ${cacheError.message}`);
    }
      
    if (existingCache) {
      oldPrice = existingCache.price;
    }
    
    const now = new Date().toISOString();
    const cacheExpiry = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes
    
    // Update the inventory_cache table
    console.log(`Updating inventory cache for ${product.kiosk_token}`);
    if (existingCache) {
      const { error: updateCacheError } = await supabase
        .from('inventory_cache')
        .update({
          stock_quantity: newQuantity,
          price: stockData.price,
          last_checked_at: now,
          cached_until: cacheExpiry,
          last_sync_status: 'success',
          sync_message: null
        })
        .eq('kiosk_token', product.kiosk_token);
        
      if (updateCacheError) {
        console.error(`Error updating cache: ${updateCacheError.message}`);
      } else {
        console.log(`Cache updated successfully`);
      }
    } else {
      const { error: insertCacheError } = await supabase
        .from('inventory_cache')
        .insert({
          product_id: product.id,
          kiosk_token: product.kiosk_token,
          stock_quantity: newQuantity,
          price: stockData.price,
          last_checked_at: now,
          cached_until: cacheExpiry
        });
        
      if (insertCacheError) {
        console.error(`Error creating cache: ${insertCacheError.message}`);
      } else {
        console.log(`Cache created successfully`);
      }
    }
    
    // Update the product table
    console.log(`Updating product table for ${product.id}`);
    const { error: updateProductError } = await supabase
      .from('products')
      .update({
        stock_quantity: newQuantity,
        updated_at: now
      })
      .eq('id', product.id);
      
    if (updateProductError) {
      console.error(`Error updating product: ${updateProductError.message}`);
      throw updateProductError;
    } else {
      console.log(`Product updated successfully`);
    }
    
    // If there's a significant change, add to sync history
    if (newQuantity !== oldQuantity || stockData.price !== oldPrice) {
      console.log(`Recording sync history due to changes`);
      const { error: historyError } = await supabase
        .from('inventory_sync_history')
        .insert({
          product_id: product.id,
          kiosk_token: product.kiosk_token,
          old_quantity: oldQuantity,
          new_quantity: newQuantity,
          old_price: oldPrice,
          new_price: stockData.price,
          sync_type: 'scheduled'
        });
        
      if (historyError) {
        console.error(`Error recording sync history: ${historyError.message}`);
      }
    }
    
    return {
      success: true,
      product_id: product.id,
      kiosk_token: product.kiosk_token,
      old_quantity: oldQuantity,
      new_quantity: newQuantity,
      delta: newQuantity - oldQuantity
    };
  } catch (error) {
    console.error(`Failed to update stock for ${product.kiosk_token}:`, error);
    
    // Update cache with error information
    try {
      const { data: existingCache } = await supabase
        .from('inventory_cache')
        .select('*')
        .eq('kiosk_token', product.kiosk_token)
        .maybeSingle();
        
      if (existingCache) {
        await supabase
          .from('inventory_cache')
          .update({
            last_checked_at: new Date().toISOString(),
            last_sync_status: 'error',
            sync_message: error instanceof Error ? error.message : 'Unknown error',
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
            sync_message: error instanceof Error ? error.message : 'Unknown error',
            retry_count: 1
          });
      }
    } catch (cacheError) {
      console.error('Error updating cache with failure info:', cacheError);
    }
    
    // Add to sync history with error information
    await supabase
      .from('inventory_sync_history')
      .insert({
        product_id: product.id,
        kiosk_token: product.kiosk_token,
        old_quantity: product.stock_quantity || 0,
        new_quantity: product.stock_quantity || 0,
        sync_type: 'scheduled',
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
      
    return {
      success: false,
      product_id: product.id,
      kiosk_token: product.kiosk_token,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Main handler
serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Starting sync-inventory function");
    
    // Parse request body
    let requestBody;
    let productId = null;
    let kioskToken = null;
    let limit = 50;
    
    try {
      requestBody = await req.json();
      productId = requestBody.product_id;
      kioskToken = requestBody.kiosk_token;
      limit = requestBody.limit || 50;
      console.log(`Request body: ${JSON.stringify(requestBody)}`);
    } catch (e) {
      console.log("No request body or invalid JSON");
      // Default to bulk sync if no body
    }
    
    // Create Supabase client
    console.log("Creating Supabase admin client");
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // If we're updating a specific product
    if (productId || kioskToken) {
      console.log(`Syncing specific product: ${productId || kioskToken}`);
      
      let query = supabaseAdmin.from('products').select('id, name, kiosk_token, stock_quantity');
      
      if (productId) {
        query = query.eq('id', productId);
      } else if (kioskToken) {
        query = query.eq('kiosk_token', kioskToken);
      }
      
      const { data: product, error } = await query.maybeSingle();
      
      if (error) {
        console.error(`Error fetching product: ${error.message}`);
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: `Error fetching product: ${error.message}`
          }),
          { 
            status: 500,
            headers: { 
              ...corsHeaders,
              "Content-Type": "application/json" 
            }
          }
        );
      }
      
      if (!product) {
        console.warn(`Product not found: ${productId || kioskToken}`);
        return new Response(
          JSON.stringify({ 
            success: false, 
            message: 'Product not found'
          }),
          { 
            status: 404,
            headers: { 
              ...corsHeaders,
              "Content-Type": "application/json" 
            }
          }
        );
      }
      
      console.log(`Found product: ${product.name} (${product.id})`);
      const result = await updateProductStock(supabaseAdmin, product);
      
      return new Response(
        JSON.stringify(result),
        { 
          headers: { 
            ...corsHeaders,
            "Content-Type": "application/json" 
          }
        }
      );
    }
    
    // Bulk update products
    console.log(`Starting bulk stock sync with limit=${limit}`);
    
    const startTime = Date.now();
    
    const { data: products, error } = await supabaseAdmin
      .from('products')
      .select('id, name, kiosk_token, stock_quantity')
      .not('kiosk_token', 'is', null)
      .order('updated_at', { ascending: true }) // Update oldest first
      .limit(limit);
      
    if (error) {
      console.error(`Error fetching products: ${error.message}`);
      throw error;
    }
    
    if (!products || products.length === 0) {
      console.log("No products found to update");
      return new Response(
        JSON.stringify({
          success: true,
          message: 'No products found to update',
          count: 0
        }),
        { 
          headers: { 
            ...corsHeaders,
            "Content-Type": "application/json" 
          }
        }
      );
    }
    
    console.log(`Found ${products.length} products to update`);
    
    // Process each product sequentially to avoid rate limits
    const results = {
      success: true,
      updated: 0,
      failed: 0,
      details: []
    };
    
    for (const product of products) {
      try {
        if (!product.kiosk_token) {
          console.log(`Skipping product ${product.id} - no kiosk token`);
          continue;
        }
        
        console.log(`Processing product ${product.name} (${product.id})`);
        const result = await updateProductStock(supabaseAdmin, product);
        
        if (result.success) {
          results.updated++;
        } else {
          results.failed++;
        }
        
        results.details.push(result);
      } catch (error) {
        console.error(`Error processing product ${product.id}:`, error);
        results.failed++;
        results.details.push({
          success: false,
          product_id: product.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
      
      // Small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000;
    
    // Log the results
    console.log(`Sync completed in ${duration.toFixed(2)} seconds. Updated: ${results.updated}, Failed: ${results.failed}`);
    
    await supabaseAdmin
      .from('api_logs')
      .insert({
        api: 'sync-inventory',
        endpoint: 'bulk-sync',
        status: results.failed > 0 ? 'partial' : 'success',
        response_time: duration,
        details: {
          updated: results.updated,
          failed: results.failed,
          total: products.length
        }
      });
      
    return new Response(
      JSON.stringify({
        ...results,
        duration: `${duration.toFixed(2)} seconds`
      }),
      { 
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        }
      }
    );
    
  } catch (error) {
    console.error("Sync inventory error:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error occurred'
      }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        }
      }
    );
  }
});
