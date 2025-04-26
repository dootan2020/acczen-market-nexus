
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  Copy,
  ExternalLink,
  Loader2,
  RefreshCw,
  ShoppingBag
} from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import {
  Alert,
  AlertDescription,
  AlertTitle
} from "@/components/ui/alert";

// Define more specific types for the data property
interface OrderItemData {
  product_keys?: string[];
  kiosk_token?: string;
  taphoammo_order_id?: string;
}

interface OrderItem {
  id: string;
  product: {
    id: string;
    name: string;
    price: number;
  };
  quantity: number;
  price: number;
  total: number;
  data?: OrderItemData; // Use the specific type
}

interface Order {
  id: string;
  created_at: string;
  status: string;
  total_amount: number;
  items: OrderItem[];
}

const OrderDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const fetchOrderDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      if (!id) {
        throw new Error("Order ID is required");
      }

      const { data, error } = await supabase
        .from("orders")
        .select(`
          id,
          created_at,
          status,
          total_amount,
          items:order_items (
            id,
            product:products(id, name, price),
            quantity,
            price,
            total,
            data
          )
        `)
        .eq("id", id)
        .single();

      if (error) {
        throw error;
      }

      // Transform the data to match our Order type
      const orderData: Order = {
        id: data.id,
        created_at: data.created_at,
        status: data.status,
        total_amount: data.total_amount,
        items: data.items.map((item: any) => ({
          ...item,
          data: item.data as OrderItemData // Cast to our specific type
        }))
      };

      setOrder(orderData);
    } catch (err) {
      console.error("Error fetching order:", err);
      setError(err instanceof Error ? err.message : "Failed to load order details");
    } finally {
      setLoading(false);
    }
  };

  const refreshOrderStatus = async () => {
    try {
      setRefreshing(true);
      
      // Call the edge function to check the order status
      const { data, error } = await supabase.functions.invoke('process-taphoammo-order', {
        body: JSON.stringify({
          action: 'check_order',
          orderId: order?.items?.[0]?.data?.taphoammo_order_id
        })
      });
      
      if (error) {
        throw new Error(error.message);
      }
      
      if (data.success) {
        // Refresh the order details
        await fetchOrderDetails();
        
        toast({
          title: "Cập nhật thành công",
          description: "Thông tin đơn hàng đã được cập nhật",
        });
      } else {
        throw new Error(data.message || "Không thể cập nhật trạng thái đơn hàng");
      }
    } catch (err) {
      console.error("Error refreshing order:", err);
      toast({
        title: "Lỗi cập nhật",
        description: err instanceof Error ? err.message : "Lỗi không xác định khi cập nhật đơn hàng",
        variant: "destructive",
      });
    } finally {
      setRefreshing(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        toast({
          title: "Đã sao chép",
          description: "Thông tin đã được sao chép vào clipboard",
        });
      })
      .catch((err) => {
        console.error("Failed to copy:", err);
        toast({
          title: "Lỗi sao chép",
          description: "Không thể sao chép nội dung",
          variant: "destructive",
        });
      });
  };

  if (loading) {
    return (
      <div className="container py-10 flex flex-col items-center justify-center">
        <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
        <h2 className="text-xl font-medium">Đang tải thông tin đơn hàng...</h2>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="container py-8">
        <div className="max-w-3xl mx-auto bg-muted p-6 rounded-lg text-center shadow-sm">
          <AlertTriangle className="w-12 h-12 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Không tìm thấy đơn hàng</h2>
          <p className="text-muted-foreground mb-6">
            {error || "Đơn hàng bạn đang tìm kiếm không tồn tại hoặc đã bị xóa."}
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild variant="outline">
              <Link to="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Trang tổng quan
              </Link>
            </Button>
            <Button asChild>
              <Link to="/products">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Tiếp tục mua sắm
              </Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(order.created_at).toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const isPending = order.status === "pending" || order.status === "processing";

  return (
    <div className="container py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Chi tiết đơn hàng</h1>
            <p className="text-muted-foreground">Mã đơn: {id}</p>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Link>
          </Button>
        </div>

        <div className="grid gap-6">
          {/* Order Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center">
                <div className={`mr-2 h-3 w-3 rounded-full ${isPending ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                <span>Trạng thái đơn hàng: {isPending ? "Đang xử lý" : "Hoàn thành"}</span>
              </CardTitle>
              <CardDescription>
                Ngày đặt hàng: {formattedDate}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-3">
              {isPending && (
                <Alert className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>Đơn hàng đang được xử lý</AlertTitle>
                  <AlertDescription>
                    Hệ thống đang xử lý đơn hàng của bạn. Vui lòng đợi trong giây lát hoặc nhấn nút "Cập nhật trạng thái" để kiểm tra.
                  </AlertDescription>
                </Alert>
              )}
              {!isPending && order.items[0]?.data?.product_keys?.length > 0 && (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertTitle>Đơn hàng đã hoàn thành</AlertTitle>
                  <AlertDescription>
                    Đơn hàng đã được xử lý thành công. Vui lòng kiểm tra thông tin sản phẩm bên dưới.
                  </AlertDescription>
                </Alert>
              )}
              {isPending && (
                <div className="flex justify-center mt-4">
                  <Button 
                    onClick={refreshOrderStatus} 
                    disabled={refreshing}
                    className="flex items-center gap-2"
                  >
                    {refreshing ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Đang cập nhật...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4" />
                        Cập nhật trạng thái
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Order Items and Total */}
          <Card>
            <CardHeader>
              <CardTitle>Chi tiết sản phẩm</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sản phẩm</TableHead>
                    <TableHead className="text-right">Đơn giá</TableHead>
                    <TableHead className="text-center">SL</TableHead>
                    <TableHead className="text-right">Thành tiền</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {order.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">
                        {item.product.name}
                      </TableCell>
                      <TableCell className="text-right">
                        {new Intl.NumberFormat('vi-VN', { 
                          style: 'currency', 
                          currency: 'VND' 
                        }).format(item.price)}
                      </TableCell>
                      <TableCell className="text-center">{item.quantity}</TableCell>
                      <TableCell className="text-right">
                        {new Intl.NumberFormat('vi-VN', { 
                          style: 'currency', 
                          currency: 'VND'
                        }).format(item.total)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              <div className="flex justify-end mt-4 border-t pt-4">
                <div className="text-right">
                  <div className="flex items-center justify-between gap-8">
                    <span className="font-medium">Tổng thanh toán:</span>
                    <span className="font-bold text-lg text-primary">
                      {new Intl.NumberFormat('vi-VN', { 
                        style: 'currency', 
                        currency: 'VND' 
                      }).format(order.total_amount)}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Product Keys (if available) */}
          {order.items.map((item, index) => {
            if (!item.data || !item.data.product_keys || item.data.product_keys.length === 0) {
              return null;
            }

            return (
              <Card key={`keys-${item.id}`}>
                <CardHeader>
                  <CardTitle>Thông tin sản phẩm</CardTitle>
                  <CardDescription>
                    {item.product.name} x {item.quantity}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {item.data.product_keys.map((key, keyIndex) => (
                    <div 
                      key={`key-${keyIndex}`} 
                      className="p-3 bg-muted rounded-md flex justify-between"
                    >
                      <div className="font-mono text-sm overflow-auto whitespace-pre-wrap break-all">
                        {key}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => copyToClipboard(key)}
                        className="ml-2 flex-shrink-0"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button variant="outline" size="sm" onClick={() => copyToClipboard(item.data?.product_keys?.join('\n') || '')}>
                    <Copy className="mr-2 h-4 w-4" />
                    Sao chép tất cả
                  </Button>
                </CardFooter>
              </Card>
            );
          })}

          {/* Actions */}
          <div className="flex justify-between mt-4">
            <Button asChild variant="outline">
              <Link to="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Quay lại bảng điều khiển
              </Link>
            </Button>
            <Button asChild>
              <Link to="/products">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Tiếp tục mua sắm
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
