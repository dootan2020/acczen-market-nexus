
import { taphoammoApi } from './api/taphoammoApi';

export const enableAPIDebugMode = () => {
  // Override fetch to monitor API calls
  const originalFetch = window.fetch;
  window.fetch = async function(...args) {
    const url = args[0];
    const options = args[1] || {};
    
    // Fix: Handle different URL object types correctly
    let urlString = '';
    if (typeof url === 'string') {
      urlString = url;
    } else if (url instanceof URL) {
      urlString = url.href;
    } else {
      // url is a Request object
      urlString = (url as Request).url;
    }
    
    console.log(`🌐 Request to: ${urlString}`);
    console.log('📤 Options:', options);
    
    try {
      const response = await originalFetch.apply(this, args);
      const clonedResponse = response.clone();
      
      console.log(`✅ Response status: ${response.status} ${response.statusText}`);
      
      try {
        // Try to read body if it's JSON
        const text = await clonedResponse.text();
        try {
          const json = JSON.parse(text);
          console.log('📥 Response data:', json);
        } catch {
          console.log('📥 Response text:', text.substring(0, 500) + (text.length > 500 ? '...' : ''));
        }
      } catch (e) {
        console.log('⚠️ Cannot read response body');
      }
      
      return response;
    } catch (error) {
      console.error('❌ Request failed:', error);
      throw error;
    }
  };
  
  console.log('🔍 API debug mode activated');
  return 'Debug mode active - check console for API requests';
};

// Test function for TaphoaMMO API
export const testTaphoammoConnection = async (kioskToken: string, userToken: string) => {
  try {
    console.log('🧪 Testing TaphoaMMO API connection...');
    const result = await taphoammoApi.testConnection(kioskToken, userToken);
    console.log('✅ Connection successful!', result);
    return {
      success: true,
      message: result.message || `Connected successfully!`,
      data: result
    };
  } catch (error) {
    console.error('❌ Connection test failed:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      error
    };
  }
};

// Add to window for console access
declare global {
  interface Window {
    debugTools: {
      enableAPIDebugMode: typeof enableAPIDebugMode;
      testTaphoammoConnection: typeof testTaphoammoConnection;
    };
  }
}

// Expose debug functions to window object for console access
window.debugTools = {
  enableAPIDebugMode,
  testTaphoammoConnection
};
