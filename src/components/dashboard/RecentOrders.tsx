
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Update the interface to match the Order type from Dashboard.tsx
interface Order {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  order_items?: any[]; // Make this optional to match the Order type
}

interface RecentOrdersProps {
  orders: Order[];
  isLoading?: boolean;
}

export function RecentOrders({ orders, isLoading = false }: RecentOrdersProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-6">
            <p>Loading recent orders...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-6">
            <p>No orders found. Start shopping to see your orders here.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Orders</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {orders.map(order => (
            <div key={order.id} className="flex items-center justify-between p-2 border rounded">
              <div>
                <div className="font-medium">
                  {order.order_items && order.order_items[0]?.product?.name 
                    ? order.order_items[0].product.name 
                    : "Unknown Product"}
                </div>
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
