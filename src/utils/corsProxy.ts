
// Define the available proxy types as a union type
export type ProxyType = 'allorigins' | 'corsproxy' | 'cors-anywhere';

// Track success rate for each proxy
interface ProxyStats {
  success: number;
  failure: number;
}

const proxyStats: Record<ProxyType, ProxyStats> = {
  allorigins: { success: 0, failure: 0 },
  corsproxy: { success: 0, failure: 0 },
  'cors-anywhere': { success: 0, failure: 0 }
};

// Get the stored proxy type from local storage or use default
export const getStoredProxy = (): ProxyType => {
  const stored = localStorage.getItem('preferred-proxy');
  // Check if stored value is a valid ProxyType
  if (stored === 'allorigins' || stored === 'corsproxy' || stored === 'cors-anywhere') {
    return stored;
  }
  return 'allorigins'; // Default proxy
};

// Set the preferred proxy type in local storage
export const setStoredProxy = (proxy: ProxyType) => {
  localStorage.setItem('preferred-proxy', proxy);
};

// Get the available proxy options for display
export const getProxyOptions = () => [
  { value: 'allorigins', label: 'All Origins' },
  { value: 'corsproxy', label: 'CORS Proxy' },
  { value: 'cors-anywhere', label: 'CORS Anywhere' }
];

// Track proxy success
export const markProxySuccess = (proxyType: ProxyType) => {
  proxyStats[proxyType].success++;
};

// Track proxy failure
export const markProxyFailure = (proxyType: ProxyType) => {
  proxyStats[proxyType].failure++;
};

// Get the most reliable proxy based on success rate
export const getMostReliableProxy = (): ProxyType => {
  const proxies: ProxyType[] = ['allorigins', 'corsproxy', 'cors-anywhere'];
  
  return proxies.reduce((best, current) => {
    const bestRate = proxyStats[best].success / (proxyStats[best].success + proxyStats[best].failure + 1);
    const currentRate = proxyStats[current].success / (proxyStats[current].success + proxyStats[current].failure + 1);
    
    return currentRate > bestRate ? current : best;
  }, 'allorigins' as ProxyType);
};

// Get the proxy URL based on the selected proxy type
export const getProxyUrl = (apiUrl: string, proxyType: ProxyType): string => {
  switch (proxyType) {
    case 'corsproxy':
      return `https://corsproxy.io/?${encodeURIComponent(apiUrl)}`;
    case 'cors-anywhere':
      return `https://cors-anywhere.herokuapp.com/${apiUrl}`;
    case 'allorigins':
    default:
      return `https://api.allorigins.win/raw?url=${encodeURIComponent(apiUrl)}`;
  }
};
