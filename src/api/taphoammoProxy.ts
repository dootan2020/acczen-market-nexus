
const TAPHOAMMO_API_BASE = 'https://taphoammo.net/api/v2';

type ProxyEndpoint = 'getStock' | 'buyProducts' | 'getProducts';

interface ProxyRequest {
  endpoint: ProxyEndpoint;
  params: Record<string, any>;
}

export const taphoammoProxy = async (request: ProxyRequest) => {
  const { endpoint, params } = request;
  
  console.log(`[Taphoammo Proxy] Calling ${endpoint} with params:`, params);
  
  try {
    const response = await fetch(`${TAPHOAMMO_API_BASE}/${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });
    
    const data = await response.json();
    console.log(`[Taphoammo Proxy] Response from ${endpoint}:`, data);
    
    return data;
  } catch (error) {
    console.error(`[Taphoammo Proxy] Error calling ${endpoint}:`, error);
    throw error;
  }
};
