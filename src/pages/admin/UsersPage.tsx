
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Search, 
  UserPlus, 
  Download, 
  Filter,
  SlidersHorizontal,
  BarChart
} from 'lucide-react';
import { EditRoleDialog } from '@/components/admin/users/EditRoleDialog';
import { AdjustBalanceDialog } from '@/components/admin/users/AdjustBalanceDialog';
import { UsersTable } from '@/components/admin/users/UsersTable';
import { UsersPagination } from '@/components/admin/users/UsersPagination';
import { UserDetails } from '@/components/admin/users/UserDetails';
import { UserDiscountForm } from '@/components/admin/users/UserDiscountForm';
import { useUserManagement } from '@/hooks/admin/useUserManagement';
import { useUserDiscount } from '@/hooks/admin/useUserDiscount';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';

const UsersPage: React.FC = () => {
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
    handleAdjustBalanceConfirm,
    updateRoleMutation,
    adjustBalanceMutation
  } = useUserManagement();

  const [discountFilter, setDiscountFilter] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<string>("newest");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  
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
  
  // Filter users based on active status (this would need to be added to the profiles table)
  const applyStatusFilter = (users: any[]) => {
    if (!statusFilter) return users;
    
    return users.filter(user => {
      // This would need a status field in profiles
      // For now, we'll assume all users are active
      return statusFilter === 'active';
    });
  };
  
  // Sort users based on selected sort order
  const applySorting = (users: any[]) => {
    const sorted = [...users];
    
    switch (sortOrder) {
      case 'newest':
        return sorted.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
      case 'oldest':
        return sorted.sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );
      case 'name':
        return sorted.sort((a, b) => {
          const nameA = (a.username || a.email || "").toLowerCase();
          const nameB = (b.username || b.email || "").toLowerCase();
          return nameA.localeCompare(nameB);
        });
      default:
        return sorted;
    }
  };
  
  // Apply all filters and sorting
  const processedUsers = applySorting(applyStatusFilter(applyDiscountFilter(filteredUsers || [])));
  
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
    // Export users with discounts to CSV
    if (!users) return;
    
    const discountedUsers = users.filter(user => user.discount_percentage > 0);
    if (discountedUsers.length === 0) {
      toast.info("No users with discounts to export");
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
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-2xl font-bold">Users Management</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportUsers} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export Users
          </Button>
          <Button variant="default" className="bg-[#19C37D] hover:bg-[#19C37D]/90 flex items-center gap-2">
            <UserPlus className="h-4 w-4" />
            Add User
          </Button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-semibold mb-4">Search & Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by email, username or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
            
            <Select value={roleFilter || "all"} onValueChange={(value) => setRoleFilter(value === "all" ? null : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={statusFilter || "all"} onValueChange={(value) => setStatusFilter(value === "all" ? null : value)}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortOrder} onValueChange={(value) => setSortOrder(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex flex-wrap gap-2 mt-4">
            <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={() => setDiscountFilter("all")}>
              <Filter className="h-3 w-3" /> All Discounts
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={() => setDiscountFilter("no-discount")}>
              No Discount
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={() => setDiscountFilter("with-discount")}>
              With Discount
            </Button>
            <Button variant="outline" size="sm" className="flex items-center gap-1" onClick={() => setDiscountFilter("temporary-discount")}>
              Temporary Discounts
            </Button>
          </div>
        </div>
        
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#19C37D]"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <UsersTable 
                  users={processedUsers || []}
                  onEditRole={handleEditRole}
                  onAdjustBalance={handleAdjustBalance}
                  onSetDiscount={handleSetDiscount}
                  onViewUser={handleViewUser}
                />
              </div>
            )}
          </CardContent>
        </Card>
        
        <div className="mt-4">
          <UsersPagination
            currentPage={currentPage}
            totalPages={totalPages}
            prevPage={prevPage}
            nextPage={nextPage}
            hasNextPage={hasNextPage}
            hasPrevPage={hasPrevPage}
          />
        </div>
      </div>
      
      {/* Modal Dialogs */}
      <EditRoleDialog
        open={isEditRoleDialogOpen}
        onOpenChange={setIsEditRoleDialogOpen}
        onConfirm={handleUpdateRole}
        isLoading={updateRoleMutation.isPending}
        currentUser={currentUser}
      />
      
      <AdjustBalanceDialog
        open={isAdjustBalanceDialogOpen}
        onOpenChange={setIsAdjustBalanceDialogOpen}
        onConfirm={handleAdjustBalanceConfirm}
        isLoading={adjustBalanceMutation.isPending}
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

export default UsersPage;
