
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Percent } from 'lucide-react';

interface DiscountBadgeProps {
  percentage: number;
  showTooltip?: boolean;
  tooltipContent?: React.ReactNode;
  size?: 'sm' | 'default' | 'lg';
  className?: string;
}

export const DiscountBadge: React.FC<DiscountBadgeProps> = ({
  percentage,
  showTooltip = true,
  tooltipContent,
  size = 'default',
  className = '',
}) => {
  if (percentage <= 0) {
    return null;
  }

  const badgeContent = (
    <Badge 
      variant="success" 
      className={`
        ${size === 'sm' ? 'text-xs px-1.5 py-0' : ''}
        ${size === 'lg' ? 'text-sm px-3 py-1' : ''}
        ${className}
      `}
    >
      <Percent className={`
        ${size === 'sm' ? 'h-3 w-3' : ''}
        ${size === 'default' ? 'h-3.5 w-3.5' : ''}
        ${size === 'lg' ? 'h-4 w-4' : ''}
        mr-0.5
      `} />
      {percentage.toFixed(1)}% Off
    </Badge>
  );

  if (showTooltip) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {badgeContent}
          </TooltipTrigger>
          <TooltipContent>
            {tooltipContent || `This user receives a ${percentage.toFixed(1)}% discount on all purchases.`}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return badgeContent;
};
