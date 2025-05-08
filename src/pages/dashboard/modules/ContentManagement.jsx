import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { checkPermission } from '../../../utils/permissions';

const ContentManagement = () => {
  const { user } = useAuth();
  const [contents, setContents] = useState([]);
  const [filteredContents, setFilteredContents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');

  // Mock content data for development
  const mockContents = [
    {
      id: '1',
      title: 'مستقبل العلاقات الدولية في الشرق الأوسط',
      type: 'article',
      author: 'د. محمد العتيبي',
      status: 'published',
      createdAt: '2023-04-15',
      updatedAt: '2023-04-20',
      viewCount: 1254,
      featured: true,
      image: '/assets/images/article1.jpg'
    },
    {
      id: '2',
      title: 'تأثير الاقتصاد السياسي على التنمية المستدامة',
      type: 'research',
      author: 'د. فاطمة الزهراني',
      status: 'published',
      createdAt: '2023-03-10',
      updatedAt: '2023-03-15',
      viewCount: 875,
      featured: false,
      image: '/assets/images/research1.jpg'
    },
    {
      id: '3',
      title: 'دور المرأة في صنع السياسات العامة',
      type: 'article',
      author: 'د. نورة العنزي',
      status: 'draft',
      createdAt: '2023-05-05',
      updatedAt: '2023-05-05',
      viewCount: 0,
      featured: false,
      image: null
    },
    {
      id: '4',
      title: 'تحليل الخطاب السياسي في وسائل الإعلام',
      type: 'analysis',
      author: 'د. أحمد الغامدي',
      status: 'review',
      createdAt: '2023-05-01',
      updatedAt: '2023-05-03',
      viewCount: 0,
      featured: false,
      image: '/assets/images/analysis1.jpg'
    },
    {
      id: '5',
      title: 'ملخص المؤتمر السنوي للعلوم السياسية',
      type: 'news',
      author: 'إدارة الجمعية',
      status: 'published',
      createdAt: '2023-02-20',
      updatedAt: '2023-02-25',
      viewCount: 2130,
      featured: true,
      image: '/assets/images/news1.jpg'
    }
  ];

  // Load contents on component mount
  useEffect(() => {
    // Simulating API call with a delay
    setIsLoading(true);
    setTimeout(() => {
      setContents(mockContents);
      setFilteredContents(mockContents);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Filter contents when search or filters change
  useEffect(() => {
    let result = [...contents];
    
    // Filter by search term
    if (searchTerm) {
      result = result.filter(
        content => 
          content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          content.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    // Filter by content type
    if (selectedType !== 'all') {
      result = result.filter(content => content.type === selectedType);
    }
    
    // Filter by status
    if (selectedStatus !== 'all') {
      result = result.filter(content => content.status === selectedStatus);
    }
    
    setFilteredContents(result);
  }, [searchTerm, selectedType, selectedStatus, contents]);

  // Format date to Arabic format
  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('ar-SA', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }).format(date);
  };

  // Toggle featured state
  const toggleFeatured = (contentId) => {
    setContents(prevContents =>
      prevContents.map(content => {
        if (content.id === contentId) {
          return { ...content, featured: !content.featured };
        }
        return content;
      })
    );
  };

  // Get content type badge color
  const getTypeBadgeColor = (type) => {
    switch (type) {
      case 'article':
        return 'bg-blue-100 text-blue-800';
      case 'research':
        return 'bg-purple-100 text-purple-800';
      case 'news':
        return 'bg-green-100 text-green-800';
      case 'analysis':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status badge color
  const getStatusBadgeColor = (status) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'review':
        return 'bg-amber-100 text-amber-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Translate content type to Arabic
  const translateType = (type) => {
    const types = {
      'article': 'مقال',
      'research': 'بحث',
      'news': 'خبر',
      'analysis': 'تحليل',
      'event': 'فعالية'
    };
    return types[type] || type;
  };

  // Translate status to Arabic
  const translateStatus = (status) => {
    const statuses = {
      'published': 'منشور',
      'draft': 'مسودة',
      'review': 'قيد المراجعة',
      'rejected': 'مرفوض'
    };
    return statuses[status] || status;
  };

  // Create new content (stub function)
  const createContent = () => {
    alert('ستظهر هنا نافذة إنشاء محتوى جديد');
    // In a real app, this would open a modal or navigate to a create content form
  };

  // Check if user can manage content
  const canManageContent = checkPermission(user, 'content.manage');
  const canCreateContent = checkPermission(user, 'content.create') || canManageContent;
  const canEditContent = checkPermission(user, 'content.edit') || canManageContent;
  const canDeleteContent = checkPermission(user, 'content.delete') || canManageContent;

  return (
    <div>
      <div className="mb-6 flex flex-col lg:flex-row justify-between items-start lg:items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">إدارة المحتوى</h1>
          <p className="text-gray-600 mt-1">عرض وإدارة جميع المحتويات في النظام</p>
        </div>
        {canCreateContent && (
          <button
            onClick={createContent}
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

      {/* Filters and search */}
      <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Search */}
          <div>
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">بحث</label>
            <div className="relative">
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                id="search"
                className="block w-full pr-10 border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-right"
                placeholder="البحث بالعنوان أو اسم الكاتب"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Type filter */}
          <div>
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">نوع المحتوى</label>
            <select
              id="type"
              className="block w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-right"
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
            >
              <option value="all">جميع الأنواع</option>
              <option value="article">مقال</option>
              <option value="research">بحث</option>
              <option value="news">خبر</option>
              <option value="analysis">تحليل</option>
              <option value="event">فعالية</option>
            </select>
          </div>

          {/* Status filter */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">الحالة</label>
            <select
              id="status"
              className="block w-full border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-right"
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
            >
              <option value="all">جميع الحالات</option>
              <option value="published">منشور</option>
              <option value="draft">مسودة</option>
              <option value="review">قيد المراجعة</option>
              <option value="rejected">مرفوض</option>
            </select>
          </div>
        </div>
      </div>

      {/* Content table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-6 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-3 text-gray-600">جاري تحميل المحتويات...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    العنوان
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    النوع
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الكاتب
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    تاريخ الإنشاء
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    المشاهدات
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredContents.length > 0 ? (
                  filteredContents.map((content) => (
                    <tr key={content.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          {content.featured && (
                            <span className="bg-yellow-100 text-yellow-800 text-xs px-2 py-0.5 rounded-full ml-2">
                              مميز
                            </span>
                          )}
                          <div className="text-sm font-medium text-gray-900 truncate max-w-md">
                            {content.title}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getTypeBadgeColor(content.type)}`}>
                          {translateType(content.type)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {content.author}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(content.status)}`}>
                          {translateStatus(content.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(content.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {content.viewCount}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-3 space-x-reverse">
                          <button
                            className="text-blue-600 hover:text-blue-900"
                            onClick={() => alert(`سيتم عرض تفاصيل المحتوى: ${content.title}`)}
                          >
                            عرض
                          </button>
                          {canEditContent && (
                            <button
                              className="text-indigo-600 hover:text-indigo-900"
                              onClick={() => alert(`سيتم تعديل المحتوى: ${content.title}`)}
                            >
                              تعديل
                            </button>
                          )}
                          {canManageContent && (
                            <button
                              className={content.featured ? 'text-amber-600 hover:text-amber-900' : 'text-gray-600 hover:text-gray-900'}
                              onClick={() => toggleFeatured(content.id)}
                            >
                              {content.featured ? 'إلغاء التمييز' : 'تمييز'}
                            </button>
                          )}
                          {canDeleteContent && content.status !== 'published' && (
                            <button
                              className="text-red-600 hover:text-red-900"
                              onClick={() => alert(`سيتم حذف المحتوى: ${content.title}`)}
                            >
                              حذف
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                      لا توجد نتائج مطابقة للبحث
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentManagement;