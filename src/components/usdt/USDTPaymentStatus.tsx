
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Clock, AlertCircle, CheckCircle, RefreshCw, Copy } from 'lucide-react';
import { usePayment, PaymentStatus } from '@/contexts/PaymentContext';

interface USDTPaymentStatusProps {
  depositId: string;
  onComplete?: () => void;
  className?: string;
}

const USDTPaymentStatus: React.FC<USDTPaymentStatusProps> = ({ 
  depositId, 
  onComplete,
  className 
}) => {
  const [countdown, setCountdown] = useState(300); // 5 minutes
  const [progress, setProgress] = useState(100);
  const [checking, setChecking] = useState(false);
  const { toast } = useToast();
  const { deposits, verifications, refreshDeposits } = usePayment();
  
  const currentDeposit = deposits.find(d => d.id === depositId);
  const currentVerification = verifications.find(v => v.deposit_id === depositId);
  
  useEffect(() => {
    // Set up the countdown timer
    if (currentDeposit?.status !== 'completed') {
      const timer = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 0) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [currentDeposit?.status]);
  
  useEffect(() => {
    // Convert countdown to progress percentage
    setProgress(Math.max((countdown / 300) * 100, 0));
  }, [countdown]);
  
  useEffect(() => {
    // Auto-refresh deposits every 30 seconds
    const intervalId = setInterval(() => {
      refreshDeposits();
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, [refreshDeposits]);
  
  const handleManualCheck = async () => {
    setChecking(true);
    try {
      await refreshDeposits();
      toast({
        title: "Status Updated",
        description: "Payment status has been refreshed",
      });
    } finally {
      setChecking(false);
    }
  };
  
  const getStatusBadge = (status: PaymentStatus) => {
    switch (status) {
      case 'completed':
        return (
          <Badge variant="success" className="ml-2">
            <CheckCircle className="h-3 w-3 mr-1" />
            Verified
          </Badge>
        );
      case 'processing':
        return (
          <Badge variant="outline" className="ml-2 bg-yellow-50 text-yellow-700 border-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Processing
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive" className="ml-2">
            <AlertCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="ml-2">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        );
    }
  };
  
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied to clipboard",
      description: "Transaction ID has been copied",
    });
  };
  
  // If no deposit is found
  if (!currentDeposit) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Payment Status</CardTitle>
          <CardDescription>Transaction not found</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-4">
            <AlertCircle className="h-6 w-6 text-destructive mr-2" />
            <p>Could not find deposit information</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>USDT Payment Status</CardTitle>
            <CardDescription>
              Transaction ID: 
              <button 
                onClick={() => copyToClipboard(currentDeposit.transaction_hash)}
                className="inline-flex items-center ml-1 text-primary hover:text-primary/80"
              >
                {currentDeposit.transaction_hash.substring(0, 10)}...
                <Copy className="h-3 w-3 ml-1" />
              </button>
            </CardDescription>
          </div>
          {getStatusBadge(currentDeposit.status)}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span>Amount:</span>
              <span className="font-medium">${currentDeposit.amount} USDT</span>
            </div>
            
            <div className="flex justify-between items-center text-sm">
              <span>Status:</span>
              <span className="font-medium">
                {currentDeposit.status === 'completed' 
                  ? 'Payment verified' 
                  : currentDeposit.status === 'failed'
                    ? 'Verification failed'
                    : 'Waiting for verification'}
              </span>
            </div>
            
            {currentVerification && (
              <div className="flex justify-between items-center text-sm">
                <span>Attempts:</span>
                <span className="font-medium">{currentVerification.verification_attempts}</span>
              </div>
            )}
            
            <div className="flex justify-between items-center text-sm">
              <span>Last updated:</span>
              <span className="font-medium">
                {new Date(currentDeposit.updated_at).toLocaleTimeString()}
              </span>
            </div>
          </div>
          
          {currentDeposit.status === 'pending' || currentDeposit.status === 'processing' ? (
            <>
              <div className="space-y-1">
                <div className="flex justify-between items-center text-sm">
                  <span>Auto-verification in:</span>
                  <span className="font-medium">{formatTime(countdown)}</span>
                </div>
                <Progress value={progress} />
              </div>
              
              <div className="bg-blue-50 border border-blue-100 rounded-md p-3 text-sm text-blue-700">
                <p className="flex items-center">
                  <Clock className="h-4 w-4 mr-2" />
                  Your payment is being verified. This usually takes 1-5 minutes.
                </p>
              </div>
            </>
          ) : currentDeposit.status === 'completed' ? (
            <div className="bg-green-50 border border-green-100 rounded-md p-3 text-sm text-green-700">
              <p className="flex items-center">
                <CheckCircle className="h-4 w-4 mr-2" />
                Your payment has been verified and funds have been added to your account.
              </p>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-100 rounded-md p-3 text-sm text-red-700">
              <p className="flex items-center">
                <AlertCircle className="h-4 w-4 mr-2" />
                {currentVerification?.verification_data?.error || 
                 "There was an issue verifying your payment. Please contact support."}
              </p>
            </div>
          )}
        </div>
      </CardContent>
      
      <CardFooter>
        <div className="flex justify-between w-full">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleManualCheck}
            disabled={checking}
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${checking ? 'animate-spin' : ''}`} />
            Refresh Status
          </Button>
          
          {currentDeposit.status === 'completed' && (
            <Button 
              size="sm" 
              onClick={onComplete}
            >
              Continue
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default USDTPaymentStatus;
