
/**
 * Removes all HTML tags from a string
 * @param html HTML string to strip tags from
 * @returns Plain text without HTML tags
 */
export const stripHtmlTags = (html: string | null | undefined): string => {
  if (!html) return '';
  
  // Replace HTML tags with spaces to maintain readability
  return html
    .replace(/<[^>]*>?/g, ' ')  // Replace tags with space
    .replace(/\s{2,}/g, ' ')    // Collapse multiple spaces
    .trim();                    // Remove leading/trailing spaces
};

/**
 * Truncates text to specified length and adds ellipsis
 * @param text Text to truncate
 * @param length Maximum length before truncating
 * @returns Truncated text with ellipsis if needed
 */
export const truncateText = (text: string | null | undefined, length: number = 150): string => {
  if (!text) return '';
  
  const cleanText = text.trim();
  
  if (cleanText.length <= length) {
    return cleanText;
  }
  
  // Find the last space before the limit to avoid cutting words
  const lastSpace = cleanText.lastIndexOf(' ', length);
  const truncateAt = lastSpace > 0 ? lastSpace : length;
  
  return `${cleanText.substring(0, truncateAt)}...`;
};
