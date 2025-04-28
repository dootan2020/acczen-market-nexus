
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BadgeCheck, ArrowRight, ShieldCheck, ShoppingCart } from "lucide-react";

const DepositSuccess = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  
  const deposit = state?.deposit;
  const transaction = state?.transaction;
  
  if (!deposit) {
    navigate('/deposit');
    return null;
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-md mx-auto">
        <Card className="border-green-200 shadow-lg">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-2">
              <div className="rounded-full bg-green-100 p-3">
                <BadgeCheck className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-2xl text-green-700">Deposit Successful!</CardTitle>
            <CardDescription>Your funds have been added to your account</CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6 pt-2">
            <div className="rounded-lg bg-green-50/50 p-4 border border-green-100">
              <div className="text-center">
                <p className="text-4xl font-bold text-green-700">${deposit.amount.toFixed(2)}</p>
                <p className="text-sm text-muted-foreground">has been added to your balance</p>
              </div>
            </div>
            
            <div className="border-t border-dashed pt-4 grid gap-3">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Transaction ID:</span>
                <span className="font-medium">{transaction?.id.substring(0, 8)}...</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Payment Method:</span>
                <span className="font-medium">USDT (TRC20)</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Status:</span>
                <span className="text-green-600 font-medium flex items-center">
                  <BadgeCheck className="h-4 w-4 mr-1" /> Completed
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-1 pt-2">
              <ShieldCheck className="h-4 w-4 text-green-600" />
              <span className="text-xs text-muted-foreground">Secured by Digital Deals Hub</span>
            </div>
          </CardContent>
          
          <CardFooter className="flex flex-col gap-2">
            <Button 
              className="w-full" 
              onClick={() => navigate('/dashboard')}
            >
              Go to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => navigate('/products')}
            >
              <ShoppingCart className="mr-2 h-4 w-4" /> Browse Products
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default DepositSuccess;
