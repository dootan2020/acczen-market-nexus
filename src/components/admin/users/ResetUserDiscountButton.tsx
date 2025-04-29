
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
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
import { useUserDiscount } from '@/hooks/admin/useUserDiscount';
import { Loader2, RefreshCw } from 'lucide-react';

interface ResetUserDiscountButtonProps {
  userId: string;
  username?: string;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

export const ResetUserDiscountButton: React.FC<ResetUserDiscountButtonProps> = ({
  userId,
  username,
  variant = 'outline',
  size = 'sm'
}) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { setDiscountMutation } = useUserDiscount(userId);
  
  const handleResetDiscount = async () => {
    setDiscountMutation.mutate({
      userId,
      discountPercentage: 0,
      discountNote: 'Manually reset by admin'
    });
    setDialogOpen(false);
  };
  
  return (
    <>
      <Button 
        variant={variant} 
        size={size} 
        onClick={() => setDialogOpen(true)}
        disabled={setDiscountMutation.isPending}
      >
        {setDiscountMutation.isPending ? (
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
        ) : (
          <RefreshCw className="h-4 w-4 mr-2" />
        )}
        Reset Discount
      </Button>
      
      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset User Discount</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove all discounts for {username || 'this user'}.
              The discount percentage will be set to 0%.
              Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetDiscount}>
              Reset Discount
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
