
// Types of CORS proxies we can use
export type ProxyType = 'direct' | 'allorigins' | 'corsproxy.io' | 'corsanywhere' | 'admin';

// Store the current proxy type in localStorage
export const getStoredProxy = (): ProxyType => {
  const storedProxy = localStorage.getItem('taphoammo_proxy');
  return (storedProxy as ProxyType) || 'allorigins';
};

export const setStoredProxy = (proxy: ProxyType): void => {
  localStorage.setItem('taphoammo_proxy', proxy);
};

// Build URL with the appropriate proxy
export const buildProxyUrl = (url: string, proxyType: ProxyType): string => {
  switch (proxyType) {
    case 'allorigins':
      return `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
      
    case 'corsproxy.io':
      return `https://corsproxy.io/?${encodeURIComponent(url)}`;
      
    case 'corsanywhere':
      return `https://cors-anywhere.herokuapp.com/${url}`;
      
    case 'admin':
      // This means use server-side Edge Function - handled separately
      return url;
      
    case 'direct':
    default:
      return url;
  }
};
