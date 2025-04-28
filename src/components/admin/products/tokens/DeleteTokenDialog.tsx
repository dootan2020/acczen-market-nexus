
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserToken } from '@/types/tokens';

interface DeleteTokenDialogProps {
  token: UserToken;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DeleteTokenDialog({ token, open, onOpenChange }: DeleteTokenDialogProps) {
  const queryClient = useQueryClient();

  const deleteTokenMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('user_tokens')
        .delete()
        .eq('id', token.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-tokens'] });
      toast.success('Token đã được xóa');
      onOpenChange(false);
    },
    onError: () => {
      toast.error('Không thể xóa token');
    }
  });

  const handleDelete = () => {
    deleteTokenMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Xóa Token</DialogTitle>
          <DialogDescription>
            Bạn có chắc chắn muốn xóa token "<strong>{token.name}</strong>"? 
            Hành động này không thể hoàn tác.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <div className="flex justify-end gap-2 w-full">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteTokenMutation.isPending}
            >
              {deleteTokenMutation.isPending ? 'Đang xóa...' : 'Xóa Token'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
