
// This file is deprecated and should not be used.
// Please import useAuth from '@/contexts/AuthContext' instead

import { useAuth as authHook } from '@/contexts/AuthContext';

// Re-export the hook from the context
export const useAuth = authHook;

// This ensures existing imports still work but encourages migration to the context version
console.warn('Importing useAuth from src/hooks/useAuth.ts is deprecated. Import from @/contexts/AuthContext instead.');
