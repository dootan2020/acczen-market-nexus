
import React from 'react';
import { AlertCircle, XCircle, AlertTriangle, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export type ErrorSeverity = 'error' | 'warning' | 'info';

interface ErrorAlertProps {
  title?: string;
  message: string;
  details?: string;
  action?: React.ReactNode;
  severity?: ErrorSeverity;
  onDismiss?: () => void;
}

const ErrorAlert: React.FC<ErrorAlertProps> = ({
  title,
  message,
  details,
  action,
  severity = 'error',
  onDismiss
}) => {
  const getIcon = () => {
    switch (severity) {
      case 'error':
        return <XCircle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      case 'info':
        return <Info className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };
  
  const getAlertVariant = () => {
    switch (severity) {
      case 'error':
        return 'destructive';
      case 'warning':
        return 'warning';
      case 'info':
        return 'default';
      default:
        return 'destructive';
    }
  };
  
  return (
    <Alert variant={getAlertVariant() as any} className="my-4">
      <div className="flex items-start">
        <div className="flex-shrink-0 mt-0.5">
          {getIcon()}
        </div>
        <div className="ml-3 flex-1">
          {title && <AlertTitle>{title}</AlertTitle>}
          <AlertDescription className="text-sm">
            {message}
            {details && (
              <details className="mt-2 text-xs">
                <summary>Chi tiết kỹ thuật</summary>
                <p className="p-2 bg-black/5 rounded mt-1 whitespace-pre-wrap">{details}</p>
              </details>
            )}
          </AlertDescription>
          {action && (
            <div className="mt-3">
              {action}
            </div>
          )}
        </div>
        {onDismiss && (
          <button 
            onClick={onDismiss} 
            className="flex-shrink-0 ml-2"
            aria-label="Đóng"
          >
            <XCircle className="h-4 w-4" />
          </button>
        )}
      </div>
    </Alert>
  );
};

export default ErrorAlert;
