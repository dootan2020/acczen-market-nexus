
import React from 'react';
import { PurchaseCard } from './PurchaseCard';
import { useOrderConfirmation } from "@/hooks/useOrderConfirmation";
import { useAuth } from "@/contexts/AuthContext";

interface Product {
  id: string;
  name: string;
  price: number;
}

interface OrderItem {
  id: string;
  product: Product;
  quantity: number;
  price: number;
  total: number;
  data?: {
    product_keys?: string[];
    kiosk_token?: string;
    taphoammo_order_id?: string;
    [key: string]: any;
  } | null;
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
  return (
    <div className="space-y-4">
      {orders.map((order) => (
        order.order_items.map((item) => (
          <PurchaseCard
            key={`${order.id}-${item.id}`}
            id={order.id}
            date={order.created_at}
            productName={item.product.name}
            status={order.status}
            price={item.price}
            productKeys={item.data?.product_keys}
          />
        ))
      ))}
    </div>
  );
};
