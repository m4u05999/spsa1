import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../contexts/index.jsx';
import { checkPermission } from '../../../utils/permissions';
import { useMasterData } from '../../../hooks/useMasterData';
import ContentFilter from '../../../components/content/ContentFilter';
import ContentCard from '../../../components/content/ContentCard';
import ContentModal from '../../../components/content/ContentModal';
import { CONTENT_TYPES, CONTENT_STATUS } from '../../../models/Content';

const ContentManagementV2 = () => {
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
    type: 'content',
    autoLoad: false
  });

  // User auth and permissions
  const { user } = useAuth();
  const canManageContent = checkPermission(user, 'content.manage');
  const canCreateContent = checkPermission(user, 'content.create') || canManageContent;
  const canEditContent = checkPermission(user, 'content.edit') || canManageContent;
  const canDeleteContent = checkPermission(user, 'content.delete') || canManageContent;

  // Content state
  const [contents, setContents] = useState([]);
  const [filteredContents, setFilteredContents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTag, setSelectedTag] = useState('all');
  const [featuredOnly, setFeaturedOnly] = useState(false);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentContent, setCurrentContent] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Fetch data using MasterDataService
  const fetchData = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 جاري تحميل بيانات المحتوى من MasterDataService...');

      // استخدام loadData من MasterDataService
      await loadData({ type: 'content' });

      if (masterData && Array.isArray(masterData) && masterData.length > 0) {
        console.log('✅ تم تحميل المحتوى من MasterDataService:', masterData.length);
        setContents(masterData);
        setFilteredContents(masterData);
        setIsLoading(false);
        return;
      }

      // Fallback للبيانات المحلية
      console.log('⚠️ لا توجد بيانات في MasterDataService، استخدام البيانات المحلية');
      const fallbackData = JSON.parse(localStorage.getItem('contentManagement') || '[]');

      if (fallbackData.length > 0) {
        setContents(fallbackData);
        setFilteredContents(fallbackData);
      } else {
        // بيانات افتراضية للاختبار
        const defaultContent = [
          {
            id: 1,
            title: 'مقال تجريبي',
            type: 'article',
            status: 'published',
            category: 'عام',
            tags: ['تجريبي'],
            featured: false,
            createdAt: new Date().toISOString()
          }
        ];
        setContents(defaultContent);
        setFilteredContents(defaultContent);
      }

      // إعداد الفئات والعلامات الافتراضية
      const defaultCategories = ['عام', 'أخبار', 'مقالات', 'فعاليات'];
      const defaultTags = ['تجريبي', 'مهم', 'جديد'];

      setCategories(defaultCategories);
      setTags(defaultTags);

    } catch (error) {
      console.error('❌ خطأ في تحميل بيانات المحتوى:', error);

      // Fallback للبيانات الافتراضية
      const defaultContent = [
        {
          id: 1,
          title: 'مقال تجريبي',
          type: 'article',
          status: 'published',
          category: 'عام',
          tags: ['تجريبي'],
          featured: false,
          createdAt: new Date().toISOString()
        }
      ];

      setContents(defaultContent);
      setFilteredContents(defaultContent);
      setCategories(['عام', 'أخبار', 'مقالات']);
      setTags(['تجريبي', 'مهم']);

    } finally {
      setIsLoading(false);
    }
  };
  
  // Load content on component mount
  useEffect(() => {
    fetchData();
  }, []);
  
  // Apply filters when search or filters change using MasterDataService
  useEffect(() => {
    const applyFilters = async () => {
      try {
        // إذا لم توجد فلاتر، عرض جميع المحتويات
        if (!searchTerm && selectedType === 'all' && selectedStatus === 'all' &&
            selectedCategory === 'all' && selectedTag === 'all' && !featuredOnly &&
            !dateFrom && !dateTo) {
          setFilteredContents(contents);
          return;
        }

        // تحضير معاملات البحث لـ MasterDataService
        const searchParams = {
          contentType: 'content',
          query: searchTerm,
          filters: {},
          sortBy: sortBy,
          sortOrder: sortOrder
        };

        // إضافة الفلاتر
        if (selectedType !== 'all') searchParams.filters.type = selectedType;
        if (selectedStatus !== 'all') searchParams.filters.status = selectedStatus;
        if (selectedCategory !== 'all') searchParams.filters.category = selectedCategory;
        if (selectedTag !== 'all') searchParams.filters.tag = selectedTag;
        if (featuredOnly) searchParams.filters.featured = true;
        if (dateFrom) searchParams.filters.dateFrom = dateFrom;
        if (dateTo) searchParams.filters.dateTo = dateTo;

        // استخدام searchContent من MasterDataService
        try {
          const searchResult = await searchContent(searchTerm, {
            type: selectedType !== 'all' ? selectedType : undefined,
            status: selectedStatus !== 'all' ? selectedStatus : undefined,
            category: selectedCategory !== 'all' ? selectedCategory : undefined,
            tag: selectedTag !== 'all' ? selectedTag : undefined,
            featured: featuredOnly ? true : undefined
          });

          if (searchResult && Array.isArray(searchResult)) {
            setFilteredContents(searchResult);
            return;
          }
        } catch (searchError) {
          console.warn('⚠️ فشل البحث في MasterDataService، استخدام التصفية المحلية:', searchError);
        }

        // Fallback للتصفية المحلية
        let filtered = [...contents];

        if (searchTerm) {
          filtered = filtered.filter(content =>
            content.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            content.content?.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }

        if (selectedType !== 'all') {
          filtered = filtered.filter(content => content.type === selectedType);
        }

        if (selectedStatus !== 'all') {
          filtered = filtered.filter(content => content.status === selectedStatus);
        }

        if (selectedCategory !== 'all') {
          filtered = filtered.filter(content => content.category === selectedCategory);
        }

        if (selectedTag !== 'all') {
          filtered = filtered.filter(content =>
            content.tags && content.tags.includes(selectedTag)
          );
        }

        if (featuredOnly) {
          filtered = filtered.filter(content => content.featured === true);
        }

        if (dateFrom) {
          filtered = filtered.filter(content =>
            new Date(content.createdAt) >= new Date(dateFrom)
          );
        }

        if (dateTo) {
          filtered = filtered.filter(content =>
            new Date(content.createdAt) <= new Date(dateTo)
          );
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

        setFilteredContents(filtered);

      } catch (error) {
        console.error('❌ خطأ في تصفية المحتويات:', error);
        // في حالة الخطأ، عرض جميع المحتويات
        setFilteredContents(contents);
      }
    };

    applyFilters();
  }, [searchTerm, selectedType, selectedStatus, selectedCategory, selectedTag, featuredOnly, dateFrom, dateTo, sortBy, sortOrder, contents]);
  
  // Open create content modal
  const handleCreateContent = () => {
    setCurrentContent(null);
    setIsEditMode(false);
    setIsModalOpen(true);
  };
  
  // Open edit content modal using MasterDataService
  const handleEditContent = async (contentId) => {
    try {
      // البحث عن المحتوى في البيانات المحلية أولاً
      const contentToEdit = contents.find(content => content.id === contentId);

      if (contentToEdit) {
        setCurrentContent(contentToEdit);
        setIsEditMode(true);
        setIsModalOpen(true);
      } else {
        console.error('❌ لم يتم العثور على المحتوى:', contentId);
        alert('لم يتم العثور على المحتوى المطلوب');
      }
    } catch (error) {
      console.error('❌ خطأ في تحميل المحتوى للتعديل:', error);
      alert('حدث خطأ أثناء تحميل المحتوى');
    }
  };

  // View content details
  const handleViewContent = (contentId) => {
    // In a real app, this would navigate to a content detail page
    alert(`عرض تفاصيل المحتوى: ${contentId}`);
  };

  // Toggle content featured status using MasterDataService
  const handleToggleFeatured = async (contentId) => {
    try {
      // العثور على المحتوى في القائمة المحلية
      const content = contents.find(c => c.id === contentId);
      if (!content) {
        throw new Error('المحتوى غير موجود');
      }

      // تحديث حالة التمييز
      const updatedContent = {
        ...content,
        featured: !content.featured,
        updatedAt: new Date().toISOString()
      };

      // محاولة التحديث في MasterDataService
      try {
        const result = await updateContent({
          contentType: 'content',
          action: 'update',
          id: contentId,
          data: updatedContent
        });

        if (result?.success) {
          console.log('✅ تم تحديث حالة التمييز في MasterDataService');
        } else {
          throw new Error('فشل في تحديث MasterDataService');
        }
      } catch (serviceError) {
        console.warn('⚠️ فشل في MasterDataService، سيتم استخدام unifiedContentService:', serviceError);
        const { unifiedContentService } = await import('../../../services/unifiedContentService');
        await unifiedContentService.toggleFeatured(contentId);
      }

      // إعادة تحميل البيانات
      await fetchData();
    } catch (error) {
      console.error('❌ خطأ في تغيير حالة التمييز:', error);
      alert('حدث خطأ أثناء تغيير حالة التمييز');
    }
  };

  // Delete content using MasterDataService
  const handleDeleteContent = async (contentId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المحتوى؟')) {
      try {
        // محاولة الحذف من MasterDataService أولاً
        await deleteContent(contentId);
        console.log('✅ تم حذف المحتوى من MasterDataService');

        // تحديث البيانات المحلية
        const updatedContents = contents.filter(content => content.id !== contentId);
        setContents(updatedContents);
        setFilteredContents(updatedContents);

        // حفظ في localStorage
        localStorage.setItem('contentManagement', JSON.stringify(updatedContents));

      } catch (error) {
        console.error('❌ خطأ في حذف المحتوى:', error);
        alert('حدث خطأ أثناء حذف المحتوى');
      }
    }
  };
  
  // Handle content form submission using MasterDataService
  const handleSubmitContent = async (formData) => {
    setIsSubmitting(true);
    try {
      // تحضير البيانات للحفظ
      const contentData = {
        ...formData,
        updatedAt: new Date().toISOString(),
        ...(isEditMode ? {} : {
          id: `content_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          createdAt: new Date().toISOString()
        })
      };

      // محاولة الحفظ في MasterDataService أولاً
      if (isEditMode && currentContent) {
        await updateContent(currentContent.id, { ...contentData, contentType: 'content', type: 'content' });
        console.log('✅ تم تحديث المحتوى في MasterDataService');

        // تحديث البيانات المحلية
        const updatedContents = contents.map(content =>
          content.id === currentContent.id ? { ...content, ...contentData } : content
        );
        setContents(updatedContents);
        setFilteredContents(updatedContents);
        localStorage.setItem('contentManagement', JSON.stringify(updatedContents));
      } else {
        await createContent({ ...contentData, contentType: 'content', type: 'content' });
        console.log('✅ تم إنشاء المحتوى في MasterDataService');

        // إضافة للبيانات المحلية
        const updatedContents = [...contents, contentData];
        setContents(updatedContents);
        setFilteredContents(updatedContents);
        localStorage.setItem('contentManagement', JSON.stringify(updatedContents));
      }

      // إغلاق النافذة المنبثقة
      setIsModalOpen(false);
      setCurrentContent(null);
      setIsEditMode(false);

    } catch (error) {
      console.error('❌ خطأ في حفظ المحتوى:', error);
      alert('حدث خطأ أثناء حفظ المحتوى');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex flex-col lg:flex-row justify-between items-start lg:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة المحتوى</h1>
          <p className="text-gray-600 mt-1">عرض وإدارة جميع المحتويات في النظام</p>
        </div>
        {canCreateContent && (
          <button
            onClick={handleCreateContent}
            className="mt-4 lg:mt-0 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <span className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-1" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
              </svg>
              إضافة محتوى جديد
            </span>
          </button>
        )}
      </div>

      {/* Filters */}
      <ContentFilter
        searchTerm={searchTerm}
        selectedType={selectedType}
        selectedStatus={selectedStatus}
        selectedCategory={selectedCategory}
        selectedTag={selectedTag}
        featuredOnly={featuredOnly}
        sortBy={sortBy}
        sortOrder={sortOrder}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onSearchChange={setSearchTerm}
        onTypeChange={setSelectedType}
        onStatusChange={setSelectedStatus}
        onCategoryChange={setSelectedCategory}
        onTagChange={setSelectedTag}
        onFeaturedChange={setFeaturedOnly}
        onSortChange={({ sortBy: newSortBy, sortOrder: newSortOrder }) => {
          setSortBy(newSortBy);
          setSortOrder(newSortOrder);
        }}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        availableCategories={categories}
        availableTags={tags}
      />

      {/* Content Grid */}
      <div className="mt-6">
        {isLoading ? (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-3 text-gray-600">جاري تحميل المحتويات...</p>
          </div>
        ) : filteredContents.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredContents.map(content => (
              <ContentCard
                key={content.id}
                content={content}
                onClick={handleViewContent}
                onEdit={canEditContent ? handleEditContent : null}
                onDelete={canDeleteContent ? handleDeleteContent : null}
                onToggleFeatured={canManageContent ? handleToggleFeatured : null}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="mt-4 text-lg text-gray-700">لا توجد محتويات مطابقة</p>
            <p className="mt-1 text-gray-500">جرب تغيير معايير البحث أو أضف محتوى جديد</p>
          </div>
        )}
      </div>

      {/* Content Modal */}
      <ContentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        initialContent={currentContent}
        onSubmit={handleSubmitContent}
        title={isEditMode ? 'تعديل المحتوى' : 'إضافة محتوى جديد'}
        loading={isSubmitting}
        availableCategories={categories}
        availableTags={tags}
      />
    </div>
  );
};

export default ContentManagementV2;