
import React from 'react';
import { 
  Truck, 
  Shield, 
  Award, 
  RefreshCw 
} from "lucide-react";

const ProductBenefits = () => {
  const benefits = [
    {
      icon: <Truck className="h-10 w-10 text-primary" />,
      title: "Fast Delivery",
      description: "Get your items quickly"
    },
    {
      icon: <Shield className="h-10 w-10 text-accent" />,
      title: "100% Secure",
      description: "Safe & secure payment"
    },
    {
      icon: <Award className="h-10 w-10 text-[#F1C40F]" />,
      title: "Quality Products",
      description: "Guaranteed quality"
    },
    {
      icon: <RefreshCw className="h-10 w-10 text-[#E74C3C]" />,
      title: "Easy Returns",
      description: "Within 30 days"
    }
  ];

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-semibold mb-4 font-poppins">What You Get</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {benefits.map((benefit, index) => (
          <div 
            key={index} 
            className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md hover:border-primary/20"
          >
            <div className="p-3 bg-gray-50 rounded-full">
              {benefit.icon}
            </div>
            <div>
              <h3 className="text-base font-semibold mb-1 text-gray-800 font-poppins">{benefit.title}</h3>
              <p className="text-sm text-gray-600 font-inter">{benefit.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductBenefits;
