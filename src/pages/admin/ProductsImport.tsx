
import { useState } from 'react';
import ProductImportForm from '@/components/admin/products/ProductImportForm';
import ProductEditForm from '@/components/admin/products/ProductEditForm';
import ImportPreview from '@/components/admin/products/ImportPreview';
import { useTaphoammoService } from '@/hooks/useTaphoammoService';
import { toast } from 'sonner';

interface ProductData {
  name: string;
  price: number;
  stock_quantity: number;
  kiosk_token: string;
}

export default function ProductsImport() {
  const [step, setStep] = useState<'form' | 'preview' | 'edit'>('form');
  const [productData, setProductData] = useState<ProductData | null>(null);
  const { getStock, loading, error } = useTaphoammoService();

  const handleFetchProduct = async (kioskToken: string, userToken: string) => {
    try {
      const data = await getStock(kioskToken, userToken);
      setProductData(data);
      toast.success('Product information fetched successfully');
      setStep('preview');
    } catch (err) {
      toast.error('Failed to fetch product information');
      // Stay on form step
    }
  };

  const handleEditProduct = () => {
    setStep('edit');
  };

  const handleImportSuccess = () => {
    setStep('form');
    setProductData(null);
  };

  const handleCancel = () => {
    setStep('preview');
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Import Products</h2>
        <p className="text-muted-foreground">
          Import products from TaphoaMMO to your store
        </p>
      </div>

      <div className="grid gap-6">
        {step === 'form' && (
          <ProductImportForm
            onFetchProduct={handleFetchProduct}
            isLoading={loading}
            error={error}
          />
        )}

        {step === 'preview' && productData && (
          <div className="grid gap-6">
            <ImportPreview
              name={productData.name}
              price={productData.price}
              stockQuantity={productData.stock_quantity}
              kioskToken={productData.kiosk_token}
            />
            <div className="flex justify-end">
              <button
                onClick={handleEditProduct}
                className="bg-primary text-white px-4 py-2 rounded-md"
              >
                Continue to Edit
              </button>
            </div>
          </div>
        )}

        {step === 'edit' && productData && (
          <ProductEditForm
            productData={productData}
            onSuccess={handleImportSuccess}
            onCancel={handleCancel}
          />
        )}
      </div>
    </div>
  );
}
