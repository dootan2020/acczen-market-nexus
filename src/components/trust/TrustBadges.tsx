
import React from 'react';
import { cn } from '@/lib/utils';
import { Shield, Lock, CreditCard, CheckCircle } from 'lucide-react';

interface TrustBadgeProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  className?: string;
}

const TrustBadge = ({ icon, title, description, className }: TrustBadgeProps) => (
  <div className={cn("flex flex-col items-center p-4 text-center", className)}>
    <div className="mb-3 text-primary">{icon}</div>
    <h3 className="text-sm font-medium mb-1">{title}</h3>
    <p className="text-xs text-muted-foreground">{description}</p>
  </div>
);

interface TrustBadgesProps {
  className?: string;
  variant?: 'default' | 'compact' | 'horizontal';
}

const TrustBadges = ({ className, variant = 'default' }: TrustBadgesProps) => {
  const badges = [
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Secure Payments",
      description: "All transactions are encrypted and secure"
    },
    {
      icon: <Lock className="h-6 w-6" />,
      title: "100% Private",
      description: "Your data is never shared with third parties"
    },
    {
      icon: <CreditCard className="h-6 w-6" />,
      title: "Multiple Payment Methods",
      description: "Pay with PayPal, USDT, and more"
    },
    {
      icon: <CheckCircle className="h-6 w-6" />,
      title: "Guaranteed Delivery",
      description: "Immediate delivery or your money back"
    }
  ];

  const containerClasses = cn(
    "grid gap-4",
    {
      "grid-cols-2 md:grid-cols-4": variant === 'default',
      "grid-cols-2": variant === 'compact',
      "grid-cols-1 md:grid-cols-4": variant === 'horizontal'
    },
    className
  );

  const badgeClasses = cn({
    "p-4": variant === 'default',
    "p-3": variant === 'compact',
    "flex flex-row items-center text-left p-3": variant === 'horizontal',
  });

  return (
    <div className={containerClasses}>
      {badges.map((badge, index) => (
        <TrustBadge
          key={index}
          icon={badge.icon}
          title={badge.title}
          description={badge.description}
          className={badgeClasses}
        />
      ))}
    </div>
  );
};

export default TrustBadges;
