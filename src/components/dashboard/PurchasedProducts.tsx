
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Loader, Search, Check, X, Clock } from 'lucide-react';

interface PurchasedProduct {
  id: string;
  order_id: string;
  created_at: string;
  product: {
    name: string;
    image_url: string;
  };
  quantity: number;
  price: number;
  total: number;
  data?: {
    taphoammo_order_id?: string;
    product_keys?: string[];
  };
}

const PurchasedProducts = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [showKeys, setShowKeys] = useState<Record<string, boolean>>({});

  // Fetch purchased products
  const { data: purchasedProducts, isLoading } = useQuery({
    queryKey: ['purchased-products', user?.id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('order_items')
        .select(`
          id,
          order_id,
          created_at,
          product:products(name, image_url),
          quantity,
          price,
          total,
          data
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as PurchasedProduct[];
    },
    enabled: !!user
  });

  // Toggle showing product keys
  const toggleShowKeys = (id: string) => {
    setShowKeys(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Filter products by search term
  const filteredProducts = purchasedProducts?.filter(item =>
    item.product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (item.data?.taphoammo_order_id || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Purchased Products</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : filteredProducts && filteredProducts.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Date</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-center">Keys</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProducts.map((item) => (
                <React.Fragment key={item.id}>
                  <TableRow>
                    <TableCell>
                      <div className="flex items-center">
                        {item.product.image_url && (
                          <img
                            src={item.product.image_url}
                            alt={item.product.name}
                            className="h-10 w-10 object-cover rounded mr-3"
                          />
                        )}
                        <div>
                          <div className="font-medium">{item.product.name}</div>
                          <div className="text-sm text-muted-foreground">
                            Qty: {item.quantity}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {new Date(item.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      ${item.price.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-center">
                      {item.data?.product_keys?.length ? (
                        <div className="flex flex-col items-center">
                          <Badge variant="outline" className="mb-1">
                            {item.data.product_keys.length} keys
                          </Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => toggleShowKeys(item.id)}
                          >
                            {showKeys[item.id] ? 'Hide Keys' : 'Show Keys'}
                          </Button>
                        </div>
                      ) : item.data?.taphoammo_order_id ? (
                        <Badge variant="secondary">
                          <Clock className="h-3 w-3 mr-1" />
                          Processing
                        </Badge>
                      ) : (
                        <Badge variant="outline">No keys</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                  {showKeys[item.id] && item.data?.product_keys?.length && (
                    <TableRow>
                      <TableCell colSpan={4} className="bg-muted/30">
                        <div className="p-2">
                          <h4 className="text-sm font-medium mb-2">Product Keys</h4>
                          <div className="grid gap-2">
                            {item.data.product_keys.map((key, index) => (
                              <div key={index} className="bg-muted p-2 rounded text-sm font-mono">
                                {key}
                              </div>
                            ))}
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            No purchased products found.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PurchasedProducts;
