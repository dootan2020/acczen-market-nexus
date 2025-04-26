
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
