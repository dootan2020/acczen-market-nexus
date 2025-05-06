
// This file is deprecated and should be replaced with the new structure.
// Please import from '@/contexts/auth' instead

import { AuthProvider, useAuth, AuthContext } from './auth';

// Re-export the components and hooks
export { AuthProvider, useAuth, AuthContext };

// This ensures existing imports still work but encourages migration to the new structure
console.warn('Importing from src/contexts/AuthContext.tsx is deprecated. Import from @/contexts/auth instead.');
