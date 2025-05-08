// src/utils/permissions.js
/**
 * Permission definitions for the Saudi Association for Political Science admin system
 * This file defines all available permissions and permission checks
 */

// Define all available permissions
export const PERMISSIONS = {
  // User management permissions
  USER_VIEW: 'users.view',
  USER_CREATE: 'users.create',
  USER_EDIT: 'users.edit',
  USER_DELETE: 'users.delete',
  USER_MANAGE: 'users.manage', // Super permission that includes all user permissions
  
  // Content management permissions
  CONTENT_VIEW: 'content.view',
  CONTENT_CREATE: 'content.create',
  CONTENT_EDIT: 'content.edit',
  CONTENT_DELETE: 'content.delete',
  CONTENT_PUBLISH: 'content.publish',
  CONTENT_MANAGE: 'content.manage', // Super permission that includes all content permissions
  
  // Event management permissions
  EVENT_VIEW: 'events.view',
  EVENT_CREATE: 'events.create',
  EVENT_EDIT: 'events.edit',
  EVENT_DELETE: 'events.delete',
  EVENT_MANAGE: 'events.manage', // Super permission that includes all event permissions
  
  // Settings permissions
  SETTINGS_VIEW: 'settings.view',
  SETTINGS_EDIT: 'settings.edit',
  SETTINGS_MANAGE: 'settings.manage', // Super permission for all settings
  
  // Membership permissions
  MEMBER_VIEW: 'members.view',
  MEMBER_APPROVE: 'members.approve',
  MEMBER_MANAGE: 'members.manage' // Super permission for all membership actions
};

// Default permission sets for different roles
export const ROLE_PERMISSIONS = {
  admin: [
    PERMISSIONS.USER_MANAGE,
    PERMISSIONS.CONTENT_MANAGE,
    PERMISSIONS.EVENT_MANAGE,
    PERMISSIONS.SETTINGS_MANAGE,
    PERMISSIONS.MEMBER_MANAGE
  ],
  staff: [
    PERMISSIONS.USER_VIEW,
    PERMISSIONS.CONTENT_VIEW,
    PERMISSIONS.CONTENT_CREATE,
    PERMISSIONS.CONTENT_EDIT,
    PERMISSIONS.EVENT_VIEW,
    PERMISSIONS.EVENT_CREATE,
    PERMISSIONS.EVENT_EDIT,
    PERMISSIONS.MEMBER_VIEW,
    PERMISSIONS.MEMBER_APPROVE
  ],
  member: [
    PERMISSIONS.CONTENT_VIEW,
    PERMISSIONS.EVENT_VIEW
  ]
};

// Helper function to check if a permission includes a super permission
export const isPermissionIncluded = (permission, checkPermission) => {
  // If the permissions are exactly the same
  if (permission === checkPermission) return true;
  
  // Check if the permission is a super permission
  const permissionBase = permission.split('.')[0];
  const checkBase = checkPermission.split('.')[0];
  const checkAction = checkPermission.split('.')[1];
  
  // If the bases don't match, they're not related
  if (permissionBase !== checkBase) return false;
  
  // If the permission is a manage permission, it includes all actions for its base
  return checkAction === 'manage';
};

// Helper function to get all permissions for a role
export const getRolePermissions = (role) => {
  return ROLE_PERMISSIONS[role] || [];
};

// Check if a user has a specific permission
export const checkPermission = (user, requiredPermission) => {
  if (!user || !user.permissions) return false;
  
  return user.permissions.some(permission => 
    isPermissionIncluded(permission, requiredPermission)
  );
};

// Check if a user has any of the specified permissions
export const hasAnyPermission = (user, permissions) => {
  if (!user || !user.permissions) return false;
  
  return permissions.some(permission => 
    user.permissions.some(userPerm => 
      isPermissionIncluded(userPerm, permission)
    )
  );
};