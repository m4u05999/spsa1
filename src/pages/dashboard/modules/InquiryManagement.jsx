// src/pages/dashboard/modules/InquiryManagement.jsx
import React, { useState, useEffect } from 'react';
import { useMasterData } from '../../../hooks/useMasterData';
import { useAuth } from '../../../contexts/index.jsx';
import { checkPermission } from '../../../utils/permissions';

const InquiryManagement = () => {
  // MasterDataService integration
  const {
    data: masterData,
    loading: masterDataLoading,
    error: masterDataError,
    loadData,
    updateContent,
    createContent,
    deleteContent,
    searchContent
  } = useMasterData({
    type: 'inquiries',
    autoLoad: false
  });

  // Authentication and permissions
  const { user } = useAuth();
  const canManageInquiries = checkPermission(user, 'content.write');
  const canReplyToInquiries = checkPermission(user, 'content.write');

  // Local state management
  const [inquiries, setInquiries] = useState([]);
  const [filteredInquiries, setFilteredInquiries] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedInquiry, setSelectedInquiry] = useState(null);
  const [reply, setReply] = useState('');

  // Default inquiries data for fallback
  const defaultInquiries = [
    {
      id: 'inquiry-1',
      name: 'أحمد محمد',
      email: 'ahmed.m@example.com',
      subject: 'استفسار عن العضوية',
      message: 'أرغب في الاستفسار عن شروط وإجراءات الانضمام للجمعية وماهي المستندات المطلوبة للتقديم.',
      status: 'pending',
      date: '2023-11-15',
      priority: 'medium',
      category: 'membership',
      replies: [],
      contentType: 'inquiries',
      createdAt: '2023-11-15T00:00:00Z'
    },
    {
      id: 'inquiry-2',
      name: 'سارة الأحمدي',
      email: 'sara.a@example.com',
      subject: 'مشكلة في التسجيل',
      message: 'واجهت بعض المشكلات التقنية أثناء محاولة التسجيل في موقع الجمعية. يرجى المساعدة في حل هذه المشكلة.',
      status: 'resolved',
      date: '2023-11-10',
      priority: 'high',
      category: 'technical',
      replies: [
        {
          id: 'reply-1',
          responder: 'مدير النظام',
          message: 'شكراً للتواصل معنا. يرجى تجربة استخدام متصفح آخر، أو محاولة مسح ذاكرة التخزين المؤقتة ثم إعادة المحاولة.',
          date: '2023-11-11'
        }
      ],
      contentType: 'inquiries',
      createdAt: '2023-11-10T00:00:00Z'
    },
    {
      id: 'inquiry-3',
      name: 'خالد العتيبي',
      email: 'khalid.o@example.com',
      subject: 'استفسار عن المؤتمر السنوي',
      message: 'متى سيقام المؤتمر السنوي لهذا العام، وهل يمكن المشاركة فيه كباحث؟ أرغب في تقديم ورقة بحثية.',
      status: 'in-progress',
      date: '2023-11-12',
      priority: 'medium',
      category: 'events',
      replies: [
        {
          id: 'reply-2',
          responder: 'منسق الفعاليات',
          message: 'شكراً لاهتمامك بالمشاركة في المؤتمر. سيقام المؤتمر في مارس 2024، وسيتم فتح باب تقديم الأوراق البحثية قريباً.',
          date: '2023-11-13'
        }
      ],
      contentType: 'inquiries',
      createdAt: '2023-11-12T00:00:00Z'
    },
    {
      id: 'inquiry-4',
      name: 'نورة السالم',
      email: 'noura.s@example.com',
      subject: 'طلب تعاون أكاديمي',
      message: 'أمثل جامعة الملك سعود ونرغب في عقد شراكة مع الجمعية لإقامة ندوات مشتركة. كيف يمكننا التنسيق لذلك؟',
      status: 'pending',
      date: '2023-11-14',
      priority: 'high',
      category: 'partnership',
      replies: [],
      contentType: 'inquiries',
      createdAt: '2023-11-14T00:00:00Z'
    },
    {
      id: 'inquiry-5',
      name: 'فهد القحطاني',
      email: 'fahad.q@example.com',
      subject: 'اقتراح تطوير الموقع',
      message: 'أقترح إضافة خاصية للبحث في الأوراق البحثية والمنشورات حسب الكلمات المفتاحية لتسهيل الوصول للمحتوى.',
      status: 'pending',
      date: '2023-11-13',
      priority: 'low',
      category: 'suggestions',
      replies: [],
      contentType: 'inquiries',
      createdAt: '2023-11-13T00:00:00Z'
    }
  ];

  // Load inquiries from MasterDataService
  const loadInquiries = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 جاري تحميل بيانات الاستفسارات من MasterDataService...');

      await loadData({
        type: 'inquiries',
        limit: 100,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      });

      const loadedInquiries = masterData || [];

      // Use default data if no inquiries found, or fallback to localStorage
      let finalInquiries = loadedInquiries.length > 0 ? loadedInquiries : [];

      if (finalInquiries.length === 0) {
        // Try localStorage fallback
        const localData = localStorage.getItem('inquiryManagement');
        if (localData) {
          try {
            finalInquiries = JSON.parse(localData);
            console.log('🔄 تم تحميل البيانات من localStorage');
          } catch (e) {
            console.warn('❌ خطأ في قراءة localStorage:', e);
          }
        }

        // Use default data as final fallback
        if (finalInquiries.length === 0) {
          finalInquiries = defaultInquiries;
          // Save default data to localStorage
          localStorage.setItem('inquiryManagement', JSON.stringify(defaultInquiries));
          console.log('🔄 تم استخدام البيانات الافتراضية للاستفسارات');
        }
      } else {
        // Save successful data to localStorage
        localStorage.setItem('inquiryManagement', JSON.stringify(finalInquiries));
      }

      setInquiries(finalInquiries);
      console.log(`✅ تم تحميل الاستفسارات من MasterDataService: ${finalInquiries.length}`);
    } catch (error) {
      console.error('❌ خطأ في تحميل الاستفسارات من MasterDataService:', error);

      // Try localStorage fallback
      let fallbackInquiries = [];
      const localData = localStorage.getItem('inquiryManagement');
      if (localData) {
        try {
          fallbackInquiries = JSON.parse(localData);
          console.log('🔄 تم تحميل البيانات من localStorage كبديل');
        } catch (e) {
          console.warn('❌ خطأ في قراءة localStorage:', e);
        }
      }

      // Use default data as final fallback
      if (fallbackInquiries.length === 0) {
        fallbackInquiries = defaultInquiries;
        localStorage.setItem('inquiryManagement', JSON.stringify(defaultInquiries));
        console.log('🔄 تم استخدام البيانات الافتراضية للاستفسارات');
      }

      setInquiries(fallbackInquiries);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInquiries();
  }, []);

  // Apply filters using MasterDataService search with local fallback
  const applyFilters = async () => {
    try {
      if (searchTerm || filter !== 'all') {
        // Use MasterDataService search for advanced filtering
        const filters = filter !== 'all' ? { status: filter } : {};
        const searchResult = await searchContent(searchTerm, filters);
        const searchedInquiries = searchResult || [];

        if (searchedInquiries.length > 0) {
          setFilteredInquiries(searchedInquiries);
          return;
        }
      }

      // Local fallback filtering
      let result = [...inquiries];

      // Apply status filter
      if (filter !== 'all') {
        result = result.filter(inquiry => inquiry.status === filter);
      }

      // Apply search filter
      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        result = result.filter(inquiry =>
          inquiry.name.toLowerCase().includes(search) ||
          inquiry.email.toLowerCase().includes(search) ||
          inquiry.subject.toLowerCase().includes(search) ||
          inquiry.message.toLowerCase().includes(search)
        );
      }

      setFilteredInquiries(result);
    } catch (error) {
      console.error('❌ خطأ في البحث في الاستفسارات:', error);
      // Fallback to local filtering
      let result = [...inquiries];

      if (filter !== 'all') {
        result = result.filter(inquiry => inquiry.status === filter);
      }

      if (searchTerm) {
        const search = searchTerm.toLowerCase();
        result = result.filter(inquiry =>
          inquiry.name.toLowerCase().includes(search) ||
          inquiry.email.toLowerCase().includes(search) ||
          inquiry.subject.toLowerCase().includes(search) ||
          inquiry.message.toLowerCase().includes(search)
        );
      }

      setFilteredInquiries(result);
    }
  };

  useEffect(() => {
    applyFilters();
  }, [inquiries, filter, searchTerm]);

  // Handle inquiry reply using MasterDataService
  const handleReply = async (e) => {
    e.preventDefault();

    if (!reply.trim()) {
      alert('الرجاء كتابة رد');
      return;
    }

    try {
      console.log('🔄 إضافة رد جديد للاستفسار:', selectedInquiry.id);

      const newReply = {
        id: `reply-${Date.now()}`,
        responder: user?.name || 'مدير النظام',
        message: reply,
        date: new Date().toISOString().split('T')[0]
      };

      const updatedInquiry = {
        ...selectedInquiry,
        status: 'in-progress',
        replies: [...selectedInquiry.replies, newReply]
      };

      // Update inquiry using MasterDataService
      await updateContent(selectedInquiry.id, updatedInquiry);

      // Update local state
      const updatedInquiries = inquiries.map(inquiry => {
        if (inquiry.id === selectedInquiry.id) {
          return updatedInquiry;
        }
        return inquiry;
      });

      setInquiries(updatedInquiries);
      setReply('');
      setSelectedInquiry(updatedInquiry);

      // Update localStorage
      localStorage.setItem('inquiryManagement', JSON.stringify(updatedInquiries));

      console.log('✅ تم إضافة الرد بنجاح');

      // Reload inquiries to ensure consistency
      await loadInquiries();
    } catch (error) {
      console.error('❌ خطأ في إضافة الرد:', error);
      alert('حدث خطأ في إضافة الرد. يرجى المحاولة مرة أخرى.');
    }
  };

  // Mark as resolved using MasterDataService
  const markAsResolved = async (id) => {
    try {
      console.log('🔄 تعيين الاستفسار كمحلول:', id);

      const inquiryToUpdate = inquiries.find(inquiry => inquiry.id === id);
      if (!inquiryToUpdate) {
        console.error('❌ لم يتم العثور على الاستفسار');
        return;
      }

      const updatedInquiry = {
        ...inquiryToUpdate,
        status: 'resolved'
      };

      // Update inquiry using MasterDataService
      await updateContent(id, updatedInquiry);

      // Update local state
      const updatedInquiries = inquiries.map(inquiry => {
        if (inquiry.id === id) {
          return updatedInquiry;
        }
        return inquiry;
      });

      setInquiries(updatedInquiries);

      if (selectedInquiry && selectedInquiry.id === id) {
        setSelectedInquiry(updatedInquiry);
      }

      // Update localStorage
      localStorage.setItem('inquiryManagement', JSON.stringify(updatedInquiries));

      console.log('✅ تم تعيين الاستفسار كمحلول بنجاح');

      // Reload inquiries to ensure consistency
      await loadInquiries();
    } catch (error) {
      console.error('❌ خطأ في تعيين الاستفسار كمحلول:', error);
      alert('حدث خطأ في تحديث حالة الاستفسار. يرجى المحاولة مرة أخرى.');
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('ar-SA', options);
  };

  // Get status badge classes
  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status text in Arabic
  const getStatusText = (status) => {
    switch(status) {
      case 'pending':
        return 'قيد الانتظار';
      case 'in-progress':
        return 'قيد المعالجة';
      case 'resolved':
        return 'تم الحل';
      default:
        return 'غير معروف';
    }
  };

  // Get priority badge classes and text
  const getPriorityBadge = (priority) => {
    switch(priority) {
      case 'high':
        return {
          class: 'bg-red-100 text-red-800',
          text: 'عالية'
        };
      case 'medium':
        return {
          class: 'bg-orange-100 text-orange-800',
          text: 'متوسطة'
        };
      case 'low':
        return {
          class: 'bg-gray-100 text-gray-800',
          text: 'منخفضة'
        };
      default:
        return {
          class: 'bg-gray-100 text-gray-800',
          text: 'غير محدد'
        };
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">إدارة الاستفسارات</h1>
      </div>
      
      {/* Filter and Search Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="البحث في الاستفسارات..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <select 
              className="w-full border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">جميع الاستفسارات</option>
              <option value="pending">قيد الانتظار</option>
              <option value="in-progress">قيد المعالجة</option>
              <option value="resolved">تم الحل</option>
            </select>
          </div>
        </div>
        
        <div className="flex items-center">
          <span className="text-sm text-gray-600 ml-2">
            {filteredInquiries.length} استفسار
          </span>
        </div>
      </div>

      {/* Inquiries List */}
      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredInquiries.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-md p-6 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">لا توجد استفسارات</h3>
          <p className="mt-1 text-sm text-gray-500">
            لا توجد استفسارات تطابق معايير البحث الخاصة بك.
          </p>
        </div>
      ) : (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    المرسل
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الموضوع
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    التاريخ
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الأولوية
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الحالة
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    الإجراءات
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInquiries.map((inquiry) => (
                  <tr key={inquiry.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium">{inquiry.name.charAt(0)}</span>
                        </div>
                        <div className="mr-4">
                          <div className="text-sm font-medium text-gray-900">{inquiry.name}</div>
                          <div className="text-sm text-gray-500">{inquiry.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{inquiry.subject}</div>
                      <div className="text-sm text-gray-500 truncate max-w-[200px]">{inquiry.message.substring(0, 50)}...</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(inquiry.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityBadge(inquiry.priority).class}`}>
                        {getPriorityBadge(inquiry.priority).text}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(inquiry.status)}`}>
                        {getStatusText(inquiry.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button 
                        className="text-blue-600 hover:text-blue-900 ml-3"
                        onClick={() => setSelectedInquiry(inquiry)}
                      >
                        عرض
                      </button>
                      {inquiry.status !== 'resolved' && (
                        <button 
                          className="text-green-600 hover:text-green-900"
                          onClick={() => markAsResolved(inquiry.id)}
                        >
                          تم الحل
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Pagination */}
      <div className="mt-6 flex items-center justify-between border-t border-gray-200 pt-4">
        <div className="flex flex-1 justify-between sm:hidden">
          <button className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            السابق
          </button>
          <button className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            التالي
          </button>
        </div>
        <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
          <div>
            <p className="text-sm text-gray-700">
              عرض <span className="font-medium">1</span> إلى <span className="font-medium">{filteredInquiries.length}</span> من{' '}
              <span className="font-medium">{inquiries.length}</span> استفسار
            </p>
          </div>
          <div>
            <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
              <button className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-none">
                <span className="sr-only">السابق</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                </svg>
              </button>
              <button aria-current="page" className="relative z-10 inline-flex items-center bg-blue-600 px-4 py-2 text-sm font-semibold text-white focus:z-20">
                1
              </button>
              <button className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:outline-none">
                <span className="sr-only">التالي</span>
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                </svg>
              </button>
            </nav>
          </div>
        </div>
      </div>
      
      {/* Inquiry Detail Modal */}
      {selectedInquiry && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" onClick={() => setSelectedInquiry(null)}>
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen"></span>&#8203;
            
            <div className="inline-block align-bottom bg-white rounded-lg text-right overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full md:max-w-2xl" role="dialog" aria-modal="true" aria-labelledby="modal-headline">
              <div className="bg-white p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    {selectedInquiry.subject}
                  </h3>
                  <button 
                    onClick={() => setSelectedInquiry(null)}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="border-b border-gray-200 pb-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium">{selectedInquiry.name.charAt(0)}</span>
                      </div>
                      <div className="mr-3">
                        <div className="text-sm font-medium text-gray-900">{selectedInquiry.name}</div>
                        <div className="text-sm text-gray-500">{selectedInquiry.email}</div>
                      </div>
                    </div>
                    <div className="text-sm text-gray-500">
                      {formatDate(selectedInquiry.date)}
                    </div>
                  </div>
                  <div className="flex space-x-2 space-x-reverse mt-2">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(selectedInquiry.status)}`}>
                      {getStatusText(selectedInquiry.status)}
                    </span>
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityBadge(selectedInquiry.priority).class}`}>
                      {getPriorityBadge(selectedInquiry.priority).text}
                    </span>
                  </div>
                </div>
                
                <div className="py-4">
                  <p className="text-sm text-gray-900 whitespace-pre-wrap">
                    {selectedInquiry.message}
                  </p>
                </div>
                
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">الردود</h4>
                  {selectedInquiry.replies.length === 0 ? (
                    <p className="text-sm text-gray-500">لم يتم الرد بعد.</p>
                  ) : (
                    <div className="space-y-4">
                      {selectedInquiry.replies.map(reply => (
                        <div key={reply.id} className="bg-gray-50 rounded-lg p-3">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium">{reply.responder}</span>
                            <span className="text-xs text-gray-500">{formatDate(reply.date)}</span>
                          </div>
                          <p className="text-sm text-gray-800">{reply.message}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                {selectedInquiry.status !== 'resolved' && (
                  <div className="mt-4">
                    <form onSubmit={handleReply} className="space-y-3">
                      <textarea
                        className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="3"
                        placeholder="اكتب ردك هنا..."
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                        required
                      ></textarea>
                      <div className="flex justify-between">
                        <button
                          type="button"
                          className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                          onClick={() => markAsResolved(selectedInquiry.id)}
                        >
                          تعيين كمحلول
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                          إرسال الرد
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InquiryManagement;