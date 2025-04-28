
import React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Edit, Trash2, Star, StarOff, Eye, EyeOff } from 'lucide-react';
import { format } from 'date-fns';
import { UserToken } from '@/types/tokens';
import { EditTokenDialog } from './EditTokenDialog';
import { DeleteTokenDialog } from './DeleteTokenDialog';
import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface UserTokenTableProps {
  tokens: UserToken[];
  isLoading: boolean;
}

export function UserTokenTable({ tokens, isLoading }: UserTokenTableProps) {
  const [showToken, setShowToken] = React.useState<Record<string, boolean>>({});
  const [editToken, setEditToken] = React.useState<UserToken | null>(null);
  const [deleteToken, setDeleteToken] = React.useState<UserToken | null>(null);
  const queryClient = useQueryClient();

  const toggleFavoriteMutation = useMutation({
    mutationFn: async (token: UserToken) => {
      const { error } = await supabase
        .from('user_tokens')
        .update({ is_favorite: !token.is_favorite })
        .eq('id', token.id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-tokens'] });
      toast.success('Cập nhật thành công');
    },
    onError: () => {
      toast.error('Không thể cập nhật token');
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-500';
      case 'inactive':
        return 'bg-gray-500';
      case 'expired':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  if (isLoading) {
    return <div className="flex justify-center py-8">Đang tải...</div>;
  }

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[30px]"></TableHead>
            <TableHead>Tên Token</TableHead>
            <TableHead>Mã Token</TableHead>
            <TableHead>Mô tả</TableHead>
            <TableHead>Ngày tạo</TableHead>
            <TableHead>Hết hạn</TableHead>
            <TableHead>Trạng thái</TableHead>
            <TableHead className="w-[100px]">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tokens.map((token) => (
            <TableRow key={token.id}>
              <TableCell>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => toggleFavoriteMutation.mutate(token)}
                >
                  {token.is_favorite ? (
                    <Star className="h-4 w-4 text-yellow-400" />
                  ) : (
                    <StarOff className="h-4 w-4" />
                  )}
                </Button>
              </TableCell>
              <TableCell>{token.name}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {showToken[token.id] ? token.token : '••••••••'}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setShowToken(prev => ({ 
                      ...prev, 
                      [token.id]: !prev[token.id] 
                    }))}
                  >
                    {showToken[token.id] ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </TableCell>
              <TableCell>{token.description}</TableCell>
              <TableCell>
                {format(new Date(token.created_at), 'dd/MM/yyyy')}
              </TableCell>
              <TableCell>
                {token.expires_at ? 
                  format(new Date(token.expires_at), 'dd/MM/yyyy') : 
                  'Không giới hạn'}
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(token.status)}>
                  {token.status}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEditToken(token)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setDeleteToken(token)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {editToken && (
        <EditTokenDialog
          token={editToken}
          open={!!editToken}
          onOpenChange={(open) => !open && setEditToken(null)}
        />
      )}

      {deleteToken && (
        <DeleteTokenDialog
          token={deleteToken}
          open={!!deleteToken}
          onOpenChange={(open) => !open && setDeleteToken(null)}
        />
      )}
    </>
  );
}
