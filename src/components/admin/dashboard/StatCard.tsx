
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  description?: string;
  percentChange?: number;
  trend?: 'up' | 'down' | 'neutral';
  loading?: boolean;
  className?: string;
}

export function StatCard({ 
  title, 
  value, 
  icon, 
  description, 
  percentChange, 
  trend = 'neutral',
  loading = false,
  className 
}: StatCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardContent className="p-6">
        {loading ? (
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div className="h-4 bg-gray-200 rounded w-1/3 animate-pulse"></div>
              <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
            <div className="h-7 bg-gray-200 rounded w-1/2 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-start mb-3">
              <div className="text-sm font-medium text-muted-foreground">
                {title}
              </div>
              <div className="p-2 rounded-full bg-chatgpt-primary/10 text-chatgpt-primary">
                {icon}
              </div>
            </div>
            <div className="text-2xl font-bold mb-2">
              {value}
            </div>
            {(description || percentChange !== undefined) && (
              <div className="flex items-center text-sm">
                {percentChange !== undefined && (
                  <div 
                    className={cn(
                      "flex items-center mr-2",
                      trend === 'up' ? "text-green-500" : 
                      trend === 'down' ? "text-red-500" : 
                      "text-gray-500"
                    )}
                  >
                    {trend === 'up' ? (
                      <ArrowUpIcon className="h-3 w-3 mr-1" />
                    ) : trend === 'down' ? (
                      <ArrowDownIcon className="h-3 w-3 mr-1" />
                    ) : null}
                    {Math.abs(percentChange)}%
                  </div>
                )}
                {description && (
                  <span className="text-muted-foreground">
                    {description}
                  </span>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
