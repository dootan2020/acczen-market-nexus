
import { Clock } from 'lucide-react';

interface StockTimestampProps {
  lastUpdate: string;
}

const StockTimestamp = ({ lastUpdate }: StockTimestampProps) => {
  return (
    <div className="flex items-center text-xs text-muted-foreground">
      <Clock className="w-3 h-3 mr-2" />
      <span>
        {lastUpdate ? (
          <>Cập nhật: {lastUpdate}</>
        ) : (
          'Chưa có dữ liệu cập nhật'
        )}
      </span>
    </div>
  );
};

export default StockTimestamp;
