
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Label } from '@/components/ui/label';
import { Search, MoreVertical, UserCog, Wallet, Shield } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const AdminUsers = () => {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isEditRoleDialogOpen, setIsEditRoleDialogOpen] = useState(false);
  const [isAdjustBalanceDialogOpen, setIsAdjustBalanceDialogOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [balanceAmount, setBalanceAmount] = useState<string>('');
  const [balanceAction, setBalanceAction] = useState<'add' | 'subtract'>('add');

  // Fetch users
  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-users'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  });

  // Update user role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ id, role }: { id: string, role: string }) => {
      const { error } = await supabase
        .from('profiles')
        .update({ role })
        .eq('id', id);
      
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: 'User role updated',
        description: 'The user role has been updated successfully.',
      });
      setIsEditRoleDialogOpen(false);
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update user role',
      });
    },
  });

  // Adjust user balance mutation
  const adjustBalanceMutation = useMutation({
    mutationFn: async ({ id, amount, action }: { id: string, amount: number, action: 'add' | 'subtract' }) => {
      // First get the current balance
      const { data: userData, error: fetchError } = await supabase
        .from('profiles')
        .select('balance')
        .eq('id', id)
        .single();
      
      if (fetchError) throw fetchError;
      
      const currentBalance = userData?.balance || 0;
      const newBalance = action === 'add' 
        ? currentBalance + amount
        : Math.max(0, currentBalance - amount);
      
      // Update the balance
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ balance: newBalance })
        .eq('id', id);
      
      if (updateError) throw updateError;
      
      // Add a transaction record
      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: id,
          amount: amount,
          type: action === 'add' ? 'deposit' : 'withdrawal',
          description: `Admin ${action === 'add' ? 'added' : 'subtracted'} funds`,
        });
      
      if (transactionError) throw transactionError;
      
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      toast({
        title: 'Balance adjusted',
        description: 'The user balance has been adjusted successfully.',
      });
      setIsAdjustBalanceDialogOpen(false);
      setBalanceAmount('');
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to adjust user balance',
      });
    },
  });

  // Handle edit role dialog
  const handleEditRoleDialog = (user: any) => {
    setCurrentUser(user);
    setSelectedRole(user.role);
    setIsEditRoleDialogOpen(true);
  };

  // Handle adjust balance dialog
  const handleAdjustBalanceDialog = (user: any) => {
    setCurrentUser(user);
    setBalanceAmount('');
    setBalanceAction('add');
    setIsAdjustBalanceDialogOpen(true);
  };

  // Handle update role
  const handleUpdateRole = () => {
    if (currentUser && selectedRole) {
      updateRoleMutation.mutate({ id: currentUser.id, role: selectedRole });
    }
  };

  // Handle adjust balance
  const handleAdjustBalance = () => {
    const amount = parseFloat(balanceAmount);
    if (currentUser && amount && !isNaN(amount) && amount > 0) {
      adjustBalanceMutation.mutate({ 
        id: currentUser.id, 
        amount, 
        action: balanceAction 
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Invalid amount',
        description: 'Please enter a valid positive number for the amount.',
      });
    }
  };

  // Filter users by search query and role
  const filteredUsers = users?.filter(user => {
    const matchesSearch = 
      (user.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.full_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRole = !roleFilter || user.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  // Get user initials for avatar fallback
  const getUserInitials = (user: any) => {
    if (user.full_name) {
      return user.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase();
    }
    
    if (user.username) {
      return user.username.substring(0, 2).toUpperCase();
    }
    
    return user.email.substring(0, 2).toUpperCase();
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Users</h1>
      </div>
      
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input 
            className="pl-10" 
            placeholder="Search users by email, username, or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Select
          value={roleFilter || ''}
          onValueChange={(value) => setRoleFilter(value || null)}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Roles</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead className="text-right">Balance</TableHead>
                    <TableHead>Joined</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUsers?.length ? (
                    filteredUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            <Avatar>
                              <AvatarImage src={user.avatar_url} />
                              <AvatarFallback>{getUserInitials(user)}</AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{user.username || 'No username'}</div>
                              <div className="text-xs text-muted-foreground">{user.full_name || ''}</div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">${Number(user.balance).toFixed(2)}</TableCell>
                        <TableCell>{format(new Date(user.created_at), 'MMM dd, yyyy')}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditRoleDialog(user)}>
                                <Shield className="h-4 w-4 mr-2" />
                                Change Role
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleAdjustBalanceDialog(user)}>
                                <Wallet className="h-4 w-4 mr-2" />
                                Adjust Balance
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6">
                        No users found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Edit Role Dialog */}
      <Dialog open={isEditRoleDialogOpen} onOpenChange={setIsEditRoleDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Update the role for user {currentUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select
              value={selectedRole}
              onValueChange={setSelectedRole}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              onClick={handleUpdateRole}
              disabled={updateRoleMutation.isPending || selectedRole === currentUser?.role}
            >
              {updateRoleMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-b-transparent mr-2"></div>
                  Updating...
                </>
              ) : 'Update Role'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Adjust Balance Dialog */}
      <Dialog open={isAdjustBalanceDialogOpen} onOpenChange={setIsAdjustBalanceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust User Balance</DialogTitle>
            <DialogDescription>
              Adjust the balance for user {currentUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="flex justify-between items-center">
              <Label>Current Balance:</Label>
              <span className="font-medium">${currentUser?.balance?.toFixed(2) || '0.00'}</span>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="action">Action</Label>
              <Select
                value={balanceAction}
                onValueChange={(value: any) => setBalanceAction(value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add">Add Funds</SelectItem>
                  <SelectItem value="subtract">Subtract Funds</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={balanceAmount}
                onChange={(e) => setBalanceAmount(e.target.value)}
                placeholder="Enter amount"
              />
            </div>
            
            {balanceAmount && !isNaN(parseFloat(balanceAmount)) && (
              <div className="flex justify-between items-center p-2 bg-muted rounded">
                <Label>New Balance:</Label>
                <span className="font-medium">
                  $
                  {balanceAction === 'add'
                    ? ((currentUser?.balance || 0) + parseFloat(balanceAmount)).toFixed(2)
                    : Math.max(0, (currentUser?.balance || 0) - parseFloat(balanceAmount)).toFixed(2)
                  }
                </span>
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              onClick={handleAdjustBalance}
              disabled={adjustBalanceMutation.isPending || !balanceAmount || isNaN(parseFloat(balanceAmount)) || parseFloat(balanceAmount) <= 0}
            >
              {adjustBalanceMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-b-transparent mr-2"></div>
                  Processing...
                </>
              ) : 'Adjust Balance'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminUsers;
