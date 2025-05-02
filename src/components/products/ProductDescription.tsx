
import React from 'react';
import DOMPurify from 'dompurify';

interface ProductDescriptionProps {
  description: string;
}

const ProductDescription: React.FC<ProductDescriptionProps> = ({ description }) => {
  // Sanitize the HTML content to prevent XSS attacks
  const sanitizedHtml = DOMPurify.sanitize(description);

  return (
    <div 
      className="text-gray-600 font-inter product-description"
      dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
    />
  );
};

export default ProductDescription;
