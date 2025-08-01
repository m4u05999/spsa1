// src/pages/dashboard/modules/EventsManagement.jsx
import React, { useState, useEffect } from 'react';
import { useMasterData } from '../../../hooks/useMasterData';
import { CONTENT_TYPES, EVENT_STATUS } from '../../../schemas/contentManagementSchema.js';
import { useAuth } from '../../../contexts/index.jsx';
import { checkPermission } from '../../../utils/permissions';

const EventsManagement = () => {
  // MasterDataService integration
  const {
    data: masterData,
    loading: masterDataLoading,
    error: masterDataError,
    loadData,
    createContent,
    updateContent,
    deleteContent,
    searchContent
  } = useMasterData({
    type: 'events',
    autoLoad: false
  });

  const { user } = useAuth();

  // Local state
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [selectedEventStatus, setSelectedEventStatus] = useState('all');
  const [selectedItems, setSelectedItems] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('startDate');
  const [sortOrder, setSortOrder] = useState('desc');

  // Load events data using MasterDataService
  const loadEvents = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 جاري تحميل بيانات الفعاليات من MasterDataService...');

      // استخدام loadData من MasterDataService
      await loadData({
        type: 'events',
        limit: 100,
        sortBy: sortBy,
        sortOrder: sortOrder
      });

      if (masterData && Array.isArray(masterData) && masterData.length > 0) {
        console.log('✅ تم تحميل الفعاليات من MasterDataService:', masterData.length);
        setEvents(masterData);
        setFilteredEvents(masterData);
        setIsLoading(false);
        return;
      }

      // Fallback للبيانات المحلية
      console.log('⚠️ لا توجد بيانات في MasterDataService، استخدام البيانات المحلية');
      const fallbackData = JSON.parse(localStorage.getItem('eventsManagement') || '[]');

      if (fallbackData.length > 0) {
        setEvents(fallbackData);
        setFilteredEvents(fallbackData);
      } else {

        // بيانات افتراضية للاختبار
        const defaultEvents = [
          {
            id: 'event-1',
            title: 'مؤتمر العلوم السياسية السنوي',
            type: CONTENT_TYPES.EVENT,
            status: EVENT_STATUS.UPCOMING,
            startDate: '2024-03-15T09:00:00Z',
            endDate: '2024-03-17T17:00:00Z',
            location: 'الرياض',
            description: 'مؤتمر سنوي يجمع خبراء العلوم السياسية',
            featured: true,
            createdAt: '2024-01-01T00:00:00Z'
          },
          {
            id: 'event-2',
            title: 'ورشة عمل: تحليل السياسات العامة',
            type: CONTENT_TYPES.WORKSHOP,
            status: EVENT_STATUS.ONGOING,
            startDate: '2024-02-10T10:00:00Z',
            endDate: '2024-02-10T16:00:00Z',
            location: 'جدة',
            description: 'ورشة عمل متخصصة في تحليل السياسات',
            featured: false,
            createdAt: '2024-01-15T00:00:00Z'
          }
        ];
        setEvents(defaultEvents);
        setFilteredEvents(defaultEvents);
        localStorage.setItem('eventsManagement', JSON.stringify(defaultEvents));
      }

    } catch (error) {
      console.error('❌ خطأ في تحميل بيانات الفعاليات:', error);

      // Fallback للبيانات الافتراضية
      const defaultEvents = [
        {
          id: 'event-1',
          title: 'مؤتمر العلوم السياسية السنوي',
          type: CONTENT_TYPES.EVENT,
          status: EVENT_STATUS.UPCOMING,
          startDate: '2024-03-15T09:00:00Z',
          endDate: '2024-03-17T17:00:00Z',
          location: 'الرياض',
          description: 'مؤتمر سنوي يجمع خبراء العلوم السياسية',
          featured: true,
          createdAt: '2024-01-01T00:00:00Z'
        },
        {
          id: 'event-2',
          title: 'ورشة عمل: تحليل السياسات العامة',
          type: CONTENT_TYPES.WORKSHOP,
          status: EVENT_STATUS.ONGOING,
          startDate: '2024-02-10T10:00:00Z',
          endDate: '2024-02-10T16:00:00Z',
          location: 'جدة',
          description: 'ورشة عمل متخصصة في تحليل السياسات',
          featured: false,
          createdAt: '2024-01-15T00:00:00Z'
        }
      ];

      setEvents(defaultEvents);
      setFilteredEvents(defaultEvents);
      localStorage.setItem('eventsManagement', JSON.stringify(defaultEvents));
    } finally {
      setIsLoading(false);
    }
  };

  // Load events on component mount
  useEffect(() => {
    loadEvents();
  }, [sortBy, sortOrder]);

  // Apply filters when search or filters change
  useEffect(() => {
    const applyFilters = async () => {
      try {
        // إذا لم توجد فلاتر، عرض جميع الفعاليات
        if (!searchTerm && selectedEventStatus === 'all') {
          setFilteredEvents(events);
          return;
        }

        // تحضير معاملات البحث لـ MasterDataService
        const filters = {};

        // إضافة فلتر حالة الفعالية
        if (selectedEventStatus !== 'all') {
          filters.status = selectedEventStatus;
        }

        // إضافة فلاتر الترتيب
        filters.sortBy = sortBy;
        filters.sortOrder = sortOrder;

        // استخدام searchContent من MasterDataService مع التوقيع الصحيح
        const searchResult = await searchContent(searchTerm, filters);

        if (searchResult && Array.isArray(searchResult)) {
          setFilteredEvents(searchResult);
        } else {
          // Fallback للتصفية المحلية
          let filtered = [...events];

          if (searchTerm) {
            filtered = filtered.filter(event =>
              event.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
              event.location?.toLowerCase().includes(searchTerm.toLowerCase())
            );
          }

          if (selectedEventStatus !== 'all') {
            filtered = filtered.filter(event => event.status === selectedEventStatus);
          }

          // ترتيب النتائج
          filtered.sort((a, b) => {
            const aValue = a[sortBy];
            const bValue = b[sortBy];

            if (sortOrder === 'desc') {
              return bValue > aValue ? 1 : -1;
            } else {
              return aValue > bValue ? 1 : -1;
            }
          });

          setFilteredEvents(filtered);
        }

      } catch (error) {
        console.error('❌ خطأ في تصفية الفعاليات:', error);
        setFilteredEvents(events);
      }
    };

    applyFilters();
  }, [searchTerm, selectedEventStatus, events, sortBy, sortOrder]);

  // Handle event status filter change
  const handleEventStatusChange = (status) => {
    setSelectedEventStatus(status);
  };

  // Handle view mode change
  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  // Handle item selection
  const toggleSelection = (eventId) => {
    setSelectedItems(prev =>
      prev.includes(eventId)
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  // Handle bulk actions using MasterDataService
  const handleBulkAction = async (action) => {
    if (selectedItems.length === 0) return;

    try {
      console.log(`🔄 تنفيذ العملية الجماعية: ${action} على ${selectedItems.length} فعالية`);

      for (const eventId of selectedItems) {
        const event = events.find(e => e.id === eventId);
        if (!event) continue;

        let updatedEvent = { ...event };

        switch (action) {
          case 'publish':
            updatedEvent.status = EVENT_STATUS.UPCOMING;
            break;
          case 'cancel':
            updatedEvent.status = EVENT_STATUS.CANCELLED;
            break;
          case 'delete':
            await deleteContent(eventId);
            console.log('✅ تم حذف الفعالية من MasterDataService');
            continue;
          default:
            continue;
        }

        if (action !== 'delete') {
          await updateContent(eventId, updatedEvent);
          console.log('✅ تم تحديث الفعالية في MasterDataService');
        }
      }

      // تحديث البيانات المحلية
      let updatedEvents = [...events];

      if (action === 'delete') {
        updatedEvents = updatedEvents.filter(event => !selectedItems.includes(event.id));
      } else {
        updatedEvents = updatedEvents.map(event => {
          if (selectedItems.includes(event.id)) {
            switch (action) {
              case 'publish':
                return { ...event, status: EVENT_STATUS.UPCOMING };
              case 'cancel':
                return { ...event, status: EVENT_STATUS.CANCELLED };
              default:
                return event;
            }
          }
          return event;
        });
      }

      setEvents(updatedEvents);
      setFilteredEvents(updatedEvents);
      localStorage.setItem('eventsManagement', JSON.stringify(updatedEvents));
      setSelectedItems([]);

      console.log(`✅ تم تنفيذ العملية الجماعية: ${action}`);

    } catch (error) {
      console.error('❌ خطأ في العملية الجماعية:', error);
      alert('حدث خطأ أثناء تنفيذ العملية');
    }
  };

  // Handle event export
  const handleExport = async (format) => {
    try {
      const dataToExport = selectedItems.length > 0
        ? events.filter(event => selectedItems.includes(event.id))
        : filteredEvents;

      const exportData = {
        events: dataToExport,
        exportDate: new Date().toISOString(),
        totalCount: dataToExport.length
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json'
      });

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `events_export_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      console.log('✅ تم تصدير الفعاليات بنجاح');

    } catch (error) {
      console.error('❌ خطأ في تصدير الفعاليات:', error);
      alert('حدث خطأ أثناء تصدير البيانات');
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
          {/* Search Input */}
          <div className="flex-1 min-w-64">
            <input
              type="text"
              placeholder="البحث في الفعاليات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Sort Controls */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="startDate">تاريخ البداية</option>
            <option value="title">العنوان</option>
            <option value="createdAt">تاريخ الإنشاء</option>
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="desc">تنازلي</option>
            <option value="asc">تصاعدي</option>
          </select>

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
                className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
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

        {/* Events Content */}
        <div className="p-6">
          {/* View Mode Toggle */}
          <div className="flex justify-between items-center mb-4">
            <div className="text-sm text-gray-600">
              عرض {filteredEvents.length} من {events.length} فعالية
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleViewModeChange('grid')}
                className={`px-3 py-1 rounded ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                شبكة
              </button>
              <button
                onClick={() => handleViewModeChange('list')}
                className={`px-3 py-1 rounded ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                قائمة
              </button>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="mt-2 text-gray-600">جاري تحميل الفعاليات...</p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && filteredEvents.length === 0 && (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد فعاليات</h3>
              <p className="text-gray-600">لا توجد فعاليات مطابقة للمعايير المحددة</p>
            </div>
          )}

          {/* Events Grid/List */}
          {!isLoading && filteredEvents.length > 0 && (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  className={`bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow ${
                    selectedItems.includes(event.id) ? 'ring-2 ring-blue-500' : ''
                  }`}
                >
                  {/* Event Card Header */}
                  <div className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(event.id)}
                          onChange={() => toggleSelection(event.id)}
                          className="mr-3 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{event.title}</h3>
                          <p className="text-sm text-gray-600">{event.type}</p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        event.status === EVENT_STATUS.UPCOMING ? 'bg-blue-100 text-blue-800' :
                        event.status === EVENT_STATUS.ONGOING ? 'bg-green-100 text-green-800' :
                        event.status === EVENT_STATUS.COMPLETED ? 'bg-gray-100 text-gray-800' :
                        event.status === EVENT_STATUS.CANCELLED ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {event.status === EVENT_STATUS.UPCOMING ? 'قادمة' :
                         event.status === EVENT_STATUS.ONGOING ? 'جارية' :
                         event.status === EVENT_STATUS.COMPLETED ? 'منتهية' :
                         event.status === EVENT_STATUS.CANCELLED ? 'ملغية' :
                         'مؤجلة'}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-gray-600 line-clamp-2">{event.description}</p>

                    <div className="mt-3 flex items-center text-sm text-gray-500">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {new Date(event.startDate).toLocaleDateString('ar-SA')}

                      {event.location && (
                        <>
                          <svg className="w-4 h-4 mr-1 ml-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          {event.location}
                        </>
                      )}
                    </div>

                    {event.featured && (
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          مميزة
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventsManagement;