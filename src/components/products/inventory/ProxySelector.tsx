
import React from 'react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getProxyOptions, ProxyType } from '@/utils/corsProxy';
import { Globe, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProxySelectorProps {
  currentProxy: ProxyType;
  responseTime?: number | null;
  onProxyChange: (proxy: ProxyType) => void;
}

const ProxySelector = ({ 
  currentProxy, 
  responseTime,
  onProxyChange 
}: ProxySelectorProps) => {
  const proxyOptions = getProxyOptions();
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <Globe className="h-3 w-3" />
          {responseTime && (
            <Badge variant="outline" className="ml-2 text-xs">
              {responseTime}ms
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {proxyOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => onProxyChange(option.value)}
            className="flex justify-between"
          >
            {option.label}
            {currentProxy === option.value && (
              <CheckCircle className="h-4 w-4 ml-2 text-green-500" />
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProxySelector;
