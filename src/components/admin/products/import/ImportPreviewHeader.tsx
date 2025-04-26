
import React from 'react';
import { ExtendedProduct } from '@/pages/admin/ProductsImport';

interface ImportPreviewHeaderProps {
  product: ExtendedProduct;
}

export default function ImportPreviewHeader({ product }: ImportPreviewHeaderProps) {
  return (
    <>
      <h2 className="text-xl font-semibold mb-4">Xem trước và chỉnh sửa thông tin sản phẩm</h2>
      <div className="bg-muted/50 p-4 rounded-md mb-6">
        <h3 className="font-medium mb-2">Thông tin từ TaphoaMMO API:</h3>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <span className="text-sm text-muted-foreground">Tên sản phẩm:</span>
            <p className="font-medium">{product.name}</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Giá gốc:</span>
            <p className="font-medium">{product.price.toLocaleString('vi-VN')} VND</p>
          </div>
          <div>
            <span className="text-sm text-muted-foreground">Tồn kho:</span>
            <p className="font-medium">{product.stock_quantity} sản phẩm</p>
          </div>
          <div className="col-span-3">
            <span className="text-sm text-muted-foreground">Kiosk Token:</span>
            <p className="font-medium">{product.kiosk_token}</p>
          </div>
        </div>
      </div>
    </>
  );
}
