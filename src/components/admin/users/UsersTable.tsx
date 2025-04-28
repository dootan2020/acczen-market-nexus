
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { UserProfile } from '@/hooks/admin/types/userManagement.types';
import { Pencil, Wallet, Eye } from 'lucide-react';
import { 
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface UsersTableProps {
  users: UserProfile[];
  onEditRole: (user: UserProfile) => void;
  onAdjustBalance: (user: UserProfile) => void;
  onViewUser: (user: UserProfile) => void;
}

export function UsersTable({ users, onEditRole, onAdjustBalance, onViewUser }: UsersTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[250px]">User</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Balance</TableHead>
          <TableHead>Created</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="h-24 text-center">
              No users found.
            </TableCell>
          </TableRow>
        ) : (
          users.map((user) => (
            <TableRow key={user.id}>
              <TableCell className="font-medium">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar_url || ''} alt={user.username || ''} />
                    <AvatarFallback>
                      {user.username?.[0].toUpperCase() || user.email?.[0].toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{user.username || user.full_name || 'Unnamed User'}</div>
                    <div className="text-sm text-muted-foreground">{user.email}</div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant={user.role === 'admin' ? "destructive" : "outline"}>
                  {user.role}
                </Badge>
              </TableCell>
              <TableCell>${user.balance?.toFixed(2) || '0.00'}</TableCell>
              <TableCell>
                {user.created_at 
                  ? new Date(user.created_at).toLocaleDateString() 
                  : 'N/A'
                }
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onViewUser(user)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onEditRole(user)}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => onAdjustBalance(user)}
                  >
                    <Wallet className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
