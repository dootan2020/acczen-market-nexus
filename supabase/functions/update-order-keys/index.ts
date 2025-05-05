
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { corsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

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
    const { orderId, productKeys } = await req.json();
    
    if (!orderId || !productKeys || !Array.isArray(productKeys)) {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid request parameters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Verify the order belongs to the user
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, user_id")
      .eq("id", orderId)
      .single();
    
    if (orderError || !order) {
      return new Response(
        JSON.stringify({ success: false, message: "Order not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (order.user_id !== user.id) {
      return new Response(
        JSON.stringify({ success: false, message: "You don't have permission to update this order" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Update the order item with product keys
    const { data: orderItems, error: itemsError } = await supabase
      .from("order_items")
      .select("id, data")
      .eq("order_id", orderId);
    
    if (itemsError || !orderItems || orderItems.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: "Order items not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Update each order item with product keys
    for (const item of orderItems) {
      const updatedData = {
        ...item.data,
        product_keys: productKeys
      };
      
      await supabase
        .from("order_items")
        .update({ data: updatedData })
        .eq("id", item.id);
    }
    
    return new Response(
      JSON.stringify({ success: true, message: "Product keys updated successfully" }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error updating order keys:", error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: error instanceof Error ? error.message : "An unexpected error occurred" 
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
