import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { ProxyType } from '@/utils/corsProxy';

const formSchema = z.object({
  kioskToken: z.string().min(1, { message: 'Kiosk Token không được để trống' }),
  proxyType: z.enum(['direct', 'corsproxy.io', 'allorigins', 'corsanywhere', 'admin'])
});

type FormValues = z.infer<typeof formSchema>;

interface ProductImportFormProps {
  onFetchProduct: (kioskToken: string, proxyType: ProxyType) => Promise<void>;
  onTestConnection?: (kioskToken: string, proxyType: ProxyType) => Promise<{success: boolean; message: string}>;
  isLoading: boolean;
  error: string | null;
}

export default function ProductImportForm({ 
  onFetchProduct, 
  onTestConnection, 
  isLoading, 
  error 
}: ProductImportFormProps) {
  const [connectionStatus, setConnectionStatus] = useState<{success?: boolean; message?: string}>({});
  const [testingConnection, setTestingConnection] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      kioskToken: '',
      proxyType: 'admin' // Default to Edge Function as it should be more reliable with improvements
    }
  });

  const handleSubmit = async (values: FormValues) => {
    setConnectionStatus({});
    await onFetchProduct(values.kioskToken, values.proxyType as ProxyType);
  };

  const handleTestConnection = async () => {
    if (!onTestConnection) return;
    
    const values = form.getValues();
    if (!values.kioskToken) {
      form.trigger(['kioskToken']);
      return;
    }

    setTestingConnection(true);
    setConnectionStatus({});
    
    try {
      const result = await onTestConnection(
        values.kioskToken,
        values.proxyType as ProxyType
      );
      setConnectionStatus(result);
    } catch (err) {
      setConnectionStatus({
        success: false,
        message: err instanceof Error ? err.message : 'Không thể kiểm tra kết nối'
      });
    } finally {
      setTestingConnection(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="kioskToken"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Kiosk Token</FormLabel>
              <FormControl>
                <Input placeholder="Nhập Kiosk Token" {...field} />
              </FormControl>
              <FormDescription>
                Mã định danh sản phẩm từ TaphoaMMO
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex items-center justify-between">
          <div className="text-sm font-medium">Phương thức kết nối</div>
          <Button 
            type="button" 
            variant="ghost" 
            size="sm"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center text-xs"
          >
            {showAdvanced ? (
              <>
                <ChevronUp className="h-3 w-3 mr-1" /> 
                Ẩn tùy chọn nâng cao
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3 mr-1" /> 
                Hiện tùy chọn nâng cao
              </>
            )}
          </Button>
        </div>
        
        <FormField
          control={form.control}
          name="proxyType"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  value={field.value}
                  className="flex flex-col space-y-1"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="admin" />
                    </FormControl>
                    <FormLabel className="font-normal">
                      Supabase Edge Function (khuyến nghị)
                    </FormLabel>
                  </FormItem>
                  
                  {showAdvanced && (
                    <>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="allorigins" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          AllOrigins CORS Proxy
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="corsproxy.io" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          CORS Proxy (corsproxy.io)
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="corsanywhere" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          CORS Anywhere
                        </FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center space-x-3 space-y-0">
                        <FormControl>
                          <RadioGroupItem value="direct" />
                        </FormControl>
                        <FormLabel className="font-normal">
                          Trực tiếp (nếu không có vấn đề CORS)
                        </FormLabel>
                      </FormItem>
                    </>
                  )}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Lỗi</AlertTitle>
            <AlertDescription>
              {error}
              {error.includes('Edge Function') && showAdvanced && (
                <div className="mt-2 text-xs">
                  <strong>Gợi ý:</strong> Hãy thử phương thức kết nối khác như "AllOrigins CORS Proxy"
                </div>
              )}
              {!showAdvanced && error.includes('Edge Function') && (
                <div className="mt-2 text-xs">
                  <Button 
                    type="button" 
                    variant="link" 
                    size="sm" 
                    className="p-0 h-auto text-xs underline"
                    onClick={() => setShowAdvanced(true)}
                  >
                    Hiện tùy chọn nâng cao
                  </Button> và thử phương thức kết nối khác.
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
        
        {connectionStatus.message && (
          <Alert variant={connectionStatus.success ? "default" : "destructive"}>
            {connectionStatus.success ? <Check className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
            <AlertTitle>{connectionStatus.success ? "Kết nối thành công" : "Lỗi kết nối"}</AlertTitle>
            <AlertDescription>{connectionStatus.message}</AlertDescription>
          </Alert>
        )}
        
        <div className="flex justify-between">
          {onTestConnection && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleTestConnection} 
              disabled={testingConnection || isLoading}
            >
              {testingConnection ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang kiểm tra...
                </>
              ) : (
                'Kiểm tra kết nối'
              )}
            </Button>
          )}
          
          <Button type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Đang lấy thông tin...
              </>
            ) : (
              'Lấy thông tin sản phẩm'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
