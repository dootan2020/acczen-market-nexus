import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Check, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ExtendedProduct } from '@/pages/admin/ProductsImport';

interface ImportConfirmationProps {
  product: ExtendedProduct;
  onPrevious: () => void;
  onComplete: () => void;
}

export default function ImportConfirmation({ product, onPrevious, onComplete }: ImportConfirmationProps) {
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{success: boolean; message: string} | null>(null);
  
  const handleImport = async () => {
    setImporting(true);
    setResult(null);
    
    try {
      // Convert product to database format
      const productToInsert = {
        name: product.name,
        description: product.description || '',
        category_id: product.category_id || null,
        price: product.price,
        sale_price: product.selling_price !== product.price ? product.selling_price : null,
        stock_quantity: product.stock_quantity,
        status: product.status,
        image_url: product.image_url || null,
        kiosk_token: product.kiosk_token,
        slug: product.slug,
        sku: product.sku
      };
      
      // Check if a product with this kiosk_token already exists
      const { data: existingProduct } = await supabase
        .from('products')
        .select('id')
        .eq('kiosk_token', product.kiosk_token)
        .single();
        
      let response;
      
      if (existingProduct) {
        // Update existing product
        response = await supabase
          .from('products')
          .update(productToInsert)
          .eq('id', existingProduct.id);
          
        if (response.error) throw new Error(response.error.message);
        
        setResult({
          success: true,
          message: `Đã cập nhật sản phẩm "${product.name}" thành công!`
        });
      } else {
        // Insert new product
        response = await supabase
          .from('products')
          .insert(productToInsert);
          
        if (response.error) throw new Error(response.error.message);
        
        setResult({
          success: true,
          message: `Đã thêm sản phẩm "${product.name}" thành công!`
        });
      }
      
      toast.success(result?.message || 'Đã import thành công!');
    } catch (error) {
      console.error('Import error:', error);
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Lỗi không xác định khi import sản phẩm'
      });
      toast.error(`Lỗi: ${result?.message || 'Không thể import sản phẩm'}`);
    } finally {
      setImporting(false);
    }
  };
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Xác nhận thông tin sản phẩm</h2>
      
      <div className="bg-card border rounded-lg p-6 mb-6">
        <div className="grid grid-cols-2 gap-x-4 gap-y-3">
          <div>
            <span className="text-sm text-muted-foreground">Tên sản phẩm:</span>
            <p className="font-medium">{product.name}</p>
          </div>
          
          <div>
            <span className="text-sm text-muted-foreground">SKU:</span>
            <p className="font-medium">{product.sku}</p>
          </div>
          
          <div>
            <span className="text-sm text-muted-foreground">Giá gốc:</span>
            <p className="font-medium">{product.price.toLocaleString('vi-VN')} VND</p>
          </div>
          
          <div>
            <span className="text-sm text-muted-foreground">Giá bán:</span>
            <p className="font-medium">{(product.selling_price || product.price).toLocaleString('vi-VN')} VND</p>
          </div>
          
          <div>
            <span className="text-sm text-muted-foreground">Số lượng:</span>
            <p className="font-medium">{product.stock_quantity}</p>
          </div>
          
          <div>
            <span className="text-sm text-muted-foreground">Trạng thái:</span>
            <p className="font-medium">{product.status === 'active' ? 'Đang bán' : 'Chưa bán'}</p>
          </div>
          
          <div className="col-span-2">
            <span className="text-sm text-muted-foreground">Kiosk Token:</span>
            <p className="font-medium">{product.kiosk_token}</p>
          </div>
          
          {product.category_id && (
            <div className="col-span-2">
              <span className="text-sm text-muted-foreground">Danh mục:</span>
              <p className="font-medium">ID: {product.category_id}</p>
            </div>
          )}
          
          {product.image_url && (
            <div className="col-span-2">
              <span className="text-sm text-muted-foreground">Hình ảnh:</span>
              <p className="font-medium break-all">{product.image_url}</p>
              <div className="mt-2">
                <img 
                  src={product.image_url} 
                  alt={product.name} 
                  className="h-24 object-cover rounded border"
                  onError={(e) => {
                    e.currentTarget.src = '/placeholder.svg';
                  }}
                />
              </div>
            </div>
          )}
          
          {product.description && (
            <div className="col-span-2 mt-2">
              <span className="text-sm text-muted-foreground">Mô tả:</span>
              <p className="text-sm whitespace-pre-wrap">{product.description}</p>
            </div>
          )}
        </div>
      </div>
      
      {result && (
        <Alert variant={result.success ? "default" : "destructive"} className="mb-6">
          {result.success ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
          <AlertDescription>{result.message}</AlertDescription>
        </Alert>
      )}
      
      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onPrevious} disabled={importing}>
          Quay lại chỉnh sửa
        </Button>
        
        {result?.success ? (
          <Button type="button" onClick={onComplete}>
            <Check className="mr-2 h-4 w-4" />
            Hoàn thành
          </Button>
        ) : (
          <Button type="button" onClick={handleImport} disabled={importing}>
            {importing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang import...
              </>
            ) : (
              'Import vào database'
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
