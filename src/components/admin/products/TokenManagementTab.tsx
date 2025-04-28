
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { UserTokenTable } from './tokens/UserTokenTable';
import { AddTokenDialog } from './tokens/AddTokenDialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { UserToken } from '@/types/tokens';
import { useAuth } from '@/contexts/AuthContext';

export function TokenManagementTab() {
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false);
  const { user } = useAuth();
  
  const { data: tokens, isLoading } = useQuery({
    queryKey: ['user-tokens'],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('user_tokens')
        .select('*')
        .order('is_favorite', { ascending: false })
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as UserToken[];
    },
    enabled: !!user?.id
  });

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Quản lý Token</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Thêm Token Mới
        </Button>
      </div>

      <UserTokenTable tokens={tokens || []} isLoading={isLoading} />
      
      <AddTokenDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
      />
    </Card>
  );
}
