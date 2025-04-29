
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loading } from "@/components/ui/loading";

interface OrderItem {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  order_items: {
    product: {
      name: string;
    };
  }[];
}

interface RecentOrdersProps {
  orders: OrderItem[];
  isLoading?: boolean;
}

export function RecentOrders({ orders, isLoading = false }: RecentOrdersProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Đơn hàng gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-6">
            <Loading text="Đang tải đơn hàng..." />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Đơn hàng gần đây</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-6">
            <p>Chưa có đơn hàng nào. Hãy bắt đầu mua sắm để xem đơn hàng của bạn tại đây.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Đơn hàng gần đây</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {orders.map(order => (
            <div key={order.id} className="flex items-center justify-between p-2 border rounded">
              <div>
                <div className="font-medium">{order.order_items[0]?.product?.name || "Sản phẩm không xác định"}</div>
                <div className="text-sm text-muted-foreground">
                  {new Date(order.created_at).toLocaleDateString()}
                </div>
              </div>
              <div className="font-medium">${order.total_amount}</div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
