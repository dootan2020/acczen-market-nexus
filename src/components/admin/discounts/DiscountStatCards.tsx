
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Percent, Calendar, CircleDollarSign } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { DiscountSummary } from '@/hooks/admin/useDiscountAnalytics';

interface DiscountStatCardsProps {
  data?: DiscountSummary;
  isLoading: boolean;
}

export function DiscountStatCards({ data, isLoading }: DiscountStatCardsProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Users With Discounts
          </CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <div className="text-2xl font-bold">
              {data?.totalUsers || 0}
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            {data?.temporaryDiscountsCount || 0} temporary
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Average Discount
          </CardTitle>
          <Percent className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <div className="text-2xl font-bold">
              {data?.averageDiscountPercentage ? data.averageDiscountPercentage.toFixed(1) : 0}%
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Highest: {data?.highestDiscount || 0}%
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Savings
          </CardTitle>
          <CircleDollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <div className="text-2xl font-bold">
              {formatCurrency(data?.totalDiscountAmount || 0)}
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            From all discounted orders
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Temporary Discounts
          </CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <div className="text-2xl font-bold">
              {data?.temporaryDiscountsCount || 0}
            </div>
          )}
          <p className="text-xs text-muted-foreground mt-1">
            Auto-expire when time is up
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
