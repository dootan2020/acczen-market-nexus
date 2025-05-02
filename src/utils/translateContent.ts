
type TranslationRecord = Record<string, string>;

// Simple translation object for product-related content
const translations: Record<string, TranslationRecord> = {
  en: {
    productInfo: "Product Information",
    productDetails: "Product Details",
    category: "Category",
    stock: "Available Stock",
    price: "Price",
    close: "Close",
    uncategorized: "Uncategorized",
    productNotFound: "Product information not found"
  },
  vi: {
    productInfo: "Thông tin sản phẩm",
    productDetails: "Chi tiết sản phẩm",
    category: "Danh mục",
    stock: "Số lượng còn lại",
    price: "Giá",
    close: "Đóng",
    uncategorized: "Chưa phân loại",
    productNotFound: "Không tìm thấy thông tin sản phẩm"
  }
};

// Default language
let currentLanguage: string = 'vi';

/**
 * Translate a content key to the current language
 * @param key The translation key to lookup
 * @param defaultValue Optional default value if translation is missing
 * @returns Translated string or default/key if not found
 */
export const translate = (key: string, defaultValue?: string): string => {
  if (!translations[currentLanguage]) {
    return defaultValue || key;
  }
  
  return translations[currentLanguage][key] || defaultValue || key;
};

/**
 * Set the current language for translations
 * @param language Language code to use (e.g., 'en', 'vi')
 */
export const setLanguage = (language: string): void => {
  if (translations[language]) {
    currentLanguage = language;
  } else {
    console.warn(`Language '${language}' is not supported. Defaulting to '${currentLanguage}'`);
  }
};

/**
 * Get the current language code
 * @returns Current language code
 */
export const getCurrentLanguage = (): string => {
  return currentLanguage;
};

export default {
  translate,
  setLanguage,
  getCurrentLanguage
};
