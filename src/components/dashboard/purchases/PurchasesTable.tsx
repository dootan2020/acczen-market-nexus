
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { PurchaseCard } from './PurchaseCard';
import { OrderRow } from '@/types/orders';
import { Button } from '@/components/ui/button';

interface PurchasesTableProps {
  orders: OrderRow[];
}

export const PurchasesTable = ({ orders }: PurchasesTableProps) => {
  if (!orders || orders.length === 0) {
    return (
      <div className="text-center py-8 bg-muted/20 rounded-md">
        <p>No purchases found matching your search criteria</p>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      {orders.map((order) => (
        <div key={order.id} className="border rounded-lg p-4 bg-card">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">Order #{order.id.substring(0, 8)}</h3>
            <div className="text-sm text-muted-foreground">
              {new Date(order.created_at).toLocaleDateString()}
            </div>
          </div>
          
          <div className="space-y-3">
            {order.order_items.map((item) => (
              <PurchaseCard
                key={`${order.id}-${item.id}`}
                id={order.id}
                date={order.created_at}
                productName={item.product?.name || 'Unknown Product'}
                status={order.status}
                price={item.price}
                productKeys={item.data?.product_keys}
              />
            ))}
          </div>
          
          <div className="flex justify-between items-center mt-3 pt-2 border-t">
            <div>
              <span className="text-sm font-medium">Total: </span>
              <span className="font-medium">${Number(order.total_amount).toFixed(2)}</span>
            </div>
            <Button asChild variant="ghost" size="sm">
              <Link to={`/orders/${order.id}`} className="flex items-center">
                View Details
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
};
