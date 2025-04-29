
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ExtendedProduct } from '@/pages/admin/ProductsImport';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ImportConfirmationProps {
  product: ExtendedProduct;
  onPrevious: () => void;
  onComplete: () => void;
}

const ImportConfirmation: React.FC<ImportConfirmationProps> = ({ 
  product, 
  onPrevious, 
  onComplete 
}) => {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const importProduct = async () => {
    setStatus('loading');
    setErrorMessage(null);
    
    try {
      // Creating the product in Supabase
      const { data: newProduct, error } = await supabase
        .from('products')
        .insert({
          name: product.name,
          description: product.description || '',
          price: product.price,
          sale_price: product.selling_price,
          stock_quantity: product.stock_quantity,
          slug: product.slug,
          category_id: product.category_id || null,
          subcategory_id: product.subcategory_id || null,
          status: product.status || 'active',
          sku: product.sku,
          kiosk_token: product.kiosk_token,
          image_url: product.image_url || null,
        })
        .select()
        .single();
      
      if (error) throw new Error(error.message);
      
      // Success!
      setStatus('success');
      toast.success('Sản phẩm đã được import thành công!');
      
      // Wait 2 seconds before completing
      setTimeout(() => {
        onComplete();
      }, 2000);
      
    } catch (err) {
      console.error('Error importing product:', err);
      setStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Unknown error occurred');
      toast.error('Không thể import sản phẩm');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-muted p-6 rounded-lg">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium mb-1">Tên sản phẩm</p>
            <p className="text-lg font-semibold">{product.name}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium mb-1">Token</p>
            <p className="text-lg font-mono">{product.kiosk_token}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium mb-1">Giá</p>
            <p className="text-lg font-semibold">{product.price.toLocaleString('vi-VN')} VNĐ</p>
          </div>
          
          <div>
            <p className="text-sm font-medium mb-1">SKU</p>
            <p className="text-lg font-mono">{product.sku}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium mb-1">Số lượng tồn kho</p>
            <p className="text-lg font-semibold">{product.stock_quantity}</p>
          </div>
          
          <div>
            <p className="text-sm font-medium mb-1">Trạng thái</p>
            <p className="text-lg font-semibold">
              {product.status === 'active' ? 'Đang bán' : 'Không hoạt động'}
            </p>
          </div>
        </div>
      </div>
      
      {status === 'success' && (
        <Alert className="border-green-500 bg-green-50 dark:bg-green-900/20">
          <CheckCircle2 className="h-4 w-4 text-green-500" />
          <AlertTitle>Thành công!</AlertTitle>
          <AlertDescription>
            Sản phẩm đã được import thành công vào cơ sở dữ liệu.
          </AlertDescription>
        </Alert>
      )}
      
      {status === 'error' && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Lỗi khi import sản phẩm</AlertTitle>
          <AlertDescription>
            {errorMessage || 'Đã có lỗi xảy ra khi import sản phẩm. Vui lòng thử lại.'}
          </AlertDescription>
        </Alert>
      )}
      
      <div className="flex justify-between pt-6">
        <Button 
          variant="outline" 
          onClick={onPrevious}
          disabled={status === 'loading' || status === 'success'}
        >
          Quay lại
        </Button>
        
        {status === 'idle' || status === 'error' ? (
          <Button 
            onClick={importProduct} 
            disabled={status === 'loading'}
          >
            {status === 'error' ? 'Thử lại' : 'Import sản phẩm'}
          </Button>
        ) : status === 'loading' ? (
          <Button disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Đang import...
          </Button>
        ) : (
          <Button disabled>
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Đã import thành công
          </Button>
        )}
      </div>
    </div>
  );
};

export default ImportConfirmation;
