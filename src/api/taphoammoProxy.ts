
import { buildProxyUrl, ProxyType } from '@/utils/corsProxy';

const TAPHOAMMO_API_BASE = 'https://taphoammo.net/api/v2';

type ProxyEndpoint = 'getStock' | 'buyProducts' | 'getProducts';

interface ProxyRequest {
  endpoint: ProxyEndpoint;
  params: Record<string, any>;
  proxyType: ProxyType;
}

interface TaphoammoResponse {
  success: string;
  price?: string;
  name?: string;
  stock?: string;
  order_id?: string;
  message?: string;
  [key: string]: any;
}

const parseProxyResponse = (data: any, proxyType: ProxyType): TaphoammoResponse => {
  if (proxyType === 'allorigins') {
    try {
      return JSON.parse(data.contents);
    } catch (e) {
      throw new Error(`Failed to parse AllOrigins response: ${e.message}`);
    }
  } else if (proxyType === 'corsproxy') {
    // corsproxy.io returns the raw response
    return typeof data === 'string' ? JSON.parse(data) : data;
  }
  
  // Default handling for other proxies
  return typeof data === 'string' ? JSON.parse(data) : data;
};

export const taphoammoProxy = async (request: ProxyRequest): Promise<TaphoammoResponse> => {
  const { endpoint, params, proxyType } = request;
  const apiUrl = `${TAPHOAMMO_API_BASE}/${endpoint}`;
  const proxyUrl = buildProxyUrl(apiUrl, proxyType);
  
  console.log(`[Taphoammo Proxy] Calling ${endpoint} with:`, {
    params,
    proxyType,
    proxyUrl
  });
  
  try {
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const rawData = await response.json();
    const result = parseProxyResponse(rawData, proxyType);
    
    console.log(`[Taphoammo Proxy] Raw response from ${endpoint}:`, result);
    
    // Validate response format
    if (!result || typeof result.success !== 'string') {
      throw new Error('Invalid response format');
    }
    
    return result;
  } catch (error) {
    console.error(`[Taphoammo Proxy] Error calling ${endpoint}:`, error);
    throw error;
  }
};
