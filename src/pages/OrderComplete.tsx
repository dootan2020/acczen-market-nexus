
import React, { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ShoppingBag, ArrowRight, Download, Home, ClipboardList, Percent } from 'lucide-react';
import TrustBadges from '@/components/trust/TrustBadges';
import { useOrderConfirmation } from '@/hooks/useOrderConfirmation';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrencyContext } from '@/contexts/CurrencyContext';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const OrderComplete = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { formatUSD } = useCurrencyContext();
  const orderData = location.state?.orderData;
  const { sendOrderConfirmationEmail } = useOrderConfirmation();
  const pdfRef = useRef(null);

  useEffect(() => {
    if (orderData?.id && user?.id) {
      // Send order confirmation email when component mounts
      sendOrderConfirmationEmail(user.id, {
        id: orderData.id,
        items: orderData.items || [],
        total: orderData.total || 0,
        payment_method: orderData.payment_method || 'Account Balance',
        transaction_id: orderData.transaction_id,
        digital_items: orderData.digital_items || [],
        discount: orderData.discount || null
      });
    }
  }, [orderData, user]);

  const handleDownloadPDF = () => {
    if (!orderData) return;
    
    const doc = new jsPDF();
    
    // Add header
    doc.setFontSize(20);
    doc.setTextColor(46, 204, 113); // Primary color
    doc.text('Order Confirmation', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.setTextColor(51, 51, 51); // Text color
    doc.text(`Order #${orderData.id}`, 105, 30, { align: 'center' });
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 105, 37, { align: 'center' });
    
    // Add order details
    doc.setFontSize(14);
    doc.text('Order Summary', 14, 50);
    
    // Create order items table
    const tableColumn = ['Product', 'Quantity', 'Unit Price', 'Total'];
    const tableRows = orderData.items.map(item => [
      item.name,
      item.quantity,
      `$${typeof item.price === 'number' ? item.price.toFixed(2) : item.price}`,
      `$${typeof item.total === 'number' ? item.total.toFixed(2) : item.total}`
    ]);
    
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 55,
      theme: 'striped',
      styles: { fontSize: 10, cellPadding: 3 },
      headStyles: { fillColor: [46, 204, 113] }
    });
    
    // Add total and discount if applicable
    let finalY = (doc as any).lastAutoTable.finalY + 10;
    
    if (orderData.discount && orderData.discount.percentage > 0) {
      doc.text(`Subtotal: $${typeof orderData.total === 'number' ? 
        (Number(orderData.total) + Number(orderData.discount.amount)).toFixed(2) : 
        orderData.total}`, 170, finalY, { align: 'right' });
      
      finalY += 7;
      doc.setTextColor(46, 204, 113); // Green color for discount
      doc.text(`Discount (${orderData.discount.percentage}%): -$${
        typeof orderData.discount.amount === 'number' ? 
        orderData.discount.amount.toFixed(2) : 
        orderData.discount.amount
      }`, 170, finalY, { align: 'right' });
      
      finalY += 7;
      doc.setTextColor(51, 51, 51); // Reset to normal text color
      doc.text(`Total: $${typeof orderData.total === 'number' ? orderData.total.toFixed(2) : orderData.total}`, 170, finalY, { align: 'right' });
    } else {
      doc.text(`Total: $${typeof orderData.total === 'number' ? orderData.total.toFixed(2) : orderData.total}`, 170, finalY, { align: 'right' });
    }
    
    // Add digital items if available
    if (orderData.digital_items && orderData.digital_items.length > 0) {
      doc.text('Digital Products', 14, finalY + 15);
      
      let y = finalY + 20;
      orderData.digital_items.forEach((item: any, index: number) => {
        doc.text(`${index + 1}. ${item.name}`, 14, y);
        y += 7;
        
        if (item.keys && item.keys.length > 0) {
          item.keys.forEach((key: string) => {
            doc.text(`• ${key}`, 20, y);
            y += 7;
          });
        }
        
        y += 5;
      });
    }
    
    // Add footer
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.text('Thank you for your purchase!', 105, doc.internal.pageSize.height - 10, { align: 'center' });
    }
    
    // Save PDF
    doc.save(`order-${orderData.id}.pdf`);
  };

  return (
    <div className="container mx-auto py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <Card className="border-green-200 shadow-lg" ref={pdfRef}>
          <CardHeader className="text-center bg-green-50 border-b border-green-100 pb-6">
            <div className="mx-auto bg-green-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl md:text-3xl text-green-700">Đặt hàng thành công!</CardTitle>
            <CardDescription className="text-green-600 mt-2">
              Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được xử lý thành công.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            {orderData ? (
              <div className="space-y-6">
                <div className="flex justify-between items-center border-b pb-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Mã đơn hàng</p>
                    <p className="font-medium">{orderData.id}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Ngày</p>
                    <p className="font-medium">{new Date().toLocaleDateString()}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5" />
                    Thông tin đơn hàng
                  </h3>
                  
                  <div className="space-y-2">
                    {orderData.items && orderData.items.map((item: any, index: number) => (
                      <div key={index} className="flex justify-between">
                        <div>
                          <p>{item.name} × {item.quantity}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatUSD(item.price)} mỗi sản phẩm
                          </p>
                        </div>
                        <p className="font-medium">
                          {formatUSD(item.total)}
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  {orderData.discount && orderData.discount.percentage > 0 && (
                    <div className="flex justify-between pt-2 text-green-600">
                      <div className="flex items-center gap-1">
                        <Percent className="h-4 w-4" />
                        <p>Giảm giá ({orderData.discount.percentage}%)</p>
                      </div>
                      <p className="font-medium">-{formatUSD(orderData.discount.amount)}</p>
                    </div>
                  )}
                  
                  <div className="flex justify-between pt-4 border-t">
                    <p className="font-medium">Tổng tiền</p>
                    <p className="font-bold">{formatUSD(orderData.total)}</p>
                  </div>
                </div>
                
                {orderData.digital_items && orderData.digital_items.length > 0 && (
                  <div className="mt-6 pt-6 border-t">
                    <h3 className="font-medium mb-3">Sản phẩm số của bạn</h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      {orderData.digital_items.map((item: any, index: number) => (
                        <div key={index} className="mb-4 last:mb-0">
                          <p className="font-medium">{item.name}</p>
                          {item.keys && item.keys.length > 0 ? (
                            <div className="mt-2 space-y-1">
                              {item.keys.map((key: string, keyIndex: number) => (
                                <div key={keyIndex} className="bg-white p-2 rounded border text-sm font-mono">
                                  {key}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground mt-1">Không có key khả dụng</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <div className="pt-6">
                  <TrustBadges variant="compact" />
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Không có thông tin đơn hàng.</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-wrap gap-3 justify-between">
            <Button 
              variant="outline" 
              onClick={() => navigate('/dashboard/purchases')}
              className="flex-1 sm:flex-none"
            >
              <ClipboardList className="mr-2 h-4 w-4" />
              Lịch sử mua hàng
            </Button>
            
            <Button 
              variant="outline"
              onClick={handleDownloadPDF}
              className="flex-1 sm:flex-none"
            >
              <Download className="mr-2 h-4 w-4" />
              Tải PDF
            </Button>
            
            <Button 
              onClick={() => navigate('/')}
              className="flex-1 sm:flex-none"
            >
              <Home className="mr-2 h-4 w-4" />
              Trang chủ
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default OrderComplete;
