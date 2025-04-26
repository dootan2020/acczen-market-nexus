
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";

interface USDTTransactionFormProps {
  amount: string;
  txid: string;
  onAmountChange: (value: string) => void;
  onTxidChange: (value: string) => void;
}

export const USDTTransactionForm: React.FC<USDTTransactionFormProps> = ({
  amount,
  txid,
  onAmountChange,
  onTxidChange,
}) => {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="amount">Số tiền muốn nạp (USDT)</Label>
        <Input
          id="amount"
          type="number"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          placeholder="Nhập số USDT..."
          min="1"
          step="0.01"
          className="bg-white mt-1.5"
        />
      </div>

      <Card className="bg-muted/30 border-border/40">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <Label htmlFor="txid" className="text-muted-foreground">
              Mã giao dịch (TXID)
            </Label>
            <Input
              id="txid"
              type="text"
              value={txid}
              onChange={(e) => onTxidChange(e.target.value)}
              placeholder="Nhập mã giao dịch..."
              className="font-mono text-sm bg-white mt-1.5"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Sau khi chuyển USDT, nhập mã giao dịch (TXID) từ ví hoặc sàn giao dịch của bạn
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
