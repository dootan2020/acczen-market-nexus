
import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";
import { useCurrencyContext } from "@/contexts/CurrencyContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface AccountBalanceProps {
  balance: number;
}

export function AccountBalance({ balance }: AccountBalanceProps) {
  const { convertVNDtoUSD, formatUSD, formatVND } = useCurrencyContext();
  const [isHovered, setIsHovered] = useState(false);
  
  // Convert VND balance to USD and format - using useMemo for optimization
  const displayBalance = React.useMemo(() => {
    const usdBalance = convertVNDtoUSD(balance);
    return formatUSD(usdBalance);
  }, [balance, convertVNDtoUSD, formatUSD]);
  
  // Format the original VND balance
  const displayVndBalance = React.useMemo(() => {
    return formatVND(balance);
  }, [balance, formatVND]);
  
  return (
    <Card className="shadow-sm border-primary/10 transition-all duration-300 hover:shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Account Balance</CardTitle>
        <Wallet className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div 
                className="text-2xl font-bold cursor-help text-chatgpt-primary" 
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
              >
                {isHovered ? displayVndBalance : displayBalance}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p>USD: {displayBalance}</p>
              <p>VND: {displayVndBalance}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <Link to="/deposit">
          <Button className="mt-2 w-full bg-chatgpt-primary hover:bg-chatgpt-primary/90">Deposit</Button>
        </Link>
      </CardContent>
    </Card>
  );
}
