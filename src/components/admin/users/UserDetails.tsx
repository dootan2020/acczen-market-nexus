
import React from 'react';
import { 
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetFooter,
  SheetDescription
} from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import {
  Avatar,
  AvatarFallback,
  AvatarImage
} from '@/components/ui/avatar';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Wallet, UserCheck } from 'lucide-react';
import { UserProfile } from '@/hooks/admin/types/userManagement.types';

interface UserDetailsProps {
  user: UserProfile;
  onEdit: () => void;
  onAdjustBalance: () => void;
}

export function UserDetails({ user, onEdit, onAdjustBalance }: UserDetailsProps) {
  // Helper function to get user initials
  const getUserInitials = (name?: string, email?: string): string => {
    if (name && name.length > 0) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase();
    }
    if (email && email.length > 0) {
      return email[0].toUpperCase();
    }
    return 'U';
  };
  
  // Helper function to format date
  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon">
          <Eye className="h-4 w-4" />
        </Button>
      </SheetTrigger>
      <SheetContent className="overflow-y-auto">
        <SheetHeader className="mb-4">
          <SheetTitle>User Details</SheetTitle>
          <SheetDescription>View complete information about this user</SheetDescription>
        </SheetHeader>
        
        <div className="space-y-6">
          <div className="flex flex-col items-center text-center">
            <Avatar className="h-20 w-20 mb-2">
              <AvatarImage src={user.avatar_url || ''} alt={user.username || ''} />
              <AvatarFallback>{getUserInitials(user.full_name, user.email)}</AvatarFallback>
            </Avatar>
            <h3 className="text-lg font-semibold">{user.full_name || user.username || 'Unnamed User'}</h3>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <Badge className="mt-2" variant={user.role === 'admin' ? "destructive" : "outline"}>
              {user.role}
            </Badge>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="font-medium">Username</div>
                <div className="text-right">{user.username || 'N/A'}</div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="font-medium">Balance</div>
                <div className="text-right font-semibold">${user.balance?.toFixed(2) || '0.00'}</div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="font-medium">User ID</div>
                <div className="text-right text-xs text-muted-foreground break-all">{user.id}</div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="font-medium">Joined</div>
                <div className="text-right">{formatDate(user.created_at)}</div>
              </div>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="font-medium">Last Updated</div>
                <div className="text-right">{formatDate(user.updated_at)}</div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex gap-2">
            <Button className="flex-1" onClick={onEdit} variant="outline">
              <Edit className="h-4 w-4 mr-2" />
              Edit Role
            </Button>
            <Button className="flex-1" onClick={onAdjustBalance} variant="outline">
              <Wallet className="h-4 w-4 mr-2" />
              Adjust Balance
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
