
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Copy, ExternalLink, Mail, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";
import { useCurrencyContext } from "@/contexts/CurrencyContext";
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
    [key: string]: any; // Allow for additional properties
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
  const [openOrderId, setOpenOrderId] = useState<string | null>(null);
  const [resendingEmailId, setResendingEmailId] = useState<string | null>(null);
  const { user } = useAuth();
  const { resendOrderConfirmationEmail } = useOrderConfirmation();
  const { convertVNDtoUSD, formatUSD } = useCurrencyContext();

  const handleOrderClick = (orderId: string) => {
    setOpenOrderId(orderId === openOrderId ? null : orderId);
  };

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Đã sao chép vào clipboard");
  };

  const handleResendConfirmationEmail = async (orderId: string) => {
    if (!user) {
      toast.error("Bạn cần đăng nhập để gửi lại email xác nhận");
      return;
    }

    setResendingEmailId(orderId);
    try {
      const result = await resendOrderConfirmationEmail(user.id, orderId);
      if (!result.success) {
        throw new Error(result.error?.message || "Failed to resend email");
      }
    } catch (error) {
      console.error("Error resending email:", error);
      toast.error("Không thể gửi lại email xác nhận");
    } finally {
      setResendingEmailId(null);
    }
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
                <TableCell>
                  {formatUSD(convertVNDtoUSD(order.total_amount))}
                </TableCell>
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
                      <div className="flex justify-between items-center mb-4">
                        <p className="font-medium">Order Details</p>
                        <div className="flex items-center gap-2">
                          <p className="text-xs text-muted-foreground">Order ID: {order.id}</p>
                          <Button
                            variant="outline"
                            size="sm"
                            className="h-8 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleResendConfirmationEmail(order.id);
                            }}
                            disabled={resendingEmailId === order.id}
                          >
                            {resendingEmailId === order.id ? (
                              <>
                                <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                                Sending...
                              </>
                            ) : (
                              <>
                                <Mail className="h-3 w-3 mr-1" />
                                Resend Email
                              </>
                            )}
                          </Button>
                        </div>
                      </div>
                      
                      {order.order_items.map((item) => (
                        <div key={item.id} className="mb-4 last:mb-0">
                          <div className="flex justify-between border-b py-2">
                            <span className="font-medium">{item.product?.name}</span>
                            <span>
                              {formatUSD(convertVNDtoUSD(item.price))} × {item.quantity}
                            </span>
                          </div>
                          
                          {/* Improved Product Keys Display */}
                          {item.data?.product_keys && item.data.product_keys.length > 0 && (
                            <Card className="mt-2 p-3">
                              <div className="flex flex-col space-y-2">
                                <div className="flex justify-between items-center">
                                  <p className="text-sm font-medium text-muted-foreground">
                                    Product Keys ({item.data.product_keys.length})
                                  </p>
                                  <Button 
                                    variant="ghost"
                                    size="sm"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleCopyToClipboard(item.data.product_keys.join('\n'));
                                    }}
                                  >
                                    <Copy className="h-4 w-4 mr-2" />
                                    Copy All
                                  </Button>
                                </div>
                                
                                {item.data.product_keys.map((key, index) => (
                                  <div 
                                    key={index} 
                                    className="flex items-center justify-between p-2 bg-muted/50 rounded-md hover:bg-muted transition-colors"
                                  >
                                    <code className="text-xs font-mono truncate">
                                      {key}
                                    </code>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleCopyToClipboard(key);
                                      }}
                                    >
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ))}
                              </div>
                            </Card>
                          )}
                          
                          {/* Display external order reference if available */}
                          {item.data?.taphoammo_order_id && (
                            <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                              <span>External Order:</span>
                              <code className="px-2 py-1 bg-muted rounded">
                                {item.data.taphoammo_order_id}
                              </code>
                            </div>
                          )}
                        </div>
                      ))}
                      
                      <div className="flex justify-between font-medium mt-4 pt-2 border-t">
                        <span>Total:</span>
                        <span>{formatUSD(convertVNDtoUSD(order.total_amount))}</span>
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
