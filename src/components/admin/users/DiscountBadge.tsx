
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Percent } from "lucide-react";

interface DiscountBadgeProps {
  percentage: number;
  tooltipContent?: string;
}

export function DiscountBadge({
  percentage,
  tooltipContent
}: DiscountBadgeProps) {
  if (percentage <= 0) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge className="bg-green-500 text-white hover:bg-green-600 flex items-center gap-1">
            <Percent className="h-3 w-3" />
            {percentage}%
          </Badge>
        </TooltipTrigger>
        {tooltipContent && (
          <TooltipContent>
            <p>{tooltipContent}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  );
}
