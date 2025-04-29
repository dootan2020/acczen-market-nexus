
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

export function UserAuth() {
  const { signOut } = useAuth();
  
  const handleLogout = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
  
  return (
    <div>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}
