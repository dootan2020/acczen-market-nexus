
import React, { useState } from 'react';
import { useUserManagement } from '@/hooks/admin/useUserManagement';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { EditRoleDialog } from '@/components/admin/users/EditRoleDialog';
import { AdjustBalanceDialog } from '@/components/admin/users/AdjustBalanceDialog';
import { UsersTable } from '@/components/admin/users/UsersTable';
import { UserRow } from '@/components/admin/users/UserRow';
import { UsersFilter } from '@/components/admin/users/UsersFilter';
import { UsersPagination } from '@/components/admin/users/UsersPagination';
import { UserDetails } from '@/components/admin/users/UserDetails';
import { UserDiscountForm } from '@/components/admin/users/UserDiscountForm';

const Users = () => {
  const [isViewingDetails, setIsViewingDetails] = useState(false);
  
  const {
    users,
    filteredUsers,
    totalUsers,
    totalPages,
    currentPage,
    isLoading,
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
    isDiscountDialogOpen,
    setIsDiscountDialogOpen,
    nextPage,
    prevPage,
    goToPage,
    hasNextPage,
    hasPrevPage,
    handleEditRole,
    handleAdjustBalance,
    handleUpdateRole,
    handleAdjustBalanceConfirm,
    handleUpdateDiscount
  } = useUserManagement();

  const handleViewDetails = (user: typeof currentUser) => {
    setCurrentUser(user);
    setIsViewingDetails(true);
  };

  // Handle discount form submission - using the correct parameter structure
  const handleDiscountFormSubmit = (values: { 
    discountPercentage: number; 
    discountNote?: string;
    isTemporary?: boolean; 
    expiryDate?: Date | null;
  }) => {
    if (!currentUser) return;
    
    // Pass only the required fields to handleUpdateDiscount
    handleUpdateDiscount({
      userId: currentUser.id,
      discount_percentage: values.discountPercentage,
      discount_note: values.discountNote,
      expiry_date: values.expiryDate ? values.expiryDate.toISOString() : undefined
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">User Management</h1>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">
            Total: {totalUsers} users
          </span>
        </div>
      </div>

      <UsersFilter 
        roleFilter={roleFilter || "all"} 
        onRoleFilterChange={setRoleFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <Card>
        <CardContent className="p-0">
          <UsersTable
            users={filteredUsers}
            onEditRole={handleEditRole}
            onAdjustBalance={handleAdjustBalance}
            onSetDiscount={(user) => {
              setCurrentUser(user);
              setIsDiscountDialogOpen(true);
            }}
            onViewUser={handleViewDetails}
          >
            {isLoading ? (
              <tr>
                <td colSpan={8} className="text-center py-10">
                  <div className="flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                  </div>
                </td>
              </tr>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <UserRow 
                  key={user.id} 
                  user={user} 
                  onEditRole={handleEditRole}
                  onAdjustBalance={handleAdjustBalance}
                  onSetDiscount={(user) => {
                    setCurrentUser(user);
                    setIsDiscountDialogOpen(true);
                  }}
                  onViewDetails={handleViewDetails}
                />
              ))
            ) : (
              <tr>
                <td colSpan={8} className="text-center py-10">
                  No users found
                </td>
              </tr>
            )}
          </UsersTable>
        </CardContent>
      </Card>

      <UsersPagination 
        currentPage={currentPage} 
        totalPages={totalPages} 
        hasPrevPage={hasPrevPage}
        hasNextPage={hasNextPage}
        prevPage={prevPage} 
        nextPage={nextPage} 
        goToPage={goToPage} 
      />

      {/* Dialogs */}
      {currentUser && (
        <>
          <EditRoleDialog
            open={isEditRoleDialogOpen}
            onOpenChange={setIsEditRoleDialogOpen}
            onConfirm={handleUpdateRole}
            currentUser={currentUser}
          />
          
          <AdjustBalanceDialog
            open={isAdjustBalanceDialogOpen}
            onOpenChange={setIsAdjustBalanceDialogOpen}
            onConfirm={handleAdjustBalanceConfirm}
            currentBalance={currentUser.balance}
            currentUser={currentUser}
          />
          
          <UserDiscountForm
            open={isDiscountDialogOpen}
            onOpenChange={setIsDiscountDialogOpen}
            onSubmit={handleDiscountFormSubmit}
            currentDiscount={currentUser.discount_percentage}
            currentNote={currentUser.discount_note || ''}
            currentExpiryDate={currentUser.discount_expires_at}
            username={currentUser.username || currentUser.email || ''}
          />
          
          {isViewingDetails && (
            <UserDetails
              user={currentUser}
              onClose={() => setIsViewingDetails(false)}
              onEdit={() => {
                setIsViewingDetails(false);
                setIsEditRoleDialogOpen(true);
              }}
              onAdjustBalance={() => {
                setIsViewingDetails(false);
                setIsAdjustBalanceDialogOpen(true);
              }}
              onSetDiscount={() => {
                setIsViewingDetails(false);
                setIsDiscountDialogOpen(true);
              }}
            />
          )}
        </>
      )}
    </div>
  );
};

export default Users;
