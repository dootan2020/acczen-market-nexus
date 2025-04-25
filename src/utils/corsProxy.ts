
export type ProxyType = 'direct' | 'corsproxy.io' | 'allorigins' | 'corsanywhere' | 'admin';

export const getStoredProxy = (): ProxyType => {
  // Try to get stored value from localStorage
  const stored = localStorage.getItem('preferred_proxy_type');
  
  // Default to 'allorigins' proxy if no stored value (since you mentioned it works well)
  return (stored as ProxyType) || 'allorigins';
};

export const setStoredProxy = (type: ProxyType): void => {
  localStorage.setItem('preferred_proxy_type', type);
};

export const buildProxyUrl = (url: string, proxyType: ProxyType): string => {
  switch (proxyType) {
    case 'corsproxy.io':
      return `https://corsproxy.io/?${encodeURIComponent(url)}`;
    case 'allorigins':
      return `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
    case 'corsanywhere':
      return `https://cors-anywhere.herokuapp.com/${url}`;
    case 'direct':
      return url;
    case 'admin':
    default:
      // This will be handled by the Edge Function
      return url;
  }
};
