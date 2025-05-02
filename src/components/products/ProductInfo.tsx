
import React from 'react';
import RichTextContent from '@/components/RichTextContent';

interface ProductInfoProps {
  description: string;
}

const ProductInfo: React.FC<ProductInfoProps> = ({ description }) => {
  if (!description) {
    return (
      <div className="p-6 bg-gray-50 rounded-lg text-center">
        <p className="text-muted-foreground">No product description available.</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white border border-gray-100 rounded-lg shadow-sm overflow-hidden">
      <div className="p-6">
        <div className="prose prose-gray max-w-none">
          <RichTextContent content={description} />
        </div>
      </div>
    </div>
  );
};

export default ProductInfo;
