
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { DiscountHistoryItem } from '@/hooks/admin/useUserDiscount';
import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react';

interface DiscountHistoryTableProps {
  history: DiscountHistoryItem[];
  isLoading: boolean;
}

export const DiscountHistoryTable: React.FC<DiscountHistoryTableProps> = ({ history, isLoading }) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy HH:mm');
    } catch (e) {
      return 'Invalid date';
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="space-y-2">
          {Array(3).fill(0).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="bg-card rounded-lg border">
        <div className="p-6 text-center">
          <h3 className="text-lg font-medium mb-2">No Discount History</h3>
          <p className="text-sm text-muted-foreground">
            This user hasn't had any discount changes yet.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-lg border">
      <div className="p-4 border-b">
        <h3 className="font-medium">Discount History</h3>
      </div>
      <div className="p-0 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[180px]">Date</TableHead>
              <TableHead>Change</TableHead>
              <TableHead>Changed By</TableHead>
              <TableHead>Expiry</TableHead>
              <TableHead>Note</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {history.map((item) => {
              const isIncrease = item.new_percentage > item.previous_percentage;
              const isReset = item.new_percentage === 0 && item.previous_percentage > 0;
              
              return (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    {formatDate(item.created_at)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {isReset ? (
                        <Badge variant="outline" className="border-gray-200 bg-gray-50">
                          Reset
                        </Badge>
                      ) : isIncrease ? (
                        <Badge variant="outline" className="border-green-200 bg-green-50 text-green-700">
                          <ArrowUpIcon className="mr-1 h-3 w-3" />
                          +{(item.new_percentage - item.previous_percentage).toFixed(1)}%
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
                          <ArrowDownIcon className="mr-1 h-3 w-3" />
                          {(item.new_percentage - item.previous_percentage).toFixed(1)}%
                        </Badge>
                      )}
                      <span>{item.previous_percentage}% → {item.new_percentage}%</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {item.admin?.username || item.admin?.email || 'System'}
                  </TableCell>
                  <TableCell>
                    {item.expiry_date ? (
                      <span className="text-sm">{format(new Date(item.expiry_date), 'MMM d, yyyy')}</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">None</span>
                    )}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate" title={item.change_note || ''}>
                    {item.change_note || '-'}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
