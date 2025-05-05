
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UserProfile } from "@/hooks/admin/types/userManagement.types";

export interface AdjustBalanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (amount: number, operation: "add" | "subtract", notes: string) => void;
  isLoading?: boolean;
  currentBalance?: number;
  currentUser?: UserProfile | null;
}

export function AdjustBalanceDialog({
  open,
  onOpenChange,
  onConfirm,
  isLoading,
  currentBalance = 0,
  currentUser
}: AdjustBalanceDialogProps) {
  const [amount, setAmount] = useState<number>(0);
  const [operation, setOperation] = useState<"add" | "subtract">("add");
  const [notes, setNotes] = useState<string>("");

  const handleSubmit = () => {
    if (amount <= 0) return;
    onConfirm(amount, operation, notes);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adjust Balance</DialogTitle>
          <DialogDescription>
            Current balance for {currentUser?.username || currentUser?.email}: ${currentBalance.toFixed(2)}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="operation" className="text-right">
              Operation
            </Label>
            <Select
              value={operation}
              onValueChange={(value) => setOperation(value as "add" | "subtract")}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select operation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="add">Add funds</SelectItem>
                <SelectItem value="subtract">Subtract funds</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Amount
            </Label>
            <div className="col-span-3 flex items-center">
              <span className="mr-2">$</span>
              <Input
                id="amount"
                type="number"
                min="0.01"
                step="0.01"
                value={amount || ""}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="notes" className="text-right">
              Notes
            </Label>
            <Textarea
              id="notes"
              placeholder="Reason for adjustment"
              className="col-span-3"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={amount <= 0 || isLoading}>
            {isLoading ? "Processing..." : "Confirm"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
