
import { format, subDays, startOfToday, endOfToday, endOfMonth, startOfMonth } from "date-fns";
import { DateRange } from "react-day-picker";
import { DATE_RANGES } from "./types";

export function getDateRangeForType(value: string): DateRange {
  const today = new Date();
  
  switch (value) {
    case DATE_RANGES.TODAY:
      return {
        from: startOfToday(),
        to: endOfToday(),
      };
    case DATE_RANGES.LAST_7_DAYS:
      return {
        from: subDays(today, 7),
        to: today,
      };
    case DATE_RANGES.LAST_30_DAYS:
      return {
        from: subDays(today, 30),
        to: today,
      };
    case DATE_RANGES.THIS_MONTH:
      return {
        from: startOfMonth(today),
        to: endOfMonth(today),
      };
    default:
      return {
        from: subDays(today, 30),
        to: today,
      };
  }
}

export function formatDateRangeForDisplay(dateRange: DateRange | undefined): string {
  if (!dateRange?.from) {
    return 'Select date range';
  }
  if (!dateRange.to) {
    return format(dateRange.from, 'PPP');
  }
  return `${format(dateRange.from, 'PPP')} - ${format(dateRange.to, 'PPP')}`;
}

export function formatDateForDB(date: Date | undefined): string {
  return date ? format(date, 'yyyy-MM-dd') : format(new Date(), 'yyyy-MM-dd');
}
