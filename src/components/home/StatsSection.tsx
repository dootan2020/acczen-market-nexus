
import { Package, ShoppingCart, Users } from "lucide-react";

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
        <h2 className="text-3xl font-bold text-center mb-12 text-[#202123]">Our Numbers Speak for Themselves</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="animate-fade-in" style={{ animationDelay: '0ms' }}>
            <StatItem
              icon={<Package className="h-12 w-12" />}
              value="5,000+"
              label="Products Available"
            />
          </div>
          <div className="animate-fade-in" style={{ animationDelay: '150ms' }}>
            <StatItem
              icon={<ShoppingCart className="h-12 w-12" />}
              value="10,000+"
              label="Orders Completed"
            />
          </div>
          <div className="animate-fade-in" style={{ animationDelay: '300ms' }}>
            <StatItem
              icon={<Users className="h-12 w-12" />}
              value="3,000+"
              label="Happy Customers"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsSection;
