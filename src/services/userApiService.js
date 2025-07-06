/**
 * User API Service - SPSA
 * خدمة API المستخدمين - الجمعية السعودية للعلوم السياسية
 * 
 * Handles all user-related API operations with the new backend
 */

import unifiedApiService from './unifiedApiService.js';
import { getFeatureFlag } from '../config/featureFlags.js';
import { monitoringService } from '../utils/monitoring.js';

/**
 * User API Service Class
 */
class UserApiService {
  constructor() {
    this.baseEndpoint = '/users';
    this.isEnabled = getFeatureFlag('USE_NEW_USER_API');
  }

  /**
   * Get users list with filtering and pagination
   */
  async getUsersList(params = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        role,
        membership_status,
        membership_type,
        is_verified,
        is_active,
        search,
        sort_by = 'created_at',
        sort_order = 'desc'
      } = params;

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sort_by,
        sort_order
      });

      // Add optional filters
      if (role) queryParams.append('role', role);
      if (membership_status) queryParams.append('membership_status', membership_status);
      if (membership_type) queryParams.append('membership_type', membership_type);
      if (is_verified !== undefined) queryParams.append('is_verified', is_verified.toString());
      if (is_active !== undefined) queryParams.append('is_active', is_active.toString());
      if (search) queryParams.append('search', search);

      const response = await unifiedApiService.request(`${this.baseEndpoint}?${queryParams}`, {
        method: 'GET',
        requestType: 'AUTH'
      });

      // Track successful request
      monitoringService.trackMetric('users_list_success', 1, {
        page,
        limit,
        filters: Object.keys(params).length
      });

      return response.data;

    } catch (error) {
      monitoringService.trackError({
        type: 'users_list_error',
        message: error.message,
        params
      });
      throw error;
    }
  }

  /**
   * Get single user
   */
  async getUser(id) {
    try {
      const response = await unifiedApiService.request(`${this.baseEndpoint}/${id}`, {
        method: 'GET',
        requestType: 'AUTH'
      });

      // Track user profile view
      monitoringService.trackMetric('user_profile_view', 1, {
        userId: id
      });

      return response.data;

    } catch (error) {
      monitoringService.trackError({
        type: 'user_get_error',
        message: error.message,
        userId: id
      });
      throw error;
    }
  }

  /**
   * Create new user (admin only)
   */
  async createUser(userData) {
    try {
      const response = await unifiedApiService.request(this.baseEndpoint, {
        method: 'POST',
        data: userData,
        requestType: 'AUTH'
      });

      // Track user creation
      monitoringService.trackMetric('user_created', 1, {
        role: userData.role,
        membershipType: userData.membership_type
      });

      return response.data;

    } catch (error) {
      monitoringService.trackError({
        type: 'user_create_error',
        message: error.message,
        userData: { ...userData, password: '[REDACTED]' }
      });
      throw error;
    }
  }

  /**
   * Update user
   */
  async updateUser(id, updates) {
    try {
      const response = await unifiedApiService.request(`${this.baseEndpoint}/${id}`, {
        method: 'PUT',
        data: updates,
        requestType: 'AUTH'
      });

      // Track user update
      monitoringService.trackMetric('user_updated', 1, {
        userId: id,
        fieldsUpdated: Object.keys(updates).length
      });

      return response.data;

    } catch (error) {
      monitoringService.trackError({
        type: 'user_update_error',
        message: error.message,
        userId: id,
        updates: Object.keys(updates)
      });
      throw error;
    }
  }

  /**
   * Delete/Deactivate user
   */
  async deleteUser(id) {
    try {
      const response = await unifiedApiService.request(`${this.baseEndpoint}/${id}`, {
        method: 'DELETE',
        requestType: 'AUTH'
      });

      // Track user deletion
      monitoringService.trackMetric('user_deleted', 1, {
        userId: id
      });

      return response.data;

    } catch (error) {
      monitoringService.trackError({
        type: 'user_delete_error',
        message: error.message,
        userId: id
      });
      throw error;
    }
  }

  /**
   * Activate user
   */
  async activateUser(id) {
    try {
      const response = await unifiedApiService.request(`${this.baseEndpoint}/${id}/activate`, {
        method: 'POST',
        requestType: 'AUTH'
      });

      // Track user activation
      monitoringService.trackMetric('user_activated', 1, {
        userId: id
      });

      return response.data;

    } catch (error) {
      monitoringService.trackError({
        type: 'user_activate_error',
        message: error.message,
        userId: id
      });
      throw error;
    }
  }

  /**
   * Verify user
   */
  async verifyUser(id) {
    try {
      const response = await unifiedApiService.request(`${this.baseEndpoint}/${id}/verify`, {
        method: 'POST',
        requestType: 'AUTH'
      });

      // Track user verification
      monitoringService.trackMetric('user_verified', 1, {
        userId: id
      });

      return response.data;

    } catch (error) {
      monitoringService.trackError({
        type: 'user_verify_error',
        message: error.message,
        userId: id
      });
      throw error;
    }
  }

  /**
   * Update user role
   */
  async updateUserRole(id, role) {
    try {
      const response = await unifiedApiService.request(`${this.baseEndpoint}/${id}/role`, {
        method: 'PUT',
        data: { role },
        requestType: 'AUTH'
      });

      // Track role update
      monitoringService.trackMetric('user_role_updated', 1, {
        userId: id,
        newRole: role
      });

      return response.data;

    } catch (error) {
      monitoringService.trackError({
        type: 'user_role_update_error',
        message: error.message,
        userId: id,
        role
      });
      throw error;
    }
  }

  /**
   * Get current user profile
   */
  async getCurrentUser() {
    try {
      const response = await unifiedApiService.request('/auth/profile', {
        method: 'GET',
        requestType: 'AUTH'
      });

      return response.data;

    } catch (error) {
      monitoringService.trackError({
        type: 'current_user_error',
        message: error.message
      });
      throw error;
    }
  }

  /**
   * Update current user profile
   */
  async updateCurrentUser(updates) {
    try {
      const response = await unifiedApiService.request('/auth/profile', {
        method: 'PUT',
        data: updates,
        requestType: 'AUTH'
      });

      // Track profile update
      monitoringService.trackMetric('profile_updated', 1, {
        fieldsUpdated: Object.keys(updates).length
      });

      return response.data;

    } catch (error) {
      monitoringService.trackError({
        type: 'profile_update_error',
        message: error.message,
        updates: Object.keys(updates)
      });
      throw error;
    }
  }

  /**
   * Search users
   */
  async searchUsers(query, filters = {}) {
    return this.getUsersList({
      search: query,
      ...filters
    });
  }

  /**
   * Get users by role
   */
  async getUsersByRole(role, params = {}) {
    return this.getUsersList({
      role,
      ...params
    });
  }

  /**
   * Get users by membership status
   */
  async getUsersByMembershipStatus(status, params = {}) {
    return this.getUsersList({
      membership_status: status,
      ...params
    });
  }

  /**
   * Get user statistics
   */
  async getUserStats() {
    try {
      const response = await unifiedApiService.request(`${this.baseEndpoint}/stats`, {
        method: 'GET',
        requestType: 'AUTH'
      });

      return response.data;

    } catch (error) {
      monitoringService.trackError({
        type: 'user_stats_error',
        message: error.message
      });
      throw error;
    }
  }
}

// Create singleton instance
const userApiService = new UserApiService();

export default userApiService;
