
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

  const handleRoleChange = (userId: string, role: 'admin' | 'user') => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      setIsEditRoleDialogOpen(true);
    }
  };

  const handleBalanceAdjust = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      setIsAdjustBalanceDialogOpen(true);
    }
  };

  const handleDiscountUpdate = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setCurrentUser(user);
      setIsDiscountDialogOpen(true);
    }
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

      <UsersFilter roleFilter={roleFilter} onRoleFilterChange={setRoleFilter} />

      <UsersTable>
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
              user={user as UserProfile} 
              onRoleChange={() => handleRoleChange(user.id, user.role === 'admin' ? 'user' : 'admin')}
              onBalanceAdjust={() => handleBalanceAdjust(user.id)}
              onDiscountUpdate={() => handleDiscountUpdate(user.id)}
              formatDate={formatDate}
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
        hasNextPage={hasNextPage}
        hasPrevPage={hasPrevPage}
        onNextPage={nextPage} 
        onPrevPage={prevPage} 
        onPageChange={goToPage} 
      />

      {/* Dialogs */}
      {currentUser && (
        <>
          <EditRoleDialog
            open={isEditRoleDialogOpen}
            onClose={() => setIsEditRoleDialogOpen(false)}
            onUpdateRole={handleUpdateRole}
            user={currentUser as UserProfile}
          />
          <AdjustBalanceDialog
            open={isAdjustBalanceDialogOpen}
            onClose={() => setIsAdjustBalanceDialogOpen(false)}
            onAdjustBalance={handleAdjustBalanceConfirm}
            currentBalance={currentUser.balance}
            user={currentUser as UserProfile}
          />
          <UserDiscountForm
            open={isDiscountDialogOpen}
            onClose={() => setIsDiscountDialogOpen(false)}
            user={currentUser as UserProfile}
            discount={currentUser.discount_percentage}
            discountNote={currentUser.discount_note || ''}
            discountExpiresAt={currentUser.discount_expires_at}
          />
        </>
      )}

      {showDiscountForm && currentUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">Update User Discount</h2>
            <UserDiscountForm 
              open={showDiscountForm}
              onClose={() => setShowDiscountForm(false)}
              user={currentUser as UserProfile}
              discount={currentUser.discount_percentage}
              discountNote={currentUser.discount_note || ''}
              discountExpiresAt={currentUser.discount_expires_at}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
