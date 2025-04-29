
import { useAuth } from "@/contexts/AuthContext";

export type AdminPermission = 
  | 'view_users' 
  | 'edit_users' 
  | 'view_products' 
  | 'edit_products'
  | 'view_orders'
  | 'edit_orders'
  | 'view_deposits'
  | 'approve_deposits'
  | 'view_reports'
  | 'system_settings';

// Role-based permission map
const ADMIN_PERMISSIONS: Record<string, AdminPermission[]> = {
  'admin': [
    'view_users', 'edit_users', 'view_products', 'edit_products',
    'view_orders', 'edit_orders', 'view_deposits', 'approve_deposits',
    'view_reports', 'system_settings'
  ],
  'support': ['view_users', 'view_orders', 'view_deposits'],
  'content_manager': ['view_products', 'edit_products']
};

export const useAdmin = () => {
  const { user, isAdmin } = useAuth();
  
  console.log("useAdmin hook called, isAdmin:", isAdmin, "user:", user ? "exists" : "null");
  
  // Check for specific admin permission
  const hasPermission = (permission: AdminPermission): boolean => {
    if (!isAdmin || !user) {
      console.log("Permission check failed: not admin or no user");
      return false;
    }
    
    // Get admin type from metadata or default to 'admin'
    const adminType = user.user_metadata?.admin_type as string || 'admin';
    console.log("Admin type:", adminType);
    
    const permissions = ADMIN_PERMISSIONS[adminType] || [];
    const result = permissions.includes(permission);
    
    console.log(`Permission check: ${permission} = ${result}`);
    return result;
  };

  // Check if user has any of the provided permissions
  const hasAnyPermission = (permissions: AdminPermission[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  // Check if user has all of the provided permissions
  const hasAllPermissions = (permissions: AdminPermission[]): boolean => {
    return permissions.every(permission => hasPermission(permission));
  };

  return {
    isAdmin,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions
  };
};
