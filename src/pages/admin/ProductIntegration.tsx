
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { ProxySelector } from '@/components/products/inventory/ProxySelector';
import { ProxyType, getProxyOptions, getStoredProxy, setStoredProxy } from '@/utils/corsProxy';

const apiSettingsSchema = z.object({
  api_key: z.string().min(1, { message: "API key không được để trống" }),
  api_secret: z.string().min(1, { message: "API secret không được để trống" }),
  api_url: z.string().url({ message: "API URL không hợp lệ" }),
});

type ApiSettings = z.infer<typeof apiSettingsSchema>;

const ProductIntegration = () => {
  const [activeTab, setActiveTab] = useState("api-settings");
  const [currentProxy, setCurrentProxy] = useState<ProxyType>(getStoredProxy());
  const [responseTime, setResponseTime] = useState<number | null>(null);

  const form = useForm<ApiSettings>({
    resolver: zodResolver(apiSettingsSchema),
    defaultValues: {
      api_key: localStorage.getItem("taphoammo_api_key") || "",
      api_secret: localStorage.getItem("taphoammo_api_secret") || "",
      api_url: localStorage.getItem("taphoammo_api_url") || "https://taphoammo.net/api/v1",
    },
  });

  const handleProxyChange = (proxy: ProxyType) => {
    setStoredProxy(proxy);
    setCurrentProxy(proxy);
    toast.info(`Đã chuyển sang sử dụng proxy: ${getProxyOptions().find(p => p.value === proxy)?.label}`);
  };

  const testConnection = async () => {
    try {
      const startTime = Date.now();
      await fetch('https://taphoammo.net/api/ping', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      const endTime = Date.now();
      setResponseTime(endTime - startTime);
      return true;
    } catch (err) {
      console.error('Failed to test connection', err);
      return false;
    }
  };

  useEffect(() => {
    testConnection();
    
    const handleStorageChange = () => {
      setCurrentProxy(getStoredProxy());
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const onSubmit = (data: ApiSettings) => {
    // Save API settings to localStorage
    localStorage.setItem("taphoammo_api_key", data.api_key);
    localStorage.setItem("taphoammo_api_secret", data.api_secret);
    localStorage.setItem("taphoammo_api_url", data.api_url);
    
    toast.success("Cài đặt API đã được lưu thành công");
  };

  return (
    <div className="container py-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Tích hợp sản phẩm</h1>
        <div className="flex items-center gap-2">
          <ProxySelector
            currentProxy={currentProxy}
            responseTime={responseTime}
            onProxyChange={handleProxyChange}
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="api-settings">Cài đặt API</TabsTrigger>
          <TabsTrigger value="automation">Tự động hóa</TabsTrigger>
          <TabsTrigger value="mapping">Ánh xạ danh mục</TabsTrigger>
        </TabsList>
        
        <TabsContent value="api-settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Cài đặt API TaphoaMMO</CardTitle>
              <CardDescription>
                Thiết lập kết nối đến API của TaphoaMMO để lấy thông tin sản phẩm và xử lý đơn hàng tự động.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={form.control}
                    name="api_key"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>API Key</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          API Key được cung cấp bởi TaphoaMMO
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="api_secret"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>API Secret</FormLabel>
                        <FormControl>
                          <Input type="password" {...field} />
                        </FormControl>
                        <FormDescription>
                          API Secret dùng để xác thực các yêu cầu
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="api_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>API URL</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormDescription>
                          URL cơ sở của API
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit">Lưu cài đặt</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="automation" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Tự động hóa</CardTitle>
              <CardDescription>
                Thiết lập các tác vụ tự động cho việc nhập sản phẩm và xử lý đơn hàng.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Chức năng đang được phát triển...</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="mapping" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Ánh xạ danh mục</CardTitle>
              <CardDescription>
                Thiết lập ánh xạ giữa danh mục của TaphoaMMO và danh mục trên hệ thống của bạn.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>Chức năng đang được phát triển...</p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductIntegration;
