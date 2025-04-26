
/**
 * Types of available proxies for API calls
 */
export type ProxyType = 'direct' | 'corsproxy.io' | 'allorigins' | 'corsanywhere' | 'admin';

/**
 * Build a proper URL for the selected CORS proxy
 * @param targetUrl The original API URL to proxy
 * @param proxyType The type of proxy to use
 * @returns A properly formatted proxy URL
 */
export function buildProxyUrl(targetUrl: string, proxyType: ProxyType): string {
  switch (proxyType) {
    case 'direct':
      return targetUrl;
    case 'corsproxy.io':
      return `https://corsproxy.io/?${encodeURIComponent(targetUrl)}`;
    case 'allorigins':
      return `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`;
    case 'corsanywhere':
      return `https://cors-anywhere.herokuapp.com/${targetUrl}`;
    default:
      return targetUrl;
  }
}

/**
 * Get a list of available proxies with descriptions
 * @returns Array of proxy options
 */
export function getProxyOptions() {
  return [
    { value: 'admin', label: 'Supabase Edge Function (khuyến nghị)', description: 'Gọi API qua backend server của bạn' },
    { value: 'allorigins', label: 'AllOrigins', description: 'CORS proxy đáng tin cậy' },
    { value: 'corsproxy.io', label: 'corsproxy.io', description: 'Public CORS proxy' },
    { value: 'corsanywhere', label: 'CORS Anywhere', description: 'Có thể yêu cầu tạo token' },
    { value: 'direct', label: 'Trực tiếp', description: 'Không sử dụng proxy, có thể gặp vấn đề CORS' }
  ];
}

/**
 * Retrieve the stored proxy type from localStorage or return default
 * @returns The proxy type to use
 */
export function getStoredProxy(): ProxyType {
  if (typeof window !== 'undefined') {
    const storedProxy = localStorage.getItem('preferred_proxy');
    if (storedProxy && isValidProxyType(storedProxy)) {
      return storedProxy as ProxyType;
    }
  }
  return 'admin'; // Default to admin/edge function
}

/**
 * Set the preferred proxy type in localStorage
 * @param proxyType The proxy type to store
 */
export function setStoredProxy(proxyType: ProxyType): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('preferred_proxy', proxyType);
  }
}

/**
 * Type guard to check if the value is a valid ProxyType
 * @param value The value to check
 * @returns True if value is a valid ProxyType
 */
function isValidProxyType(value: string): boolean {
  return ['direct', 'corsproxy.io', 'allorigins', 'corsanywhere', 'admin'].includes(value);
}
