
export type ProxyType = 'direct' | 'corsproxy.io' | 'admin';

export const getStoredProxy = (): ProxyType => {
  // Default to 'direct' proxy if no stored value
  return 'direct';
};
