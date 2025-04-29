
import { useState } from "react";
import { format, subDays, startOfToday, endOfToday, endOfMonth, startOfMonth } from "date-fns";
import { DateRange } from "react-day-picker";

// Pre-defined date ranges
export const DATE_RANGES = {
  TODAY: 'today',
  LAST_7_DAYS: '7days',
  LAST_30_DAYS: '30days',
  THIS_MONTH: 'month',
  CUSTOM: 'custom',
};

export function useReportDateRange() {
  // State
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const [dateRangeType, setDateRangeType] = useState(DATE_RANGES.LAST_30_DAYS);

  // Update date range based on selection
  const handleDateRangeChange = (value: string) => {
    setDateRangeType(value);
    
    const today = new Date();
    switch (value) {
      case DATE_RANGES.TODAY:
        setDateRange({
          from: startOfToday(),
          to: endOfToday(),
        });
        break;
      case DATE_RANGES.LAST_7_DAYS:
        setDateRange({
          from: subDays(today, 7),
          to: today,
        });
        break;
      case DATE_RANGES.LAST_30_DAYS:
        setDateRange({
          from: subDays(today, 30),
          to: today,
        });
        break;
      case DATE_RANGES.THIS_MONTH:
        setDateRange({
          from: startOfMonth(today),
          to: endOfMonth(today),
        });
        break;
      // For custom, do nothing as it's handled by the date picker component
    }
  };

  // Custom date range handler
  const handleDateRangePickerChange = (range: DateRange | undefined) => {
    if (range?.from && range?.to) {
      setDateRange(range);
      setDateRangeType(DATE_RANGES.CUSTOM);
    }
  };

  // Format date range for display
  const formattedDateRange = (() => {
    if (!dateRange?.from) {
      return 'Select date range';
    }
    if (!dateRange.to) {
      return format(dateRange.from, 'PPP');
    }
    return `${format(dateRange.from, 'PPP')} - ${format(dateRange.to, 'PPP')}`;
  })();

  return {
    dateRange,
    dateRangeType,
    handleDateRangeChange,
    handleDateRangePickerChange,
    formattedDateRange,
  };
}
