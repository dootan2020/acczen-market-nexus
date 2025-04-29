
/**
 * Types of proxy available for CORS handling
 */
export type ProxyType = 'cloudflare' | 'cors-anywhere' | 'direct';

/**
 * Cache key for storing proxy preference
 */
const PROXY_STORAGE_KEY = 'preferred_proxy';

/**
 * Get the stored proxy type from localStorage or default to cors-anywhere
 */
export const getStoredProxy = (): ProxyType => {
  try {
    const storedProxy = localStorage.getItem(PROXY_STORAGE_KEY);
    if (storedProxy && ['cloudflare', 'cors-anywhere', 'direct'].includes(storedProxy)) {
      return storedProxy as ProxyType;
    }
  } catch (err) {
    console.error('Error accessing localStorage:', err);
  }
  return 'cors-anywhere'; // Default value
};

/**
 * Store the preferred proxy type in localStorage
 */
export const setStoredProxy = (proxyType: ProxyType): void => {
  try {
    localStorage.setItem(PROXY_STORAGE_KEY, proxyType);
  } catch (err) {
    console.error('Error storing proxy preference:', err);
  }
};

/**
 * Get proxy URL based on the proxy type
 */
export const getProxyUrl = (targetUrl: string, proxyType: ProxyType = getStoredProxy()): string => {
  switch(proxyType) {
    case 'cloudflare':
      // Replace with your Cloudflare Worker URL
      return `https://cors-proxy.your-worker.workers.dev/?url=${encodeURIComponent(targetUrl)}`;
    case 'cors-anywhere':
      return `https://cors-anywhere.herokuapp.com/${targetUrl}`;
    case 'direct':
    default:
      return targetUrl;
  }
};

/**
 * Get options for proxy selector dropdown
 */
export const getProxyOptions = () => [
  { label: 'CORS-Anywhere', value: 'cors-anywhere' },
  { label: 'Cloudflare Worker', value: 'cloudflare' },
  { label: 'Direct (No Proxy)', value: 'direct' }
];

/**
 * Check if a proxy is likely to work based on past results
 * Returns true if the proxy should work, false if it has known issues
 */
export const isProxyLikelyToWork = (proxyType: ProxyType): boolean => {
  try {
    const lastProxyStatus = JSON.parse(localStorage.getItem('proxy_status') || '{}');
    const proxyStatus = lastProxyStatus[proxyType];
    
    if (!proxyStatus) return true;
    
    // If the proxy failed in the last hour, suggest it might not work
    if (proxyStatus.lastFailure && (Date.now() - proxyStatus.lastFailure) < 60 * 60 * 1000) {
      return false;
    }
    
    return true;
  } catch (err) {
    return true;
  }
};

/**
 * Mark a proxy as failing
 */
export const markProxyFailure = (proxyType: ProxyType): void => {
  try {
    const lastProxyStatus = JSON.parse(localStorage.getItem('proxy_status') || '{}');
    lastProxyStatus[proxyType] = {
      lastFailure: Date.now(),
      failures: (lastProxyStatus[proxyType]?.failures || 0) + 1
    };
    localStorage.setItem('proxy_status', JSON.stringify(lastProxyStatus));
  } catch (err) {
    console.error('Error storing proxy status:', err);
  }
};

/**
 * Mark a proxy as working
 */
export const markProxySuccess = (proxyType: ProxyType): void => {
  try {
    const lastProxyStatus = JSON.parse(localStorage.getItem('proxy_status') || '{}');
    if (lastProxyStatus[proxyType]) {
      lastProxyStatus[proxyType].lastSuccess = Date.now();
      lastProxyStatus[proxyType].successCount = (lastProxyStatus[proxyType]?.successCount || 0) + 1;
      localStorage.setItem('proxy_status', JSON.stringify(lastProxyStatus));
    }
  } catch (err) {
    console.error('Error storing proxy status:', err);
  }
};

/**
 * Get the most reliable proxy based on success/failure history
 */
export const getMostReliableProxy = (): ProxyType => {
  try {
    const lastProxyStatus = JSON.parse(localStorage.getItem('proxy_status') || '{}');
    let bestProxy: ProxyType = 'cors-anywhere';
    let highestScore = -1;
    
    // Calculate a score for each proxy based on success/failure history
    for (const proxy of ['cloudflare', 'cors-anywhere', 'direct'] as ProxyType[]) {
      const status = lastProxyStatus[proxy] || {};
      const failures = status.failures || 0;
      const successes = status.successCount || 0;
      
      // Simple scoring based on successes minus failures
      const score = successes - failures;
      
      if (score > highestScore) {
        highestScore = score;
        bestProxy = proxy;
      }
    }
    
    return bestProxy;
  } catch (err) {
    return 'cors-anywhere';
  }
};
