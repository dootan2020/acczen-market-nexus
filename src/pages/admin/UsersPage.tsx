
import React, { useState } from 'react';
import { useUserManagement } from '@/hooks/admin/useUserManagement';
import { UsersTable } from '@/components/admin/users/UsersTable';
import { UserRow } from '@/components/admin/users/UserRow';
import { UsersPagination } from '@/components/admin/users/UsersPagination';
import { EditRoleDialog } from '@/components/admin/users/EditRoleDialog';
import { AdjustBalanceDialog } from '@/components/admin/users/AdjustBalanceDialog';
import { UserDiscountForm } from '@/components/admin/users/UserDiscountForm';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, Users, UserCheck, Shield, Download } from 'lucide-react';

const UsersPage: React.FC = () => {
  const {
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
    isEditRoleDialogOpen,
    setIsEditRoleDialogOpen,
    isAdjustBalanceDialogOpen,
    setIsAdjustBalanceDialogOpen,
    isDiscountDialogOpen,
    setIsDiscountDialogOpen,
    hasNextPage,
    hasPrevPage,
    nextPage,
    prevPage,
    handleEditRole,
    handleAdjustBalance,
    handleUpdateRole,
    handleAdjustBalanceConfirm,
    handleUpdateDiscount,
    updateRoleMutation,
    adjustBalanceMutation,
    updateDiscountMutation
  } = useUserManagement();

  const handleExportUsers = () => {
    // Export users functionality could be implemented here
    console.log("Export users");
  };

  const resetFilters = () => {
    setSearchQuery('');
    setRoleFilter(null);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Button onClick={handleExportUsers} className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Export Users
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Regular Users</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredUsers.filter(user => user.role === 'user').length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Administrators</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {filteredUsers.filter(user => user.role === 'admin').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow-sm mb-6">
        <h2 className="text-lg font-semibold mb-4">Search & Filters</h2>
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search by email, username or name"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={roleFilter || ""} onValueChange={(value) => setRoleFilter(value || null)}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Roles</SelectItem>
              <SelectItem value="user">User</SelectItem>
              <SelectItem value="admin">Administrator</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={resetFilters}>
            Reset Filters
          </Button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm">
        <div className="overflow-hidden">
          <UsersTable
            users={filteredUsers}
            onEditRole={handleEditRole}
            onAdjustBalance={handleAdjustBalance}
            onSetDiscount={(user) => {
              setCurrentUser(user);
              setIsDiscountDialogOpen(true);
            }}
          >
            {isLoading ? (
              <tr>
                <td colSpan={8} className="text-center py-4">Loading users...</td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-4">No users found</td>
              </tr>
            ) : (
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
                />
              ))
            )}
          </UsersTable>
        </div>

        {/* Pagination */}
        <UsersPagination
          currentPage={currentPage}
          totalPages={totalPages}
          prevPage={prevPage}
          nextPage={nextPage}
          hasNextPage={hasNextPage}
          hasPrevPage={hasPrevPage}
        />
      </div>

      {/* Dialogs */}
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
        currentBalance={currentUser?.balance}
        currentUser={currentUser}
      />

      <UserDiscountForm
        open={isDiscountDialogOpen}
        onOpenChange={setIsDiscountDialogOpen}
        onSubmit={({ discountPercentage, discountNote, expiryDate }) => {
          if (currentUser) {
            handleUpdateDiscount({
              userId: currentUser.id,
              discount_percentage: discountPercentage,
              discount_note: discountNote,
              expiry_date: expiryDate ? expiryDate.toISOString() : undefined
            });
          }
        }}
        currentDiscount={currentUser?.discount_percentage}
        currentNote={currentUser?.discount_note}
        currentExpiryDate={currentUser?.discount_expires_at}
        username={currentUser?.username || currentUser?.email || ''}
        isLoading={updateDiscountMutation.isPending}
      />
    </div>
  );
};

export default UsersPage;
