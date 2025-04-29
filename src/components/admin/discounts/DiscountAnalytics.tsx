
import React from 'react';
import { Button } from '@/components/ui/button';
import { useDiscountAnalytics } from '@/hooks/admin/useDiscountAnalytics';
import { DiscountDistributionChart } from './DiscountDistributionChart';
import { DiscountTimelineChart } from './DiscountTimelineChart';
import { DiscountStatCards } from './DiscountStatCards';
import { TopDiscountedUsersTable } from './TopDiscountedUsersTable';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Download } from 'lucide-react';

export function DiscountAnalytics() {
  const {
    distributionData,
    timelineData,
    topUsers,
    summaryData,
    dateRange,
    setDateRange,
    isLoading,
  } = useDiscountAnalytics();

  const exportAnalyticsData = () => {
    // Create a combined analytics data object
    const exportData = {
      summary: summaryData,
      distribution: distributionData,
      timeline: timelineData,
      topUsers: topUsers?.map(user => ({
        email: user.email,
        username: user.username,
        full_name: user.full_name,
        discount: user.discount_percentage,
        saved: user.total_discount_amount,
        orders: user.order_count,
        expires: user.discount_expires_at
      }))
    };

    // Convert to JSON and download
    const jsonData = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `discount_analytics_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="container px-4 sm:px-6 w-full max-w-full mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Discount Analytics</h1>
        
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={(value) => setDateRange(value as any)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Date Range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Last 7 Days</SelectItem>
              <SelectItem value="30days">Last 30 Days</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="all">All Time</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={exportAnalyticsData}>
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>
      
      <DiscountStatCards data={summaryData} isLoading={isLoading} />
      
      <div className="grid gap-6 md:grid-cols-2">
        <DiscountDistributionChart data={distributionData || []} isLoading={isLoading} />
        <DiscountTimelineChart data={timelineData || []} isLoading={isLoading} />
      </div>
      
      <TopDiscountedUsersTable users={topUsers} isLoading={isLoading} />
      
      <div className="bg-card rounded-lg border p-6 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">About User Discounts</h2>
        <div className="space-y-4 text-sm">
          <p>
            User discounts can be set on individual user profiles by administrators. Discounts are applied
            automatically at checkout time based on the user's discount percentage.
          </p>
          <p>
            <strong>Temporary Discounts:</strong> Discounts with an expiration date will automatically expire and reset to 0%
            when the date is reached. The system runs a check for expired discounts daily at midnight.
          </p>
          <p>
            <strong>Usage Statistics:</strong> The analytics on this page help you understand the impact of your discount 
            strategy on revenue and user behavior. Track which discounts are most effective and adjust your strategy accordingly.
          </p>
          <div className="rounded-md bg-amber-50 dark:bg-amber-950 p-4 mt-4">
            <p className="text-amber-800 dark:text-amber-200">
              <strong>Tip:</strong> To reset an expired discount manually, set the discount percentage to 0 for the user.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
