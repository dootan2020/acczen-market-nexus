
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useProductContext } from "@/contexts/ProductContext";
import { useProductInfo } from "@/hooks/useProductInfo";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { X, Info, HelpCircle, ShieldCheck } from "lucide-react";

export const ProductInfoModal = () => {
  const { selectedProductId, isModalOpen, closeModal } = useProductContext();
  const { data, isLoading } = useProductInfo(selectedProductId);
  
  // Get the product and cleanDescription from data
  const product = data ? data : null;
  const cleanDescription = data?.cleanDescription || '';
  
  // Default content for tabs that might not have specific data
  const usageGuide = "Sản phẩm này sẵn sàng để sử dụng ngay sau khi mua. Vui lòng làm theo các hướng dẫn được gửi qua email để kích hoạt sản phẩm. Nếu bạn gặp bất kỳ vấn đề nào, hãy liên hệ với bộ phận hỗ trợ của chúng tôi.";
  const warrantyInfo = "Tất cả sản phẩm số của chúng tôi đều có bảo hành 48 giờ cho các vấn đề kỹ thuật. Chúng tôi cung cấp hỗ trợ kỹ thuật trong 30 ngày sau khi mua hàng. Liên hệ với chúng tôi qua email hỗ trợ để được trợ giúp.";

  return (
    <Dialog open={isModalOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="sm:max-w-md md:max-w-lg max-h-[80vh] overflow-auto">
        {isLoading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : product ? (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl font-semibold">{product.name}</DialogTitle>
            </DialogHeader>
            
            <div className="py-4">
              <Tabs defaultValue="info" className="w-full">
                <TabsList className="w-full grid grid-cols-3">
                  <TabsTrigger value="info" className="flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    <span>Thông tin</span>
                  </TabsTrigger>
                  <TabsTrigger value="usage" className="flex items-center gap-2">
                    <HelpCircle className="h-4 w-4" />
                    <span>Hướng dẫn</span>
                  </TabsTrigger>
                  <TabsTrigger value="warranty" className="flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" />
                    <span>Bảo hành</span>
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="info" className="mt-4">
                  <div className="space-y-4">
                    <div className="text-gray-700 whitespace-pre-line">
                      {cleanDescription}
                    </div>
                    
                    <div className="text-sm text-gray-500 mt-4">
                      <div className="grid grid-cols-2 gap-2">
                        <div>Danh mục:</div>
                        <div className="font-medium">{product.category?.name || "Chưa phân loại"}</div>
                        
                        <div>Số lượng còn lại:</div>
                        <div className="font-medium">{product.stock_quantity || 0}</div>
                        
                        <div>Giá:</div>
                        <div className="font-medium text-green-600">${product.price}</div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="usage" className="mt-4">
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg">Hướng dẫn sử dụng</h3>
                    <div className="text-gray-700">
                      {usageGuide}
                    </div>
                    <div className="bg-blue-50 p-3 rounded-md text-blue-800 text-sm">
                      <p>Lưu ý: Hướng dẫn chi tiết sẽ được gửi qua email sau khi mua hàng.</p>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="warranty" className="mt-4">
                  <div className="space-y-4">
                    <h3 className="font-medium text-lg">Chính sách bảo hành</h3>
                    <div className="text-gray-700">
                      {warrantyInfo}
                    </div>
                    <div className="bg-green-50 p-3 rounded-md text-green-800 text-sm flex items-start gap-2">
                      <ShieldCheck className="h-5 w-5 shrink-0 mt-0.5" />
                      <p>Cam kết hoàn tiền 100% nếu sản phẩm không hoạt động trong 48 giờ đầu tiên.</p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            <div className="mt-4 flex justify-end">
              <Button 
                onClick={closeModal} 
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                <X className="mr-2 h-4 w-4" /> ĐÓNG
              </Button>
            </div>
          </>
        ) : (
          <div className="p-6 text-center text-gray-500">
            Không tìm thấy thông tin sản phẩm
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
