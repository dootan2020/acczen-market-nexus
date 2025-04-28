
import React from 'react';
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

interface KpiCardProps extends React.HTMLAttributes<HTMLDivElement> {
  icon: React.ReactNode;
  title: string;
  value: string | number;
  change?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  color?: "default" | "primary" | "success" | "warning" | "danger";
}

export function KpiCard({
  icon,
  title,
  value,
  change,
  color = "default",
  className,
  ...props
}: KpiCardProps) {
  const colorStyles = {
    default: "bg-card",
    primary: "bg-primary/10",
    success: "bg-success/10",
    warning: "bg-warning/10",
    danger: "bg-destructive/10",
  };

  const iconColorStyles = {
    default: "bg-primary/10 text-primary",
    primary: "bg-primary/20 text-primary",
    success: "bg-success/20 text-success",
    warning: "bg-warning/20 text-warning",
    danger: "bg-destructive/20 text-destructive",
  };

  return (
    <Card 
      className={cn("overflow-hidden transition-all hover:shadow-md", colorStyles[color], className)}
      {...props}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={cn("p-2 rounded-full", iconColorStyles[color])}>
            {icon}
          </div>
          
          {change && (
            <div 
              className={cn(
                "flex items-center text-xs font-medium rounded-full px-2 py-1",
                change.isPositive ? "text-success bg-success/10" : "text-destructive bg-destructive/10"
              )}
            >
              {change.isPositive ? (
                <ArrowUpRight className="mr-1 h-3 w-3" />
              ) : (
                <ArrowDownRight className="mr-1 h-3 w-3" />
              )}
              {change.isPositive ? "+" : ""}{change.value}%
            </div>
          )}
        </div>
        
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground">{title}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
          {change?.label && (
            <p className="text-xs text-muted-foreground">{change.label}</p>
          )}
        </div>
      </div>
    </Card>
  );
}
