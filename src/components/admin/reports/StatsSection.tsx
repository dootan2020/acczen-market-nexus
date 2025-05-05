
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { StatsData } from '@/types/reports';
import { formatCurrency } from '@/utils/formatters';

interface StatsSectionProps {
  statsData: StatsData;
}

export const StatsSection: React.FC<StatsSectionProps> = ({ statsData }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      <Card className="bg-white shadow-sm">
        <CardContent className="p-4">
          <p className="text-sm font-medium text-muted-foreground">Total Orders</p>
          <p className="text-2xl font-bold">{statsData.totalOrders}</p>
        </CardContent>
      </Card>
      
      <Card className="bg-white shadow-sm">
        <CardContent className="p-4">
          <p className="text-sm font-medium text-muted-foreground">Total Deposits</p>
          <p className="text-2xl font-bold">{statsData.totalDeposits}</p>
        </CardContent>
      </Card>
      
      <Card className="bg-white shadow-sm">
        <CardContent className="p-4">
          <p className="text-sm font-medium text-muted-foreground">Revenue</p>
          <p className="text-2xl font-bold">{formatCurrency(statsData.totalDepositAmount)}</p>
        </CardContent>
      </Card>
      
      <Card className="bg-white shadow-sm">
        <CardContent className="p-4">
          <p className="text-sm font-medium text-muted-foreground">Avg. Order Value</p>
          <p className="text-2xl font-bold">{formatCurrency(statsData.averageOrderValue)}</p>
        </CardContent>
      </Card>
    </div>
  );
};
