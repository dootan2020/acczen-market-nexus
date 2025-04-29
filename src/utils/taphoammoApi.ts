// Define the response type from the Taphoammo API
export interface TaphoammoApiResponse {
  success: string; // Note: API returns "true" or "false" as strings
  name?: string;
  price?: string;
  stock?: string;
  description?: string;
}

// Define the proxy options
export interface ProxyOption {
  value: string;
  label: string;
}

// Define available proxies
export const corsProxyOptions: ProxyOption[] = [
  { value: "https://api.allorigins.win/raw?url=", label: "AllOrigins (Khuyến nghị)" },
  { value: "https://corsproxy.io/?", label: "corsproxy.io" },
  { value: "https://cors-anywhere.herokuapp.com/", label: "cors-anywhere" },
];

// The default user token for API calls
export const DEFAULT_USER_TOKEN = "0LP8RN0I7TNX6ROUD3DUS1I3LUJTQUJ4IFK9";

// Storage key for recent tokens
export const RECENT_TOKENS_KEY = 'recent_taphoammo_tokens';

/**
 * Fetch product data from Taphoammo API
 * @param kioskToken The kiosk token for the product
 * @param corsProxyUrl The CORS proxy URL to use
 * @returns The product data or null if an error occurred
 */
export async function fetchTaphoammoProduct(
  kioskToken: string,
  corsProxyUrl: string = corsProxyOptions[0].value
): Promise<{ 
  data: { name: string; price: string; stock: string } | null;
  error: string | null;
}> {
  try {
    // Validate inputs
    if (!kioskToken.trim()) {
      return { data: null, error: "Vui lòng nhập token sản phẩm" };
    }
    
    if (!corsProxyUrl) {
      return { data: null, error: "Không có CORS proxy được chọn" };
    }

    // Build the API URL
    const apiUrl = `https://taphoammo.net/api/getStock?kioskToken=${kioskToken}&userToken=${DEFAULT_USER_TOKEN}`;
    const proxyUrl = `${corsProxyUrl}${encodeURIComponent(apiUrl)}`;
    
    // Make the API call
    const response = await fetch(proxyUrl);
    
    // Check for HTTP errors
    if (!response.ok) {
      return { 
        data: null, 
        error: `Lỗi HTTP: ${response.status} - ${response.statusText}` 
      };
    }
    
    // Parse the response
    const data = await response.json() as TaphoammoApiResponse;
    
    // Check for API errors (note: success is a string, not boolean)
    if (data.success === "false") {
      return { 
        data: null, 
        error: data.description || "API trả về lỗi không xác định"
      };
    }
    
    // Return the product data
    return {
      data: {
        name: data.name || "Không có tên",
        price: data.price || "0",
        stock: data.stock || "0"
      },
      error: null
    };
    
  } catch (error) {
    console.error("API call error:", error);
    return { 
      data: null, 
      error: error instanceof Error 
        ? `Lỗi khi gọi API: ${error.message}` 
        : "Lỗi không xác định khi gọi API"
    };
  }
}

/**
 * Test connection to the Taphoammo API
 */
export async function testTaphoammoConnection(
  kioskToken: string,
  corsProxyUrl: string = corsProxyOptions[0].value
): Promise<{
  success: boolean;
  message: string;
}> {
  try {
    // Validate inputs
    if (!kioskToken.trim()) {
      return { success: false, message: "Vui lòng nhập token sản phẩm" };
    }
    
    // Try to fetch the product data
    const result = await fetchTaphoammoProduct(kioskToken, corsProxyUrl);
    
    if (result.error) {
      return { success: false, message: result.error };
    }
    
    if (!result.data) {
      return { 
        success: false, 
        message: "Không thể kết nối đến API Taphoammo"
      };
    }
    
    return { 
      success: true, 
      message: `Kết nối thành công! Sản phẩm: ${result.data.name}` 
    };
    
  } catch (error) {
    console.error("Connection test error:", error);
    return { 
      success: false, 
      message: error instanceof Error 
        ? error.message 
        : "Lỗi không xác định khi kiểm tra kết nối" 
    };
  }
}

/**
 * Manage recently used tokens
 */
export function getRecentTokens(): { token: string; timestamp: number; name: string }[] {
  try {
    const savedTokens = localStorage.getItem(RECENT_TOKENS_KEY);
    return savedTokens ? JSON.parse(savedTokens) : [];
  } catch (e) {
    console.error('Failed to parse recent tokens:', e);
    return [];
  }
}

export function saveRecentToken(token: string, name: string) {
  try {
    const recentTokens = getRecentTokens();
    
    // Check if token already exists
    const existingIndex = recentTokens.findIndex(item => item.token === token);
    
    // Remove if exists
    if (existingIndex > -1) {
      recentTokens.splice(existingIndex, 1);
    }
    
    // Add to beginning of array
    recentTokens.unshift({ 
      token, 
      timestamp: Date.now(),
      name: name || token.substring(0, 8) 
    });
    
    // Keep only the 5 most recent tokens
    const trimmedTokens = recentTokens.slice(0, 5);
    
    // Save to localStorage
    localStorage.setItem(RECENT_TOKENS_KEY, JSON.stringify(trimmedTokens));
    
    return trimmedTokens;
  } catch (e) {
    console.error('Failed to save recent token:', e);
    return getRecentTokens();
  }
}

export function clearRecentTokens() {
  localStorage.removeItem(RECENT_TOKENS_KEY);
}
