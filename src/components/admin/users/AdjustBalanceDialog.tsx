
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCurrencyContext } from "@/contexts/CurrencyContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface UserProfile {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  balance: number;
}

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
  const { convertUSDtoVND, convertVNDtoUSD, formatUSD, formatVND } = useCurrencyContext();

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
  
  // Convert calculated balance to USD and VND for display
  const newBalance = calculateNewBalance();
  const newBalanceUSD = convertVNDtoUSD(newBalance);
  const formattedCurrentUSD = formatUSD(convertVNDtoUSD(currentUser?.balance || 0));
  const formattedCurrentVND = formatVND(currentUser?.balance || 0);
  const formattedNewUSD = formatUSD(newBalanceUSD);
  const formattedNewVND = formatVND(newBalance);

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
          <Tabs value={currencyTab} onValueChange={(v) => setCurrencyTab(v as 'usd' | 'vnd')}>
            <TabsList className="w-full">
              <TabsTrigger value="usd" className="flex-1">USD</TabsTrigger>
              <TabsTrigger value="vnd" className="flex-1">VND</TabsTrigger>
            </TabsList>
            <TabsContent value="usd" className="mt-2">
              <div className="flex items-center gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="amount-usd">Amount (USD)</Label>
                  <Input
                    id="amount-usd"
                    type="number"
                    min="0.01"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="operation">Operation</Label>
                  <Select value={operation} onValueChange={(value) => setOperation(value as 'add' | 'subtract')}>
                    <SelectTrigger id="operation" className="w-[130px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="add">Add</SelectItem>
                      <SelectItem value="subtract">Subtract</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="vnd" className="mt-2">
              <div className="flex items-center gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="amount-vnd">Amount (VND)</Label>
                  <Input
                    id="amount-vnd"
                    type="number"
                    min="1000"
                    step="1000"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="operation-vnd">Operation</Label>
                  <Select value={operation} onValueChange={(value) => setOperation(value as 'add' | 'subtract')}>
                    <SelectTrigger id="operation-vnd" className="w-[130px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="add">Add</SelectItem>
                      <SelectItem value="subtract">Subtract</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </TabsContent>
          </Tabs>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Reason for adjustment"
            />
          </div>
          
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
