
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useProductContext } from "@/contexts/ProductContext";
import { useProductInfo } from "@/hooks/useProductInfo";
import { X } from "lucide-react";

export const ProductInfoModal = () => {
  const { selectedProductId, isModalOpen, closeModal } = useProductContext();
  const { data: product, isLoading } = useProductInfo(selectedProductId);

  return (
    <Dialog open={isModalOpen} onOpenChange={(open) => !open && closeModal()}>
      <DialogContent className="sm:max-w-md">
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
              {product.description && (
                <div className="mb-4 text-gray-700 whitespace-pre-line">
                  {typeof product.description === 'string' ? 
                    product.description : 
                    JSON.stringify(product.description)}
                </div>
              )}

              <div className="text-sm text-gray-500 mb-2">
                <div className="mb-1">Category: {product.category?.name || "Uncategorized"}</div>
                <div className="mb-1">In stock: {product.stock_quantity || 0}</div>
                <div>Price: ${product.price}</div>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Button 
                onClick={closeModal} 
                className="bg-red-500 hover:bg-red-600 text-white"
              >
                CLOSE
              </Button>
            </div>
          </>
        ) : (
          <div className="p-6 text-center text-gray-500">
            Product information not found
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
