
import React from 'react';
import DOMPurify from 'dompurify';

interface ProductDescriptionProps {
  description: string;
}

const ProductDescription: React.FC<ProductDescriptionProps> = ({ description }) => {
  // Sanitize the HTML content to prevent XSS attacks
  const sanitizedHtml = DOMPurify.sanitize(description);

  // Simple preprocessor for better formatting of lists
  const processDescription = (content: string) => {
    // Make sure lists have proper spacing
    const withFormattedLists = content
      .replace(/<ul>/g, '<ul class="list-disc ml-5 space-y-2 my-4">')
      .replace(/<ol>/g, '<ol class="list-decimal ml-5 space-y-2 my-4">');

    // Add some spacing to paragraphs
    const withFormattedParagraphs = withFormattedLists
      .replace(/<p>/g, '<p class="mb-4">');

    return withFormattedParagraphs;
  };

  const processedHtml = processDescription(sanitizedHtml);

  return (
    <div 
      className="text-gray-600 font-inter product-description prose prose-sm max-w-none"
      dangerouslySetInnerHTML={{ __html: processedHtml }}
    />
  );
};

export default ProductDescription;
