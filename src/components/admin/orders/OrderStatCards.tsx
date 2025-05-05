
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, Clock, RefreshCw, Calendar } from 'lucide-react';

interface OrderStatCardsProps {
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  failedOrders: number;
}

export const OrderStatCards: React.FC<OrderStatCardsProps> = ({
  totalOrders,
  pendingOrders,
  completedOrders,
  failedOrders
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-white dark:bg-slate-800 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Total Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalOrders}</div>
          <p className="text-xs text-muted-foreground mt-1 flex items-center">
            <Calendar className="h-3 w-3 mr-1" /> All time
          </p>
        </CardContent>
      </Card>
      
      <Card className="bg-white dark:bg-slate-800 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Pending Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-500">{pendingOrders}</div>
          <p className="text-xs text-muted-foreground mt-1 flex items-center">
            <Clock className="h-3 w-3 mr-1" /> Awaiting processing
          </p>
        </CardContent>
      </Card>
      
      <Card className="bg-white dark:bg-slate-800 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Completed Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-500">{completedOrders}</div>
          <p className="text-xs text-muted-foreground mt-1 flex items-center">
            <RefreshCw className="h-3 w-3 mr-1" /> Successfully delivered
          </p>
        </CardContent>
      </Card>
      
      <Card className="bg-white dark:bg-slate-800 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Failed Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-500">{failedOrders}</div>
          <p className="text-xs text-muted-foreground mt-1 flex items-center">
            <BarChart3 className="h-3 w-3 mr-1" /> Require attention
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
