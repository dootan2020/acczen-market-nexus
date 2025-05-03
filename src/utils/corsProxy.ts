
// Định nghĩa kiểu proxy
export type ProxyType = 'direct' | 'corsproxy.io' | 'allorigins' | 'admin' | 'corsproxy' | 'cors-anywhere';

// Lưu proxy đã chọn vào localStorage
export const setStoredProxy = (proxy: ProxyType): void => {
  localStorage.setItem('preferred_proxy', proxy);
  // Kích hoạt localStorage event để các component khác cập nhật
  window.dispatchEvent(new Event('storage'));
};

// Lấy proxy đã lưu từ localStorage
export const getStoredProxy = (): ProxyType => {
  const stored = localStorage.getItem('preferred_proxy');
  return (stored as ProxyType) || 'direct';
};

// Lấy danh sách các proxy có sẵn
export const getProxyOptions = (): {value: ProxyType; label: string}[] => {
  return [
    { value: 'direct', label: 'Trực tiếp' },
    { value: 'corsproxy.io', label: 'CORS Proxy' },
    { value: 'allorigins', label: 'All Origins' },
    { value: 'corsproxy', label: 'CORS Proxy (Legacy)' },
    { value: 'cors-anywhere', label: 'CORS Anywhere' },
  ];
};

// Add the missing getProxyUrl function
export const getProxyUrl = (baseUrl: string, proxyType: ProxyType): string => {
  switch (proxyType) {
    case 'corsproxy.io':
      return `https://corsproxy.io/?${encodeURIComponent(baseUrl)}`;
    case 'allorigins':
      return `https://api.allorigins.win/raw?url=${encodeURIComponent(baseUrl)}`;
    case 'corsproxy':
      return `https://corsproxy.org/?${encodeURIComponent(baseUrl)}`;
    case 'cors-anywhere':
      return `https://cors-anywhere.herokuapp.com/${baseUrl}`;
    case 'admin':
    case 'direct':
    default:
      return baseUrl;
  }
};
