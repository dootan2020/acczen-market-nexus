import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader, Search, Check, X, RefreshCw, Link } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useTaphoammoAPI } from "@/hooks/useTaphoammoAPI";

interface Product {
  id: string;
  name: string;
  price: number;
  stock_quantity: number;
  kiosk_token?: string;
}

interface MockProduct {
  id: string;
  kiosk_token: string;
  name: string;
  price: number;
  stock_quantity: number;
  updated_at: string;
}

interface OrderItem {
  id: string;
  order_id: string;
  data: {
    taphoammo_order_id: string;
    product_keys: string[];
  };
  product: {
    name: string;
  };
  created_at: string;
}

const ProductIntegration = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterKiosk, setFilterKiosk] = useState("");
  const queryClient = useQueryClient();
  const { getStock } = useTaphoammoAPI();

  const { 
    data: mockProducts, 
    isLoading: loadingMockProducts,
    refetch: refetchMockProducts
  } = useQuery({
    queryKey: ['taphoammo-products'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('taphoammo_mock_products')
        .select('*')
        .order('name');
      
      if (error) throw new Error(error.message);
      return data as MockProduct[];
    }
  });

  const { 
    data: products, 
    isLoading: loadingProducts 
  } = useQuery({
    queryKey: ['products-admin'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('id, name, price, stock_quantity, kiosk_token')
        .order('name');
      
      if (error) throw new Error(error.message);
      return data as Product[];
    }
  });

  const {
    data: orderItems,
    isLoading: loadingOrders,
    refetch: refetchOrders
  } = useQuery({
    queryKey: ['taphoammo-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('order_items')
        .select(`
          id,
          order_id,
          data,
          product:products(name),
          created_at
        `)
        .not('data', 'is', null)
        .order('created_at', { ascending: false });
      
      if (error) throw new Error(error.message);
      return data as OrderItem[];
    }
  });

  const linkProductMutation = useMutation({
    mutationFn: async ({ productId, kioskToken }: { productId: string, kioskToken: string }) => {
      const { error } = await supabase
        .from('products')
        .update({ kiosk_token: kioskToken })
        .eq('id', productId);
      
      if (error) throw new Error(error.message);
      
      return { productId, kioskToken };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products-admin'] });
      toast.success('Product linked successfully');
    },
    onError: (error) => {
      toast.error(`Failed to link product: ${error.message}`);
    }
  });

  const unlinkProductMutation = useMutation({
    mutationFn: async (productId: string) => {
      const { error } = await supabase
        .from('products')
        .update({ kiosk_token: null })
        .eq('id', productId);
      
      if (error) throw new Error(error.message);
      
      return productId;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products-admin'] });
      toast.success('Product unlinked successfully');
    },
    onError: (error) => {
      toast.error(`Failed to unlink product: ${error.message}`);
    }
  });

  const updateStockMutation = useMutation({
    mutationFn: async ({ kioskToken }: { kioskToken: string }) => {
      try {
        const product = await getStock(kioskToken, 'admin');
        
        const { error: mockError } = await supabase
          .from('taphoammo_mock_products')
          .update({
            price: product.price,
            stock_quantity: product.stock_quantity
          })
          .eq('kiosk_token', kioskToken);
        
        if (mockError) throw new Error(mockError.message);
        
        const { data: linkedProducts } = await supabase
          .from('products')
          .select('id')
          .eq('kiosk_token', kioskToken);
        
        if (linkedProducts && linkedProducts.length > 0) {
          const { error: linkedError } = await supabase
            .from('products')
            .update({
              price: product.price,
              stock_quantity: product.stock_quantity
            })
            .eq('kiosk_token', kioskToken);
          
          if (linkedError) throw new Error(linkedError.message);
        }
        
        return product;
      } catch (error) {
        console.error('Error updating stock:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['taphoammo-products'] });
      queryClient.invalidateQueries({ queryKey: ['products-admin'] });
      toast.success('Stock updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update stock: ${error.message}`);
    }
  });

  const syncAllMutation = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke('sync-taphoammo');
      
      if (error) throw new Error(error.message);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['taphoammo-products'] });
      queryClient.invalidateQueries({ queryKey: ['products-admin'] });
      toast.success(`Synced ${data.updated} products successfully`);
      
      if (data.errors.length > 0) {
        toast.warning(`${data.errors.length} errors occurred during sync`);
      }
    },
    onError: (error) => {
      toast.error(`Failed to sync products: ${error.message}`);
    }
  });

  const filteredMockProducts = mockProducts?.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) && 
    (filterKiosk === "" || product.kiosk_token.includes(filterKiosk))
  );

  return (
    <div className="container py-6">
      <h1 className="text-2xl font-bold mb-6">Product API Integration</h1>
      
      <Tabs defaultValue="products">
        <TabsList className="mb-6">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Order History</TabsTrigger>
        </TabsList>
        
        <TabsContent value="products">
          <div className="flex justify-between items-center mb-4">
            <div className="flex gap-4">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Input
                placeholder="Filter by kiosk token"
                value={filterKiosk}
                onChange={(e) => setFilterKiosk(e.target.value)}
              />
            </div>
            <Button 
              onClick={() => syncAllMutation.mutate()} 
              disabled={syncAllMutation.isPending}
            >
              {syncAllMutation.isPending ? (
                <>
                  <Loader className="mr-2 h-4 w-4 animate-spin" />
                  Syncing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Sync All Products
                </>
              )}
            </Button>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>API Products</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingMockProducts || loadingProducts ? (
                <div className="flex justify-center py-8">
                  <Loader className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Kiosk Token</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Stock</TableHead>
                      <TableHead>Linked Product</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMockProducts?.map((mockProduct) => {
                      const linkedProduct = products?.find(p => p.kiosk_token === mockProduct.kiosk_token);
                      
                      return (
                        <TableRow key={mockProduct.id}>
                          <TableCell>{mockProduct.name}</TableCell>
                          <TableCell>
                            <code className="text-xs bg-muted px-1 py-0.5 rounded">
                              {mockProduct.kiosk_token}
                            </code>
                          </TableCell>
                          <TableCell className="text-right">${mockProduct.price.toFixed(2)}</TableCell>
                          <TableCell className="text-right">
                            <Badge variant={mockProduct.stock_quantity > 10 ? "outline" : mockProduct.stock_quantity > 0 ? "secondary" : "destructive"}>
                              {mockProduct.stock_quantity}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {linkedProduct ? (
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="bg-green-50">
                                  <Check className="h-3 w-3 mr-1 text-green-500" />
                                  {linkedProduct.name}
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => unlinkProductMutation.mutate(linkedProduct.id)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <select
                                className="border p-1 rounded text-sm"
                                defaultValue=""
                                onChange={(e) => {
                                  if (e.target.value) {
                                    linkProductMutation.mutate({
                                      productId: e.target.value,
                                      kioskToken: mockProduct.kiosk_token
                                    });
                                  }
                                }}
                              >
                                <option value="">Link to product</option>
                                {products
                                  ?.filter(p => !p.kiosk_token)
                                  .map(p => (
                                    <option key={p.id} value={p.id}>
                                      {p.name}
                                    </option>
                                  ))}
                              </select>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => updateStockMutation.mutate({ kioskToken: mockProduct.kiosk_token })}
                              disabled={updateStockMutation.isPending}
                            >
                              {updateStockMutation.isPending ? (
                                <Loader className="h-3 w-3 animate-spin" />
                              ) : (
                                <RefreshCw className="h-3 w-3 mr-2" />
                              )}
                              Update
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="orders">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">API Order History</h2>
            <Button 
              variant="outline" 
              onClick={() => refetchOrders()}
              disabled={loadingOrders}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Refresh
            </Button>
          </div>
          
          <Card>
            <CardContent className="pt-6">
              {loadingOrders ? (
                <div className="flex justify-center py-8">
                  <Loader className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : orderItems && orderItems.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Order ID</TableHead>
                      <TableHead>Product</TableHead>
                      <TableHead>API Order ID</TableHead>
                      <TableHead>Keys</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {orderItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          {new Date(item.created_at).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-1 py-0.5 rounded">
                            {item.order_id?.substring(0, 8)}...
                          </code>
                        </TableCell>
                        <TableCell>
                          {item.product?.name || "Unknown product"}
                        </TableCell>
                        <TableCell>
                          {item.data?.taphoammo_order_id || "N/A"}
                        </TableCell>
                        <TableCell>
                          {item.data?.product_keys?.length || 0} keys
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  No order history found
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductIntegration;
