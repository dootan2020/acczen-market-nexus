
// Define the available proxy types as a union type
export type ProxyType = 'allorigins' | 'corsproxy' | 'cors-anywhere';

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
