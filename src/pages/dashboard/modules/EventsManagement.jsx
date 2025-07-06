// src/pages/dashboard/modules/EventsManagement.jsx
import React, { useState } from 'react';
import ContentManager from '../../../components/content/ContentManager.jsx';
import { useContentManagement } from '../../../hooks/useContentManagement.js';
import { CONTENT_TYPES, EVENT_STATUS } from '../../../schemas/contentManagementSchema.js';
import { useAuth } from '../../../context/AuthContext';
import { checkPermission } from '../../../utils/permissions';

const EventsManagement = () => {
  const { user } = useAuth();
  const [selectedEventStatus, setSelectedEventStatus] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  // Use the new content management system
  const {
    selectedItems,
    viewMode: currentViewMode,
    setViewMode: updateViewMode,
    performBulkAction,
    createFromTemplate,
    exportContent
  } = useContentManagement();

  // Handle event status filter change
  const handleEventStatusChange = (status) => {
    setSelectedEventStatus(status);
  };

  // Handle view mode change
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
    updateViewMode(mode);
  };

  // Handle bulk actions
  const handleBulkAction = async (action) => {
    try {
      await performBulkAction(action, selectedItems);
      // Show success message
    } catch (error) {
      console.error('Bulk action failed:', error);
      // Show error message
    }
  };

  // Handle event export
  const handleExport = async (format) => {
    try {
      await exportContent(selectedItems, format);
      // Show success message
    } catch (error) {
      console.error('Export failed:', error);
      // Show error message
    }
  };

  // Check permissions
  const canManageEvents = checkPermission(user, 'content', 'write');
  const canDeleteEvents = checkPermission(user, 'content', 'delete');

  if (!canManageEvents) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">غير مصرح</h3>
          <p className="text-gray-600">ليس لديك صلاحية لإدارة الفعاليات</p>
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة الفعاليات</h1>
          <p className="text-gray-600 mt-1">عرض وإدارة جميع الفعاليات في النظام</p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 mt-4 lg:mt-0">
          {selectedItems.length > 0 && (
            <>
              <button
                onClick={() => handleBulkAction('publish')}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                نشر المحدد ({selectedItems.length})
              </button>
              <button
                onClick={() => handleBulkAction('cancel')}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                إلغاء الفعاليات
              </button>
              {canDeleteEvents && (
                <button
                  onClick={() => handleBulkAction('delete')}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                  حذف المحدد
                </button>
              )}
              <button
                onClick={() => handleExport('json')}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                تصدير
              </button>
            </>
          )}
        </div>
      </div>

      {/* Event Status Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 space-x-reverse px-6" aria-label="Tabs">
            {[
              { key: 'all', label: 'الكل', count: null },
              { key: EVENT_STATUS.UPCOMING, label: 'قادمة', count: null },
              { key: EVENT_STATUS.ONGOING, label: 'جارية', count: null },
              { key: EVENT_STATUS.COMPLETED, label: 'منتهية', count: null },
              { key: EVENT_STATUS.CANCELLED, label: 'ملغية', count: null },
              { key: EVENT_STATUS.POSTPONED, label: 'مؤجلة', count: null },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleEventStatusChange(tab.key)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  selectedEventStatus === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
                {tab.count && (
                  <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2.5 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>

        {/* Content Manager Component for Events */}
        <div className="p-6">
          <ContentManager
            contentType={CONTENT_TYPES.EVENT}
            showFilters={true}
            showBulkActions={true}
            showSearch={true}
            showViewModes={true}
            viewMode={viewMode}
            onViewModeChange={handleViewModeChange}
            enableSelection={true}
            enableSorting={true}
            enableExport={true}
            customFilters={{
              eventStatus: selectedEventStatus === 'all' ? null : selectedEventStatus
            }}
            permissions={{
              canCreate: canManageEvents,
              canEdit: canManageEvents,
              canDelete: canDeleteEvents,
              canPublish: canManageEvents
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default EventsManagement;