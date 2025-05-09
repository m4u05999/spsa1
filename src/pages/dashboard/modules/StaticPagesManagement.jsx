import React, { useState, useEffect, useMemo } from 'react';
import { Button, Card, Table, Badge, Modal, Input, message, Popconfirm, Tooltip } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined, CopyOutlined } from '@ant-design/icons';
import localStorageService from '../../../services/localStorageService';
import { pageTemplateService } from '../../../services/pageTemplateService';
import PageEditor from '../../../components/pages/PageEditor';
import PageTemplateForm from '../../../components/pages/PageTemplateForm';
import { PageTemplate } from '../../../models/PageTemplate';

// Storage key for static pages
const STATIC_PAGES_STORAGE_KEY = 'cms_static_pages';

/**
 * StaticPagesManagement - Module for managing static pages and templates
 */
const StaticPagesManagement = () => {
  // State for pages and templates
  const [pages, setPages] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('pages'); // 'pages' or 'templates'
  
  // Modals state
  const [isPageModalVisible, setIsPageModalVisible] = useState(false);
  const [isTemplateModalVisible, setIsTemplateModalVisible] = useState(false);
  const [isViewModalVisible, setIsViewModalVisible] = useState(false);
  
  // Current edited items
  const [currentPage, setCurrentPage] = useState(null);
  const [currentTemplate, setCurrentTemplate] = useState(null);
  const [viewContent, setViewContent] = useState('');
  
  // Loading states
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch pages and templates on mount
  useEffect(() => {
    fetchPages();
    fetchTemplates();
  }, []);

  // Fetch pages from localStorage
  const fetchPages = () => {
    setLoading(true);
    try {
      const storedPages = localStorageService.getItem(STATIC_PAGES_STORAGE_KEY) || [];
      setPages(storedPages);
    } catch (error) {
      console.error('Error fetching pages:', error);
      message.error('حدث خطأ أثناء تحميل الصفحات');
    } finally {
      setLoading(false);
    }
  };

  // Fetch templates using the service
  const fetchTemplates = async () => {
    try {
      const allTemplates = await pageTemplateService.getAll();
      setTemplates(allTemplates);
    } catch (error) {
      console.error('Error fetching templates:', error);
      message.error('حدث خطأ أثناء تحميل القوالب');
    }
  };

  // Filter pages based on search query
  const filteredPages = useMemo(() => {
    if (!searchQuery.trim()) return pages;
    
    const query = searchQuery.toLowerCase();
    return pages.filter(page => 
      page.title.toLowerCase().includes(query) || 
      page.slug.toLowerCase().includes(query)
    );
  }, [pages, searchQuery]);

  // Filter templates based on search query
  const filteredTemplates = useMemo(() => {
    if (!searchQuery.trim()) return templates;
    
    const query = searchQuery.toLowerCase();
    return templates.filter(template => 
      template.name.toLowerCase().includes(query) || 
      template.description.toLowerCase().includes(query)
    );
  }, [templates, searchQuery]);

  // Handle page creation/update
  const handleSavePage = async (pageData) => {
    setSaving(true);
    try {
      const allPages = [...pages];
      
      // If editing existing page
      if (currentPage?.id) {
        const index = allPages.findIndex(p => p.id === currentPage.id);
        if (index !== -1) {
          allPages[index] = { 
            ...currentPage, 
            ...pageData,
            updatedAt: new Date().toISOString()
          };
        }
      } else {
        // New page
        const newPage = {
          ...pageData,
          id: Math.random().toString(36).substr(2, 9),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        allPages.push(newPage);
      }
      
      // Save to localStorage
      localStorageService.setItem(STATIC_PAGES_STORAGE_KEY, allPages);
      setPages(allPages);
      
      message.success(currentPage ? 'تم تحديث الصفحة بنجاح' : 'تم إنشاء الصفحة بنجاح');
      setIsPageModalVisible(false);
      setCurrentPage(null);
    } catch (error) {
      console.error('Error saving page:', error);
      message.error('حدث خطأ أثناء حفظ الصفحة');
    } finally {
      setSaving(false);
    }
  };

  // Handle template creation/update
  const handleSaveTemplate = async (templateData) => {
    setSaving(true);
    try {
      if (currentTemplate?.id) {
        // Update existing template
        await pageTemplateService.update(currentTemplate.id, templateData);
      } else {
        // Create new template
        await pageTemplateService.create(templateData);
      }
      
      // Refresh templates list
      fetchTemplates();
      message.success(currentTemplate ? 'تم تحديث القالب بنجاح' : 'تم إنشاء القالب بنجاح');
      setIsTemplateModalVisible(false);
      setCurrentTemplate(null);
    } catch (error) {
      console.error('Error saving template:', error);
      message.error('حدث خطأ أثناء حفظ القالب');
    } finally {
      setSaving(false);
    }
  };

  // Handle page deletion
  const handleDeletePage = (id) => {
    try {
      const updatedPages = pages.filter(page => page.id !== id);
      localStorageService.setItem(STATIC_PAGES_STORAGE_KEY, updatedPages);
      setPages(updatedPages);
      message.success('تم حذف الصفحة بنجاح');
    } catch (error) {
      console.error('Error deleting page:', error);
      message.error('حدث خطأ أثناء حذف الصفحة');
    }
  };

  // Handle template deletion
  const handleDeleteTemplate = async (id) => {
    try {
      await pageTemplateService.delete(id);
      fetchTemplates();
      message.success('تم حذف القالب بنجاح');
    } catch (error) {
      console.error('Error deleting template:', error);
      message.error('حدث خطأ أثناء حذف القالب');
    }
  };

  // Handle template cloning
  const handleCloneTemplate = async (id) => {
    try {
      await pageTemplateService.clone(id);
      fetchTemplates();
      message.success('تم نسخ القالب بنجاح');
    } catch (error) {
      console.error('Error cloning template:', error);
      message.error('حدث خطأ أثناء نسخ القالب');
    }
  };

  // View page content
  const viewPage = (page) => {
    setViewContent(page.content);
    setIsViewModalVisible(true);
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ar-SA', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };

  // Get status badge
  const getStatusBadge = (status) => {
    if (status === 'published') {
      return <Badge color="green" text="منشورة" />;
    } else if (status === 'draft') {
      return <Badge color="gold" text="مسودة" />;
    } else {
      return <Badge color="gray" text="مؤرشفة" />;
    }
  };

  // Table columns for pages
  const pageColumns = [
    {
      title: 'العنوان',
      dataIndex: 'title',
      key: 'title',
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: 'الرابط',
      dataIndex: 'slug',
      key: 'slug',
      render: (slug) => (
        <Tooltip title={`/pages/${slug}`}>
          <code className="text-xs bg-gray-100 px-2 py-1 rounded">{slug}</code>
        </Tooltip>
      ),
    },
    {
      title: 'الحالة',
      dataIndex: 'status',
      key: 'status',
      render: (status) => getStatusBadge(status),
    },
    {
      title: 'تاريخ الإنشاء',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date) => formatDate(date),
    },
    {
      title: 'آخر تحديث',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date) => formatDate(date),
    },
    {
      title: 'الإجراءات',
      key: 'actions',
      render: (_, record) => (
        <div className="flex space-x-2 space-x-reverse">
          <Tooltip title="عرض">
            <Button 
              icon={<EyeOutlined />} 
              size="small" 
              onClick={() => viewPage(record)} 
            />
          </Tooltip>
          <Tooltip title="تعديل">
            <Button 
              icon={<EditOutlined />} 
              size="small" 
              onClick={() => {
                setCurrentPage(record);
                setIsPageModalVisible(true);
              }} 
            />
          </Tooltip>
          <Popconfirm
            title="هل أنت متأكد من حذف هذه الصفحة؟"
            onConfirm={() => handleDeletePage(record.id)}
            okText="نعم"
            cancelText="إلغاء"
          >
            <Tooltip title="حذف">
              <Button 
                icon={<DeleteOutlined />} 
                size="small" 
                danger 
              />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  // Table columns for templates
  const templateColumns = [
    {
      title: 'الاسم',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: 'النوع',
      dataIndex: 'type',
      key: 'type',
      render: (type) => {
        const types = {
          'standard': { color: 'blue', text: 'قياسي' },
          'landing': { color: 'green', text: 'صفحة هبوط' },
          'contact': { color: 'purple', text: 'تواصل' },
          'about': { color: 'orange', text: 'تعريفي' },
          'custom': { color: 'cyan', text: 'مخصص' }
        };
        const typeInfo = types[type] || { color: 'default', text: type };
        return <Badge color={typeInfo.color} text={typeInfo.text} />;
      }
    },
    {
      title: 'الوصف',
      dataIndex: 'description',
      key: 'description',
      render: (text) => <span className="truncate block max-w-xs">{text}</span>,
    },
    {
      title: 'عدد الأقسام',
      dataIndex: 'sections',
      key: 'sections',
      render: (sections) => sections?.length || 0,
    },
    {
      title: 'آخر تحديث',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      render: (date) => formatDate(date),
    },
    {
      title: 'الإجراءات',
      key: 'actions',
      render: (_, record) => (
        <div className="flex space-x-2 space-x-reverse">
          <Tooltip title="تعديل">
            <Button 
              icon={<EditOutlined />} 
              size="small" 
              onClick={() => {
                setCurrentTemplate(record);
                setIsTemplateModalVisible(true);
              }} 
            />
          </Tooltip>
          <Tooltip title="نسخ">
            <Button 
              icon={<CopyOutlined />} 
              size="small" 
              onClick={() => handleCloneTemplate(record.id)} 
            />
          </Tooltip>
          <Popconfirm
            title="هل أنت متأكد من حذف هذا القالب؟"
            onConfirm={() => handleDeleteTemplate(record.id)}
            okText="نعم"
            cancelText="إلغاء"
          >
            <Tooltip title="حذف">
              <Button 
                icon={<DeleteOutlined />} 
                size="small" 
                danger 
              />
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6" dir="rtl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">إدارة الصفحات الثابتة</h1>
        <p className="text-gray-600 mt-1">
          قم بإنشاء وإدارة الصفحات الثابتة للموقع باستخدام نظام القوالب المتقدم
        </p>
      </div>

      {/* Tabs */}
      <div className="mb-6 border-b border-gray-200">
        <div className="flex -mb-px">
          <button
            className={`px-4 py-2 border-b-2 text-sm font-medium ${
              activeTab === 'pages'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('pages')}
          >
            الصفحات الثابتة
          </button>
          <button
            className={`ml-8 px-4 py-2 border-b-2 text-sm font-medium ${
              activeTab === 'templates'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('templates')}
          >
            قوالب الصفحات
          </button>
        </div>
      </div>

      {/* Action Bar */}
      <div className="mb-6 flex justify-between items-center">
        <Input
          prefix={<SearchOutlined style={{ color: '#d9d9d9' }} />}
          placeholder={activeTab === 'pages' ? "بحث في الصفحات..." : "بحث في القوالب..."}
          style={{ width: 300 }}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          allowClear
        />

        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => {
            if (activeTab === 'pages') {
              setCurrentPage(null);
              setIsPageModalVisible(true);
            } else {
              setCurrentTemplate(null);
              setIsTemplateModalVisible(true);
            }
          }}
        >
          {activeTab === 'pages' ? 'إنشاء صفحة جديدة' : 'إنشاء قالب جديد'}
        </Button>
      </div>

      {/* Content Area */}
      <Card bordered={false}>
        {activeTab === 'pages' ? (
          <Table
            rowKey="id"
            columns={pageColumns}
            dataSource={filteredPages}
            loading={loading}
            pagination={{ defaultPageSize: 10 }}
            locale={{ emptyText: 'لا توجد صفحات' }}
          />
        ) : (
          <Table
            rowKey="id"
            columns={templateColumns}
            dataSource={filteredTemplates}
            loading={loading}
            pagination={{ defaultPageSize: 10 }}
            locale={{ emptyText: 'لا توجد قوالب' }}
          />
        )}
      </Card>

      {/* Page Modal */}
      <Modal
        title={currentPage ? 'تعديل الصفحة' : 'إنشاء صفحة جديدة'}
        open={isPageModalVisible}
        onCancel={() => {
          setIsPageModalVisible(false);
          setCurrentPage(null);
        }}
        footer={null}
        width={1000}
        bodyStyle={{ padding: '20px' }}
        style={{ top: 20 }}
      >
        <PageEditor
          initialPage={currentPage}
          onSave={handleSavePage}
          onCancel={() => {
            setIsPageModalVisible(false);
            setCurrentPage(null);
          }}
          loading={saving}
        />
      </Modal>

      {/* Template Modal */}
      <Modal
        title={currentTemplate ? 'تعديل القالب' : 'إنشاء قالب جديد'}
        open={isTemplateModalVisible}
        onCancel={() => {
          setIsTemplateModalVisible(false);
          setCurrentTemplate(null);
        }}
        footer={null}
        width={800}
      >
        <PageTemplateForm
          initialTemplate={currentTemplate}
          onSubmit={handleSaveTemplate}
          onCancel={() => {
            setIsTemplateModalVisible(false);
            setCurrentTemplate(null);
          }}
          loading={saving}
        />
      </Modal>

      {/* View Modal */}
      <Modal
        title="معاينة محتوى الصفحة"
        open={isViewModalVisible}
        onCancel={() => setIsViewModalVisible(false)}
        footer={null}
        width={800}
      >
        <div className="bg-white p-4 rounded border">
          <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: viewContent }} />
        </div>
      </Modal>
    </div>
  );
};

export default StaticPagesManagement;