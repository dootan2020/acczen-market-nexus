
import React, { useState } from 'react';
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Search } from "lucide-react";

const PAGE_SIZE = 10;

const PurchasesPage = () => {
  const { user } = useAuth();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [openOrderId, setOpenOrderId] = useState<string | null>(null);

  // Fetch orders with pagination
  const { data, isLoading, error } = useQuery({
    queryKey: ['purchases', page, search],
    queryFn: async () => {
      let query = supabase
        .from('orders')
        .select(`
          id,
          total_amount,
          status,
          created_at,
          order_items (
            id,
            product:products(id, name, price)
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (search) {
        query = query.or(`order_items.product.name.ilike.%${search}%`);
      }

      // Add pagination
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;
      
      // First get the count - using the correct pattern for count queries
      const countQuery = supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user?.id);
        
      if (search) {
        countQuery.or(`order_items.product.name.ilike.%${search}%`);
      }
      
      const { count } = await countQuery.count();
      
      // Then fetch the paginated data
      const { data: orders, error } = await query.range(from, to);
      
      if (error) throw error;
      
      return { orders, count };
    },
    enabled: !!user,
  });

  const totalPages = data?.count ? Math.ceil(data.count / PAGE_SIZE) : 0;

  const formatStatus = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const handleOrderClick = (orderId: string) => {
    setOpenOrderId(orderId === openOrderId ? null : orderId);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Purchases</CardTitle>
          <CardDescription>View and manage your order history</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-8">
          <p>Loading your purchase history...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Purchases</CardTitle>
          <CardDescription>View and manage your order history</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-8">
          <p className="text-red-500">Error loading purchases. Please try again later.</p>
        </CardContent>
      </Card>
    );
  }

  if (!data?.orders?.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Purchases</CardTitle>
          <CardDescription>View and manage your order history</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-8">
          <p>You haven't made any purchases yet. Browse our products to get started!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Your Purchases</CardTitle>
          <CardDescription>View and manage your order history</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Search Bar */}
          <div className="flex items-center mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="search"
                placeholder="Search products..."
                className="pl-8"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              onClick={() => setSearch("")}
              className="ml-2"
            >
              Clear
            </Button>
          </div>

          {/* Orders Table */}
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
                {data.orders.map((order) => (
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

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination className="mt-4">
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      if (page > 1) setPage(page - 1);
                    }}
                    aria-disabled={page === 1}
                    tabIndex={page === 1 ? -1 : undefined}
                    className={page === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
                
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <PaginationItem key={pageNum}>
                      <PaginationLink 
                        href="#" 
                        onClick={(e) => {
                          e.preventDefault();
                          setPage(pageNum);
                        }}
                        isActive={pageNum === page}
                      >
                        {pageNum}
                      </PaginationLink>
                    </PaginationItem>
                  );
                })}
                
                <PaginationItem>
                  <PaginationNext 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      if (page < totalPages) setPage(page + 1);
                    }}
                    aria-disabled={page === totalPages}
                    tabIndex={page === totalPages ? -1 : undefined}
                    className={page === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PurchasesPage;
