
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Edit, Trash, Copy, Check } from 'lucide-react';
import { format } from 'date-fns';
import { UserToken } from '@/types/tokens';
import { EditTokenDialog } from './EditTokenDialog';
import { DeleteTokenDialog } from './DeleteTokenDialog';
import { useToast } from '@/components/ui/use-toast';

interface UserTokenTableProps {
  tokens: UserToken[];
  isLoading: boolean;
}

export function UserTokenTable({ tokens, isLoading }: UserTokenTableProps) {
  const [selectedToken, setSelectedToken] = useState<UserToken | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);
  const { toast } = useToast();

  const handleEditToken = (token: UserToken) => {
    setSelectedToken(token);
    setIsEditDialogOpen(true);
  };

  const handleDeleteToken = (token: UserToken) => {
    setSelectedToken(token);
    setIsDeleteDialogOpen(true);
  };

  const copyTokenPreview = (token: UserToken) => {
    // Only copy first 8 chars followed by ***
    const previewToken = `${token.token.substring(0, 8)}***`;
    navigator.clipboard.writeText(previewToken);
    
    setCopiedToken(token.id);
    toast({
      title: "Copied to clipboard",
      description: "Token preview copied. For security reasons, only a partial token is shown.",
    });
    
    setTimeout(() => setCopiedToken(null), 2000);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (tokens.length === 0) {
    return (
      <div className="text-center py-8 border rounded-lg">
        <p className="text-muted-foreground">No tokens found. Create a new token to get started.</p>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-md border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Token</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tokens.map((token) => (
              <TableRow key={token.id}>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={token.is_favorite ? 'text-yellow-500' : 'text-muted-foreground'}
                  >
                    <Star className="h-4 w-4" />
                  </Button>
                </TableCell>
                <TableCell className="font-medium">{token.name}</TableCell>
                <TableCell className="font-mono">
                  <div className="flex items-center">
                    {`${token.token.substring(0, 8)}***`}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="ml-2"
                      onClick={() => copyTokenPreview(token)}
                    >
                      {copiedToken === token.id ? (
                        <Check className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </TableCell>
                <TableCell className="max-w-md truncate">
                  {token.description || "-"}
                </TableCell>
                <TableCell>
                  {token.created_at
                    ? format(new Date(token.created_at), 'MMM d, yyyy')
                    : '-'}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={token.status === 'active' ? 'default' : 'secondary'}
                  >
                    {token.status || 'active'}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditToken(token)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteToken(token)}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <EditTokenDialog
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        token={selectedToken}
      />

      <DeleteTokenDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        token={selectedToken}
      />
    </>
  );
}
