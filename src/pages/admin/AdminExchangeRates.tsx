
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { useAdmin } from '@/hooks/useAdmin';

export default function AdminExchangeRates() {
  const [newRate, setNewRate] = useState<string>('');
  const { hasPermission } = useAdmin();

  // Fetch current exchange rate
  const { data: currentRate, refetch: refetchRate } = useQuery({
    queryKey: ['exchange-rate'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exchange_rates')
        .select('*')
        .eq('from_currency', 'VND')
        .eq('to_currency', 'USD')
        .single();

      if (error) throw error;
      return data;
    }
  });

  // Fetch rate history
  const { data: rateHistory } = useQuery({
    queryKey: ['exchange-rate-history'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exchange_rate_history')
        .select(`
          *,
          updater:updated_by(
            email
          )
        `)
        .eq('from_currency', 'VND')
        .eq('to_currency', 'USD')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    }
  });

  const handleUpdateRate = async () => {
    const rate = parseFloat(newRate);
    if (isNaN(rate) || rate <= 0) {
      toast.error("Vui lòng nhập tỷ giá hợp lệ");
      return;
    }

    try {
      const { data, error } = await supabase.rpc(
        'admin_update_exchange_rate',
        {
          p_from_currency: 'VND',
          p_to_currency: 'USD',
          p_new_rate: rate
        }
      );

      if (error) throw error;

      toast.success("Cập nhật tỷ giá thành công");
      setNewRate('');
      refetchRate();
    } catch (error) {
      console.error('Error updating exchange rate:', error);
      toast.error("Không thể cập nhật tỷ giá");
    }
  };

  if (!hasPermission('system_settings')) {
    return (
      <div className="p-4">
        <p className="text-muted-foreground">
          Bạn không có quyền truy cập trang này.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Tỷ giá hiện tại</CardTitle>
          <CardDescription>
            Quản lý tỷ giá chuyển đổi giữa VND và USD
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-2xl font-bold">
            1 USD = {currentRate?.rate.toLocaleString()} VND
          </div>
          
          <div className="flex gap-4">
            <Input
              type="number"
              placeholder="Nhập tỷ giá mới"
              value={newRate}
              onChange={(e) => setNewRate(e.target.value)}
              step="0.000001"
              min="0"
              className="max-w-[200px]"
            />
            <Button onClick={handleUpdateRate}>
              Cập nhật tỷ giá
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Lịch sử thay đổi</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Thời gian</TableHead>
                <TableHead>Tỷ giá cũ</TableHead>
                <TableHead>Tỷ giá mới</TableHead>
                <TableHead>Người thực hiện</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rateHistory?.map((record) => (
                <TableRow key={record.id}>
                  <TableCell>
                    {new Date(record.created_at).toLocaleString('vi-VN')}
                  </TableCell>
                  <TableCell>
                    {record.old_rate?.toLocaleString() ?? 'N/A'}
                  </TableCell>
                  <TableCell>
                    {record.new_rate.toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {record.updater?.email ?? 'N/A'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
