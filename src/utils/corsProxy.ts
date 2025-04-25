
export type ProxyType = 'direct' | 'corsproxy.io' | 'admin';

export const getStoredProxy = (): ProxyType => {
  // Try to get stored value from localStorage
  const stored = localStorage.getItem('preferred_proxy_type');
  
  // Default to 'admin' proxy if no stored value
  return (stored as ProxyType) || 'admin';
};

export const setStoredProxy = (type: ProxyType): void => {
  localStorage.setItem('preferred_proxy_type', type);
};

export const buildProxyUrl = (url: string, proxyType: ProxyType): string => {
  switch (proxyType) {
    case 'corsproxy.io':
      return `https://corsproxy.io/?${encodeURIComponent(url)}`;
    case 'direct':
      return url;
    case 'admin':
    default:
      // This will be handled by the Edge Function
      return url;
  }
};
