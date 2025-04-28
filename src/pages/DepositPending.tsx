
import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { BadgeCheck, Calendar, AlertCircle, Clock, HomeIcon, RefreshCw, ArrowRight } from "lucide-react";
import { usePayment } from '@/contexts/PaymentContext';
import { StatusBadge } from '@/components/dashboard/purchases/StatusBadge';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { DepositStatus } from '@/components/deposits/DepositStatus';

const DepositPending = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { deposits, isLoading, getDepositStatus, refreshDeposits } = usePayment();
  const [refreshing, setRefreshing] = useState(false);
  const { user } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const depositId = state?.depositId;
  const deposit = deposits.find(d => d.id === depositId);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (!depositId) {
      navigate('/deposit');
      return;
    }

    // Initial refresh
    refreshDeposits();

    // Set up periodic refresh
    const interval = setInterval(() => {
      refreshDeposits();
    }, 15000); // Refresh every 15 seconds

    return () => {
      clearInterval(interval);
    };
  }, [depositId, user, navigate, refreshDeposits]);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshDeposits();
    } catch (err) {
      setError('Failed to refresh deposit status');
    } finally {
      setRefreshing(false);
    }
  };

  if (isLoading && !deposit) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-xl mx-auto">
          <CardContent className="pt-6 flex justify-center items-center flex-col p-10">
            <Clock className="h-10 w-10 text-muted-foreground animate-pulse mb-4" />
            <p className="text-center">Loading transaction status...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!deposit) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card className="max-w-xl mx-auto">
          <CardContent className="pt-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Deposit Not Found</AlertTitle>
              <AlertDescription>
                The deposit information could not be found. Please check your transactions in the dashboard.
              </AlertDescription>
            </Alert>
            <div className="flex justify-end mt-6">
              <Button onClick={() => navigate('/deposit')}>
                <HomeIcon className="mr-2 h-4 w-4" /> Back to Deposits
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Transaction Status</h1>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="w-full">
          <Card className="mb-6">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>USDT Deposit</CardTitle>
                  <CardDescription>
                    Transaction Details
                  </CardDescription>
                </div>
                <StatusBadge status={deposit.status} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Amount:</span>
                  <span className="font-medium">${deposit.amount.toFixed(2)} USDT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Date:</span>
                  <span className="font-medium flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {format(new Date(deposit.created_at), 'MMM d, yyyy h:mm a')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Transaction Hash:</span>
                  <span className="font-medium font-mono text-sm truncate max-w-[220px]">
                    {deposit.transaction_hash}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <DepositStatus 
            status={deposit.status} 
            createdAt={deposit.created_at} 
          />

          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>What's Next?</CardTitle>
            <CardDescription>Information about your transaction</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {deposit.status === 'pending' && (
              <>
                <Alert className="bg-blue-50/50 border-blue-200">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <AlertTitle className="text-blue-700">Transaction is being verified</AlertTitle>
                  <AlertDescription className="text-blue-600">
                    We're verifying your USDT transaction on the blockchain. 
                    This usually takes 1-5 minutes but can sometimes take up to 30 minutes depending on network conditions.
                  </AlertDescription>
                </Alert>
                <p className="text-sm text-muted-foreground">
                  You don't need to stay on this page. We'll notify you once your deposit is completed 
                  and the funds will be automatically added to your account.
                </p>
              </>
            )}

            {deposit.status === 'processing' && (
              <Alert className="bg-blue-50/50 border-blue-200">
                <Clock className="h-4 w-4 text-blue-500" />
                <AlertTitle className="text-blue-700">Transaction confirmed, processing deposit</AlertTitle>
                <AlertDescription className="text-blue-600">
                  Your transaction has been confirmed on the blockchain. We're now processing the deposit 
                  to add funds to your account. This should only take a moment.
                </AlertDescription>
              </Alert>
            )}

            {deposit.status === 'completed' && (
              <Alert className="bg-green-50/50 border-green-200">
                <BadgeCheck className="h-4 w-4 text-green-500" />
                <AlertTitle className="text-green-700">Transaction Completed</AlertTitle>
                <AlertDescription className="text-green-600">
                  Your deposit has been successfully processed and the funds have been added to your account.
                </AlertDescription>
              </Alert>
            )}

            {deposit.status === 'failed' && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Transaction Failed</AlertTitle>
                <AlertDescription>
                  There was an issue processing your transaction. Please contact support for assistance.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleManualRefresh} disabled={refreshing}>
              {refreshing ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" /> Refresh Status
                </>
              )}
            </Button>

            <Button onClick={() => navigate('/dashboard/transactions')}>
              View Transactions <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default DepositPending;
