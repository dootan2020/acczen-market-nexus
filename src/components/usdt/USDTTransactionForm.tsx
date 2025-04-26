
import React from 'react';
import { Input } from "@/components/ui/input";

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
    <>
      <div>
        <label className="block text-sm font-medium mb-2">
          Số tiền muốn nạp (USDT)
        </label>
        <Input
          type="number"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          placeholder="Nhập số USDT..."
          min="1"
          step="0.01"
          className="bg-white"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          Mã giao dịch (TXID)
        </label>
        <Input
          type="text"
          value={txid}
          onChange={(e) => onTxidChange(e.target.value)}
          placeholder="Nhập mã giao dịch..."
          className="font-mono text-sm bg-white"
        />
        <p className="text-xs text-muted-foreground mt-1">
          Sau khi chuyển USDT, nhập mã giao dịch (TXID) từ ví hoặc sàn giao dịch của bạn
        </p>
      </div>
    </>
  );
};
