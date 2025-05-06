
import { createContext } from 'react';
import { AuthContextType } from './types';

// Create the AuthContext with a default value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default AuthContext;
