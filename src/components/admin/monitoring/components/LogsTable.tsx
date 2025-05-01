
import React from 'react';
import { format } from 'date-fns';
import { Loader } from 'lucide-react';
import { ApiLog } from '@/types/api-logs';
import { Badge } from '@/components/ui/badge';
import { JsonViewer } from './JsonViewer';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

interface LogsTableProps {
  logs: ApiLog[];
  isLoading: boolean;
}

export function LogsTable({ logs, isLoading }: LogsTableProps) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="outline" className="bg-green-50 text-green-700">Success</Badge>;
      case 'error':
      case 'api-error':
      case 'transaction-error':
        return <Badge variant="destructive">Error</Badge>;
      case 'critical-error':
        return <Badge variant="destructive" className="bg-red-700">Critical</Badge>;
      case 'started':
        return <Badge variant="outline" className="bg-blue-50 text-blue-700">Started</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>Endpoint</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Response Time</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                <Loader className="mx-auto h-6 w-6 animate-spin text-muted-foreground" />
              </TableCell>
            </TableRow>
          ) : logs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-24 text-center">
                No logs found
              </TableCell>
            </TableRow>
          ) : (
            logs.map((log) => (
              <TableRow key={log.id}>
                <TableCell>
                  {format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss')}
                </TableCell>
                <TableCell>{log.endpoint}</TableCell>
                <TableCell>{getStatusBadge(log.status)}</TableCell>
                <TableCell>
                  {log.response_time ? `${Math.round(log.response_time)}ms` : "N/A"}
                </TableCell>
                <TableCell className="max-w-md">
                  {log.details ? (
                    <JsonViewer data={log.details} />
                  ) : (
                    "No details"
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
