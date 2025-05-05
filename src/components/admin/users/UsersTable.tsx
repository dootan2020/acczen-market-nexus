
import React, { ReactNode } from 'react';
import { UserProfile } from '@/hooks/admin/types/userManagement.types';

interface UsersTableProps {
  users: UserProfile[];
  onEditRole: (user: UserProfile) => void;
  onAdjustBalance: (user: UserProfile) => void;
  onSetDiscount: (user: UserProfile) => void;
  onViewUser?: (user: UserProfile) => void;
  children?: ReactNode;
}

export const UsersTable: React.FC<UsersTableProps> = ({
  users,
  onEditRole,
  onAdjustBalance,
  onSetDiscount,
  onViewUser,
  children
}) => {
  return (
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
          {children}
        </tbody>
      </table>
    </div>
  );
};
