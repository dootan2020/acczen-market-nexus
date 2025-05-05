
import React, { useState } from 'react';
import { useUserManagement } from '@/hooks/admin/useUserManagement';
import { EditRoleDialog } from './EditRoleDialog';
import { AdjustBalanceDialog } from './AdjustBalanceDialog';
import { UsersTable } from './UsersTable';
import { UserRow } from './UserRow';
import { UsersFilter } from './UsersFilter';
import { UsersPagination } from './UsersPagination';
import { Button } from '@/components/ui/button';
import { UserProfile } from '@/hooks/admin/types/userManagement.types';
import { UserDiscountForm } from './UserDiscountForm';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const AdminUsers = () => {
  const [showDiscountForm, setShowDiscountForm] = useState(false);
  const {
    users,
    filteredUsers,
    totalUsers,
    currentPage,
    totalPages,
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  // Fixing type mismatch: We need to pass the user object instead of just the ID
  const handleRoleChange = (user: UserProfile) => {
    setCurrentUser(user);
    setIsEditRoleDialogOpen(true);
  };

  const handleBalanceAdjust = (user: UserProfile) => {
    setCurrentUser(user);
    setIsAdjustBalanceDialogOpen(true);
  };

  const handleDiscountUpdate = (user: UserProfile) => {
    setCurrentUser(user);
    setIsDiscountDialogOpen(true);
  };

  // Handle discount form submission - fixing the property name issue
  const handleDiscountFormSubmit = (values: { 
    discountPercentage: number; 
    discountNote?: string;
    isTemporary?: boolean; 
    expiryDate?: Date | null;
  }) => {
    if (!currentUser) return;
    
    // Now we pass the values to handleUpdateDiscount with the correct property names
    handleUpdateDiscount({
      id: currentUser.id,
      discount_percentage: values.discountPercentage,  // Using snake_case to match the UserProfile type
      discount_note: values.discountNote,
      expiry_date: values.expiryDate // This is correct as it matches what's expected by the backend
    });
  };

  // Render the users table
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <h1 className="text-2xl font-bold">Users Management</h1>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 w-full"
          />
        </div>
      </div>

      <UsersFilter 
        roleFilter={roleFilter || "all"} 
        onRoleFilterChange={setRoleFilter}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <UsersTable
        users={filteredUsers}
        onEditRole={handleEditRole}
        onAdjustBalance={handleAdjustBalance}
        onSetDiscount={handleDiscountUpdate}
        onViewUser={setCurrentUser}
      >
        {isLoading ? (
          <tr>
            <td colSpan={7} className="text-center py-10">
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
              onSetDiscount={handleDiscountUpdate}
            />
          ))
        ) : (
          <tr>
            <td colSpan={7} className="text-center py-10">
              No users found
            </td>
          </tr>
        )}
      </UsersTable>

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
            username={currentUser.username || currentUser.email}
          />
        </>
      )}

      {showDiscountForm && currentUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Update User Discount</h2>
            <UserDiscountForm 
              open={showDiscountForm}
              onOpenChange={setShowDiscountForm}
              onSubmit={handleDiscountFormSubmit}
              currentDiscount={currentUser.discount_percentage}
              currentNote={currentUser.discount_note || ''}
              currentExpiryDate={currentUser.discount_expires_at}
              username={currentUser.username || currentUser.email}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
