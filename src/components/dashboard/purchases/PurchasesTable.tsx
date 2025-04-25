
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Product {
  id: string;
  name: string;
  price: number;
}

interface OrderItem {
  id: string;
  product: Product;
}

interface Order {
  id: string;
  total_amount: number;
  status: string;
  created_at: string;
  order_items: OrderItem[];
}

interface PurchasesTableProps {
  orders: Order[];
}

export const PurchasesTable = ({ orders }: PurchasesTableProps) => {
  const [openOrderId, setOpenOrderId] = useState<string | null>(null);

  const handleOrderClick = (orderId: string) => {
    setOpenOrderId(orderId === openOrderId ? null : orderId);
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {orders.map((order) => (
            <React.Fragment key={order.id}>
              <TableRow 
                className="cursor-pointer hover:bg-muted/60"
                onClick={() => handleOrderClick(order.id)}
              >
                <TableCell>
                  {new Date(order.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {order.order_items[0]?.product?.name || "Multiple Products"}
                  {order.order_items.length > 1 && ` + ${order.order_items.length - 1} more`}
                </TableCell>
                <TableCell>${order.total_amount}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    order.status === 'completed' ? 'bg-green-100 text-green-800' : 
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {formatStatus(order.status)}
                  </span>
                </TableCell>
              </TableRow>
              {openOrderId === order.id && (
                <TableRow className="bg-muted/30">
                  <TableCell colSpan={4} className="p-4">
                    <div className="text-sm">
                      <p className="font-medium mb-2">Order Details</p>
                      {order.order_items.map((item) => (
                        <div key={item.id} className="flex justify-between border-b py-1 last:border-0">
                          <span>{item.product?.name}</span>
                          <span>${item.product?.price}</span>
                        </div>
                      ))}
                      <div className="flex justify-between font-medium mt-2">
                        <span>Total:</span>
                        <span>${order.total_amount}</span>
                      </div>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
