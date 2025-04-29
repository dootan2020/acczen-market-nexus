
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Loader2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export function ResetExpiredDiscountsButton() {
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [result, setResult] = useState<{count: number} | null>(null);

  const handleResetExpiredDiscounts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('reset-expired-discounts');
      
      if (error) {
        throw error;
      }
      
      setResult(data);
      toast.success(
        data.count > 0 
          ? `Reset ${data.count} expired discount${data.count === 1 ? '' : 's'}` 
          : 'No expired discounts found'
      );
    } catch (error) {
      console.error('Error resetting expired discounts:', error);
      toast.error('Failed to reset expired discounts');
    } finally {
      setIsLoading(false);
      setIsDialogOpen(false);
    }
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsDialogOpen(true)}
        disabled={isLoading}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <RefreshCw className="h-4 w-4 mr-2" />
        )}
        Reset Expired Discounts
      </Button>
      
      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Expired Discounts</AlertDialogTitle>
            <AlertDialogDescription>
              This will reset all temporary discounts that have expired to 0%.
              This normally happens automatically at midnight, but you can run it manually.
              Do you want to proceed?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetExpiredDiscounts} disabled={isLoading}>
              {isLoading ? 'Processing...' : 'Reset Expired Discounts'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
