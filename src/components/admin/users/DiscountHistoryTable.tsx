
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
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { CalendarIcon, User2Icon, ClockIcon, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DiscountHistoryTableProps {
  history: DiscountHistoryItem[];
  isLoading: boolean;
  onExportCSV?: () => void;
}

export const DiscountHistoryTable: React.FC<DiscountHistoryTableProps> = ({
  history,
  isLoading,
  onExportCSV,
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

  const handleExportCSV = () => {
    if (onExportCSV) {
      onExportCSV();
    } else {
      // Default export implementation if none provided
      const headers = ['Date', 'Previous', 'New', 'Change', 'Admin', 'Note', 'Expiry Date'];
      const csvData = history.map(item => [
        formatDate(item.created_at),
        `${item.previous_percentage}%`,
        `${item.new_percentage}%`,
        `${item.new_percentage - item.previous_percentage}%`,
        item.admin?.full_name || item.admin?.username || item.admin?.email || 'Unknown',
        item.change_note || '-',
        item.expiry_date ? formatDate(item.expiry_date) : 'No expiry'
      ]);
      
      const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `discount_history_${new Date().getTime()}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
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
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Discount History</CardTitle>
        <Button variant="outline" size="sm" onClick={handleExportCSV}>
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
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
                <TableHead className="w-1/4">Note</TableHead>
                <TableHead>Expiry</TableHead>
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
                  <TableCell>
                    {item.expiry_date ? (
                      <div className="flex items-center gap-2 text-sm">
                        <ClockIcon className="h-3.5 w-3.5 text-muted-foreground" />
                        {formatDate(item.expiry_date)}
                      </div>
                    ) : (
                      <span className="text-muted-foreground text-sm">No expiry</span>
                    )}
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
