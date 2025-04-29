
/**
 * Types of proxy available for CORS handling
 */
export type ProxyType = 'cloudflare' | 'cors-anywhere' | 'direct';

/**
 * Get the stored proxy type from localStorage or default to cloudflare
 */
export const getStoredProxy = (): ProxyType => {
  const storedProxy = localStorage.getItem('preferred_proxy');
  if (storedProxy && ['cloudflare', 'cors-anywhere', 'direct'].includes(storedProxy)) {
    return storedProxy as ProxyType;
  }
  return 'cors-anywhere';
};

/**
 * Store the preferred proxy type in localStorage
 */
export const setStoredProxy = (proxyType: ProxyType): void => {
  localStorage.setItem('preferred_proxy', proxyType);
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
