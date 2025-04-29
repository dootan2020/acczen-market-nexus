
import { Settings, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProxyType, getProxyOptions } from '@/utils/corsProxy';

interface ProxySelectorProps {
  currentProxy: ProxyType;
  responseTime: number | null;
  onProxyChange: (proxy: ProxyType) => void;
}

export const ProxySelector = ({ currentProxy, responseTime, onProxyChange }: ProxySelectorProps) => {
  const proxyOptions = getProxyOptions();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6"
          title="Tùy chọn kết nối API"
        >
          <Settings className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="px-2 py-1.5 text-xs font-semibold">Kết nối API qua</div>
        {proxyOptions.map(option => (
          <DropdownMenuItem 
            key={option.value}
            className={currentProxy === option.value ? 'bg-muted' : ''}
            onClick={() => onProxyChange(option.value as ProxyType)}
          >
            <span className="font-medium">{option.label}</span>
            {currentProxy === option.value && <CheckCircle2 className="ml-2 h-3 w-3" />}
          </DropdownMenuItem>
        ))}
        <div className="px-2 py-1 text-xs text-muted-foreground border-t">
          {responseTime ? `Thời gian phản hồi: ${responseTime}ms` : 'Chưa có dữ liệu tốc độ'}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProxySelector;
