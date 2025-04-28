
// Types of CORS proxies we can use
export type ProxyType = 'direct' | 'allorigins' | 'corsproxy.io' | 'corsanywhere' | 'codetabs' | 'admin';

// Store the current proxy type in localStorage
export const getStoredProxy = (): ProxyType => {
  const storedProxy = localStorage.getItem('taphoammo_proxy');
  return (storedProxy as ProxyType) || 'corsproxy.io'; // Default to corsproxy.io instead of allorigins
};

export const setStoredProxy = (proxy: ProxyType): void => {
  localStorage.setItem('taphoammo_proxy', proxy);
};

// Get available proxy options with descriptions
export const getProxyOptions = () => [
  {
    value: 'admin',
    label: 'Edge Function',
    description: 'Sử dụng hàm phía máy chủ (an toàn nhất)'
  },
  {
    value: 'corsproxy.io',
    label: 'CORSProxy.io',
    description: 'corsproxy.io - Proxy miễn phí, đáng tin cậy'
  },
  {
    value: 'codetabs',
    label: 'CodeTabs',
    description: 'api.codetabs.com - Proxy thay thế'
  },
  {
    value: 'corsanywhere',
    label: 'CORS-Anywhere',
    description: 'cors-anywhere.herokuapp.com - Yêu cầu đăng ký'
  },
  {
    value: 'allorigins',
    label: 'AllOrigins',
    description: 'api.allorigins.win - Có thể không ổn định'
  },
  {
    value: 'direct',
    label: 'Direct',
    description: 'Kết nối trực tiếp (có thể gặp lỗi CORS)'
  }
];

// Build URL with the appropriate proxy
export const buildProxyUrl = (url: string, proxyType: ProxyType): string => {
  switch (proxyType) {
    case 'allorigins':
      return `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
      
    case 'corsproxy.io':
      return `https://corsproxy.io/?${encodeURIComponent(url)}`;
      
    case 'corsanywhere':
      return `https://cors-anywhere.herokuapp.com/${url}`;
      
    case 'codetabs':
      return `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`;
      
    case 'admin':
      // This means use server-side Edge Function - handled separately
      return url;
      
    case 'direct':
    default:
      return url;
  }
};

