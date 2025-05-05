
import { useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { DateRange } from 'react-day-picker';
import { addDays, startOfMonth, endOfMonth, startOfDay, endOfDay, subDays } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';

// Define the type for date range options
export type DateRangeType = 'today' | '7days' | '30days' | 'month' | 'custom';

// Constants for date range options
export const DATE_RANGES = {
  TODAY: 'today',
  LAST_7_DAYS: '7days',
  LAST_30_DAYS: '30days',
  THIS_MONTH: 'month',
  CUSTOM: 'custom'
};

export const useReportsData = () => {
  // Function to get date range from type - moved before first usage
  const getDateRangeFromType = useCallback((type: DateRangeType): DateRange => {
    const today = new Date();
    const todayEnd = endOfDay(today);
    
    switch (type) {
      case DATE_RANGES.TODAY:
        return {
          from: startOfDay(today),
          to: todayEnd
        };
      case DATE_RANGES.LAST_7_DAYS:
        return {
          from: startOfDay(subDays(today, 6)),
          to: todayEnd
        };
      case DATE_RANGES.LAST_30_DAYS:
        return {
          from: startOfDay(subDays(today, 29)),
          to: todayEnd
        };
      case DATE_RANGES.THIS_MONTH:
        return {
          from: startOfMonth(today),
          to: endOfMonth(today)
        };
      default:
        return {
          from: startOfDay(subDays(today, 29)),
          to: todayEnd
        };
    }
  }, []);

  // State for date range type and custom date range
  const [dateRangeType, setDateRangeType] = useState<DateRangeType>('30days');
  const [dateRange, setDateRange] = useState<DateRange | undefined>(getDateRangeFromType('30days'));

  // Handle date range type change
  const handleDateRangeTypeChange = useCallback((type: DateRangeType) => {
    setDateRangeType(type);
    
    if (type !== DATE_RANGES.CUSTOM) {
      setDateRange(getDateRangeFromType(type));
    }
  }, [getDateRangeFromType]);

  // Handle custom date range change
  const handleCustomDateRangeChange = useCallback((range: DateRange | undefined) => {
    setDateRange(range);
  }, []);

  // Base query to fetch report data
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['reports-data', dateRange],
    queryFn: async () => {
      // This is a placeholder for actual data fetching
      // In a real implementation, you would query the database based on dateRange
      return {};
    },
    enabled: !!dateRange?.from && !!dateRange?.to,
  });

  return {
    data,
    isLoading,
    error,
    dateRangeType,
    dateRange,
    handleDateRangeTypeChange,
    handleCustomDateRangeChange,
    refetch
  };
};
