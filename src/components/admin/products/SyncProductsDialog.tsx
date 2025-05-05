
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { RefreshCcw, AlertCircle, CheckCircle } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface SyncProductsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSync: () => Promise<void>;
  isPending?: boolean;
}

export function SyncProductsDialog({
  isOpen,
  onOpenChange,
  onSync,
  isPending = false
}: SyncProductsDialogProps) {
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  
  const handleSync = async () => {
    setSyncStatus('syncing');
    setProgress(0);
    setError(null);
    
    // Start progress animation
    let interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) {
          clearInterval(interval);
          return prev;
        }
        return prev + 5;
      });
    }, 300);
    
    try {
      await onSync();
      setProgress(100);
      setSyncStatus('success');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      setSyncStatus('error');
    } finally {
      clearInterval(interval);
    }
  };
  
  const handleClose = () => {
    if (syncStatus !== 'syncing') {
      setSyncStatus('idle');
      setProgress(0);
      setError(null);
      onOpenChange(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Sync Products with External API</DialogTitle>
          <DialogDescription>
            This will synchronize product data with the TaphoaMMO API. New products will be added, and existing products will be updated.
          </DialogDescription>
        </DialogHeader>
        
        {syncStatus === 'idle' && (
          <div className="py-4 text-center">
            <RefreshCcw className="h-12 w-12 mx-auto text-primary mb-3" />
            <p className="text-sm text-muted-foreground">
              Ready to synchronize products. This process may take a few minutes.
            </p>
          </div>
        )}
        
        {syncStatus === 'syncing' && (
          <div className="py-4 space-y-4">
            <Progress value={progress} className="h-2" />
            <p className="text-sm text-center">
              Synchronizing products... Please don't close this window.
            </p>
          </div>
        )}
        
        {syncStatus === 'success' && (
          <div className="py-4 text-center">
            <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-3" />
            <p className="text-green-700 font-medium">Synchronization completed successfully!</p>
            <p className="text-sm text-muted-foreground mt-2">
              All products have been synchronized with the external API.
            </p>
          </div>
        )}
        
        {syncStatus === 'error' && (
          <div className="py-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error || 'An error occurred during synchronization.'}
              </AlertDescription>
            </Alert>
            <p className="text-sm text-muted-foreground mt-4 text-center">
              Please try again later or contact support if the issue persists.
            </p>
          </div>
        )}
        
        <DialogFooter>
          {syncStatus === 'idle' && (
            <>
              <Button 
                variant="outline" 
                onClick={handleClose}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSync}
                disabled={isPending}
              >
                <RefreshCcw className="mr-2 h-4 w-4" />
                Start Sync
              </Button>
            </>
          )}
          
          {syncStatus === 'syncing' && (
            <Button disabled>
              Syncing...
            </Button>
          )}
          
          {(syncStatus === 'success' || syncStatus === 'error') && (
            <>
              {syncStatus === 'error' && (
                <Button 
                  variant="outline" 
                  onClick={handleSync}
                  disabled={isPending}
                >
                  Try Again
                </Button>
              )}
              <Button onClick={handleClose}>
                Close
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
