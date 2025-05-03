
// Định nghĩa kiểu proxy
export type ProxyType = 'direct' | 'corsproxy.io' | 'allorigins' | 'admin';

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
  ];
};
