
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Clock, AlertCircle, XCircle } from "lucide-react";
import { PaymentStatus } from '@/contexts/PaymentContext';
import { differenceInSeconds, formatDistanceToNow } from 'date-fns';

interface DepositStatusProps {
  status: PaymentStatus;
  createdAt: string;
}

export const DepositStatus = ({ status, createdAt }: DepositStatusProps) => {
  const createdTime = new Date(createdAt);
  const secondsElapsed = differenceInSeconds(new Date(), createdTime);
  const timeAgo = formatDistanceToNow(createdTime, { addSuffix: true });

  const renderStatusSteps = () => {
    // Helper to determine if a step is active
    const isActive = (stepStatus: string) => {
      if (stepStatus === 'submitted') return true;
      if (stepStatus === 'verified' && (status === 'processing' || status === 'completed')) return true;
      if (stepStatus === 'completed' && status === 'completed') return true;
      if (stepStatus === 'failed' && status === 'failed') return true;
      return false;
    };

    return (
      <div className="space-y-6 py-2">
        <div className="flex items-start">
          <div className={`rounded-full p-1 ${isActive('submitted') ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="ml-4">
            <p className="font-medium">Transaction Submitted</p>
            <p className="text-sm text-muted-foreground">{timeAgo}</p>
          </div>
        </div>
        
        <div className="h-8 w-px bg-border ml-3"></div>
        
        <div className="flex items-start">
          {status === 'pending' ? (
            <div className="rounded-full p-1 bg-yellow-100 text-yellow-600">
              <Clock className="h-5 w-5" />
            </div>
          ) : status === 'failed' ? (
            <div className="rounded-full p-1 bg-red-100 text-red-600">
              <XCircle className="h-5 w-5" />
            </div>
          ) : (
            <div className={`rounded-full p-1 ${isActive('verified') ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
              <CheckCircle2 className="h-5 w-5" />
            </div>
          )}
          <div className="ml-4">
            <p className="font-medium">Transaction Verified</p>
            <p className="text-sm text-muted-foreground">
              {status === 'pending' && 'Verification in progress...'}
              {status === 'processing' && 'Verified, processing payment...'}
              {status === 'completed' && 'Successfully verified'}
              {status === 'failed' && 'Verification failed'}
            </p>
          </div>
        </div>
        
        {status !== 'failed' && (
          <>
            <div className="h-8 w-px bg-border ml-3"></div>
            
            <div className="flex items-start">
              {status === 'completed' ? (
                <div className="rounded-full p-1 bg-green-100 text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              ) : (
                <div className="rounded-full p-1 bg-gray-100 text-gray-400">
                  <Clock className="h-5 w-5" />
                </div>
              )}
              <div className="ml-4">
                <p className="font-medium">Funds Added</p>
                <p className="text-sm text-muted-foreground">
                  {status === 'completed' ? 'Funds added to your balance' : 'Waiting to complete...'}
                </p>
              </div>
            </div>
          </>
        )}
        
        {status === 'failed' && (
          <>
            <div className="h-8 w-px bg-border ml-3"></div>
            
            <div className="flex items-start">
              <div className="rounded-full p-1 bg-red-100 text-red-600">
                <AlertCircle className="h-5 w-5" />
              </div>
              <div className="ml-4">
                <p className="font-medium">Transaction Failed</p>
                <p className="text-sm text-muted-foreground">
                  The transaction could not be processed. Please contact support.
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <h3 className="text-lg font-medium mb-4">Transaction Progress</h3>
        {renderStatusSteps()}
        {status === 'pending' && secondsElapsed > 300 && (
          <div className="mt-4 text-sm text-muted-foreground">
            <p>This verification is taking longer than usual. Please be patient as we complete the process.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
