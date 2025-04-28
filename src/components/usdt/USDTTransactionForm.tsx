
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Coins, FileText } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface USDTTransactionFormProps {
  amount: string;
  txid: string;
  onAmountChange: (value: string) => void;
  onTxidChange: (value: string) => void;
}

export const USDTTransactionForm = ({
  amount,
  txid,
  onAmountChange,
  onTxidChange,
}: USDTTransactionFormProps) => {
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      onAmountChange(value);
    }
  };

  const handleTxIDChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value === '' || /^[0-9a-fA-F]+$/.test(value)) {
      onTxidChange(value.trim());
    }
  };

  const isValidTxid = txid.length === 64 || txid === '';
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="amount" className="flex items-center">
          <Coins className="h-4 w-4 mr-1.5" /> Amount (USDT)
        </Label>
        <Input
          id="amount"
          type="text"
          inputMode="decimal"
          placeholder="0.00"
          value={amount}
          onChange={handleAmountChange}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label htmlFor="txid" className="flex items-center">
            <FileText className="h-4 w-4 mr-1.5" /> Transaction Hash
          </Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger className="text-xs text-muted-foreground underline underline-offset-2">
                Where to find?
              </TooltipTrigger>
              <TooltipContent className="max-w-sm">
                <p className="text-sm">
                  After sending USDT from your wallet, you'll receive a transaction hash. 
                  Copy and paste it here to verify your deposit.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Textarea
          id="txid"
          placeholder="Enter your TRC20 transaction hash here..."
          value={txid}
          onChange={handleTxIDChange}
          className={`font-mono ${!isValidTxid ? 'border-red-300' : ''}`}
        />
        {txid !== '' && !isValidTxid && (
          <Alert variant="destructive" className="py-2 px-3">
            <AlertDescription>
              Transaction hash should be 64 characters long hexadecimal string.
            </AlertDescription>
          </Alert>
        )}
        <p className="text-xs text-muted-foreground mt-1.5">
          Paste the TRC20 transaction hash from your wallet after sending USDT.
        </p>
      </div>
    </div>
  );
};
