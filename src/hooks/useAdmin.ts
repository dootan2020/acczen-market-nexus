
import { useAuth } from "@/contexts/AuthContext";

type AdminPermission = 
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

// Giả lập hệ thống phân quyền chi tiết
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
  
  // Kiểm tra quyền cụ thể của admin
  const hasPermission = (permission: AdminPermission): boolean => {
    if (!isAdmin || !user) return false;
    
    // Lấy loại admin từ metadata (hoặc mặc định là 'admin')
    const adminType = user.user_metadata?.admin_type as string || 'admin';
    const permissions = ADMIN_PERMISSIONS[adminType] || [];
    
    return permissions.includes(permission);
  };

  // Kiểm tra nhiều quyền cùng lúc (chỉ cần có 1 quyền)
  const hasAnyPermission = (permissions: AdminPermission[]): boolean => {
    return permissions.some(permission => hasPermission(permission));
  };

  // Kiểm tra bắt buộc có tất cả các quyền
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
