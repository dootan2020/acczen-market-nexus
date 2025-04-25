
import { buildProxyUrl, ProxyType } from '@/utils/corsProxy';

const TAPHOAMMO_API_BASE = 'https://taphoammo.net/api/v2';

type ProxyEndpoint = 'getStock' | 'buyProducts' | 'getProducts';

interface ProxyRequest {
  endpoint: ProxyEndpoint;
  params: Record<string, any>;
  proxyType: ProxyType;
}

export const taphoammoProxy = async (request: ProxyRequest) => {
  const { endpoint, params, proxyType } = request;
  const apiUrl = `${TAPHOAMMO_API_BASE}/${endpoint}`;
  const proxyUrl = buildProxyUrl(apiUrl, proxyType);
  
  console.log(`[Taphoammo Proxy] Calling ${endpoint} with params:`, params);
  console.log(`[Taphoammo Proxy] Using proxy: ${proxyType}`);
  
  try {
    const response = await fetch(proxyUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    
    const data = await response.json();
    
    // Handle different proxy response formats
    const result = proxyType === 'allorigins' ? JSON.parse(data.contents) : data;
    
    console.log(`[Taphoammo Proxy] Response from ${endpoint}:`, result);
    
    return result;
  } catch (error) {
    console.error(`[Taphoammo Proxy] Error calling ${endpoint}:`, error);
    throw error;
  }
};
