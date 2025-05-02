
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";
import { corsHeaders } from "../_shared/cors.ts";

interface PurchaseItem {
  id: string;
  quantity: number;
}

interface PurchaseRequest {
  items: PurchaseItem[];
}

interface ErrorResponse {
  success: false;
  message: string;
  code: string;
  details?: any;
}

interface SuccessResponse {
  success: true;
  order: {
    id: string;
    total: number;
    created_at: string;
    items: any[];
  };
}

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Create Supabase clients
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const authClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Get the JWT from the request
    const authHeader = req.headers.get("authorization");
    if (!authHeader) {
      return errorResponse("Unauthorized", "UNAUTHORIZED", 401);
    }
    
    // Get the JWT token from the Authorization header
    const jwt = authHeader.replace("Bearer ", "");
    
    // Verify the JWT token and get the user
    const { data: { user }, error: authError } = await authClient.auth.getUser(jwt);
    
    if (authError || !user) {
      console.error("Auth error:", authError);
      return errorResponse("Unauthorized: Invalid token", "INVALID_TOKEN", 401);
    }
    
    // Get the request body
    const requestData: PurchaseRequest = await req.json();
    
    if (!requestData.items || !Array.isArray(requestData.items) || requestData.items.length === 0) {
      return errorResponse("Yêu cầu không hợp lệ: Thiếu thông tin sản phẩm", "INVALID_REQUEST", 400);
    }
    
    // Start a transaction
    const { data: user_data, error: userError } = await supabaseAdmin
      .from("profiles")
      .select("id, balance, discount_percentage")
      .eq("id", user.id)
      .single();
    
    if (userError) {
      console.error("Error fetching user data:", userError);
      return errorResponse("Không thể tải thông tin người dùng", "USER_FETCH_ERROR", 500);
    }
    
    // Get product details for all items
    const productIds = requestData.items.map(item => item.id);
    const { data: products, error: productsError } = await supabaseAdmin
      .from("products")
      .select("id, name, price, selling_price, kiosk_token, stock_quantity")
      .in("id", productIds);
    
    if (productsError || !products) {
      console.error("Error fetching products:", productsError);
      return errorResponse("Không thể tải thông tin sản phẩm", "PRODUCTS_FETCH_ERROR", 500);
    }
    
    // Build the items array with calculated prices
    const orderItems = [];
    let totalAmount = 0;
    
    for (const requestItem of requestData.items) {
      const product = products.find(p => p.id === requestItem.id);
      
      if (!product) {
        return errorResponse(`Sản phẩm không tồn tại: ${requestItem.id}`, "PRODUCT_NOT_FOUND", 400);
      }
      
      if (!product.kiosk_token) {
        return errorResponse(`Sản phẩm không có mã kiosk: ${product.name}`, "INVALID_PRODUCT_CONFIG", 400);
      }
      
      if (product.stock_quantity < requestItem.quantity) {
        return errorResponse(
          `Số lượng tồn kho không đủ: ${product.name} (Yêu cầu: ${requestItem.quantity}, Còn lại: ${product.stock_quantity})`, 
          "INSUFFICIENT_STOCK", 
          400
        );
      }
      
      // Use selling_price if available, otherwise use regular price
      const itemPrice = product.selling_price || product.price;
      const itemTotal = itemPrice * requestItem.quantity;
      totalAmount += itemTotal;
      
      orderItems.push({
        product_id: product.id,
        quantity: requestItem.quantity,
        unit_price: itemPrice,
        total_price: itemTotal,
        kiosk_token: product.kiosk_token
      });
    }
    
    // Apply user discount if available
    const discountPercentage = user_data.discount_percentage || 0;
    const discountAmount = totalAmount * (discountPercentage / 100);
    const finalAmount = totalAmount - discountAmount;
    
    // Check if user has enough balance
    if (user_data.balance < finalAmount) {
      const shortfall = finalAmount - user_data.balance;
      return errorResponse(
        `Số dư tài khoản không đủ. Thiếu ${shortfall} để hoàn tất đơn hàng.`, 
        "INSUFFICIENT_FUNDS", 
        400
      );
    }
    
    // Create order
    const { data: order, error: orderError } = await supabaseAdmin
      .from("orders")
      .insert({
        user_id: user.id,
        total_amount: finalAmount,
        original_amount: totalAmount,
        discount_amount: discountAmount,
        discount_percentage: discountPercentage,
        status: "pending"
      })
      .select()
      .single();
    
    if (orderError || !order) {
      console.error("Error creating order:", orderError);
      return errorResponse("Không thể tạo đơn hàng", "ORDER_CREATION_ERROR", 500);
    }
    
    // Create order items
    const orderItemsWithOrderId = orderItems.map(item => ({
      ...item,
      order_id: order.id
    }));
    
    const { error: orderItemsError } = await supabaseAdmin
      .from("order_items")
      .insert(orderItemsWithOrderId);
    
    if (orderItemsError) {
      console.error("Error creating order items:", orderItemsError);
      
      // Rollback the order if order items couldn't be created
      await supabaseAdmin.from("orders").delete().eq("id", order.id);
      
      return errorResponse("Không thể tạo chi tiết đơn hàng", "ORDER_ITEMS_ERROR", 500);
    }
    
    // Update user balance
    const { error: balanceError } = await supabaseAdmin
      .from("profiles")
      .update({ balance: user_data.balance - finalAmount })
      .eq("id", user.id);
    
    if (balanceError) {
      console.error("Error updating balance:", balanceError);
      
      // Rollback the order if balance update failed
      await supabaseAdmin.from("orders").delete().eq("id", order.id);
      
      return errorResponse("Không thể cập nhật số dư", "BALANCE_UPDATE_ERROR", 500);
    }
    
    // Create transaction record
    const { error: transactionError } = await supabaseAdmin
      .from("transactions")
      .insert({
        user_id: user.id,
        amount: finalAmount,
        type: "purchase",
        description: `Thanh toán cho đơn hàng #${order.id}`,
        reference_id: order.id
      });
    
    if (transactionError) {
      console.error("Error creating transaction:", transactionError);
      // We don't rollback here because the order is already created successfully
      // Instead, we'll just log the error and continue
    }
    
    // Queue order for processing
    // This could be handled by another Edge Function or a webhook
    
    return successResponse(order, orderItemsWithOrderId);
  } catch (error) {
    console.error("Unexpected error:", error);
    return errorResponse(
      "Đã xảy ra lỗi không mong muốn khi xử lý đơn hàng", 
      "UNEXPECTED_ERROR",
      500,
      error
    );
  }
});

function errorResponse(message: string, code: string, status: number = 400, details?: any): Response {
  const body: ErrorResponse = {
    success: false,
    message,
    code,
    details
  };
  
  return new Response(
    JSON.stringify(body),
    { 
      status, 
      headers: { 
        ...corsHeaders,
        "Content-Type": "application/json"
      } 
    }
  );
}

function successResponse(order: any, items: any[]): Response {
  const body: SuccessResponse = {
    success: true,
    order: {
      id: order.id,
      total: order.total_amount,
      created_at: order.created_at,
      items
    }
  };
  
  return new Response(
    JSON.stringify(body),
    {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json"
      }
    }
  );
}
