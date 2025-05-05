
import { useState, useEffect } from 'react';

// This is a simple mock of an auth hook - in a real application, this would connect to your authentication system
export const useAuth = () => {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is stored in localStorage (this is just a simple example)
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    
    setLoading(false);
  }, []);

  const login = (email: string, password: string) => {
    // This would normally validate credentials with a backend
    const mockUser = { id: '123', email };
    localStorage.setItem('user', JSON.stringify(mockUser));
    setUser(mockUser);
    return true;
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  const register = (email: string, password: string) => {
    // This would normally register a user with a backend
    const mockUser = { id: '123', email };
    localStorage.setItem('user', JSON.stringify(mockUser));
    setUser(mockUser);
    return true;
  };

  return {
    user,
    loading,
    login,
    logout,
    register,
  };
};
