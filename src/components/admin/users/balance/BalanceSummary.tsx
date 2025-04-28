
import { UserProfile } from '@/hooks/admin/types/userManagement.types';
import { useCurrencyContext } from '@/contexts/CurrencyContext';

interface BalanceSummaryProps {
  currentUser: UserProfile | null;
  newBalance: number;
}

export const BalanceSummary = ({ currentUser, newBalance }: BalanceSummaryProps) => {
  const { convertVNDtoUSD, formatUSD, formatVND } = useCurrencyContext();
  
  const formattedCurrentUSD = formatUSD(convertVNDtoUSD(currentUser?.balance || 0));
  const formattedCurrentVND = formatVND(currentUser?.balance || 0);
  
  const newBalanceUSD = convertVNDtoUSD(newBalance);
  const formattedNewUSD = formatUSD(newBalanceUSD);
  const formattedNewVND = formatVND(newBalance);
  
  return (
    <div className="rounded-md bg-muted p-4 text-sm space-y-3">
      <div className="flex justify-between">
        <span>Current Balance:</span>
        <div className="text-right">
          <div>{formattedCurrentUSD}</div>
          <div className="text-xs text-muted-foreground">{formattedCurrentVND}</div>
        </div>
      </div>
      <div className="flex justify-between">
        <span>New Balance:</span>
        <div className="text-right">
          <div>{formattedNewUSD}</div>
          <div className="text-xs text-muted-foreground">{formattedNewVND}</div>
        </div>
      </div>
    </div>
  );
};
