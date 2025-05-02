
type TranslationRecord = Record<string, string>;

// Simple translation object for product-related content
const translations: Record<string, TranslationRecord> = {
  en: {
    productInfo: "Product Information",
    usageGuide: "Usage Guide",
    warranty: "Warranty & Support",
    productDetails: "Product Details",
    category: "Category",
    stock: "Available Stock",
    price: "Price",
    close: "Close",
    uncategorized: "Uncategorized",
    usageGuideText: "This product is ready to use immediately after purchase. Please follow the instructions sent via email to activate the product. If you encounter any issues, contact our support team.",
    usageGuideNote: "Note: Detailed instructions will be sent via email after purchase.",
    warrantyText: "All our digital products come with a 48-hour warranty for technical issues. We provide technical support for 30 days after purchase. Contact us via support email for assistance.",
    warrantyGuarantee: "100% money-back guarantee if the product doesn't work within the first 48 hours.",
    productNotFound: "Product information not found"
  },
  vi: {
    productInfo: "Thông tin sản phẩm",
    usageGuide: "Hướng dẫn sử dụng",
    warranty: "Chính sách bảo hành",
    productDetails: "Chi tiết sản phẩm",
    category: "Danh mục",
    stock: "Số lượng còn lại",
    price: "Giá",
    close: "Đóng",
    uncategorized: "Chưa phân loại",
    usageGuideText: "Sản phẩm này sẵn sàng để sử dụng ngay sau khi mua. Vui lòng làm theo các hướng dẫn được gửi qua email để kích hoạt sản phẩm. Nếu bạn gặp bất kỳ vấn đề nào, hãy liên hệ với bộ phận hỗ trợ của chúng tôi.",
    usageGuideNote: "Lưu ý: Hướng dẫn chi tiết sẽ được gửi qua email sau khi mua hàng.",
    warrantyText: "Tất cả sản phẩm số của chúng tôi đều có bảo hành 48 giờ cho các vấn đề kỹ thuật. Chúng tôi cung cấp hỗ trợ kỹ thuật trong 30 ngày sau khi mua hàng. Liên hệ với chúng tôi qua email hỗ trợ để được trợ giúp.",
    warrantyGuarantee: "Cam kết hoàn tiền 100% nếu sản phẩm không hoạt động trong 48 giờ đầu tiên.",
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
