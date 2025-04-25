
export type ProxyType = 'default' | 'alternate' | 'admin';

export const getStoredProxy = (): ProxyType => {
  // Default to 'default' proxy if no stored value
  return 'default';
};
