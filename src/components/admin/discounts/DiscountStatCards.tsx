
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { DiscountSummary } from '@/hooks/admin/useDiscountAnalytics';

interface DiscountStatCardsProps {
  data: DiscountSummary | undefined;
  isLoading: boolean;
}

export function DiscountStatCards({ data, isLoading }: DiscountStatCardsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {Array(4).fill(0).map((_, i) => (
          <Card key={i}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Loading...</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-4 bg-muted rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">No Data Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Users with Discounts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.totalUsers}</div>
          <p className="text-xs text-muted-foreground mt-1">
            <Badge variant="outline">{data.temporaryDiscountsCount} temporary</Badge>
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Total Discount Amount</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${data.totalDiscountAmount.toFixed(2)}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Average Discount</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.averageDiscountPercentage.toFixed(1)}%</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Highest Discount</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.highestDiscount}%</div>
        </CardContent>
      </Card>
    </div>
  );
}
