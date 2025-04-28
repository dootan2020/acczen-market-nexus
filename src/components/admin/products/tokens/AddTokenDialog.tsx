
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';

interface AddTokenDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddTokenDialog({ open, onOpenChange }: AddTokenDialogProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [generatedToken, setGeneratedToken] = useState('');
  const [copied, setCopied] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const generateToken = () => {
    return [...Array(32)]
      .map(() => Math.floor(Math.random() * 36).toString(36))
      .join('')
      .toUpperCase();
  };

  const resetForm = () => {
    setName('');
    setDescription('');
    setGeneratedToken('');
    setCopied(false);
  };

  const handleDialogChange = (openState: boolean) => {
    if (!openState) {
      resetForm();
    }
    onOpenChange(openState);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      toast({
        title: 'Authentication error',
        description: 'You must be logged in to create a token',
        variant: 'destructive'
      });
      return;
    }
    
    setIsLoading(true);
    
    const token = generateToken();
    
    try {
      // Fix: Pass a single object to insert instead of an array of objects
      const { error } = await supabase
        .from('user_tokens')
        .insert({
          name,
          token,
          description,
          user_id: user.id,
          status: 'active',
          is_favorite: false
        });
        
      if (error) throw error;
      
      setGeneratedToken(token);
      toast({
        title: 'Token created',
        description: 'Your new API token has been created successfully.'
      });
      
      queryClient.invalidateQueries({ queryKey: ['user-tokens'] });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create token',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedToken);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Token</DialogTitle>
          <DialogDescription>
            Create an API token to access the system programmatically.
          </DialogDescription>
        </DialogHeader>
        
        {generatedToken ? (
          <div className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Your Token (copy it now, you won't see it again)</Label>
              <div className="flex items-center">
                <Input
                  value={generatedToken}
                  readOnly
                  className="font-mono pr-10"
                />
                <Button
                  size="icon"
                  variant="ghost"
                  className="ml-[-40px]"
                  onClick={copyToClipboard}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Make sure to save this token somewhere safe. It won't be shown again.
              </p>
            </div>
            
            <div className="pt-4 flex justify-end gap-2">
              <Button onClick={() => {
                resetForm();
                onOpenChange(false);
              }}>
                Done
              </Button>
            </div>
          </div>
        ) : (
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
                placeholder="What will this token be used for?"
                rows={3}
              />
            </div>
            
            <div className="pt-4 flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Creating...' : 'Create Token'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
