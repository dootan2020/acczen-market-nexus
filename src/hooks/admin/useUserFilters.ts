
import { useState, useMemo } from 'react';
import { UserProfile } from './types/userManagement.types';

export const useUserFilters = (users: UserProfile[] | undefined) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  
  // Filter users by search query and role
  const filteredUsers = useMemo(() => {
    if (!users) return [];
    
    return users.filter(user => {
      const matchesSearch = 
        (user.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.full_name || '').toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRole = !roleFilter || user.role === roleFilter;
      
      return matchesSearch && matchesRole;
    });
  }, [users, searchQuery, roleFilter]);

  return {
    searchQuery,
    setSearchQuery,
    roleFilter,
    setRoleFilter,
    filteredUsers
  };
};
