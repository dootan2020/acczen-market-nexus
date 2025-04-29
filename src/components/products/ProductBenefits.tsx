
import { 
  Truck, 
  Shield, 
  Award, 
  RefreshCw 
} from "lucide-react";

const ProductBenefits = () => {
  const benefits = [
    {
      icon: <Truck className="h-8 w-8 text-[#2ECC71]" />,
      title: "Giao hàng miễn phí",
      description: "Áp dụng cho đơn hàng từ $50"
    },
    {
      icon: <Shield className="h-8 w-8 text-[#3498DB]" />,
      title: "Bảo mật 100%",
      description: "Thanh toán an toàn & bảo mật"
    },
    {
      icon: <Award className="h-8 w-8 text-[#F1C40F]" />,
      title: "Sản phẩm chất lượng",
      description: "Cam kết chất lượng cao"
    },
    {
      icon: <RefreshCw className="h-8 w-8 text-[#E74C3C]" />,
      title: "Hoàn tiền dễ dàng",
      description: "Trong vòng 30 ngày"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {benefits.map((benefit, index) => (
        <div 
          key={index} 
          className="flex items-start gap-3 p-4 bg-[#F9FAFB] rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 hover:bg-white"
        >
          <div className="flex-shrink-0 mt-1">
            {benefit.icon}
          </div>
          <div>
            <h3 className="text-base font-semibold mb-1 text-[#333333] font-poppins">{benefit.title}</h3>
            <p className="text-sm text-gray-600 font-inter">{benefit.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductBenefits;
