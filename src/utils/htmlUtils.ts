
/**
 * Removes all HTML tags and decodes HTML entities from a string
 * @param html String that may contain HTML tags or entities
 * @returns Clean text without HTML
 */
export const stripHtmlTags = (html: string | null | undefined): string => {
  if (!html) return '';
  
  // Create a temporary element to handle the HTML
  const tempElement = document.createElement('div');
  tempElement.innerHTML = html;
  
  // Get the text content (strips tags)
  const textContent = tempElement.textContent || tempElement.innerText || '';
  
  // Replace common HTML entities and extra whitespace
  return textContent
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Truncates text to a specific length and adds ellipsis if needed
 * @param text Text to truncate
 * @param maxLength Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};
