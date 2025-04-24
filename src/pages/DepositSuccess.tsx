
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { CheckCircle, ArrowRight, History } from "lucide-react";
import { format } from "date-fns";

const DepositSuccess = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const { deposit, transaction } = location.state || {};
  
  if (!deposit) {
    // If there's no deposit data, redirect to the deposit page
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-2xl font-bold mb-4">No Transaction Data</h1>
        <p>No transaction data was found. Please go back to the deposit page.</p>
        <Button onClick={() => navigate('/deposit')} className="mt-4">
          Go to Deposit Page
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h1 className="text-2xl font-bold">Deposit Successful!</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Transaction Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Transaction ID</p>
              <p className="font-medium">{transaction?.id || deposit.id}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Date</p>
              <p className="font-medium">
                {format(new Date(deposit.updated_at), "PPP p")}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Payment Method</p>
              <p className="font-medium">{deposit.payment_method}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Status</p>
              <p className="font-medium capitalize">{deposit.status}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Amount</p>
              <p className="font-medium text-xl text-primary">${deposit.amount.toFixed(2)}</p>
            </div>
            {deposit.transaction_hash && (
              <div className="col-span-2">
                <p className="text-sm text-muted-foreground">Blockchain Transaction ID</p>
                <p className="font-medium break-all">{deposit.transaction_hash}</p>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-center gap-4">
          <div className="w-full text-center p-4 bg-muted rounded-md">
            <p className="text-sm text-muted-foreground">Current Balance</p>
            <p className="text-2xl font-bold text-primary">${user?.balance.toFixed(2)}</p>
          </div>
          <div className="w-full flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={() => navigate('/')} 
              className="flex-1"
            >
              Continue Shopping <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button 
              onClick={() => navigate('/dashboard')} 
              variant="outline" 
              className="flex-1"
            >
              <History className="mr-2 h-4 w-4" /> View Transaction History
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default DepositSuccess;
