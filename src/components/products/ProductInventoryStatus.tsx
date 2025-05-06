
import React, { useState, useEffect } from 'react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getProxyOptions, getStoredProxy, setStoredProxy, ProxyType } from '@/utils/corsProxy';
import ProxySelector from './inventory/ProxySelector';

interface InventoryStatusProps {
  stockQuantity: number;
  lastChecked?: string | Date | null;
  isLoading?: boolean;
  onRefresh?: () => Promise<void>;
  kioskToken?: string | null;
  variant?: string; // Add the variant prop
  isCached?: boolean;
  isEmergency?: boolean;
}

const formatTimeAgo = (date: Date | string) => {
  if (!date) return '';
  
  const now = new Date();
  const past = new Date(date);
  const seconds = Math.floor((now.getTime() - past.getTime()) / 1000);
  
  if (seconds < 60) return `${seconds} seconds ago`;
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} minutes ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  
  const days = Math.floor(hours / 24);
  return `${days} days ago`;
};

// Check if data is stale (older than 30 minutes)
const isDataStale = (date?: Date | string | null): boolean => {
  if (!date) return true;
  
  const now = new Date();
  const past = new Date(date);
  const minutes = Math.floor((now.getTime() - past.getTime()) / (1000 * 60));
  
  return minutes > 30; // Stale if older than 30 minutes
};

export default function ProductInventoryStatus({ 
  stockQuantity, 
  lastChecked, 
  isLoading = false,
  onRefresh,
  kioskToken,
  variant = 'default',
  isCached = false,
  isEmergency = false
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

  const stale = isDataStale(lastChecked);
  
  // Render different UI based on variant
  if (variant === 'badge') {
    return (
      <Badge 
        variant={stockQuantity > 0 ? "success" : "destructive"}
      >
        {stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}
      </Badge>
    );
  }
  
  return (
    <Card className="mt-6">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-sm font-medium">Inventory Status</h3>
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
            >
              {stockQuantity > 0 ? 'In Stock' : 'Out of Stock'}
            </Badge>
            <span className="text-sm">{stockQuantity} items</span>
          </div>
          
          <div className="text-xs text-muted-foreground">
            {lastChecked ? (
              <>Updated {formatTimeAgo(lastChecked)}</>
            ) : (
              <>No data yet</>
            )}
          </div>
        </div>

        {/* Warning for stale data */}
        {stale && lastChecked && (
          <div className="mt-2 flex items-center gap-1 text-xs text-yellow-600 bg-yellow-50 p-1.5 rounded-sm">
            <AlertTriangle className="h-3 w-3" />
            <span>Stock data may be outdated</span>
          </div>
        )}

        {/* Warning for cached data */}
        {isCached && isEmergency && (
          <div className="mt-2 flex items-center gap-1 text-xs text-amber-600 bg-amber-50 p-1.5 rounded-sm">
            <AlertTriangle className="h-3 w-3" />
            <span>Using emergency cached data</span>
          </div>
        )}

        {/* Low stock warning */}
        {stockQuantity > 0 && stockQuantity < 10 && (
          <div className="mt-2 flex items-center gap-1 text-xs text-red-600 bg-red-50 p-1.5 rounded-sm">
            <AlertTriangle className="h-3 w-3" />
            <span>Low stock: Only {stockQuantity} items left</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
