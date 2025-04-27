
import { TableRow, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatDistanceToNow } from 'date-fns';

interface UserProfile {
  id: string;
  email: string;
  username: string;
  full_name: string;
  role: string;
  balance: number;
  created_at: string;
}

interface UsersTableProps {
  users: UserProfile[];
  onEditRole: (user: UserProfile) => void;
  onAdjustBalance: (user: UserProfile) => void;
}

export const UsersTable = ({ users, onEditRole, onAdjustBalance }: UsersTableProps) => {
  if (!users?.length) {
    return (
      <TableRow>
        <TableCell colSpan={6} className="text-center py-6">
          No users found
        </TableCell>
      </TableRow>
    );
  }

  return (
    <>
      {users.map((user) => (
        <TableRow key={user.id}>
          <TableCell>
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium mr-3">
                {(user.full_name?.[0] || user.username?.[0] || user.email?.[0] || '?').toUpperCase()}
              </div>
              <div>
                <div className="font-medium">{user.full_name || user.username || 'Unknown'}</div>
                <div className="text-sm text-muted-foreground">{user.id.substring(0, 8)}...</div>
              </div>
            </div>
          </TableCell>
          <TableCell>{user.email}</TableCell>
          <TableCell>
            <Badge variant={user.role === 'admin' ? 'default' : 'outline'}>
              {user.role}
            </Badge>
          </TableCell>
          <TableCell className="text-right">${user.balance?.toFixed(2) || '0.00'}</TableCell>
          <TableCell>{formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}</TableCell>
          <TableCell className="text-right">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEditRole(user)}>
                  Change Role
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onAdjustBalance(user)}>
                  Adjust Balance
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TableCell>
        </TableRow>
      ))}
    </>
  );
};
