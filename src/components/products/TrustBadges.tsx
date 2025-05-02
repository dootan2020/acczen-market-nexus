
import React from 'react';
import { Shield, Clock, CheckCircle, CreditCard } from 'lucide-react';

const TrustBadges: React.FC = () => {
  return (
    <div className="flex flex-wrap gap-4 md:gap-6 mt-6">
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-primary" />
        <span className="text-sm font-medium">Instant Delivery</span>
      </div>
      <div className="flex items-center gap-2">
        <Shield className="h-5 w-5 text-primary" />
        <span className="text-sm font-medium">Secure Products</span>
      </div>
      <div className="flex items-center gap-2">
        <CreditCard className="h-5 w-5 text-primary" />
        <span className="text-sm font-medium">Secure Payment</span>
      </div>
      <div className="flex items-center gap-2">
        <CheckCircle className="h-5 w-5 text-primary" />
        <span className="text-sm font-medium">Quality Guaranteed</span>
      </div>
    </div>
  );
};

export default TrustBadges;
