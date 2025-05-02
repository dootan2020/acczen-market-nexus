
/**
 * Utility to handle CORS issues by proxying requests through a CORS proxy
 */

// List of allowed domains that don't need proxying
const allowedDomains = [
  'static.cloudflareinsights.com',
  'cdn.gpteng.co',
  'fonts.googleapis.com',
  'fonts.gstatic.com'
];

/**
 * Check if a URL is from an allowed domain
 * @param {string} url - URL to check
 * @returns {boolean} - Whether the URL is from an allowed domain
 */
export const isAllowedDomain = (url) => {
  try {
    const urlObj = new URL(url);
    return allowedDomains.some(domain => urlObj.hostname.includes(domain));
  } catch (e) {
    return false;
  }
};

/**
 * Proxy a URL through a CORS proxy if needed
 * @param {string} url - URL to proxy
 * @returns {string} - Proxied URL or original URL if allowed
 */
export const proxyUrl = (url) => {
  if (isAllowedDomain(url)) {
    return url;
  }
  
  // Use a CORS proxy service
  return `https://corsproxy.io/?${encodeURIComponent(url)}`;
};

/**
 * Fetch data with CORS handling
 * @param {string} url - URL to fetch
 * @param {Object} options - Fetch options
 * @returns {Promise} - Promise with fetch result
 */
export const fetchWithCors = async (url, options = {}) => {
  const proxiedUrl = proxyUrl(url);
  
  try {
    const response = await fetch(proxiedUrl, {
      ...options,
      headers: {
        ...options.headers,
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return response;
  } catch (error) {
    console.error('Fetch error with CORS handling:', error);
    throw error;
  }
};
