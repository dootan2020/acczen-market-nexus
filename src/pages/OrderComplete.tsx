
import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ShoppingBag, ArrowRight, Download, Home, ClipboardList, Award } from 'lucide-react';
import TrustBadges from '@/components/trust/TrustBadges';
import { useOrderConfirmation } from '@/hooks/useOrderConfirmation';
import { useAuth } from '@/contexts/AuthContext';
import { useCurrencyContext } from '@/contexts/CurrencyContext';
import { useLoyalty } from '@/hooks/useLoyalty';
import { LoyaltyPointsResponse, TierUpgrade } from '@/types/loyalty';
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
  const [loyaltyPoints, setLoyaltyPoints] = useState<LoyaltyPointsResponse | null>(null);
  const { awardPoints, isProcessingPoints } = useLoyalty();

  useEffect(() => {
    if (orderData?.id && user?.id) {
      // Send order confirmation email when component mounts
      sendOrderConfirmationEmail(user.id, {
        id: orderData.id,
        items: orderData.items || [],
        total: orderData.total || 0,
        payment_method: orderData.payment_method || 'Account Balance',
        transaction_id: orderData.transaction_id,
        digital_items: orderData.digital_items || []
      });
      
      // Award loyalty points for purchase
      const awardLoyaltyPoints = async () => {
        try {
          if (orderData.total) {
            // Calculate points based on order total (1 point per $1)
            const points = Math.floor(orderData.total);
            
            if (points > 0) {
              const result = await awardPoints({
                points,
                transactionType: 'earned',
                referenceId: orderData.id,
                description: `Đơn hàng #${orderData.id.substring(0, 8)}`
              });
              
              setLoyaltyPoints(result);
            }
          }
        } catch (error) {
          console.error('Error awarding loyalty points:', error);
        }
      };
      
      awardLoyaltyPoints();
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
    
    // Add total
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.text(`Total: $${typeof orderData.total === 'number' ? orderData.total.toFixed(2) : orderData.total}`, 170, finalY, { align: 'right' });
    
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

  // Get tier color
  const getTierColor = (tierName: string | undefined): string => {
    if (!tierName) return '#3498DB';
    
    switch (tierName) {
      case 'Bronze':
        return '#CD7F32';
      case 'Silver':
        return '#C0C0C0';
      case 'Gold':
        return '#FFD700';
      case 'Platinum':
        return '#E5E4E2';
      default:
        return '#3498DB'; // Default blue
    }
  };
  
  // Get text color for tier
  const getTextColor = (tierName: string | undefined): string => {
    if (!tierName) return '#000';
    return ['Bronze', 'Gold'].includes(tierName) ? '#000' : '#fff';
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
                  
                  <div className="flex justify-between pt-4 border-t">
                    <p className="font-medium">Tổng tiền</p>
                    <p className="font-bold">{formatUSD(orderData.total)}</p>
                  </div>
                </div>
                
                {/* Loyalty points info */}
                {loyaltyPoints && loyaltyPoints.loyaltyInfo && (
                  <div className="mt-4 pt-4 border-t">
                    <div className="bg-primary/5 rounded-lg p-4 relative">
                      <div className="absolute top-0 right-0 flex items-center px-2.5 py-0.5 rounded-bl rounded-tr text-xs font-medium"
                        style={{ 
                          backgroundColor: getTierColor(loyaltyPoints.loyaltyInfo.current_tier_name),
                          color: getTextColor(loyaltyPoints.loyaltyInfo.current_tier_name)
                        }}
                      >
                        {loyaltyPoints.loyaltyInfo.current_tier_name}
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Award className="h-5 w-5 text-primary" />
                        <h3 className="font-medium">Điểm thành viên</h3>
                      </div>
                      
                      <div className="mt-3 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Điểm nhận được:</span>
                          <span className="font-bold text-lg text-primary">+{Math.floor(orderData.total)} điểm</span>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Tổng điểm hiện tại:</span>
                          <span className="font-medium">{loyaltyPoints.loyaltyInfo.loyalty_points} điểm</span>
                        </div>
                        
                        {loyaltyPoints.tierUpgrade && (
                          <div className="bg-amber-50 border border-amber-200 rounded p-3 mt-2">
                            <div className="flex items-center">
                              <div className="bg-amber-100 p-1.5 rounded-full mr-2">
                                <Award className="h-4 w-4 text-amber-600" />
                              </div>
                              <div>
                                <p className="font-medium text-amber-800">Chúc mừng! Bạn đã lên cấp!</p>
                                <p className="text-sm text-amber-700">
                                  Bạn đã được nâng cấp từ {loyaltyPoints.tierUpgrade.previousTier} lên {loyaltyPoints.tierUpgrade.newTier}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex justify-end mt-1">
                          <Button variant="link" className="text-sm p-0" asChild>
                            <a href="/dashboard/loyalty">
                              Xem chi tiết 
                              <ArrowRight className="h-3 w-3 ml-1" />
                            </a>
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                
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
