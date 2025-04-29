
import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getProxyOptions, getStoredProxy, setStoredProxy, ProxyType } from '@/utils/corsProxy';
import ProxySelector from './inventory/ProxySelector';

interface InventoryStatusProps {
  stockQuantity: number;
  lastChecked: string | Date | null;
  isLoading?: boolean;
  onRefresh?: () => Promise<void>;
}

const formatTimeAgo = (date: Date | string) => {
  const now = new Date();
  const past = new Date(date);
  const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);
  
  if (seconds < 60) return `${seconds} giây trước`;
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} phút trước`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} giờ trước`;
  
  const days = Math.floor(hours / 24);
  return `${days} ngày trước`;
};

export default function ProductInventoryStatus({ 
  stockQuantity, 
  lastChecked, 
  isLoading = false,
  onRefresh 
}: InventoryStatusProps) {
  const [currentProxy, setCurrentProxy] = useState<ProxyType>(getStoredProxy());
  const [responseTime, setResponseTime] = useState<number | null>(null);
  
  const refreshInventory = async () => {
    if (onRefresh) {
      const startTime = Date.now();
      await onRefresh();
      const endTime = Date.now();
      setResponseTime(endTime - startTime);
    }
  };
  
  const handleProxyChange = (proxy: ProxyType) => {
    setStoredProxy(proxy);
    setCurrentProxy(proxy);
  };
  
  useEffect(() => {
    const handleStorageChange = () => {
      setCurrentProxy(getStoredProxy());
    };
    
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);
  
  return (
    <Card className="mt-6">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium">Tình trạng tồn kho</h3>
          <div className="flex items-center gap-1">
            <ProxySelector 
              currentProxy={currentProxy}
              responseTime={responseTime}
              onProxyChange={handleProxyChange}
            />
            
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={refreshInventory}
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3" />
              )}
            </Button>
          </div>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Badge 
              variant={stockQuantity > 0 ? "success" : "destructive"}
              className={stockQuantity > 0 ? "bg-green-500" : ""}
            >
              {stockQuantity > 0 ? 'Còn hàng' : 'Hết hàng'}
            </Badge>
            <span className="text-sm">{stockQuantity} sản phẩm</span>
          </div>
          
          <div className="text-xs text-muted-foreground">
            {lastChecked ? (
              <>Cập nhật {formatTimeAgo(lastChecked)}</>
            ) : (
              <>Chưa có dữ liệu</>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
