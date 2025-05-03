
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, XCircle, AlertTriangle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  let badgeVariant:
    | "default"
    | "secondary"
    | "destructive"
    | "outline" = "outline";
  let badgeIcon = null;
  let badgeText = status;
  
  // Normalize status
  const normalizedStatus = status.toLowerCase();
  
  if (["pending", "awaiting", "waiting"].includes(normalizedStatus)) {
    badgeVariant = "outline";
    badgeText = "Pending";
    badgeIcon = <Clock className="h-3 w-3 mr-1" />;
  } else if (["completed", "success", "successful", "fulfilled", "approved"].includes(normalizedStatus)) {
    badgeVariant = "default";
    badgeText = "Completed";
    badgeIcon = <CheckCircle2 className="h-3 w-3 mr-1" />;
  } else if (["failed", "error", "rejected", "cancelled", "canceled"].includes(normalizedStatus)) {
    badgeVariant = "destructive";
    badgeText = normalizedStatus === "rejected" ? "Rejected" : "Failed";
    badgeIcon = <XCircle className="h-3 w-3 mr-1" />;
  } else if (["processing", "in_progress", "in-progress"].includes(normalizedStatus)) {
    badgeVariant = "secondary";
    badgeText = "Processing";
    badgeIcon = <RefreshCw className="h-3 w-3 mr-1 animate-spin" />;
  } else if (["warning", "partial"].includes(normalizedStatus)) {
    badgeVariant = "outline";
    badgeText = normalizedStatus === "partial" ? "Partial" : "Warning";
    badgeIcon = <AlertTriangle className="h-3 w-3 mr-1" />;
  }
  
  return (
    <Badge variant={badgeVariant} className={cn("capitalize flex w-fit items-center", className)}>
      {badgeIcon}
      {badgeText}
    </Badge>
  );
};
