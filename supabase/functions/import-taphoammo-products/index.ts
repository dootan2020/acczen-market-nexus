
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface ImportProductRequest {
  products: Array<{
    id: string;
    kiosk_token: string;
    name: string;
    description?: string;
    stock_quantity: number;
    price: number;
    markup_percentage: number;
    category?: string;
    subcategory?: string; // Added subcategory support
    rating?: number;
    sales_count?: number;
    image_url?: string; // Support for image URL
  }>;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    // Get user from the request
    const authHeader = req.headers.get('Authorization')?.replace('Bearer ', '');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Not authenticated' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401
        }
      );
    }
    
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser(authHeader);
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Authentication failed' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401
        }
      );
    }
    
    // Check if the user is an admin
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();
      
    if (profileError || profile?.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Unauthorized, admin access required' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403
        }
      );
    }
    
    // Parse request to get products to import
    const { products } = await req.json() as ImportProductRequest;
    
    if (!products || !Array.isArray(products) || products.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No products provided for import' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }
    
    console.log(`Importing ${products.length} products`);
    
    // Process each product
    const importedProducts = [];
    const errors = [];
    
    for (const product of products) {
      try {
        // Apply markup to price
        const adjustedPrice = product.price * (1 + (product.markup_percentage / 100));
        
        // Check if this product (by kiosk_token) already exists
        const { data: existingProduct } = await supabaseClient
          .from('products')
          .select('id')
          .eq('kiosk_token', product.kiosk_token)
          .maybeSingle();
        
        if (existingProduct) {
          // Update existing product
          const { error: updateError } = await supabaseClient
            .from('products')
            .update({
              name: product.name,
              description: product.description || '',
              price: adjustedPrice,
              stock_quantity: product.stock_quantity,
              category_id: product.category,
              subcategory_id: product.subcategory, // Added subcategory_id
              image_url: product.image_url, // Added image_url support
              updated_at: new Date().toISOString()
            })
            .eq('id', existingProduct.id);
            
          if (updateError) {
            throw new Error(`Failed to update product: ${updateError.message}`);
          }
          
          importedProducts.push({
            id: existingProduct.id,
            name: product.name,
            action: 'updated'
          });
        } else {
          // Insert new product
          const { data: newProduct, error: insertError } = await supabaseClient
            .from('products')
            .insert({
              name: product.name,
              description: product.description || '',
              price: adjustedPrice,
              stock_quantity: product.stock_quantity,
              category_id: product.category,
              subcategory_id: product.subcategory, // Added subcategory_id
              image_url: product.image_url, // Added image_url support
              status: 'active',
              kiosk_token: product.kiosk_token
            })
            .select('id')
            .single();
            
          if (insertError) {
            throw new Error(`Failed to insert product: ${insertError.message}`);
          }
          
          importedProducts.push({
            id: newProduct.id,
            name: product.name,
            action: 'created'
          });
        }
      } catch (error) {
        console.error(`Error processing product ${product.name}:`, error);
        errors.push({
          kiosk_token: product.kiosk_token,
          name: product.name,
          error: error.message || String(error)
        });
      }
    }
    
    // Log the import activity
    try {
      await supabaseClient
        .from('admin_logs')
        .insert({
          user_id: user.id,
          action: 'import_products',
          details: {
            total: products.length,
            imported: importedProducts.length,
            errors: errors.length,
            products: importedProducts.map(p => p.id)
          }
        });
    } catch (logError) {
      console.error('Failed to log admin activity:', logError);
    }
    
    return new Response(
      JSON.stringify({
        success: true,
        imported: importedProducts.length,
        errors: errors.length,
        details: {
          imported: importedProducts,
          errors
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in import-taphoammo-products:', error);
    
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error.message || String(error)
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
