
import React from 'react';

interface ProductDescriptionProps {
  description: string;
}

const ProductDescription: React.FC<ProductDescriptionProps> = ({ description }) => {
  // A simple function to render description with line breaks
  const renderDescription = (text: string) => {
    return text.split('\n').map((line, index) => (
      <p key={index} className="mb-3">
        {line}
      </p>
    ));
  };

  return (
    <div className="text-gray-600 font-inter">
      {renderDescription(description)}
    </div>
  );
};

export default ProductDescription;
