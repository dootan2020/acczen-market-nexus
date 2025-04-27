
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

  const handleConfirm = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) return;
    onConfirm(numAmount, operation, notes);
  };

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
          <div className="flex items-center gap-4">
            <div className="flex-1 space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
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
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Reason for adjustment"
            />
          </div>
          
          <div className="rounded-md bg-muted p-4 text-sm">
            <div className="flex justify-between">
              <span>Current Balance:</span>
              <span>${currentUser?.balance?.toFixed(2) || '0.00'}</span>
            </div>
            <div className="flex justify-between mt-2">
              <span>New Balance:</span>
              <span>
                ${calculateNewBalance(currentUser?.balance || 0, parseFloat(amount) || 0, operation).toFixed(2)}
              </span>
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

// Helper function to calculate the new balance
function calculateNewBalance(currentBalance: number, amount: number, operation: 'add' | 'subtract'): number {
  return operation === 'add' ? currentBalance + amount : Math.max(0, currentBalance - amount);
}
