
export type ProxyType = 'cloudflare' | 'cors-anywhere' | 'direct';

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
