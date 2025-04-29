
export type ProxyType = 'cloudflare' | 'cors-anywhere' | 'direct';

// Store the proxy selection in localStorage
export const setStoredProxy = (proxyType: ProxyType): void => {
  try {
    localStorage.setItem('preferred_proxy', proxyType);
    // Also dispatch a storage event to notify other components
    window.dispatchEvent(new Event('storage'));
  } catch (err) {
    console.error('Error storing proxy preference:', err);
  }
};

// Get the stored proxy from localStorage
export const getStoredProxy = (): ProxyType => {
  try {
    const stored = localStorage.getItem('preferred_proxy');
    if (stored && (stored === 'cloudflare' || stored === 'cors-anywhere' || stored === 'direct')) {
      return stored as ProxyType;
    }
  } catch (err) {
    console.error('Error retrieving proxy preference:', err);
  }
  return 'cloudflare'; // Default
};

// Get available proxy options for UI
export const getProxyOptions = () => [
  { value: 'cloudflare', label: 'Cloudflare Workers' },
  { value: 'cors-anywhere', label: 'CORS Anywhere' },
  { value: 'direct', label: 'Kết nối trực tiếp' }
];

export const getProxiedUrl = (originalUrl: string, proxyType: ProxyType): string => {
  switch (proxyType) {
    case 'cloudflare':
      return `https://corsproxy.io/?${encodeURIComponent(originalUrl)}`;
    case 'cors-anywhere':
      return `https://cors-anywhere.herokuapp.com/${originalUrl}`;
    case 'direct':
    default:
      return originalUrl;
  }
};

export const fetchWithProxy = async (
  url: string, 
  proxyType: ProxyType, 
  options: RequestInit = {}
): Promise<Response> => {
  const proxiedUrl = getProxiedUrl(url, proxyType);
  return fetch(proxiedUrl, options);
};
