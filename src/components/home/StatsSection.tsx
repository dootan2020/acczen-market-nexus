
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
  <div className="flex flex-col items-center p-6 bg-white rounded-xl shadow-sm border">
    <div className="mb-4 text-primary">{icon}</div>
    <h3 className="text-3xl font-bold mb-2">{value}</h3>
    <p className="text-gray-500">{label}</p>
  </div>
);

const StatsSection = () => {
  return (
    <div className="bg-gray-50 py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Our Numbers Speak for Themselves</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <StatItem
            icon={<Package className="h-12 w-12" />}
            value="5,000+"
            label="Products Available"
          />
          <StatItem
            icon={<ShoppingCart className="h-12 w-12" />}
            value="10,000+"
            label="Orders Completed"
          />
          <StatItem
            icon={<Users className="h-12 w-12" />}
            value="3,000+"
            label="Happy Customers"
          />
        </div>
      </div>
    </div>
  );
};

export default StatsSection;
