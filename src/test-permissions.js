// Test file to verify permissions module
import { checkPermission, PERMISSIONS, getRolePermissions } from './utils/permissions.js';

console.log('Testing permissions module...');
console.log('PERMISSIONS:', PERMISSIONS);
console.log('checkPermission function:', typeof checkPermission);
console.log('getRolePermissions function:', typeof getRolePermissions);

// Test with mock user
const mockUser = {
  permissions: ['users.manage', 'content.view']
};

console.log('Test checkPermission:', checkPermission(mockUser, 'users.view'));
console.log('Test getRolePermissions:', getRolePermissions('admin'));

export default true;
