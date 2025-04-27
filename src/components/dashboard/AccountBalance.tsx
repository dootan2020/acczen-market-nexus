
import React from 'react';
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { useCurrencyContext } from "@/contexts/CurrencyContext";

interface AccountBalanceProps {
  balance: number;
}

export function AccountBalance({ balance }: AccountBalanceProps) {
  const { convertVNDtoUSD, formatUSD } = useCurrencyContext();
  
  // Convert VND balance to USD and format
  const displayBalance = React.useMemo(() => {
    const usdBalance = convertVNDtoUSD(balance);
    console.log("AccountBalance - Balance conversion:", { originalVND: balance, convertedUSD: usdBalance });
    return formatUSD(usdBalance);
  }, [balance, convertVNDtoUSD, formatUSD]);
  
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Account Balance</CardTitle>
        <Wallet className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{displayBalance}</div>
        <Link to="/deposit">
          <Button className="mt-2 w-full">Deposit</Button>
        </Link>
      </CardContent>
    </Card>
  );
}
