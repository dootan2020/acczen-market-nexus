
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface DepositStatusProps {
  status: string;
  createdAt: string;
}

export const DepositStatus: React.FC<DepositStatusProps> = ({ status, createdAt }) => {
  const createdTime = new Date(createdAt);
  const now = new Date();
  const minutesSinceCreation = Math.floor((now.getTime() - createdTime.getTime()) / 60000);

  // Set color based on status
  const getStatusColor = () => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'failed': return 'bg-red-500';
      case 'rejected': return 'bg-red-500';
      case 'processing': return 'bg-blue-500'; 
      default: return 'bg-amber-500'; // pending
    }
  };

  // Set icon based on status
  const getStatusIcon = () => {
    switch (status) {
      case 'completed': 
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'failed':
      case 'rejected':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'processing':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      default: // pending
        return <Clock className="h-5 w-5 text-amber-500" />;
    }
  };

  // Get expected wait time message
  const getWaitMessage = () => {
    if (status === 'completed') {
      return "Transaction completed successfully";
    } else if (status === 'failed' || status === 'rejected') {
      return "Transaction failed. Please contact support.";
    } else if (status === 'processing') {
      return "Transaction confirmed, finalizing deposit";
    } else {
      // For pending state
      if (minutesSinceCreation < 5) {
        return "Expected wait time: 1-5 minutes";
      } else if (minutesSinceCreation < 15) {
        return "Expected wait time: 5-15 minutes";
      } else {
        return "Taking longer than usual. Please contact support if this persists.";
      }
    }
  };

  // Get steps based on status
  const steps = [
    {
      name: "Deposit initiated",
      status: "complete",
      icon: <CheckCircle2 className="h-5 w-5 text-green-500" />
    },
    {
      name: "Transaction confirmation",
      status: status === 'pending' ? "current" : (status === 'completed' || status === 'processing' ? "complete" : "failed"),
      icon: status === 'pending' ? 
        <Clock className="h-5 w-5 text-amber-500" /> : 
        (status === 'completed' || status === 'processing' ? 
          <CheckCircle2 className="h-5 w-5 text-green-500" /> : 
          <AlertCircle className="h-5 w-5 text-red-500" />)
    },
    {
      name: "Funds credited",
      status: status === 'completed' ? "complete" : (status === 'processing' ? "current" : "upcoming"),
      icon: status === 'completed' ? 
        <CheckCircle2 className="h-5 w-5 text-green-500" /> : 
        (status === 'processing' ? 
          <Loader2 className="h-5 w-5 text-blue-500 animate-spin" /> : 
          <Clock className="h-5 w-5 text-muted-foreground" />)
    }
  ];

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium">Deposit Progress</h3>
          <div className="flex items-center gap-2">
            <span className={cn(
              "h-2.5 w-2.5 rounded-full", 
              getStatusColor()
            )} />
            <span className="font-medium capitalize">{status}</span>
          </div>
        </div>

        <div className="mt-2 space-y-4">
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            {getStatusIcon()}
            <span>{getWaitMessage()}</span>
          </div>

          <div className="relative">
            {/* Timeline */}
            <div className="absolute left-2.5 top-0 h-full w-0.5 bg-gray-200" />

            <ul className="space-y-6">
              {steps.map((step, index) => (
                <li key={index} className="relative pl-10">
                  <div className={cn(
                    "absolute left-0 top-0 flex h-6 w-6 items-center justify-center rounded-full border",
                    step.status === "complete" ? "border-green-500 bg-green-50" :
                    step.status === "current" ? "border-amber-500 bg-amber-50" :
                    step.status === "failed" ? "border-red-500 bg-red-50" :
                    "border-gray-300 bg-white"
                  )}>
                    {step.icon}
                  </div>
                  <div className="flex flex-col">
                    <span className={cn(
                      "text-sm font-medium",
                      step.status === "complete" ? "text-green-600" :
                      step.status === "current" ? "text-amber-600" :
                      step.status === "failed" ? "text-red-600" :
                      "text-muted-foreground"
                    )}>
                      {step.name}
                    </span>
                    {step.status === "current" && (
                      <span className="text-xs text-muted-foreground">In progress</span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
