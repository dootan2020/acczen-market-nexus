
import React from 'react';
import { useUserManagement } from '@/hooks/admin/useUserManagement';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Search, Filter, MoreHorizontal, DollarSign, Percent, Shield } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';

const Users = () => {
  const [date, setDate] = React.useState<Date | undefined>(undefined);
  const [balanceAmount, setBalanceAmount] = React.useState<string>('');
  const [balanceOperation, setBalanceOperation] = React.useState<'add' | 'subtract'>('add');
  const [balanceNotes, setBalanceNotes] = React.useState<string>('');
  const [discountPercentage, setDiscountPercentage] = React.useState<string>('');
  const [discountNote, setDiscountNote] = React.useState<string>('');
  const [selectedRole, setSelectedRole] = React.useState<'admin' | 'user'>('user');
  
  const {
    users,
    totalUsers,
    totalPages,
    currentPage,
    isLoading,
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
    currentUser,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isBalanceDialogOpen,
    setIsBalanceDialogOpen,
    isDiscountDialogOpen,
    setIsDiscountDialogOpen,
    nextPage,
    prevPage,
    goToPage,
    updateRoleMutation,
    adjustBalanceMutation,
    updateDiscountMutation
  } = useUserManagement();

  const handleUpdateRole = () => {
    if (currentUser) {
      updateRoleMutation.mutate({ 
        id: currentUser.id, 
        role: selectedRole 
      });
    }
  };

  const handleAdjustBalance = () => {
    if (currentUser && balanceAmount) {
      adjustBalanceMutation.mutate({ 
        id: currentUser.id, 
        amount: parseFloat(balanceAmount), 
        operation: balanceOperation,
        notes: balanceNotes
      });
    }
  };

  const handleUpdateDiscount = () => {
    if (currentUser && discountPercentage) {
      updateDiscountMutation.mutate({ 
        id: currentUser.id, 
        discountPercentage: parseFloat(discountPercentage), 
        discountNote: discountNote,
        expiresAt: date
      });
    }
  };

  const handleEditDialogOpen = (user: any) => {
    setSelectedRole(user.role);
    setIsEditDialogOpen(true);
  };

  const handleBalanceDialogOpen = (user: any) => {
    setBalanceAmount('');
    setBalanceOperation('add');
    setBalanceNotes('');
    setIsBalanceDialogOpen(true);
  };

  const handleDiscountDialogOpen = (user: any) => {
    setDiscountPercentage(user.discount_percentage?.toString() || '0');
    setDiscountNote(user.discount_note || '');
    setDate(user.discount_expires_at ? new Date(user.discount_expires_at) : undefined);
    setIsDiscountDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">User Management</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">
            Total: {totalUsers} users
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 items-end">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by email, username or name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        
        <Select value={roleFilter || ""} onValueChange={(value) => setRoleFilter(value || null)}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All roles</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="user">User</SelectItem>
          </SelectContent>
        </Select>
        
        <Button
          variant="outline"
          onClick={() => {
            setSearchQuery('');
            setRoleFilter(null);
          }}
        >
          <Filter className="mr-2 h-4 w-4" />
          Reset Filters
        </Button>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="py-3 px-4 text-left font-medium">Email</th>
                  <th className="py-3 px-4 text-left font-medium">Username</th>
                  <th className="py-3 px-4 text-left font-medium">Full Name</th>
                  <th className="py-3 px-4 text-left font-medium">Role</th>
                  <th className="py-3 px-4 text-left font-medium">Balance</th>
                  <th className="py-3 px-4 text-left font-medium">Discount</th>
                  <th className="py-3 px-4 text-left font-medium">Created</th>
                  <th className="py-3 px-4 text-center font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <>
                    {[...Array(5)].map((_, i) => (
                      <tr key={i} className="border-b">
                        <td colSpan={8} className="py-3 px-4">
                          <div className="h-6 bg-muted rounded animate-pulse"></div>
                        </td>
                      </tr>
                    ))}
                  </>
                ) : users.length > 0 ? (
                  users.map((user) => (
                    <tr key={user.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 max-w-[200px] truncate">{user.email}</td>
                      <td className="py-3 px-4">{user.username}</td>
                      <td className="py-3 px-4">{user.full_name || "-"}</td>
                      <td className="py-3 px-4">
                        <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">${user.balance.toFixed(2)}</td>
                      <td className="py-3 px-4">
                        {user.discount_percentage ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700">
                            {user.discount_percentage}%
                          </Badge>
                        ) : "-"}
                      </td>
                      <td className="py-3 px-4">{formatDate(user.created_at)}</td>
                      <td className="py-3 px-4 text-center">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => {
                              handleEditDialogOpen(user);
                            }}>
                              <Shield className="mr-2 h-4 w-4" />
                              Change Role
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              handleBalanceDialogOpen(user);
                            }}>
                              <DollarSign className="mr-2 h-4 w-4" />
                              Adjust Balance
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => {
                              handleDiscountDialogOpen(user);
                            }}>
                              <Percent className="mr-2 h-4 w-4" />
                              Set Discount
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-muted-foreground">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => prevPage()}
            disabled={currentPage === 1}
          >
            Previous
          </Button>
          <div className="text-sm">
            Page {currentPage} of {totalPages}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => nextPage()}
            disabled={currentPage === totalPages}
          >
            Next
          </Button>
        </div>
      )}

      {/* Edit Role Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change User Role</DialogTitle>
            <DialogDescription>
              Update role for {currentUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <RadioGroup 
              value={selectedRole} 
              onValueChange={(value) => setSelectedRole(value as 'admin' | 'user')}
            >
              <div className="flex items-center space-x-2 py-2">
                <RadioGroupItem value="admin" id="admin" />
                <Label htmlFor="admin">Admin</Label>
              </div>
              <div className="flex items-center space-x-2 py-2">
                <RadioGroupItem value="user" id="user" />
                <Label htmlFor="user">User</Label>
              </div>
            </RadioGroup>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              onClick={handleUpdateRole} 
              disabled={updateRoleMutation.isPending}
            >
              {updateRoleMutation.isPending ? "Updating..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Adjust Balance Dialog */}
      <Dialog open={isBalanceDialogOpen} onOpenChange={setIsBalanceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Balance</DialogTitle>
            <DialogDescription>
              Modify the balance for {currentUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="operation">Operation</Label>
              <RadioGroup 
                value={balanceOperation} 
                onValueChange={(value) => setBalanceOperation(value as 'add' | 'subtract')}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="add" id="add" />
                  <Label htmlFor="add">Add</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="subtract" id="subtract" />
                  <Label htmlFor="subtract">Subtract</Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <DollarSign className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="amount"
                  placeholder="0.00"
                  type="number"
                  min="0"
                  step="0.01"
                  value={balanceAmount}
                  onChange={(e) => setBalanceAmount(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Reason for the adjustment"
                value={balanceNotes}
                onChange={(e) => setBalanceNotes(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              onClick={handleAdjustBalance} 
              disabled={!balanceAmount || adjustBalanceMutation.isPending}
            >
              {adjustBalanceMutation.isPending ? "Processing..." : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Set Discount Dialog */}
      <Dialog open={isDiscountDialogOpen} onOpenChange={setIsDiscountDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Set User Discount</DialogTitle>
            <DialogDescription>
              Configure discount for {currentUser?.email}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="discountPercentage">Discount Percentage</Label>
              <div className="relative">
                <Percent className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="discountPercentage"
                  placeholder="0"
                  type="number"
                  min="0"
                  max="100"
                  value={discountPercentage}
                  onChange={(e) => setDiscountPercentage(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Expiry Date (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {date ? format(date, "PPP") : "Select a date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="discountNote">Note (Optional)</Label>
              <Textarea
                id="discountNote"
                placeholder="Reason for the discount"
                value={discountNote}
                onChange={(e) => setDiscountNote(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              onClick={handleUpdateDiscount} 
              disabled={!discountPercentage || updateDiscountMutation.isPending}
            >
              {updateDiscountMutation.isPending ? "Processing..." : "Save Discount"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Users;
