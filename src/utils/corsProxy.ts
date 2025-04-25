
export type ProxyType = 'allorigins' | 'cors-anywhere' | 'thingproxy' | 'cors.sh' | 'corsproxy';

export interface ProxyInfo {
  value: ProxyType;
  label: string;
  description: string;
}

export const PROXY_OPTIONS: ProxyInfo[] = [
  {
    value: 'allorigins',
    label: 'AllOrigins',
    description: 'Default proxy service - most reliable'
  },
  {
    value: 'corsproxy',
    label: 'Corsproxy.io',
    description: 'Fast and reliable proxy service'
  },
  {
    value: 'cors-anywhere',
    label: 'CORS Anywhere',
    description: 'Popular proxy service, may require registration'
  },
  {
    value: 'thingproxy',
    label: 'ThingProxy',
    description: 'Simple and lightweight proxy solution'
  },
  {
    value: 'cors.sh',
    label: 'CORS.sh',
    description: 'Modern proxy service with high reliability'
  }
];

export const buildProxyUrl = (url: string, proxyType: ProxyType): string => {
  switch(proxyType) {
    case 'allorigins':
      return `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
    case 'corsproxy':
      return `https://corsproxy.io/?${encodeURIComponent(url)}`;
    case 'cors-anywhere':
      return `https://cors-anywhere.herokuapp.com/${url}`;
    case 'thingproxy':
      return `https://thingproxy.freeboard.io/fetch/${url}`;
    case 'cors.sh':
      return `https://cors.sh/${url}`;
    default:
      return `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
  }
};

export const getStoredProxy = (): ProxyType => {
  return (localStorage.getItem('preferred_cors_proxy') as ProxyType) || 'allorigins';
};

export const setStoredProxy = (proxy: ProxyType): void => {
  localStorage.setItem('preferred_cors_proxy', proxy);
};

export const getStoredTokens = (): { userToken: string; kioskToken: string; proxyType: ProxyType } => {
  return {
    userToken: localStorage.getItem('taphoammo_user_token') || '',
    kioskToken: localStorage.getItem('taphoammo_kiosk_token') || '',
    proxyType: getStoredProxy() // Added proxyType to the returned object
  };
};

export const setStoredTokens = (userToken: string, kioskToken: string): void => {
  localStorage.setItem('taphoammo_user_token', userToken);
  localStorage.setItem('taphoammo_kiosk_token', kioskToken);
};
