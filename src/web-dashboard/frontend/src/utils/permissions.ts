// Role-based permission utilities for Resource Management

export type UserRole = 'citizen' | 'responder' | 'admin';

export interface User {
  role: UserRole;
  [key: string]: any;
}

// Check if user has permission to access resource management
export const canAccessResourceManagement = (user: User | null): boolean => {
  return user?.role === 'admin' || user?.role === 'responder';
};

// Check if user can create resources
export const canCreateResources = (user: User | null): boolean => {
  return user?.role === 'admin' || user?.role === 'responder';
};

// Check if user can edit resources
export const canEditResources = (user: User | null): boolean => {
  return user?.role === 'admin' || user?.role === 'responder';
};

// Check if user can delete resources
export const canDeleteResources = (user: User | null): boolean => {
  return user?.role === 'admin';
};

// Check if user can allocate resources
export const canAllocateResources = (user: User | null): boolean => {
  return user?.role === 'admin' || user?.role === 'responder';
};

// Check if user can reserve resources
export const canReserveResources = (user: User | null): boolean => {
  return user?.role === 'admin' || user?.role === 'responder';
};

// Check if user can view analytics/metrics
export const canViewAnalytics = (user: User | null): boolean => {
  return user?.role === 'admin' || user?.role === 'responder';
};

// Check if user can manage deployments
export const canManageDeployments = (user: User | null): boolean => {
  return user?.role === 'admin' || user?.role === 'responder';
};

// Check if user can complete deployments
export const canCompleteDeployments = (user: User | null): boolean => {
  return user?.role === 'admin' || user?.role === 'responder';
};

// Check if user can recall deployments
export const canRecallDeployments = (user: User | null): boolean => {
  return user?.role === 'admin' || user?.role === 'responder';
};

// Get role display name
export const getRoleDisplayName = (role: UserRole): string => {
  switch (role) {
    case 'admin': return 'Administrator';
    case 'responder': return 'Responder';
    case 'citizen': return 'Citizen';
    default: return 'Unknown';
  }
};

// Get role color for UI display
export const getRoleColor = (role: UserRole): string => {
  switch (role) {
    case 'admin': return 'bg-red-100 text-red-800';
    case 'responder': return 'bg-blue-100 text-blue-800';
    case 'citizen': return 'bg-green-100 text-green-800';
    default: return 'bg-gray-100 text-gray-800';
  }
};

// Permission levels for different actions
export const PERMISSIONS = {
  VIEW_RESOURCES: ['admin', 'responder', 'citizen'],
  CREATE_RESOURCES: ['admin', 'responder'],
  EDIT_RESOURCES: ['admin', 'responder'],
  DELETE_RESOURCES: ['admin'],
  ALLOCATE_RESOURCES: ['admin', 'responder'],
  RESERVE_RESOURCES: ['admin', 'responder'],
  VIEW_ANALYTICS: ['admin', 'responder'],
  MANAGE_DEPLOYMENTS: ['admin', 'responder'],
  COMPLETE_DEPLOYMENTS: ['admin', 'responder'],
  RECALL_DEPLOYMENTS: ['admin', 'responder'],
} as const;

// Check if user has specific permission
export const hasPermission = (user: User | null, action: keyof typeof PERMISSIONS): boolean => {
  if (!user) return false;
  return PERMISSIONS[action].includes(user.role as any);
};
