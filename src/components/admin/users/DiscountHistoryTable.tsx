
import React from 'react';
import { format } from 'date-fns';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DiscountHistoryItem } from '@/hooks/admin/useUserDiscount';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarIcon, User2Icon } from 'lucide-react';

interface DiscountHistoryTableProps {
  history: DiscountHistoryItem[];
  isLoading: boolean;
}

export const DiscountHistoryTable: React.FC<DiscountHistoryTableProps> = ({
  history,
  isLoading,
}) => {
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getDiscountChangeBadge = (previous: number, current: number) => {
    const diff = current - previous;
    if (diff > 0) {
      return <Badge variant="success">+{diff.toFixed(1)}%</Badge>;
    } else if (diff < 0) {
      return <Badge variant="destructive">{diff.toFixed(1)}%</Badge>;
    } else {
      return <Badge variant="outline">No change</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Discount History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!history || history.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Discount History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center items-center h-32 text-muted-foreground">
            No discount history available.
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Discount History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Previous</TableHead>
                <TableHead>New</TableHead>
                <TableHead>Change</TableHead>
                <TableHead>Admin</TableHead>
                <TableHead className="w-1/3">Note</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="whitespace-nowrap">
                    <div className="flex items-center gap-2 text-sm">
                      <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
                      {formatDate(item.created_at)}
                    </div>
                  </TableCell>
                  <TableCell>{item.previous_percentage}%</TableCell>
                  <TableCell>{item.new_percentage}%</TableCell>
                  <TableCell>
                    {getDiscountChangeBadge(item.previous_percentage, item.new_percentage)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 max-w-[150px] truncate" title={item.admin?.full_name || item.admin?.username || item.admin?.email || 'Unknown'}>
                      <User2Icon className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="truncate">
                        {item.admin?.full_name || item.admin?.username || item.admin?.email || 'Unknown'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-xs">
                    <div className="truncate" title={item.change_note || '-'}>
                      {item.change_note || '-'}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
