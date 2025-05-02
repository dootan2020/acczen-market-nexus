
import React from 'react';
import { Card } from "@/components/ui/card";
import { Tag, Package, Clock } from "lucide-react";

interface ProductSpecsProps {
  product: any;
}

const ProductSpecifications: React.FC<ProductSpecsProps> = ({ product }) => {
  // Extract specs from product
  const specifications = [
    {
      name: "SKU",
      value: product?.sku || "N/A",
      icon: <Tag className="h-4 w-4 text-muted-foreground" />
    },
    {
      name: "Category",
      value: product?.category?.name || "N/A",
      icon: <Package className="h-4 w-4 text-muted-foreground" />
    },
    {
      name: "Type",
      value: product?.subcategory_name || product?.category?.name || "Digital Product",
      icon: <Clock className="h-4 w-4 text-muted-foreground" />
    },
  ];

  // Add any custom specifications from product object if available
  if (product?.specifications) {
    Object.entries(product.specifications).forEach(([name, value]) => {
      specifications.push({
        name,
        value: value as string,
        icon: null,
      });
    });
  }

  return (
    <Card className="border border-gray-200 rounded-lg overflow-hidden">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
        {specifications.map((spec, index) => (
          <div key={index} className="p-4 flex items-start">
            <div className="mr-2 mt-0.5">
              {spec.icon}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{spec.name}</p>
              <p className="text-sm text-gray-500">{spec.value}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default ProductSpecifications;
