import { useAuth } from '../contexts/AuthContext';

// Custom hook for permission checking
export const usePermissions = () => {
  const { hasPermission, hasRole, userPermissions, user } = useAuth();

  const canRead = (resource: string) => hasPermission(`${resource}:read`);
  const canWrite = (resource: string) => hasPermission(`${resource}:write`);
  const canDelete = (resource: string) => hasPermission(`${resource}:delete`);
  const canManage = (resource: string) => hasPermission(`${resource}:manage`);

  const isAdmin = () => hasRole('admin');
  const isResponder = () => hasRole('responder');

  return {
    hasPermission,
    hasRole,
    userPermissions,
    user,
    canRead,
    canWrite,
    canDelete,
    canManage,
    isAdmin,
    isResponder
  };
};
