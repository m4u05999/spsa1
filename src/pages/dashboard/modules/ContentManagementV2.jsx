import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { checkPermission } from '../../../utils/permissions';
import { contentService } from '../../../services/contentService';
import ContentFilter from '../../../components/content/ContentFilter';
import ContentCard from '../../../components/content/ContentCard';
import ContentModal from '../../../components/content/ContentModal';
import { CONTENT_TYPES, CONTENT_STATUS } from '../../../models/Content';

const ContentManagementV2 = () => {
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
  
  // Fetch data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [contentsData, categoriesData, tagsData] = await Promise.all([
        contentService.getAll(),
        contentService.getCategories(),
        contentService.getTags()
      ]);
      
      setContents(contentsData);
      setFilteredContents(contentsData);
      setCategories(categoriesData);
      setTags(tagsData);
    } catch (error) {
      console.error('Error fetching content data:', error);
      alert('حدث خطأ أثناء جلب البيانات');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Load content on component mount
  useEffect(() => {
    fetchData();
  }, []);
  
  // Apply filters when search or filters change
  useEffect(() => {
    const applyFilters = async () => {
      try {
        // Prepare filter params
        const filterParams = {};
        if (searchTerm) filterParams.query = searchTerm;
        if (selectedType !== 'all') filterParams.type = selectedType;
        if (selectedStatus !== 'all') filterParams.status = selectedStatus;
        if (selectedCategory !== 'all') filterParams.category = selectedCategory;
        if (selectedTag !== 'all') filterParams.tag = selectedTag;
        if (featuredOnly) filterParams.featured = true;
        if (dateFrom) filterParams.dateFrom = dateFrom;
        if (dateTo) filterParams.dateTo = dateTo;
        filterParams.sortBy = sortBy;
        filterParams.sortOrder = sortOrder;
        
        // Use contentService to filter
        const filtered = await contentService.search(filterParams);
        setFilteredContents(filtered);
      } catch (error) {
        console.error('Error filtering contents:', error);
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
  
  // Open edit content modal
  const handleEditContent = async (contentId) => {
    try {
      const contentToEdit = await contentService.getById(contentId);
      setCurrentContent(contentToEdit);
      setIsEditMode(true);
      setIsModalOpen(true);
    } catch (error) {
      console.error('Error fetching content for edit:', error);
      alert('حدث خطأ أثناء تحميل المحتوى');
    }
  };
  
  // View content details
  const handleViewContent = (contentId) => {
    // In a real app, this would navigate to a content detail page
    alert(`عرض تفاصيل المحتوى: ${contentId}`);
  };
  
  // Toggle content featured status
  const handleToggleFeatured = async (contentId) => {
    try {
      await contentService.toggleFeatured(contentId);
      // Refresh content list
      fetchData();
    } catch (error) {
      console.error('Error toggling featured status:', error);
      alert('حدث خطأ أثناء تغيير حالة التمييز');
    }
  };
  
  // Delete content
  const handleDeleteContent = async (contentId) => {
    if (window.confirm('هل أنت متأكد من حذف هذا المحتوى؟')) {
      try {
        await contentService.delete(contentId);
        // Refresh content list
        fetchData();
      } catch (error) {
        console.error('Error deleting content:', error);
        alert('حدث خطأ أثناء حذف المحتوى');
      }
    }
  };
  
  // Handle content form submission
  const handleSubmitContent = async (formData) => {
    setIsSubmitting(true);
    try {
      if (isEditMode && currentContent) {
        await contentService.update(currentContent.id, formData);
      } else {
        await contentService.create(formData);
      }
      
      // Refresh content list and close modal
      await fetchData();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error saving content:', error);
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