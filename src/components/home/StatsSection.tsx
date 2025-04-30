
import { Users, ShoppingCart, CheckCircle, PhoneCall } from "lucide-react";

const StatItem = ({ 
  icon, 
  value, 
  label 
}: { 
  icon: React.ReactNode; 
  value: string; 
  label: string;
}) => (
  <div className="flex flex-col items-center p-8 bg-white rounded-xl border border-[#E5E5E5] shadow-sm hover:shadow-md transition-shadow">
    <div className="mb-4 text-[#19C37D]">{icon}</div>
    <h3 className="text-4xl font-bold mb-2 text-[#202123]">{value}</h3>
    <p className="text-[#8E8EA0]">{label}</p>
  </div>
);

const StatsSection = () => {
  return (
    <div className="bg-white py-20">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12 text-[#202123]">Chúng tôi tự hào về con số</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="animate-fade-in" style={{ animationDelay: '0ms' }}>
            <StatItem
              icon={<Users className="h-12 w-12" />}
              value="5,000+"
              label="Khách hàng hài lòng"
            />
          </div>
          <div className="animate-fade-in" style={{ animationDelay: '150ms' }}>
            <StatItem
              icon={<ShoppingCart className="h-12 w-12" />}
              value="20,000+"
              label="Sản phẩm đã bán"
            />
          </div>
          <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
            <StatItem
              icon={<CheckCircle className="h-12 w-12" />}
              value="99.8%"
              label="Tỷ lệ giao dịch thành công"
            />
          </div>
          <div className="animate-fade-in" style={{ animationDelay: '450ms' }}>
            <StatItem
              icon={<PhoneCall className="h-12 w-12" />}
              value="24/7"
              label="Hỗ trợ khách hàng"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsSection;
