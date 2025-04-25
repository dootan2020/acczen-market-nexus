
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface TaphoammoProductRequest {
  kioskToken: string;
  userToken: string;
  filters?: {
    category?: string;
    minRating?: number;
    minStock?: number;
    maxPrice?: number;
  }
}

interface TaphoammoProduct {
  id: string;
  kiosk_token: string;
  name: string;
  description?: string;
  stock_quantity: number;
  price: number;
  rating?: number;
  sales_count?: number;
  category?: string;
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

    // Parse request body
    const { kioskToken, userToken, filters } = await req.json() as TaphoammoProductRequest;
    
    if (!kioskToken || !userToken) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: kioskToken and userToken' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    console.log(`Fetching products with kioskToken: ${kioskToken}`);
    console.log(`Filters:`, filters);

    // First call the mock-taphoammo function to get the basic stock info
    const { data: stockData, error: stockError } = await supabaseClient.functions.invoke('mock-taphoammo', {
      body: JSON.stringify({
        kioskToken,
        userToken
      })
    });

    if (stockError || stockData.success === 'false') {
      const errorMessage = stockError?.message || stockData?.message || 'Failed to fetch product stock';
      return new Response(
        JSON.stringify({ error: errorMessage }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    // Fetch existing products from TaphoaMMO mock DB to get additional details
    const { data: taphoammoProducts, error: productsError } = await supabaseClient
      .from('taphoammo_mock_products')
      .select('*')
      .eq('kiosk_token', kioskToken);

    if (productsError) {
      console.error('Error fetching mock products:', productsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch product details' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }

    // Get all categories to match with products
    const { data: categories } = await supabaseClient
      .from('categories')
      .select('*');

    // If we don't have the product in our mock db, create a new entry with just the basic info
    let products: TaphoammoProduct[] = [];
    
    if (!taphoammoProducts || taphoammoProducts.length === 0) {
      // Create a new product entry with basic info from stock data
      products = [{
        id: `taphoammo-${kioskToken}`,
        kiosk_token: kioskToken,
        name: stockData.name || 'Unknown Product',
        stock_quantity: stockData.stock_quantity || 0,
        price: stockData.price || 0,
        rating: Math.random() * 5, // Mock rating between 0-5
        sales_count: Math.floor(Math.random() * 1000), // Mock sales count
        category: categories && categories.length > 0 ? 
          categories[Math.floor(Math.random() * categories.length)].id : undefined
      }];
    } else {
      // Use the existing products data
      products = taphoammoProducts.map(product => ({
        id: product.id,
        kiosk_token: product.kiosk_token,
        name: product.name,
        description: product.description,
        stock_quantity: stockData.stock_quantity || product.stock_quantity,
        price: stockData.price || product.price,
        rating: product.rating,
        sales_count: product.sales_count,
        category: product.category_id
      }));
    }

    // Apply filters if provided
    if (filters) {
      if (filters.category && filters.category !== '') {
        products = products.filter(product => product.category === filters.category);
      }
      
      if (filters.minRating && filters.minRating > 0) {
        products = products.filter(product => (product.rating || 0) >= (filters.minRating || 0));
      }
      
      if (filters.minStock && filters.minStock > 0) {
        products = products.filter(product => product.stock_quantity >= (filters.minStock || 0));
      }
      
      if (filters.maxPrice && filters.maxPrice > 0) {
        products = products.filter(product => product.price <= (filters.maxPrice || Infinity));
      }
    }

    // Check if the userToken has access to this kioskToken
    // This would be a real API check in production
    const hasAccess = true; // Mock check
    
    if (!hasAccess) {
      return new Response(
        JSON.stringify({ error: 'Invalid access token or permissions' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403
        }
      );
    }

    // Log this API call to the monitoring system
    try {
      await supabaseClient
        .from('api_logs')
        .insert({
          api: 'taphoammo',
          endpoint: 'sync-products',
          status: 'success',
          details: {
            kioskToken,
            productsCount: products.length,
            filters
          }
        });
    } catch (logError) {
      console.error('Failed to log API call:', logError);
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        products,
        totalCount: products.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in sync-taphoammo-products:', error);
    
    // Log error to monitoring
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );
    
    try {
      await supabaseClient
        .from('api_logs')
        .insert({
          api: 'taphoammo',
          endpoint: 'sync-products',
          status: 'error',
          details: {
            error: error.message || String(error)
          }
        });
    } catch (logError) {
      console.error('Failed to log API error:', logError);
    }
    
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
