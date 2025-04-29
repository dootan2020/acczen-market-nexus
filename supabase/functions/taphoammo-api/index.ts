
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'X-Environment': Deno.env.get('ENVIRONMENT') || 'development'
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Parse request body
    const requestData = await req.json();
    console.log('[TaphoaMMO API] Request body:', JSON.stringify(requestData));

    // Handle different action types
    if (requestData.action === 'test_connection') {
      return handleTestConnection(requestData);
    } else if (requestData.action === 'get_product') {
      return handleGetProduct(requestData);
    } else if (requestData.endpoint) {
      // Direct API endpoint call
      return handleDirectEndpoint(requestData);
    } else {
      throw new Error("Missing 'endpoint' parameter");
    }
  } catch (error) {
    console.error('[TaphoaMMO API] Error:', error.message);
    
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || 'Unexpected error occurred',
        error_details: error.stack || null
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  }
});

// Mock data for development
const mockProductData = {
  '9HULV0W2GORMWU7OKMZC': {
    name: 'Gmail Edu USA Random',
    description: 'Gmail Edu USA Random Name bảo hành 30 ngày',
    price: 35000,
    stock_quantity: 150,
    slug: 'gmail-edu-usa-random',
    sku: 'GM-EDUUSA',
  }
};

async function handleTestConnection(data) {
  const { kiosk_token, proxy_type } = data;
  
  try {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Check if we have mock data for this token
    if (mockProductData[kiosk_token]) {
      return new Response(
        JSON.stringify({
          success: true,
          message: `Connection successful - Found: ${mockProductData[kiosk_token].name} (Stock: ${mockProductData[kiosk_token].stock_quantity})`,
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // For testing, use the real API with taphoammo.net
    const productInfo = await fetchFromTaphoaMMO('stock', { kioskToken: kiosk_token }, proxy_type);
    
    return new Response(
      JSON.stringify({
        success: true,
        message: productInfo.message || 'Connection successful',
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Connection test error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || 'Không thể kết nối đến API'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function handleGetProduct(data) {
  const { kiosk_token, proxy_type } = data;
  
  try {
    // Check if we have mock data for this token
    if (mockProductData[kiosk_token]) {
      console.log('[TaphoaMMO API] Using mock data for token:', kiosk_token);
      return new Response(
        JSON.stringify({
          success: true,
          product: mockProductData[kiosk_token],
          source: 'mock'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // For testing, use the real API with taphoammo.net
    const productInfo = await fetchFromTaphoaMMO('stock', { kioskToken: kiosk_token }, proxy_type);
    
    if (!productInfo || !productInfo.message) {
      throw new Error('API response does not contain product information');
    }
    
    // Extract product name from response
    const name = productInfo.message?.split('Found: ')?.[1]?.split(' (Stock:')?.[0] || 'Unknown Product';
    const stockStr = productInfo.message?.split('Stock: ')?.[1]?.split(')')?.[0] || '0';
    const stock = parseInt(stockStr, 10);
    
    if (isNaN(stock)) {
      throw new Error(`Invalid stock quantity in API response: ${productInfo.message}`);
    }
    
    const product = {
      name: name,
      description: `Imported from TaphoaMMO: ${name}`,
      price: 0, // Price will need to be set manually
      stock_quantity: stock,
      slug: name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      sku: `TH-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      kiosk_token: kiosk_token,
    };
    
    return new Response(
      JSON.stringify({
        success: true,
        product: product,
        source: 'api',
        last_updated: new Date().toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Get product error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || 'Không thể lấy thông tin sản phẩm',
        error_details: error.stack || null
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function handleDirectEndpoint(data) {
  const { endpoint, ...params } = data;
  const proxy_type = params.proxy_type || 'cors-anywhere';
  
  try {
    const result = await fetchFromTaphoaMMO(endpoint, params, proxy_type);
    
    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error(`Error calling endpoint ${endpoint}:`, error);
    return new Response(
      JSON.stringify({
        success: false,
        message: error.message || `Lỗi khi gọi API endpoint ${endpoint}`,
        error_details: error.stack || null
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}

async function fetchFromTaphoaMMO(endpoint, params, proxyType = 'cors-anywhere') {
  // Base URL for TaphoaMMO API
  const baseUrl = 'https://taphoammo.net/api';
  
  // Build query string from parameters
  const queryParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (key !== 'proxy_type') { // Skip proxy_type as it's not an API parameter
      queryParams.append(key, String(value));
    }
  }
  
  // Construct the full API URL
  const apiUrl = `${baseUrl}/${endpoint}?${queryParams.toString()}`;
  
  // Use different proxy methods based on proxyType
  let fetchUrl;
  let fetchOptions = {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
  };
  
  switch(proxyType) {
    case 'cloudflare':
      // For development/testing, we'll use a mock
      console.log('Using Cloudflare Workers proxy (mocked)');
      fetchUrl = apiUrl;
      break;
      
    case 'cors-anywhere':
      // CORS Anywhere proxy
      console.log('Using CORS Anywhere proxy');
      fetchUrl = `https://cors-anywhere.herokuapp.com/${apiUrl}`;
      fetchOptions.headers['Origin'] = 'https://acczen.net';
      break;
      
    case 'direct':
    default:
      // Direct connection (will likely fail due to CORS)
      console.log('Using direct connection');
      fetchUrl = apiUrl;
      break;
  }
  
  console.log(`[TaphoaMMO] Fetching from: ${fetchUrl}`);
  
  // FIXED: Removed "|| true" condition to actually make API calls in production
  if (Deno.env.get('ENVIRONMENT') !== 'production') {
    console.log('Using mock data for development environment');
    return {
      success: true, 
      message: "Found: Test Product (Stock: 150)",
      price: 100000,
      stock_quantity: 150
    };
  }
  
  try {
    // Make the actual API call
    const response = await fetch(fetchUrl, fetchOptions);
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}: ${await response.text()}`);
    }
    
    const data = await response.json();
    
    // Validate API response
    if (!data) {
      throw new Error('Empty response from API');
    }
    
    return data;
  } catch (error) {
    console.error('API fetch error:', error);
    throw new Error(`API request failed: ${error.message}`);
  }
}
