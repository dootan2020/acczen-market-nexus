
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from 'sonner';
import { EditRoleDialog } from '@/components/admin/users/EditRoleDialog';
import { AdjustBalanceDialog } from '@/components/admin/users/AdjustBalanceDialog';
import { UsersTable } from '@/components/admin/users/UsersTable';
import { UsersFilter } from '@/components/admin/users/UsersFilter';
import { useUserManagement } from '@/hooks/admin/useUserManagement';
import { UsersPagination } from '@/components/admin/users/UsersPagination';
import { UserDetails } from '@/components/admin/users/UserDetails';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Search, UserCog, Download, Filter, BarChart } from 'lucide-react';
import { UserDiscountForm } from './UserDiscountForm';
import { useUserDiscount } from '@/hooks/admin/useUserDiscount';
import { Link } from 'react-router-dom';

const AdminUsers = () => {
  const { 
    users, 
    filteredUsers,
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
    currentUser,
    setCurrentUser,
    isEditRoleDialogOpen, 
    setIsEditRoleDialogOpen,
    isAdjustBalanceDialogOpen, 
    setIsAdjustBalanceDialogOpen,
    isLoading,
    currentPage,
    totalPages,
    prevPage,
    nextPage,
    hasNextPage,
    hasPrevPage,
    handleEditRole,
    handleAdjustBalance,
    handleUpdateRole,
    handleAdjustBalanceConfirm
  } = useUserManagement();

  const [discountFilter, setDiscountFilter] = useState<string | null>(null);
  
  // Filter users based on discount percentage
  const applyDiscountFilter = (users: any[]) => {
    if (!discountFilter) return users;
    
    return users.filter(user => {
      const discount = user.discount_percentage || 0;
      switch (discountFilter) {
        case 'no-discount':
          return discount === 0;
        case 'with-discount':
          return discount > 0;
        case 'high-discount':
          return discount >= 10;
        case 'temporary-discount':
          return discount > 0 && user.discount_expires_at;
        default:
          return true;
      }
    });
  };
  
  const discountFilteredUsers = applyDiscountFilter(filteredUsers || []);
  
  // Get access to user discount functionality
  const { 
    setDiscountMutation, 
    isDialogOpen: isDiscountDialogOpen,
    setIsDialogOpen: setIsDiscountDialogOpen
  } = useUserDiscount();
  
  const handleSetDiscount = (user: any) => {
    setCurrentUser(user);
    setIsDiscountDialogOpen(true);
  };
  
  const handleDiscountSubmit = (values: { 
    discountPercentage: number; 
    discountNote?: string;
    isTemporary?: boolean; 
    expiryDate?: Date | null;
  }) => {
    if (!currentUser) return;
    
    setDiscountMutation.mutate({
      userId: currentUser.id,
      discountPercentage: values.discountPercentage,
      discountNote: values.discountNote,
      expiryDate: values.expiryDate
    });
  };

  const handleViewUser = (user: any) => {
    setCurrentUser(user);
  };

  const handleExportUsers = () => {
    // Simple CSV export of users with discounts
    if (!users) return;
    
    const discountedUsers = users.filter(user => user.discount_percentage > 0);
    if (discountedUsers.length === 0) {
      toast.info('No users with discounts to export');
      return;
    }
    
    const headers = [
      'Email', 
      'Username', 
      'Full Name', 
      'Discount %', 
      'Note', 
      'Updated At', 
      'Expires'
    ];
    
    const csvData = discountedUsers.map(user => [
      user.email || '',
      user.username || '',
      user.full_name || '',
      user.discount_percentage || 0,
      user.discount_note || '',
      user.discount_updated_at || '',
      user.discount_expires_at || ''
    ]);
    
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `users_with_discounts_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Users with discounts exported successfully');
  };

  return (
    <div className="container px-4 sm:px-6 w-full max-w-full mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Users Management</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportUsers}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="default" asChild>
            <Link to="/admin/discount-analytics">
              <BarChart className="h-4 w-4 mr-2" />
              Discount Analytics
            </Link>
          </Button>
        </div>
      </div>
      
      <div className="flex flex-col md:flex-row gap-4 items-start">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search by email, username or name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 w-full"
          />
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={roleFilter || "all"} onValueChange={(value) => setRoleFilter(value === "all" ? null : value)}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Select value={discountFilter || "all"} onValueChange={(value) => setDiscountFilter(value === "all" ? null : value)}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by discount" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Discounts</SelectItem>
                <SelectItem value="no-discount">No Discount (0%)</SelectItem>
                <SelectItem value="with-discount">With Discount ({'>'}0%)</SelectItem>
                <SelectItem value="high-discount">High Discount (≥10%)</SelectItem>
                <SelectItem value="temporary-discount">Temporary Discounts</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <UsersTable 
                users={discountFilteredUsers || []}
                onEditRole={handleEditRole}
                onAdjustBalance={handleAdjustBalance}
                onSetDiscount={handleSetDiscount}
                onViewUser={handleViewUser}
              />
            </div>
          )}
        </CardContent>
      </Card>
      
      <div>
        <UsersPagination
          currentPage={currentPage}
          totalPages={totalPages}
          prevPage={prevPage}
          nextPage={nextPage}
          hasNextPage={hasNextPage}
          hasPrevPage={hasPrevPage}
        />
      </div>
      
      <EditRoleDialog
        open={isEditRoleDialogOpen}
        onOpenChange={setIsEditRoleDialogOpen}
        onConfirm={handleUpdateRole}
        isLoading={false}
        currentUser={currentUser}
      />
      
      <AdjustBalanceDialog
        open={isAdjustBalanceDialogOpen}
        onOpenChange={setIsAdjustBalanceDialogOpen}
        onConfirm={handleAdjustBalanceConfirm}
        isLoading={false}
        currentUser={currentUser}
      />
      
      <UserDiscountForm
        open={isDiscountDialogOpen}
        onOpenChange={setIsDiscountDialogOpen}
        onSubmit={handleDiscountSubmit}
        isLoading={setDiscountMutation.isPending}
        currentDiscount={currentUser?.discount_percentage || 0}
        currentNote={currentUser?.discount_note || ''}
        currentExpiryDate={currentUser?.discount_expires_at || null}
        username={currentUser?.username || currentUser?.email}
      />
      
      {currentUser && (
        <UserDetails 
          user={currentUser} 
          onEdit={() => setIsEditRoleDialogOpen(true)}
          onAdjustBalance={() => setIsAdjustBalanceDialogOpen(true)}
          onSetDiscount={() => setIsDiscountDialogOpen(true)}
        />
      )}
    </div>
  );
};

export default AdminUsers;
