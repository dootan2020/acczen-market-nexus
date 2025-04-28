
import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface CurrencyTabsProps {
  amount: string;
  setAmount: (amount: string) => void;
  operation: 'add' | 'subtract';
  setOperation: (operation: 'add' | 'subtract') => void;
  currencyTab: 'usd' | 'vnd';
  setCurrencyTab: (tab: 'usd' | 'vnd') => void;
}

export const CurrencyTabs = ({
  amount,
  setAmount,
  operation,
  setOperation,
  currencyTab,
  setCurrencyTab
}: CurrencyTabsProps) => {
  return (
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
          <OperationSelect operation={operation} setOperation={setOperation} id="operation" />
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
          <OperationSelect operation={operation} setOperation={setOperation} id="operation-vnd" />
        </div>
      </TabsContent>
    </Tabs>
  );
};

interface OperationSelectProps {
  operation: 'add' | 'subtract';
  setOperation: (operation: 'add' | 'subtract') => void;
  id: string;
}

const OperationSelect = ({ operation, setOperation, id }: OperationSelectProps) => {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>Operation</Label>
      <Select value={operation} onValueChange={(value) => setOperation(value as 'add' | 'subtract')}>
        <SelectTrigger id={id} className="w-[130px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="add">Add</SelectItem>
          <SelectItem value="subtract">Subtract</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
};
