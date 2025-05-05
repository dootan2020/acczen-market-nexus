
import React from 'react';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorAlertProps {
  title?: string;
  message: string;
  details?: string;
  action?: React.ReactNode;
  className?: string;
  variant?: 'default' | 'destructive';
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({
  title = 'Error',
  message,
  details,
  action,
  className,
  variant = 'destructive'
}) => {
  return (
    <Alert variant={variant} className={cn('mb-4', className)}>
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription className="mt-2">
        <p>{message}</p>
        
        {details && (
          <details className="mt-2 text-sm">
            <summary className="cursor-pointer font-medium">Technical Details</summary>
            <div className="mt-2 p-2 bg-background/80 rounded border border-border whitespace-pre-wrap">
              {details}
            </div>
          </details>
        )}
        
        {action && (
          <div className="mt-3">
            {action}
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
};

export default ErrorAlert;
