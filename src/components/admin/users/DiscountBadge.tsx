
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface DiscountBadgeProps {
  percentage: number;
  tooltipContent?: string;
}

export function DiscountBadge({ percentage, tooltipContent }: DiscountBadgeProps) {
  if (!percentage || percentage <= 0) return null;

  const badgeContent = `${percentage}%`;

  if (!tooltipContent) {
    return (
      <Badge variant="outline" className="bg-green-50 text-green-700">
        {badgeContent}
      </Badge>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className="bg-green-50 text-green-700 cursor-help">
            {badgeContent}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltipContent}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
