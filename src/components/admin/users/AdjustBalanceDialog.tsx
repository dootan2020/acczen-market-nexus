
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCurrencyContext } from "@/contexts/CurrencyContext";
import { UserProfile } from '@/hooks/admin/types/userManagement.types';
import { CurrencyTabs } from './balance/CurrencyTabs';
import { BalanceSummary } from './balance/BalanceSummary';

interface AdjustBalanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (amount: number, operation: 'add' | 'subtract', notes: string) => void;
  isLoading: boolean;
  currentUser: UserProfile | null;
}

export const AdjustBalanceDialog = ({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
  currentUser
}: AdjustBalanceDialogProps) => {
  const [amount, setAmount] = useState('');
  const [operation, setOperation] = useState<'add' | 'subtract'>('add');
  const [notes, setNotes] = useState('');
  const [currencyTab, setCurrencyTab] = useState<'usd' | 'vnd'>('usd');
  const { convertUSDtoVND, convertVNDtoUSD } = useCurrencyContext();

  const handleConfirm = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;
    
    // Convert to VND if the input was in USD
    const vndAmount = currencyTab === 'usd' 
      ? convertUSDtoVND(numAmount)
      : numAmount;
    
    onConfirm(vndAmount, operation, notes);
  };
  
  // Calculate the new balance based on current inputs
  const calculateNewBalance = () => {
    if (!currentUser || !amount || isNaN(parseFloat(amount))) {
      return currentUser?.balance || 0;
    }
    
    const numAmount = parseFloat(amount);
    // Convert to VND if input is in USD
    const vndAmount = currencyTab === 'usd' 
      ? convertUSDtoVND(numAmount)
      : numAmount;
    
    return operation === 'add' 
      ? (currentUser.balance + vndAmount)
      : Math.max(0, currentUser.balance - vndAmount);
  };
  
  // Calculate new balance
  const newBalance = calculateNewBalance();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adjust User Balance</DialogTitle>
          <DialogDescription>
            Modify the balance for {currentUser?.full_name || currentUser?.username || currentUser?.email}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <CurrencyTabs 
            amount={amount}
            setAmount={setAmount}
            operation={operation}
            setOperation={setOperation}
            currencyTab={currencyTab}
            setCurrencyTab={setCurrencyTab}
          />
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Reason for adjustment"
            />
          </div>
          
          <BalanceSummary 
            currentUser={currentUser}
            newBalance={newBalance}
          />
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button 
            onClick={handleConfirm}
            disabled={isLoading || !amount || parseFloat(amount) <= 0}
          >
            {isLoading ? (
              <>
                <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent rounded-full"></div>
                Processing...
              </>
            ) : 'Confirm'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
