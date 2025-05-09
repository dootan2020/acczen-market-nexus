
import React from 'react';
import { Navigate } from 'react-router-dom';
import Login from './auth/Login';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const { user } = useAuth();
  
  // Redirect if user is already logged in
  if (user) {
    return <Navigate to="/" replace />;
  }
  
  return <Login />;
};

export default LoginPage;
