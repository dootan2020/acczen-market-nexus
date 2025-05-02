
import React from 'react';
import { stripHtmlTags } from '@/utils/htmlUtils';

interface ProductDescriptionProps {
  description: string;
}

const ProductDescription: React.FC<ProductDescriptionProps> = ({ description }) => {
  // Clean HTML from description when the component renders
  const cleanDescription = stripHtmlTags(description);
  
  return (
    <div className="text-gray-700 whitespace-pre-line leading-relaxed">
      {cleanDescription}
    </div>
  );
};

export default ProductDescription;
