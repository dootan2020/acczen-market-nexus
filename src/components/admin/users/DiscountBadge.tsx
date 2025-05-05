
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Percent } from "lucide-react";
import { cn } from "@/lib/utils";

interface DiscountBadgeProps {
  percentage: number;
  tooltipContent?: string;
  size?: "default" | "sm" | "lg";
}

export function DiscountBadge({
  percentage,
  tooltipContent,
  size = "default"
}: DiscountBadgeProps) {
  if (percentage <= 0) return null;

  const sizeClasses = {
    sm: "text-xs py-0 px-1.5",
    default: "",
    lg: "text-base py-1 px-3"
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge className={cn("bg-green-500 text-white hover:bg-green-600 flex items-center gap-1", sizeClasses[size])}>
            <Percent className={cn("h-3 w-3", size === "lg" ? "h-4 w-4" : size === "sm" ? "h-2.5 w-2.5" : "")} />
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
