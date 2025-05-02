
import React from 'react';
import { Check } from 'lucide-react';

interface ProductFeaturesProps {
  features: string[];
}

const ProductFeatures: React.FC<ProductFeaturesProps> = ({ features }) => {
  if (!features || features.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium font-poppins text-gray-800">Key Features</h3>
      <ul className="space-y-2">
        {features.map((feature, index) => (
          <li key={index} className="flex items-start">
            <div className="mr-2 mt-0.5 bg-primary/10 rounded-full p-0.5">
              <Check className="h-4 w-4 text-primary" />
            </div>
            <span className="text-gray-600 font-inter">{feature}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ProductFeatures;
