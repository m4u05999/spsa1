// src/components/media/MediaModal.jsx
import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  Button,
  Descriptions,
  Form,
  Input,
  Select,
  Space,
  Tag,
  Tabs,
  message,
  Typography,
  Divider,
  Spin,
  Image
} from 'antd';
import {
  EditOutlined,
  DeleteOutlined,
  SaveOutlined,
  CloseOutlined,
  PlusOutlined,
  FileImageOutlined,
  FileOutlined,
  VideoCameraOutlined,
  SoundOutlined,
  FileTextOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { MEDIA_TYPES } from '../../models/Media';

const { TabPane } = Tabs;
const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;
const { Option } = Select;

/**
 * مودال عرض وتحرير تفاصيل الوسائط
 * @param {Object} media - كائن الوسائط للعرض
 * @param {Boolean} visible - هل المودال مرئي؟
 * @param {Function} onClose - دالة تستدعى عند إغلاق المودال
 * @param {Function} onSave - دالة تستدعى عند حفظ التغييرات
 * @param {Function} onDelete - دالة تستدعى عند حذف العنصر
 * @param {String} mode - وضع المودال (عرض أو تحرير)
 * @param {Function} setMode - دالة لتغيير وضع المودال
 * @param {Array} categories - قائمة الفئات المتاحة
 * @param {Array} tags - قائمة الوسوم المتاحة
 * @param {Function} onAddCategory - دالة لإضافة فئة جديدة
 */
const MediaModal = ({
  media,
  visible,
  onClose,
  onSave,
  onDelete,
  mode = 'view',
  setMode,
  categories = [],
  tags = [],
  onAddCategory
}) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const inputRef = useRef(null);

  // تحديث النموذج عند تغيير العنصر المعروض
  useEffect(() => {
    if (media && visible) {
      form.setFieldsValue({
        name: media.name || '',
        category: media.category || 'uncategorized',
        description: media.description || '',
        alt: media.alt || '',
      });
      setSelectedTags(media.tags || []);
    } else {
      form.resetFields();
      setSelectedTags([]);
    }
  }, [media, visible, form]);

  // التركيز على حقل الإدخال عند ظهوره
  useEffect(() => {
    if (inputVisible) {
      inputRef.current?.focus();
    }
  }, [inputVisible]);

  // تحديد أيقونة بناءً على نوع الوسائط
  const getMediaTypeIcon = () => {
    if (!media) return null;

    switch (media.type) {
      case MEDIA_TYPES.IMAGE:
        return <FileImageOutlined style={{ marginRight: '8px' }} />;
      case MEDIA_TYPES.VIDEO:
        return <VideoCameraOutlined style={{ marginRight: '8px' }} />;
      case MEDIA_TYPES.AUDIO:
        return <SoundOutlined style={{ marginRight: '8px' }} />;
      case MEDIA_TYPES.DOCUMENT:
        return <FileTextOutlined style={{ marginRight: '8px' }} />;
      default:
        return <FileOutlined style={{ marginRight: '8px' }} />;
    }
  };

  // معالجة حفظ التغييرات
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);
      
      const updates = {
        ...values,
        tags: selectedTags,
      };
      
      await onSave(media.id, updates);
      setMode('view');
    } catch (error) {
      console.error('خطأ في حفظ التغييرات:', error);
      message.error('يرجى التأكد من ملء جميع الحقول المطلوبة');
    } finally {
      setLoading(false);
    }
  };

  // معالجة حذف الوسائط
  const handleDelete = () => {
    Modal.confirm({
      title: 'تأكيد الحذف',
      content: `هل أنت متأكد من رغبتك في حذف "${media?.name}"؟`,
      okText: 'نعم، احذف',
      cancelText: 'إلغاء',
      okButtonProps: { danger: true },
      onOk: () => {
        setLoading(true);
        onDelete(media.id);
      }
    });
  };

  // وظائف معالجة الوسوم
  const handleClose = (removedTag) => {
    const newTags = selectedTags.filter(tag => tag !== removedTag);
    setSelectedTags(newTags);
  };

  const showInput = () => {
    setInputVisible(true);
  };

  const handleInputChange = (e) => {
    setInputValue(e.target.value);
  };

  const handleInputConfirm = () => {
    if (inputValue && !selectedTags.includes(inputValue)) {
      setSelectedTags([...selectedTags, inputValue]);
    }
    setInputVisible(false);
    setInputValue('');
  };

  // معالجة إضافة فئة جديدة
  const handleAddCategory = async (e) => {
    e.preventDefault();
    const { value } = e.currentTarget;
    
    if (value.trim() === '') {
      message.error('اسم الفئة لا يمكن أن يكون فارغاً');
      return;
    }
    
    try {
      const success = await onAddCategory(value);
      if (success) {
        message.success(`تم إضافة الفئة "${value}" بنجاح`);
        return value;
      }
    } catch (error) {
      message.error(`فشل إضافة الفئة: ${error.message}`);
    }
    
    return false;
  };

  // عرض معاينة الوسائط
  const renderMediaPreview = () => {
    if (!media) return <Spin />;

    if (media.type === MEDIA_TYPES.IMAGE && (media.dataUrl || media.path)) {
      return (
        <div style={{ textAlign: 'center', marginBottom: '16px' }}>
          <Image
            src={media.dataUrl || media.path}
            alt={media.alt || media.name}
            style={{ maxWidth: '100%', maxHeight: '300px' }}
          />
        </div>
      );
    } else {
      // لأنواع الوسائط الأخرى، نعرض أيقونة كبيرة
      let icon;
      switch (media.type) {
        case MEDIA_TYPES.VIDEO:
          icon = <VideoCameraOutlined style={{ fontSize: '64px' }} />;
          break;
        case MEDIA_TYPES.AUDIO:
          icon = <SoundOutlined style={{ fontSize: '64px' }} />;
          break;
        case MEDIA_TYPES.DOCUMENT:
          icon = <FileTextOutlined style={{ fontSize: '64px' }} />;
          break;
        default:
          icon = <FileOutlined style={{ fontSize: '64px' }} />;
      }

      return (
        <div style={{ 
          textAlign: 'center', 
          padding: '32px', 
          backgroundColor: '#f5f5f5',
          borderRadius: '4px',
          marginBottom: '16px'
        }}>
          {icon}
          <div style={{ marginTop: '16px' }}>
            <Text>{media.filename || media.name}</Text>
          </div>
        </div>
      );
    }
  };

  // عرض معلومات الوسائط (عرض فقط)
  const renderMediaInfo = () => {
    if (!media) return null;

    return (
      <Descriptions bordered column={1} size="small">
        <Descriptions.Item label="الاسم">{media.name}</Descriptions.Item>
        <Descriptions.Item label="نوع الملف">
          {getMediaTypeIcon()} 
          {media.type === MEDIA_TYPES.IMAGE && 'صورة'}
          {media.type === MEDIA_TYPES.VIDEO && 'فيديو'}
          {media.type === MEDIA_TYPES.AUDIO && 'ملف صوتي'}
          {media.type === MEDIA_TYPES.DOCUMENT && 'مستند'}
          {media.type === MEDIA_TYPES.OTHER && 'ملف آخر'}
        </Descriptions.Item>
        <Descriptions.Item label="الحجم">
          {media.getFormattedSize ? media.getFormattedSize() : `${Math.round(media.size / 1024)} كيلوبايت`}
        </Descriptions.Item>
        <Descriptions.Item label="تاريخ الرفع">
          {new Date(media.createdAt).toLocaleDateString('ar-SA')}
        </Descriptions.Item>
        {media.category && (
          <Descriptions.Item label="الفئة">
            <Tag color="blue">{
              categories.find(cat => cat.id === media.category)?.name || media.category
            }</Tag>
          </Descriptions.Item>
        )}
        {media.tags && media.tags.length > 0 && (
          <Descriptions.Item label="الوسوم">
            <Space size={[0, 4]} wrap>
              {media.tags.map(tag => (
                <Tag key={tag}>{tag}</Tag>
              ))}
            </Space>
          </Descriptions.Item>
        )}
        {media.description && (
          <Descriptions.Item label="الوصف">
            <Paragraph>{media.description}</Paragraph>
          </Descriptions.Item>
        )}
        {media.width && media.height && (
          <Descriptions.Item label="الأبعاد">
            {media.width} × {media.height} بكسل
          </Descriptions.Item>
        )}
        {media.mimeType && (
          <Descriptions.Item label="نوع MIME">
            {media.mimeType}
          </Descriptions.Item>
        )}
      </Descriptions>
    );
  };

  // نموذج تحرير الوسائط
  const renderEditForm = () => {
    return (
      <Form
        form={form}
        layout="vertical"
      >
        <Form.Item
          name="name"
          label="اسم الملف"
          rules={[{ required: true, message: 'الرجاء إدخال اسم الملف' }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="category"
          label="الفئة"
          rules={[{ required: true, message: 'الرجاء اختيار فئة' }]}
        >
          <Select 
            placeholder="اختر فئة" 
            dropdownRender={(menu) => (
              <>
                {menu}
                <Divider style={{ margin: '8px 0' }} />
                <Space style={{ padding: '0 8px 4px' }}>
                  <Input
                    placeholder="اسم الفئة الجديدة"
                    onKeyDown={(e) => e.stopPropagation()}
                  />
                  <Button type="text" icon={<PlusOutlined />} onClick={handleAddCategory}>
                    إضافة فئة
                  </Button>
                </Space>
              </>
            )}
          >
            {categories.map(category => (
              <Option key={category.id} value={category.id}>{category.name}</Option>
            ))}
          </Select>
        </Form.Item>

        <Form.Item label="الوسوم">
          <div style={{ marginBottom: '10px' }}>
            <Space size={[0, 8]} wrap>
              {selectedTags.map(tag => (
                <Tag
                  key={tag}
                  closable
                  onClose={() => handleClose(tag)}
                >
                  {tag}
                </Tag>
              ))}
              {inputVisible ? (
                <Input
                  ref={inputRef}
                  type="text"
                  size="small"
                  style={{ width: 78 }}
                  value={inputValue}
                  onChange={handleInputChange}
                  onBlur={handleInputConfirm}
                  onPressEnter={handleInputConfirm}
                  autoFocus
                />
              ) : (
                <Tag onClick={showInput} className="site-tag-plus">
                  <PlusOutlined /> وسم جديد
                </Tag>
              )}
            </Space>
          </div>
        </Form.Item>

        <Form.Item
          name="description"
          label="الوصف"
        >
          <TextArea rows={3} maxLength={500} showCount />
        </Form.Item>

        {media?.type === MEDIA_TYPES.IMAGE && (
          <Form.Item
            name="alt"
            label="النص البديل (للصور)"
          >
            <Input placeholder="وصف مختصر للصورة (للوصول)" />
          </Form.Item>
        )}
      </Form>
    );
  };

  return (
    <Modal
      title={
        <Space>
          {getMediaTypeIcon()}
          {media ? (mode === 'edit' ? 'تحرير الوسائط' : 'تفاصيل الوسائط') : 'جاري التحميل...'}
        </Space>
      }
      open={visible}
      onCancel={onClose}
      width={720}
      footer={
        mode === 'view' ? [
          <Button key="download" icon={<DownloadOutlined />} disabled={!media}>
            تنزيل
          </Button>,
          <Button key="edit" type="primary" icon={<EditOutlined />} onClick={() => setMode('edit')} disabled={!media}>
            تحرير
          </Button>,
          <Button key="delete" danger icon={<DeleteOutlined />} onClick={handleDelete} disabled={!media}>
            حذف
          </Button>,
          <Button key="close" onClick={onClose}>
            إغلاق
          </Button>
        ] : [
          <Button key="cancel" icon={<CloseOutlined />} onClick={() => setMode('view')}>
            إلغاء
          </Button>,
          <Button
            key="save"
            type="primary"
            icon={<SaveOutlined />}
            onClick={handleSave}
            loading={loading}
            disabled={!media}
          >
            حفظ التغييرات
          </Button>
        ]
      }
    >
      {media ? (
        <>
          {renderMediaPreview()}
          
          <Tabs defaultActiveKey="info">
            <TabPane tab="المعلومات الأساسية" key="info">
              {mode === 'view' ? renderMediaInfo() : renderEditForm()}
            </TabPane>
            <TabPane tab="الاستخدام" key="usage">
              <div style={{ marginBottom: '16px' }}>
                <Title level={5}>رابط الوسائط</Title>
                <Input.TextArea
                  value={media?.path || ''}
                  readOnly
                  rows={2}
                  style={{ marginBottom: '8px' }}
                />
                {media?.type === MEDIA_TYPES.IMAGE && (
                  <>
                    <Title level={5}>كود HTML للصورة</Title>
                    <Input.TextArea
                      value={`<img src="${media.path}" alt="${media.alt || media.name}" />`}
                      readOnly
                      rows={2}
                    />
                  </>
                )}
              </div>
            </TabPane>
          </Tabs>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Spin size="large" />
          <div style={{ marginTop: '16px' }}>جاري تحميل بيانات الوسائط...</div>
        </div>
      )}
    </Modal>
  );
};

export default MediaModal;