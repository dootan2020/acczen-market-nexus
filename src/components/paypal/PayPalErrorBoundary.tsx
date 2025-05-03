
import React, { Component, ErrorInfo } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { FallbackPayPalButton } from './FallbackPayPalButton';

interface Props {
  children: React.ReactNode;
  amount?: number; 
  onSuccess?: (orderDetails: any, amount: number) => Promise<void>;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class PayPalErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('PayPal Error Boundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Payment Error</AlertTitle>
            <AlertDescription>
              There was a problem loading the PayPal payment system. You can try our fallback payment option below.
            </AlertDescription>
          </Alert>
          {this.props.amount && this.props.onSuccess ? (
            <FallbackPayPalButton 
              amount={this.props.amount} 
              onSuccess={this.props.onSuccess} 
            />
          ) : (
            <Alert>
              <AlertDescription>
                Unable to load fallback payment option. Please try again later.
              </AlertDescription>
            </Alert>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
