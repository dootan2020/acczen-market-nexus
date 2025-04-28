
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { UserToken } from '@/types/tokens';

interface EditTokenDialogProps {
  token: UserToken;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditTokenDialog({ token, open, onOpenChange }: EditTokenDialogProps) {
  const [name, setName] = React.useState(token.name);
  const [description, setDescription] = React.useState(token.description || '');
  const queryClient = useQueryClient();

  React.useEffect(() => {
    if (token) {
      setName(token.name);
      setDescription(token.description || '');
    }
  }, [token]);

  const updateTokenMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('user_tokens')
        .update({
          name,
          description,
        })
        .eq('id', token.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-tokens'] });
      toast.success('Token đã được cập nhật');
      onOpenChange(false);
    },
    onError: () => {
      toast.error('Không thể cập nhật token');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateTokenMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Chỉnh Sửa Token</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Tên Token</Label>
            <Input
              id="name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên cho token"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="token">Mã Token</Label>
            <Input
              id="token"
              value={token.token}
              disabled
              className="bg-muted"
            />
            <p className="text-xs text-muted-foreground">Mã token không thể thay đổi</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Thêm mô tả cho token (không bắt buộc)"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Hủy
            </Button>
            <Button 
              type="submit"
              disabled={updateTokenMutation.isPending}
            >
              {updateTokenMutation.isPending ? 'Đang cập nhật...' : 'Cập Nhật Token'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
