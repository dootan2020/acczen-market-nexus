
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTaphoammoAPI } from '@/hooks/useTaphoammoAPI';
import { toast } from 'sonner';

const ProductIntegration = () => {
  const [kioskToken, setKioskToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const { getStock, testConnection } = useTaphoammoAPI();

  const handleTestConnection = async () => {
    if (!kioskToken.trim()) {
      toast.error('Vui lòng nhập mã kiosk');
      return;
    }
    
    setLoading(true);
    
    try {
      // Fix: Use the correct parameter type for getStock
      const stockInfo = await getStock(kioskToken, true);
      
      setResult({
        success: true,
        message: `Kết nối thành công! Đã tìm thấy: ${stockInfo.name} (Tồn kho: ${stockInfo.stock_quantity})`,
        data: stockInfo
      });
      
      toast.success('Kết nối thành công!');
    } catch (error) {
      console.error('Lỗi kết nối:', error);
      
      setResult({
        success: false,
        message: error instanceof Error ? error.message : 'Lỗi kết nối tới API',
        error
      });
      
      toast.error(error instanceof Error ? error.message : 'Lỗi kết nối tới API');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Tích hợp sản phẩm</h1>
      
      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="kioskToken" className="block text-sm font-medium mb-1">
                Mã Kiosk
              </label>
              <input
                id="kioskToken"
                type="text"
                className="w-full p-2 border rounded-md"
                value={kioskToken}
                onChange={(e) => setKioskToken(e.target.value)}
                placeholder="Nhập mã kiosk cần kiểm tra..."
              />
            </div>
            
            <button
              className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-blue-300"
              onClick={handleTestConnection}
              disabled={loading}
            >
              {loading ? 'Đang kiểm tra...' : 'Kiểm tra kết nối'}
            </button>
            
            {result && (
              <div className={`mt-4 p-4 rounded-md ${result.success ? 'bg-green-100' : 'bg-red-100'}`}>
                <h3 className="font-medium">{result.success ? 'Thành công' : 'Lỗi'}</h3>
                <p>{result.message}</p>
                
                {result.success && result.data && (
                  <div className="mt-2">
                    <p><strong>Tên:</strong> {result.data.name}</p>
                    <p><strong>Tồn kho:</strong> {result.data.stock_quantity}</p>
                    <p><strong>Giá:</strong> {result.data.price}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductIntegration;
