
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const SYSTEM_TOKEN = "0LP8RN0I7TNX6ROUD3DUS1I3LUJTQUJ4IFK9"; // Default system token for TaphoaMMO

// TaphoaMMO API helper
async function getStock(kioskToken: string, proxyType: string = "allorigins") {
  // Base URL for TaphoaMMO API
  let apiUrl = `https://taphoammo.net/api/getStock?kioskToken=${kioskToken}`;
  
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
  
  // Call the API
  const response = await fetch(proxyUrl);
  const data = await response.json();
  
  // Check for errors
  if (data.success === "false") {
    throw new Error(data.description || data.message || "API request failed");
  }
  
  // Parse stock quantity
  let stockQuantity = 0;
  let productName = "Unknown Product";
  
  if (data.stock) {
    stockQuantity = parseInt(data.stock);
  } else if (data.message && typeof data.message === 'string') {
    // Format: "Found: Product Name (Stock: 10)"
    const stockMatch = data.message.match(/Stock: (\d+)/);
    if (stockMatch && stockMatch[1]) {
      stockQuantity = parseInt(stockMatch[1]);
    }
    
    const nameMatch = data.message.match(/Found: ([^(]+)/);
    if (nameMatch && nameMatch[1]) {
      productName = nameMatch[1].trim();
    }
  }
  
  return {
    stock_quantity: stockQuantity,
    name: productName
  };
}

// Main handler
serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase client with service role key
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    
    // Get authorization header
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ success: false, message: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Get user
    const supabaseAuth = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    const { data: { user }, error: authError } = await supabaseAuth.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    
    if (authError || !user) {
      return new Response(
        JSON.stringify({ success: false, message: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Get request body
    const { product_id, kiosk_token } = await req.json();
    
    if (!product_id || !kiosk_token) {
      return new Response(
        JSON.stringify({ success: false, message: "Missing required parameters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Get current product data
    const { data: product, error: productError } = await supabase
      .from("products")
      .select("stock_quantity, name")
      .eq("id", product_id)
      .single();
    
    if (productError) {
      return new Response(
        JSON.stringify({ success: false, message: "Product not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Get stock from TaphoaMMO API
    let stockInfo;
    try {
      stockInfo = await getStock(kiosk_token);
    } catch (error) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: error instanceof Error ? error.message : "Failed to get stock" 
        }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Record sync in history
    await supabase
      .from("inventory_sync_history")
      .insert({
        product_id,
        kiosk_token,
        sync_type: "manual",
        status: "success",
        old_quantity: product.stock_quantity,
        new_quantity: stockInfo.stock_quantity,
        message: `Stock synchronized from ${product.stock_quantity} to ${stockInfo.stock_quantity}`
      });
    
    // Update cache
    await supabase
      .from("inventory_cache")
      .upsert({
        kiosk_token,
        product_id,
        stock_quantity: stockInfo.stock_quantity,
        name: stockInfo.name,
        last_checked_at: new Date().toISOString(),
        cached_until: new Date(Date.now() + 15 * 60 * 1000).toISOString(), // 15 minutes
        last_sync_status: "success"
      }, {
        onConflict: "kiosk_token"
      });
    
    // Update product
    await supabase
      .from("products")
      .update({
        stock_quantity: stockInfo.stock_quantity
      })
      .eq("id", product_id);
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "Stock synchronized successfully",
        old_quantity: product.stock_quantity,
        new_quantity: stockInfo.stock_quantity,
        name: stockInfo.name
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error syncing stock:", error);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: error instanceof Error ? error.message : "An unexpected error occurred"
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
