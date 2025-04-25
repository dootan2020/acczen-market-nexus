
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
    console.log(`Request received: ${req.method} ${req.url}`);
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Parse request body
    let requestData;
    try {
      requestData = await req.json();
      console.log('Request body:', JSON.stringify(requestData));
    } catch (error) {
      console.error('Error parsing request body:', error);
      return new Response(
        JSON.stringify({ 
          error: 'Invalid JSON in request body',
          details: error.message 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }
    
    const { kioskToken, userToken, filters } = requestData as TaphoammoProductRequest;
    
    // Validate required parameters
    if (!kioskToken) {
      console.error('Missing kioskToken parameter');
      return new Response(
        JSON.stringify({ error: 'Missing required parameter: kioskToken' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }
    
    if (!userToken) {
      console.error('Missing userToken parameter');
      return new Response(
        JSON.stringify({ error: 'Missing required parameter: userToken' }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    console.log(`Fetching products with kioskToken: ${kioskToken}`);
    console.log(`Filters:`, filters);

    // First call the mock-taphoammo function to get the basic stock info
    console.log('Calling mock-taphoammo function...');
    const { data: stockData, error: stockError } = await supabaseClient.functions.invoke('mock-taphoammo', {
      body: JSON.stringify({
        kioskToken,
        userToken
      })
    });

    if (stockError) {
      console.error('Error from mock-taphoammo:', stockError);
      return new Response(
        JSON.stringify({ 
          error: 'Error connecting to TaphoaMMO API',
          details: stockError.message
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }

    if (stockData.success === 'false' || stockData.success === false) {
      console.error('TaphoaMMO API returned error:', stockData.message);
      return new Response(
        JSON.stringify({ 
          error: 'TaphoaMMO API error', 
          details: stockData.message || 'Unknown TaphoaMMO error'
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400
        }
      );
    }

    console.log('Stock data received:', stockData);

    // Fetch existing products from TaphoaMMO mock DB to get additional details
    console.log('Fetching mock products from database...');
    const { data: taphoammoProducts, error: productsError } = await supabaseClient
      .from('taphoammo_mock_products')
      .select('*')
      .eq('kiosk_token', kioskToken);

    if (productsError) {
      console.error('Error fetching mock products:', productsError);
      return new Response(
        JSON.stringify({ 
          error: 'Database error: Failed to fetch product details',
          details: productsError.message 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500
        }
      );
    }

    console.log(`Found ${taphoammoProducts?.length || 0} mock products in database`);

    // Get all categories to match with products
    console.log('Fetching categories...');
    const { data: categories, error: categoriesError } = await supabaseClient
      .from('categories')
      .select('*');
      
    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
      // We can continue without categories, so just log the error
    } else {
      console.log(`Found ${categories?.length || 0} categories`);
    }

    // If we don't have the product in our mock db, create a new entry with just the basic info
    let products: TaphoammoProduct[] = [];
    
    if (!taphoammoProducts || taphoammoProducts.length === 0) {
      console.log('No existing products found, creating new entry with basic info');
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
      console.log('Using existing products data from database');
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

    console.log(`Processing ${products.length} products before filtering`);

    // Apply filters if provided
    if (filters) {
      console.log('Applying filters:', filters);
      if (filters.category && filters.category !== 'all') {
        console.log(`Filtering by category: ${filters.category}`);
        // Apply category filter logic
        products = products.filter(product => product.category === filters.category);
      }
      
      if (typeof filters.minRating === 'number' && filters.minRating > 0) {
        console.log(`Filtering by minimum rating: ${filters.minRating}`);
        products = products.filter(product => (product.rating || 0) >= (filters.minRating || 0));
      }
      
      if (typeof filters.minStock === 'number' && filters.minStock > 0) {
        console.log(`Filtering by minimum stock: ${filters.minStock}`);
        products = products.filter(product => product.stock_quantity >= (filters.minStock || 0));
      }
      
      if (typeof filters.maxPrice === 'number' && filters.maxPrice > 0) {
        console.log(`Filtering by maximum price: ${filters.maxPrice}`);
        products = products.filter(product => product.price <= (filters.maxPrice || Infinity));
      }
      
      console.log(`${products.length} products after applying filters`);
    }

    // Check if the userToken has access to this kioskToken
    // This would be a real API check in production
    const hasAccess = true; // Mock check
    
    if (!hasAccess) {
      console.error('Access denied: Invalid user token or permissions');
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
      console.log('Logging API call to monitoring system');
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

    console.log('Successfully processed request, returning products');
    return new Response(
      JSON.stringify({ 
        success: true,
        products,
        totalCount: products.length
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Unhandled error in sync-taphoammo-products:', error);
    
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
