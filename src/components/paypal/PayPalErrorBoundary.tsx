
import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface PayPalErrorBoundaryProps {
  children: React.ReactNode;
  amount: number;
  onSuccess: (details: any, amount: number) => Promise<void>;
}

interface PayPalErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class PayPalErrorBoundary extends React.Component<PayPalErrorBoundaryProps, PayPalErrorBoundaryState> {
  constructor(props: PayPalErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('PayPal component error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert variant="destructive" className="mt-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>PayPal Integration Error</AlertTitle>
          <AlertDescription>
            There was a problem loading the PayPal button. Please refresh the page or try again later.
          </AlertDescription>
        </Alert>
      );
    }

    return this.props.children;
  }
}
