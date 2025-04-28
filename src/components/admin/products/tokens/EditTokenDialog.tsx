
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { UserToken } from '@/types/tokens';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useQueryClient } from '@tanstack/react-query';

interface EditTokenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  token: UserToken | null;
}

export function EditTokenDialog({ open, onOpenChange, token }: EditTokenDialogProps) {
  const [name, setName] = useState(token?.name || '');
  const [description, setDescription] = useState(token?.description || '');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  React.useEffect(() => {
    if (open && token) {
      setName(token.name);
      setDescription(token.description || '');
    }
  }, [open, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token) return;
    
    setIsLoading(true);
    
    try {
      const { error } = await supabase
        .from('user_tokens')
        .update({
          name,
          description,
          updated_at: new Date().toISOString()
        })
        .eq('id', token.id);
        
      if (error) throw error;
      
      toast({
        title: 'Token updated',
        description: `Token "${name}" has been updated successfully.`
      });
      
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ['user-tokens'] });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update token',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Token</DialogTitle>
          <DialogDescription>
            Update the details of your API token.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="name">Token Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter token name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this token used for?"
              rows={3}
            />
          </div>
          
          <div className="pt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update Token'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
