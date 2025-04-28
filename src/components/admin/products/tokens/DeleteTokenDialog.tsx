
import React, { useState } from 'react';
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
import { supabase } from '@/integrations/supabase/client';
import { UserToken } from '@/types/tokens';
import { useToast } from '@/components/ui/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface DeleteTokenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  token: UserToken | null;
}

export function DeleteTokenDialog({ open, onOpenChange, token }: DeleteTokenDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleDelete = async () => {
    if (!token) return;
    
    setIsDeleting(true);
    
    try {
      const { error } = await supabase
        .from('user_tokens')
        .delete()
        .eq('id', token.id);
        
      if (error) throw error;
      
      toast({
        title: 'Token deleted',
        description: `Token "${token.name}" has been deleted successfully.`
      });
      
      queryClient.invalidateQueries({ queryKey: ['user-tokens'] });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to delete token',
        variant: 'destructive'
      });
    } finally {
      setIsDeleting(false);
      onOpenChange(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action will permanently delete the token "{token?.name}". 
            Any applications or services using this token will stop working immediately.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleDelete} 
            className="bg-destructive hover:bg-destructive/90"
            disabled={isDeleting}
          >
            {isDeleting ? 'Deleting...' : 'Delete Token'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
