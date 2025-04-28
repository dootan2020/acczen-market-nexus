
import { useState } from 'react';
import { UserProfile } from './types/userManagement.types';

export const useUserDialogs = () => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [isEditRoleDialogOpen, setIsEditRoleDialogOpen] = useState(false);
  const [isAdjustBalanceDialogOpen, setIsAdjustBalanceDialogOpen] = useState(false);

  const handleEditRole = (user: UserProfile) => {
    setCurrentUser(user);
    setIsEditRoleDialogOpen(true);
  };

  const handleAdjustBalance = (user: UserProfile) => {
    setCurrentUser(user);
    setIsAdjustBalanceDialogOpen(true);
  };

  return {
    currentUser,
    setCurrentUser,
    isEditRoleDialogOpen,
    setIsEditRoleDialogOpen,
    isAdjustBalanceDialogOpen,
    setIsAdjustBalanceDialogOpen,
    handleEditRole,
    handleAdjustBalance
  };
};
