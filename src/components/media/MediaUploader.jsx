// src/components/media/MediaUploader.jsx
import React, { useState, useRef } from 'react';
import { 
  Upload, Button, Card, Form, Input, Select, Space, Tag, 
  Typography, message, Divider, Alert 
} from 'antd';
import { 
  InboxOutlined, PlusOutlined, DeleteOutlined, PictureOutlined,
  FileOutlined, VideoCameraOutlined, SoundOutlined
} from '@ant-design/icons';
import { MEDIA_TYPES, FILE_EXTENSIONS, MAX_FILE_SIZE } from '../../models/Media';

const { Dragger } = Upload;
const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

/**
 * مكون لرفع ملفات الوسائط مع دعم السحب والإفلات
 */
const MediaUploader = ({ onUpload, categories = [], tags = [], onAddCategory }) => {
  const [form] = Form.useForm();
  const [fileList, setFileList] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [inputVisible, setInputVisible] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const inputRef = useRef(null);

  // وظيفة التحقق من الملفات المدعومة
  const isFileTypeSupported = (file) => {
    const extension = file.name.split('.').pop().toLowerCase();
    for (const mediaType of Object.keys(FILE_EXTENSIONS)) {
      if (FILE_EXTENSIONS[mediaType].includes(extension)) {
        return true;
      }
    }
    message.error(`نوع الملف ${extension} غير مدعوم`);
    return false;
  };

  // وظيفة التحقق من حجم الملف
  const isFileSizeValid = (file) => {
    if (file.size > MAX_FILE_SIZE) {
      message.error(`حجم الملف ${file.name} يتجاوز الحد الأقصى المسموح به (${MAX_FILE_SIZE / (1024 * 1024)} ميجابايت)`);
      return false;
    }
    return true;
  };

  // وظيفة معالجة تغيير الملفات
  const handleChange = (info) => {
    let newFileList = [...info.fileList];
    
    // قصر القائمة على آخر 10 ملفات مرفوعة
    newFileList = newFileList.slice(-10);
    
    setFileList(newFileList);
  };

  // وظيفة معالجة الرفع
  const handleUpload = async () => {
    try {
      await form.validateFields();
      
      if (fileList.length === 0) {
        message.error('الرجاء اختيار ملف واحد على الأقل');
        return;
      }
      
      setUploading(true);
      
      const files = fileList.map(file => file.originFileObj);
      const values = form.getFieldsValue();
      
      const metadata = {
        category: values.category,
        tags: selectedTags,
        description: values.description,
        alt: values.alt || '',
      };
      
      await onUpload(files, metadata);
      
      // إعادة ضبط النموذج
      setFileList([]);
      form.resetFields();
      setSelectedTags([]);
      
    } catch (error) {
      if (error.errorFields) {
        message.error('يرجى ملء جميع الحقول المطلوبة');
      } else {
        message.error(`خطأ في رفع الملفات: ${error.message}`);
      }
    } finally {
      setUploading(false);
    }
  };

  // وظائف معالجة الوسوم
  const handleClose = (removedTag) => {
    const newTags = selectedTags.filter(tag => tag !== removedTag);
    setSelectedTags(newTags);
  };

  const showInput = () => {
    setInputVisible(true);
    setTimeout(() => {
      inputRef.current?.focus();
    });
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

  // وظيفة إضافة فئة جديدة
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

  // معالج قبل الرفع للتحقق من نوع الملف وحجمه
  const beforeUpload = (file) => {
    const isTypeSupported = isFileTypeSupported(file);
    const isSizeValid = isFileSizeValid(file);
    return (isTypeSupported && isSizeValid) || Upload.LIST_IGNORE;
  };

  // تنسيق عرض الملف في القائمة
  const getIconForFile = (file) => {
    if (!file) return <FileOutlined />;
    
    if (file.type.startsWith('image/')) return <PictureOutlined />;
    if (file.type.startsWith('video/')) return <VideoCameraOutlined />;
    if (file.type.startsWith('audio/')) return <SoundOutlined />;
    
    return <FileOutlined />;
  };

  return (
    <div className="media-uploader">
      <Card bordered={false}>
        <Form
          form={form}
          layout="vertical"
          requiredMark={false}
        >
          <Dragger
            name="files"
            multiple={true}
            fileList={fileList}
            beforeUpload={beforeUpload}
            onChange={handleChange}
            customRequest={({ onSuccess }) => {
              setTimeout(() => {
                onSuccess("ok");
              }, 0);
            }}
            showUploadList={{
              showPreviewIcon: true,
              showDownloadIcon: false,
              showRemoveIcon: true,
              removeIcon: <DeleteOutlined />,
            }}
          >
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">انقر أو اسحب الملفات إلى هذه المنطقة للرفع</p>
            <p className="ant-upload-hint">
              يمكنك رفع ملفات متعددة في نفس الوقت. الحد الأقصى لحجم الملف: {MAX_FILE_SIZE / (1024 * 1024)} ميجابايت
            </p>
            <p className="ant-upload-hint">
              أنواع الملفات المدعومة: صور (JPG, PNG, GIF)، مستندات (PDF, DOC)، فيديو (MP4, WEBM)، صوت (MP3, WAV)
            </p>
          </Dragger>

          {fileList.length > 0 && (
            <>
              <Alert
                message={`تم اختيار ${fileList.length} ملف`}
                description="يرجى تعبئة المعلومات التالية لجميع الملفات المختارة"
                type="info"
                showIcon
                style={{ marginTop: '16px', marginBottom: '16px' }}
              />

              <Form.Item
                name="category"
                label="فئة الوسائط"
                rules={[{ required: true, message: 'الرجاء اختيار فئة' }]}
              >
                <Select 
                  placeholder="اختر فئة للملفات" 
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

              <Form.Item
                label="وسوم"
                name="tags"
              >
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
                <TextArea rows={3} placeholder="وصف عام للملفات" maxLength={500} showCount />
              </Form.Item>

              <Form.Item
                name="alt"
                label="النص البديل (للصور)"
              >
                <Input placeholder="وصف مختصر للصورة (للوصول)" />
              </Form.Item>
            </>
          )}

          <Form.Item>
            <Button
              type="primary"
              onClick={handleUpload}
              loading={uploading}
              disabled={fileList.length === 0}
              style={{ width: '100%' }}
            >
              {uploading ? 'جاري الرفع...' : 'رفع الملفات'}
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default MediaUploader;