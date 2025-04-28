
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface AddTokenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddTokenDialog({ open, onOpenChange }: AddTokenDialogProps) {
  const [name, setName] = React.useState('');
  const [token, setToken] = React.useState('');
  const [description, setDescription] = React.useState('');
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const addTokenMutation = useMutation({
    mutationFn: async () => {
      // Make sure we have a user ID
      if (!user?.id) {
        throw new Error("Bạn cần đăng nhập để thêm token");
      }
      
      const { error } = await supabase
        .from('user_tokens')
        .insert({
          name,
          token,
          description,
          user_id: user.id
        });
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-tokens'] });
      toast.success('Token đã được thêm thành công');
      onOpenChange(false);
      setName('');
      setToken('');
      setDescription('');
    },
    onError: () => {
      toast.error('Không thể thêm token');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTokenMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Thêm Token Mới</DialogTitle>
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
              required
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="Nhập mã token"
            />
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
              disabled={addTokenMutation.isPending}
            >
              {addTokenMutation.isPending ? 'Đang thêm...' : 'Thêm Token'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
