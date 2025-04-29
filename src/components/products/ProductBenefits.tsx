
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
      title: "Instant Delivery",
      description: "Digital products delivered instantly"
    },
    {
      icon: <Shield className="h-10 w-10 text-accent" />,
      title: "100% Secure",
      description: "Safe & encrypted transactions"
    },
    {
      icon: <Award className="h-10 w-10 text-[#F1C40F]" />,
      title: "Quality Guarantee",
      description: "Premium quality products"
    },
    {
      icon: <RefreshCw className="h-10 w-10 text-[#E74C3C]" />,
      title: "Easy Refunds",
      description: "Within 30 days of purchase"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      {benefits.map((benefit, index) => (
        <div 
          key={index} 
          className="flex flex-col items-center text-center p-6 bg-white rounded-lg shadow-sm border border-gray-100 transition-all duration-300 hover:shadow-md hover:border-primary/20"
        >
          <div className="p-3 bg-gray-50 rounded-full mb-4">
            {benefit.icon}
          </div>
          <div>
            <h3 className="text-base font-semibold mb-2 text-gray-800 font-poppins">{benefit.title}</h3>
            <p className="text-sm text-gray-600 font-inter">{benefit.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductBenefits;
