
import React from 'react';
import { Check, Globe, Shield } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { ProxyType } from '@/utils/corsProxy';

interface ProxySelectorProps {
  currentProxy: ProxyType;
  onProxyChange: (proxy: ProxyType) => void;
  responseTime?: number | null;
}

const ProxySelector: React.FC<ProxySelectorProps> = ({
  currentProxy,
  onProxyChange,
  responseTime
}) => {
  const proxyOptions = [
    { type: 'direct' as ProxyType, label: 'Trực tiếp', icon: <Globe className="h-3.5 w-3.5" /> },
    { type: 'corsproxy.io' as ProxyType, label: 'CORS Proxy', icon: <Shield className="h-3.5 w-3.5" /> }
  ];
  
  const handleProxyChange = (proxy: ProxyType) => {
    onProxyChange(proxy);
  };
  
  // Find current proxy in options
  const currentOption = proxyOptions.find(opt => opt.type === currentProxy) || proxyOptions[0];
  
  // Format response time
  const getResponseTimeBadge = () => {
    if (responseTime === null) return null;
    
    let color = 'bg-green-100 text-green-800';
    if (responseTime > 1000) color = 'bg-amber-100 text-amber-800';
    if (responseTime > 2000) color = 'bg-red-100 text-red-800';
    
    return (
      <span className={`ml-1.5 text-[10px] px-1.5 py-0.5 rounded-full ${color}`}>
        {responseTime}ms
      </span>
    );
  };
  
  return (
    <DropdownMenu>
      <Tooltip>
        <TooltipTrigger asChild>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6">
              {currentOption.icon}
            </Button>
          </DropdownMenuTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs flex items-center">
            Kết nối API: {currentOption.label}
            {getResponseTimeBadge()}
          </p>
        </TooltipContent>
      </Tooltip>
      
      <DropdownMenuContent className="w-48">
        <DropdownMenuGroup>
          {proxyOptions.map((option) => (
            <DropdownMenuItem 
              key={option.type}
              onClick={() => handleProxyChange(option.type)}
              className="flex items-center justify-between"
            >
              <div className="flex items-center">
                <span className="mr-2">{option.icon}</span>
                <span>{option.label}</span>
              </div>
              {currentProxy === option.type && <Check className="h-4 w-4" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProxySelector;
