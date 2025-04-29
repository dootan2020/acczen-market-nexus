
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns';

export interface DiscountDistributionData {
  discount_range: string;
  user_count: number;
}

export interface DiscountTimelineData {
  date: string;
  total_discount: number;
}

export interface TopDiscountedUser {
  user_id: string;
  email: string | null;
  username: string | null;
  full_name: string | null;
  discount_percentage: number;
  total_discount_amount: number;
  order_count: number;
  discount_expires_at?: string | null;
}

export interface DiscountSummary {
  totalUsers: number;
  totalDiscountAmount: number;
  averageDiscountPercentage: number;
  temporaryDiscountsCount: number;
  highestDiscount: number;
}

export type DateRangeType = '7days' | '30days' | 'month' | 'all';

export const useDiscountAnalytics = () => {
  const [dateRange, setDateRange] = useState<DateRangeType>('30days');

  // Get date range for queries
  const getDateRange = () => {
    const now = new Date();
    switch (dateRange) {
      case '7days':
        return { start: subDays(now, 7), end: now };
      case '30days':
        return { start: subDays(now, 30), end: now };
      case 'month':
        return { start: startOfMonth(now), end: endOfMonth(now) };
      case 'all':
      default:
        return null; // No date filter
    }
  };

  const formatDateForQuery = (date: Date) => {
    return format(date, 'yyyy-MM-dd');
  };

  // Get discount distribution data (histogram)
  const { data: distributionData, isLoading: isLoadingDistribution } = useQuery({
    queryKey: ['discount-distribution'],
    queryFn: async () => {
      // Use the database function for getting discount distribution
      const { data, error } = await supabase.rpc('get_discount_distribution');

      if (error) {
        console.error('Error fetching discount distribution:', error);
        throw error;
      }
      
      return data as DiscountDistributionData[];
    }
  });

  // Get discount timeline data
  const { data: timelineData, isLoading: isLoadingTimeline } = useQuery({
    queryKey: ['discount-timeline', dateRange],
    queryFn: async () => {
      const range = getDateRange();
      let query = supabase
        .from('discount_history')
        .select('created_at, new_percentage, user_id')
        .order('created_at', { ascending: true });
      
      if (range) {
        query = query
          .gte('created_at', formatDateForQuery(range.start))
          .lte('created_at', formatDateForQuery(range.end));
      }

      const { data, error } = await query;
      
      if (error) throw error;
      
      // Process and aggregate the data by date
      const aggregatedData: Record<string, number> = {};
      
      for (const item of data) {
        const date = format(new Date(item.created_at), 'yyyy-MM-dd');
        if (!aggregatedData[date]) {
          aggregatedData[date] = 0;
        }
        // For simplicity, we're adding the discount percentage as a proxy for the amount
        aggregatedData[date] += item.new_percentage;
      }
      
      return Object.entries(aggregatedData).map(([date, total_discount]) => ({
        date,
        total_discount
      })) as DiscountTimelineData[];
    }
  });

  // Get top discounted users
  const { data: topUsers, isLoading: isLoadingTopUsers } = useQuery({
    queryKey: ['top-discounted-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('discount_analytics')
        .select('*')
        .order('discount_percentage', { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data as TopDiscountedUser[];
    }
  });

  // Get discount summary statistics
  const { data: summaryData, isLoading: isLoadingSummary } = useQuery({
    queryKey: ['discount-summary'],
    queryFn: async () => {
      // Get total users with discounts
      const { count: totalUsers, error: countError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gt('discount_percentage', 0);
      
      if (countError) throw countError;

      // Get summary data
      const { data: summaryData, error: summaryError } = await supabase
        .from('profiles')
        .select('discount_percentage, discount_expires_at')
        .gt('discount_percentage', 0);
      
      if (summaryError) throw summaryError;

      // Calculate total discount amount (this would typically be from orders but we'll use a simplification)
      const { data: totalAmountData, error: amountError } = await supabase
        .from('discount_analytics')
        .select('total_discount_amount')
        .gt('discount_percentage', 0);
      
      if (amountError) throw amountError;

      const totalDiscountAmount = totalAmountData.reduce((sum, item) => sum + (item.total_discount_amount || 0), 0);
      const temporaryDiscountsCount = summaryData.filter(item => item.discount_expires_at).length;
      const highestDiscount = summaryData.reduce((max, item) => Math.max(max, item.discount_percentage || 0), 0);
      const averageDiscountPercentage = summaryData.length 
        ? summaryData.reduce((sum, item) => sum + (item.discount_percentage || 0), 0) / summaryData.length 
        : 0;

      return {
        totalUsers: totalUsers || 0,
        totalDiscountAmount,
        averageDiscountPercentage,
        temporaryDiscountsCount,
        highestDiscount
      } as DiscountSummary;
    }
  });
  
  // Export data functions
  const exportToCSV = (data: any[], filename: string) => {
    if (!data || !data.length) return;
    
    // Convert data to CSV format
    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row => {
        return headers.map(header => {
          // Handle null values and ensure proper CSV formatting
          const cellValue = row[header] === null ? '' : row[header];
          
          // If the value contains commas, quotes, or newlines, wrap in quotes
          if (typeof cellValue === 'string' && 
              (cellValue.includes(',') || cellValue.includes('"') || cellValue.includes('\n'))) {
            // Escape quotes by doubling them
            return `"${cellValue.replace(/"/g, '""')}"`;
          }
          return cellValue;
        }).join(',');
      })
    ].join('\n');
    
    // Create and download the CSV file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${filename}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Format user data for export
  const exportDiscountedUsers = () => {
    if (!topUsers) return;
    
    const formattedData = topUsers.map(user => ({
      User_Email: user.email || 'N/A',
      Username: user.username || 'N/A',
      Full_Name: user.full_name || 'N/A',
      Discount_Percentage: `${user.discount_percentage}%`,
      Total_Savings: user.total_discount_amount || 0,
      Order_Count: user.order_count || 0,
      Expires_At: user.discount_expires_at ? format(new Date(user.discount_expires_at), 'yyyy-MM-dd') : 'Never'
    }));
    
    exportToCSV(formattedData, 'discounted_users');
  };
  
  // Format distribution data for export
  const exportDistributionData = () => {
    if (!distributionData) return;
    
    const formattedData = distributionData.map(item => ({
      Discount_Range: item.discount_range,
      User_Count: item.user_count
    }));
    
    exportToCSV(formattedData, 'discount_distribution');
  };
  
  // Format timeline data for export
  const exportTimelineData = () => {
    if (!timelineData) return;
    
    const formattedData = timelineData.map(item => ({
      Date: item.date,
      Discount_Activity: item.total_discount
    }));
    
    exportToCSV(formattedData, 'discount_timeline');
  };
  
  // Export all data combined
  const exportAllData = () => {
    // Export each dataset
    exportDiscountedUsers();
    exportDistributionData();
    exportTimelineData();
    
    // Also export summary data
    if (summaryData) {
      exportToCSV([{
        Total_Users_With_Discount: summaryData.totalUsers,
        Total_Discount_Amount: summaryData.totalDiscountAmount,
        Average_Discount_Percentage: `${summaryData.averageDiscountPercentage.toFixed(2)}%`,
        Temporary_Discounts_Count: summaryData.temporaryDiscountsCount,
        Highest_Discount: `${summaryData.highestDiscount}%`
      }], 'discount_summary');
    }
  };

  return {
    distributionData,
    timelineData,
    topUsers,
    summaryData,
    dateRange,
    setDateRange,
    isLoading: isLoadingDistribution || isLoadingTimeline || isLoadingTopUsers || isLoadingSummary,
    // Export functions
    exportDiscountedUsers,
    exportDistributionData,
    exportTimelineData,
    exportAllData,
    exportToCSV
  };
};
