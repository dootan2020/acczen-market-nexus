
import React, { useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useProductContext } from "@/contexts/ProductContext";
import { useProductInfo } from "@/hooks/useProductInfo";
import { X } from "lucide-react";
import { translate } from "@/utils/translateContent";

export const ProductInfoModal = () => {
  const { selectedProductId, isModalOpen, closeModal } = useProductContext();
  const { data, isLoading } = useProductInfo(selectedProductId);
  
  // Get the product and cleanDescription from data
  const product = data ? data : null;
  const cleanDescription = data?.cleanDescription || '';
  
  // Memoize translated content to prevent unnecessary re-renders
  const translations = useMemo(() => ({
    productInfo: translate('productInfo'),
    productDetails: translate('productDetails'),
    category: translate('category'),
    stock: translate('stock'),
    price: translate('price'),
    close: translate('close'),
    uncategorized: translate('uncategorized'),
    productNotFound: translate('productNotFound')
  }), []);

  return (
    <Dialog open={isModalOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="sm:max-w-xl md:max-w-2xl lg:max-w-3xl max-h-[90vh] overflow-auto">
        {isLoading ? (
          <div className="p-8 flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : product ? (
          <>
            <DialogHeader className="relative pb-4 border-b">
              <Button
                onClick={closeModal}
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0"
              >
                <X className="h-5 w-5" />
              </Button>
              <DialogTitle className="text-2xl font-semibold pr-8">{product.name}</DialogTitle>
            </DialogHeader>
            
            <div className="py-6 space-y-8">
              {/* Product Description */}
              {cleanDescription && (
                <div className="space-y-4">
                  <h3 className="text-xl font-medium">{translations.productInfo}</h3>
                  <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                    {cleanDescription}
                  </div>
                </div>
              )}
              
              {/* Product Details Card */}
              <div className="bg-gray-50 rounded-lg p-5 mt-6 border">
                <h3 className="text-lg font-medium mb-4">{translations.productDetails}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-white rounded border">
                    <div className="text-sm text-gray-500">{translations.category}</div>
                    <div className="font-medium">{product.category?.name || translations.uncategorized}</div>
                  </div>
                  
                  <div className="p-3 bg-white rounded border">
                    <div className="text-sm text-gray-500">{translations.stock}</div>
                    <div className="font-medium">{product.stock_quantity || 0}</div>
                  </div>
                  
                  <div className="p-3 bg-white rounded border">
                    <div className="text-sm text-gray-500">{translations.price}</div>
                    <div className="font-medium text-green-600">${product.price}</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-center pt-4 border-t mt-4">
              <Button 
                onClick={closeModal} 
                className="w-full md:w-auto px-8"
              >
                {translations.close}
              </Button>
            </div>
          </>
        ) : (
          <div className="p-6 text-center text-gray-500">
            {translations.productNotFound}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
