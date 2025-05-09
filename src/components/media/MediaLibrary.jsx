// src/components/media/MediaLibrary.jsx
import React, { useState, useEffect } from 'react';
import { Tabs, Button, Input, Select, Space, Divider, message, Typography, Spin, Badge } from 'antd';
import { SearchOutlined, FilterOutlined, SortAscendingOutlined, SortDescendingOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import mediaService from '../../services/mediaService';
import { MEDIA_TYPES } from '../../models/Media';
import MediaGrid from './MediaGrid';
import MediaUploader from './MediaUploader';
import MediaModal from './MediaModal';

const { TabPane } = Tabs;
const { Title, Text } = Typography;
const { Option } = Select;

/**
 * مكتبة الوسائط - المكون الرئيسي لإدارة الوسائط
 * يوفر وظائف لعرض واستعراض وتحميل وإدارة ملفات الوسائط
 */
const MediaLibrary = ({ onSelect, multiple = false, selected = [], showUploadTab = true, title = 'مكتبة الوسائط' }) => {
  // حالة المكتبة
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('browse');
  const [selectedItems, setSelectedItems] = useState(selected || []);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  
  // حالة التصفية والبحث
  const [filters, setFilters] = useState({
    search: '',
    type: '',
    category: '',
    tags: [],
    sortBy: 'createdAt',
    sortDesc: true,
  });

  // حالة التفاصيل والتحرير
  const [viewItem, setViewItem] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState('view'); // 'view', 'edit', or 'delete'

  // تحميل البيانات عند تهيئة المكون
  useEffect(() => {
    fetchMediaItems();
    fetchCategories();
    fetchTags();
  }, []);

  // إعادة تحميل عناصر الوسائط عند تغيير المرشحات
  useEffect(() => {
    fetchMediaItems();
  }, [filters]);

  // جلب عناصر الوسائط
  const fetchMediaItems = () => {
    setLoading(true);
    try {
      const items = mediaService.getAll(filters);
      setMediaItems(items);
    } catch (error) {
      console.error('خطأ في جلب عناصر الوسائط:', error);
      message.error('حدث خطأ أثناء تحميل مكتبة الوسائط');
    } finally {
      setLoading(false);
    }
  };

  // جلب الفئات
  const fetchCategories = () => {
    try {
      const categoriesList = mediaService.getCategories();
      setCategories(categoriesList);
    } catch (error) {
      console.error('خطأ في جلب الفئات:', error);
    }
  };

  // جلب الوسوم
  const fetchTags = () => {
    try {
      const tagsList = mediaService.getTags();
      setTags(tagsList);
    } catch (error) {
      console.error('خطأ في جلب الوسوم:', error);
    }
  };

  // معالجة تحديد العناصر
  const handleSelect = (mediaItem) => {
    if (!multiple) {
      // وضع اختيار واحد
      setSelectedItems([mediaItem.id]);
      if (onSelect) {
        onSelect(mediaItem);
      }
    } else {
      // وضع اختيار متعدد
      setSelectedItems(prevSelected => {
        if (prevSelected.includes(mediaItem.id)) {
          return prevSelected.filter(id => id !== mediaItem.id);
        } else {
          return [...prevSelected, mediaItem.id];
        }
      });
    }
  };

  // معالجة عرض التفاصيل
  const handleViewDetails = (mediaItem) => {
    setViewItem(mediaItem);
    setModalMode('view');
    setIsModalVisible(true);
  };

  // معالجة حفظ التعديلات
  const handleSaveEdit = async (id, updates) => {
    try {
      const updatedMedia = mediaService.update(id, updates);
      if (updatedMedia) {
        message.success('تم تحديث الملف بنجاح');
        fetchMediaItems();
        setIsModalVisible(false);
      }
    } catch (error) {
      message.error(`خطأ في تحديث الملف: ${error.message}`);
    }
  };

  // معالجة حذف عنصر
  const handleDelete = async (id) => {
    try {
      const success = mediaService.delete(id);
      if (success) {
        message.success('تم حذف الملف بنجاح');
        fetchMediaItems();
        setIsModalVisible(false);
        
        // إزالة العنصر من العناصر المحددة إذا كان موجودًا
        if (selectedItems.includes(id)) {
          setSelectedItems(selectedItems.filter(itemId => itemId !== id));
        }
      } else {
        message.error('فشل في حذف الملف');
      }
    } catch (error) {
      message.error(`خطأ في حذف الملف: ${error.message}`);
    }
  };

  // معالجة الحذف المتعدد
  const handleBulkDelete = async () => {
    if (selectedItems.length === 0) {
      message.info('يرجى تحديد العناصر التي تريد حذفها أولاً');
      return;
    }

    try {
      const count = mediaService.bulkDelete(selectedItems);
      if (count > 0) {
        message.success(`تم حذف ${count} عنصر بنجاح`);
        setSelectedItems([]);
        fetchMediaItems();
      } else {
        message.warning('لم يتم حذف أي عناصر');
      }
    } catch (error) {
      message.error(`خطأ في حذف العناصر: ${error.message}`);
    }
  };

  // معالجة تحميل الملفات
  const handleUpload = async (files, metadata) => {
    try {
      await mediaService.bulkUpload(files, metadata);
      message.success(`تم رفع ${files.length} ملف بنجاح`);
      setActiveTab('browse');
      fetchMediaItems();
      fetchCategories();
      fetchTags();
    } catch (error) {
      message.error(`خطأ في رفع الملفات: ${error.message}`);
    }
  };

  // معالجة إضافة فئة جديدة
  const handleAddCategory = async (name) => {
    try {
      await mediaService.createCategory(name);
      fetchCategories();
      return true;
    } catch (error) {
      message.error(`خطأ في إضافة الفئة: ${error.message}`);
      return false;
    }
  };

  // تغيير نوع الفلتر
  const handleTypeFilterChange = (value) => {
    setFilters(prev => ({ ...prev, type: value }));
  };

  // تغيير فئة الفلتر
  const handleCategoryFilterChange = (value) => {
    setFilters(prev => ({ ...prev, category: value }));
  };

  // تغيير وسوم الفلتر
  const handleTagsFilterChange = (value) => {
    setFilters(prev => ({ ...prev, tags: value }));
  };

  // تغيير البحث
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setFilters(prev => ({ ...prev, search: value }));
  };

  // تغيير الترتيب
  const handleSortChange = (value) => {
    setFilters(prev => ({ ...prev, sortBy: value }));
  };

  // عكس اتجاه الترتيب
  const toggleSortDirection = () => {
    setFilters(prev => ({ ...prev, sortDesc: !prev.sortDesc }));
  };

  // مسح الفلاتر
  const clearFilters = () => {
    setFilters({
      search: '',
      type: '',
      category: '',
      tags: [],
      sortBy: 'createdAt',
      sortDesc: true,
    });
  };

  // تحديد العناصر المحددة في الوضع متعدد الاختيار
  const getCurrentSelection = () => {
    return mediaItems.filter(item => selectedItems.includes(item.id));
  };

  return (
    <div className="media-library">
      <div className="media-library-header" style={{ marginBottom: '16px' }}>
        <Title level={4}>{title}</Title>
        <div className="selected-count">
          {multiple && selectedItems.length > 0 && (
            <Text>العناصر المحددة: {selectedItems.length}</Text>
          )}
        </div>
      </div>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <TabPane tab="استعراض الوسائط" key="browse">
          <div className="filters" style={{ marginBottom: '16px' }}>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Input
                placeholder="البحث في الوسائط..."
                prefix={<SearchOutlined />}
                value={filters.search}
                onChange={handleSearchChange}
                allowClear
              />

              <Space wrap>
                <Select
                  placeholder={<Space><FilterOutlined /> نوع الملف</Space>}
                  style={{ width: 160 }}
                  value={filters.type}
                  onChange={handleTypeFilterChange}
                  allowClear
                >
                  {Object.entries(MEDIA_TYPES).map(([key, value]) => (
                    <Option key={value} value={value}>
                      {key === 'IMAGE' && 'صور'}
                      {key === 'DOCUMENT' && 'مستندات'}
                      {key === 'VIDEO' && 'فيديو'}
                      {key === 'AUDIO' && 'صوت'}
                      {key === 'OTHER' && 'أخرى'}
                    </Option>
                  ))}
                </Select>

                <Select
                  placeholder={<Space><FilterOutlined /> الفئة</Space>}
                  style={{ width: 160 }}
                  value={filters.category}
                  onChange={handleCategoryFilterChange}
                  allowClear
                >
                  {categories.map(category => (
                    <Option key={category.id} value={category.id}>{category.name}</Option>
                  ))}
                </Select>

                <Select
                  placeholder={<Space><FilterOutlined /> الوسوم</Space>}
                  style={{ width: 160 }}
                  mode="multiple"
                  value={filters.tags}
                  onChange={handleTagsFilterChange}
                  allowClear
                >
                  {tags.map(tag => (
                    <Option key={tag} value={tag}>{tag}</Option>
                  ))}
                </Select>

                <Select
                  placeholder="الترتيب حسب"
                  style={{ width: 160 }}
                  value={filters.sortBy}
                  onChange={handleSortChange}
                >
                  <Option value="createdAt">تاريخ الرفع</Option>
                  <Option value="name">الاسم</Option>
                  <Option value="size">الحجم</Option>
                </Select>

                <Button
                  icon={filters.sortDesc ? <SortDescendingOutlined /> : <SortAscendingOutlined />}
                  onClick={toggleSortDirection}
                />

                <Button onClick={clearFilters}>مسح الفلاتر</Button>

                {multiple && selectedItems.length > 0 && (
                  <Button type="danger" icon={<DeleteOutlined />} onClick={handleBulkDelete}>
                    حذف المحدد ({selectedItems.length})
                  </Button>
                )}
              </Space>
            </Space>
          </div>

          <div className="media-content">
            {loading ? (
              <div className="loading-container" style={{ textAlign: 'center', padding: '40px' }}>
                <Spin size="large" />
                <div style={{ marginTop: '16px' }}>جاري تحميل الوسائط...</div>
              </div>
            ) : (
              <MediaGrid
                items={mediaItems}
                selectedItems={selectedItems}
                onSelect={handleSelect}
                onViewDetails={handleViewDetails}
                multiple={multiple}
              />
            )}

            {mediaItems.length === 0 && !loading && (
              <div className="empty-state" style={{ textAlign: 'center', padding: '40px' }}>
                <Text>لا توجد وسائط متطابقة مع معايير البحث</Text>
              </div>
            )}
          </div>
        </TabPane>

        {showUploadTab && (
          <TabPane tab="رفع وسائط جديدة" key="upload">
            <MediaUploader
              onUpload={handleUpload}
              categories={categories}
              tags={tags}
              onAddCategory={handleAddCategory}
            />
          </TabPane>
        )}

        {multiple && (
          <TabPane tab={<Badge count={selectedItems.length} offset={[10, 0]}>العناصر المحددة</Badge>} key="selected">
            <div className="selected-items">
              {selectedItems.length > 0 ? (
                <>
                  <div className="actions" style={{ marginBottom: '16px' }}>
                    <Button type="danger" icon={<DeleteOutlined />} onClick={handleBulkDelete}>
                      حذف العناصر المحددة
                    </Button>
                  </div>
                  <MediaGrid
                    items={getCurrentSelection()}
                    selectedItems={selectedItems}
                    onSelect={handleSelect}
                    onViewDetails={handleViewDetails}
                    multiple={true}
                  />
                </>
              ) : (
                <div className="empty-state" style={{ textAlign: 'center', padding: '40px' }}>
                  <Text>لم يتم تحديد أي عناصر</Text>
                </div>
              )}
            </div>
          </TabPane>
        )}
      </Tabs>

      {/* مودال عرض وتحرير التفاصيل */}
      <MediaModal
        media={viewItem}
        visible={isModalVisible}
        onClose={() => setIsModalVisible(false)}
        onSave={handleSaveEdit}
        onDelete={handleDelete}
        mode={modalMode}
        setMode={setModalMode}
        categories={categories}
        tags={tags}
        onAddCategory={handleAddCategory}
      />
    </div>
  );
};

export default MediaLibrary;