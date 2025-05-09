// src/pages/dashboard/modules/MediaManagement.jsx
import React, { useState, useEffect } from 'react';
import { 
  Card, 
  Typography, 
  Breadcrumb, 
  Alert, 
  Divider, 
  Tabs, 
  Button, 
  Space, 
  Popover, 
  Statistic, 
  Row, 
  Col 
} from 'antd';
import { 
  PictureOutlined, 
  FileOutlined, 
  VideoCameraOutlined, 
  SoundOutlined, 
  HomeOutlined,
  SettingOutlined,
  InfoCircleOutlined 
} from '@ant-design/icons';
import { MEDIA_TYPES } from '../../../models/Media';
import mediaService from '../../../services/mediaService';
import MediaLibrary from '../../../components/media/MediaLibrary';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;

/**
 * إدارة الوسائط - صفحة لإدارة مكتبة الوسائط المتعددة
 * توفر واجهة لتحميل وتنظيم وإدارة الصور والملفات في النظام
 */
const MediaManagement = () => {
  // حالة إحصائيات الوسائط
  const [stats, setStats] = useState({
    totalCount: 0,
    imageCount: 0,
    documentCount: 0,
    videoCount: 0,
    audioCount: 0,
    otherCount: 0,
    totalSize: 0,
    categories: 0,
    tags: 0
  });

  // حالة الفئات
  const [categories, setCategories] = useState([]);
  
  // حالة الوسوم
  const [tags, setTags] = useState([]);
  
  // حالة العرض
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);

  // تحميل البيانات عند تهيئة الصفحة
  useEffect(() => {
    fetchMediaStats();
    fetchCategories();
    fetchTags();
  }, []);

  // جلب إحصائيات الوسائط
  const fetchMediaStats = () => {
    setLoading(true);
    try {
      const allMedia = mediaService.getAll();
      
      const imageCount = allMedia.filter(item => item.type === MEDIA_TYPES.IMAGE).length;
      const documentCount = allMedia.filter(item => item.type === MEDIA_TYPES.DOCUMENT).length;
      const videoCount = allMedia.filter(item => item.type === MEDIA_TYPES.VIDEO).length;
      const audioCount = allMedia.filter(item => item.type === MEDIA_TYPES.AUDIO).length;
      const otherCount = allMedia.filter(item => item.type === MEDIA_TYPES.OTHER).length;
      
      let totalSize = 0;
      allMedia.forEach(item => {
        totalSize += item.size || 0;
      });
      
      setStats({
        totalCount: allMedia.length,
        imageCount,
        documentCount,
        videoCount,
        audioCount,
        otherCount,
        totalSize,
        categories: categories.length,
        tags: tags.length
      });
    } catch (error) {
      console.error('خطأ في جلب إحصائيات الوسائط:', error);
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

  // تحديد فلتر حسب التبويب النشط
  const getFilterByActiveTab = () => {
    switch (activeTab) {
      case 'images':
        return { type: MEDIA_TYPES.IMAGE };
      case 'documents':
        return { type: MEDIA_TYPES.DOCUMENT };
      case 'videos':
        return { type: MEDIA_TYPES.VIDEO };
      case 'audio':
        return { type: MEDIA_TYPES.AUDIO };
      default:
        return {};
    }
  };

  // معالجة إضافة فئة جديدة
  const handleAddCategory = async (name) => {
    try {
      const newCategory = await mediaService.createCategory(name);
      fetchCategories();
      return newCategory.name;
    } catch (error) {
      console.error('خطأ في إضافة الفئة:', error);
      return false;
    }
  };

  // تنسيق حجم الملف ليصبح قابل للقراءة
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 بايت';
    
    const k = 1024;
    const sizes = ['بايت', 'كيلوبايت', 'ميجابايت', 'جيجابايت'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // محتوى توضيحي حول مكتبة الوسائط
  const helpContent = (
    <div style={{ maxWidth: '300px' }}>
      <Title level={5}>استخدام مكتبة الوسائط</Title>
      <Paragraph>
        يمكنك تحميل وإدارة جميع أنواع الوسائط المستخدمة في الموقع من خلال هذه الصفحة.
      </Paragraph>
      <ul>
        <li>
          <Text strong>رفع الملفات:</Text> يمكنك رفع الملفات بالسحب والإفلات أو بالنقر على منطقة الرفع.
        </li>
        <li>
          <Text strong>التصنيف:</Text> قم بتنظيم الملفات في فئات وإضافة وسوم لتسهيل البحث.
        </li>
        <li>
          <Text strong>البحث:</Text> استخدم شريط البحث وخيارات التصفية للعثور بسرعة على الملفات المطلوبة.
        </li>
      </ul>
      <Paragraph>
        للحصول على أفضل النتائج، ننصح بإعطاء أسماء واضحة للملفات وتصنيفها بشكل صحيح.
      </Paragraph>
    </div>
  );

  return (
    <div className="media-management-page" style={{ marginBottom: '24px' }}>
      <div className="page-header" style={{ marginBottom: '16px' }}>
        <Breadcrumb>
          <Breadcrumb.Item>
            <HomeOutlined />
          </Breadcrumb.Item>
          <Breadcrumb.Item>لوحة التحكم</Breadcrumb.Item>
          <Breadcrumb.Item>إدارة الوسائط</Breadcrumb.Item>
        </Breadcrumb>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '16px 0' }}>
          <Title level={2} style={{ margin: 0 }}>
            <PictureOutlined /> مكتبة الوسائط
          </Title>
          
          <Space>
            <Popover 
              content={helpContent} 
              title="مساعدة" 
              trigger="click"
              placement="leftTop"
            >
              <Button type="text" icon={<InfoCircleOutlined />}>
                مساعدة
              </Button>
            </Popover>
            
            <Popover 
              content={
                <div style={{ maxWidth: '300px' }}>
                  <Title level={5}>إعدادات المكتبة</Title>
                  <Paragraph>قريبًا</Paragraph>
                </div>
              } 
              title="إعدادات" 
              trigger="click"
              placement="leftTop"
            >
              <Button type="text" icon={<SettingOutlined />}>
                الإعدادات
              </Button>
            </Popover>
          </Space>
        </div>
        
        <Alert 
          message="تنظيم الوسائط يسهل إدارة محتوى الموقع"
          description="قم بإضافة وسوم وفئات لتسهيل البحث والوصول إلى الملفات بسرعة. يمكنك رفع ملفات متعددة في نفس الوقت باستخدام خاصية السحب والإفلات."
          type="info" 
          showIcon 
          style={{ marginBottom: '16px' }} 
        />
      </div>
      
      <Row gutter={[16, 16]} style={{ marginBottom: '16px' }}>
        <Col xs={24} sm={8} md={8} lg={4} xl={4}>
          <Card>
            <Statistic title="إجمالي الملفات" value={stats.totalCount} valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4} lg={4} xl={4}>
          <Card>
            <Statistic 
              title="صور" 
              value={stats.imageCount} 
              prefix={<PictureOutlined />} 
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} md={4} lg={4} xl={4}>
          <Card>
            <Statistic 
              title="مستندات" 
              value={stats.documentCount} 
              prefix={<FileOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={8} sm={8} md={4} lg={4} xl={4}>
          <Card>
            <Statistic 
              title="فيديو" 
              value={stats.videoCount} 
              prefix={<VideoCameraOutlined />}
              valueStyle={{ color: '#eb2f96' }}
            />
          </Card>
        </Col>
        <Col xs={8} sm={8} md={4} lg={4} xl={4}>
          <Card>
            <Statistic 
              title="صوت" 
              value={stats.audioCount} 
              prefix={<SoundOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={8} sm={8} md={8} lg={4} xl={4}>
          <Card>
            <Statistic 
              title="الحجم الإجمالي" 
              value={formatFileSize(stats.totalSize)}
              valueStyle={{ fontSize: '16px' }}
            />
          </Card>
        </Col>
      </Row>
      
      <Card bordered={false} className="media-management-content">
        <Tabs 
          activeKey={activeTab} 
          onChange={setActiveTab}
          type="card"
        >
          <TabPane tab="جميع الوسائط" key="all">
            <MediaLibrary 
              title={null}
              multiple={true} 
              showUploadTab={true}
              onSelect={(item) => console.log('Selected item:', item)}
            />
          </TabPane>
          
          <TabPane tab={<><PictureOutlined /> صور</>} key="images">
            <MediaLibrary 
              title={null}
              multiple={true} 
              showUploadTab={true}
              onSelect={(item) => console.log('Selected item:', item)}
              initialFilters={{ type: MEDIA_TYPES.IMAGE }}
            />
          </TabPane>
          
          <TabPane tab={<><FileOutlined /> مستندات</>} key="documents">
            <MediaLibrary 
              title={null}
              multiple={true} 
              showUploadTab={true}
              onSelect={(item) => console.log('Selected item:', item)}
              initialFilters={{ type: MEDIA_TYPES.DOCUMENT }}
            />
          </TabPane>
          
          <TabPane tab={<><VideoCameraOutlined /> فيديو</>} key="videos">
            <MediaLibrary 
              title={null}
              multiple={true} 
              showUploadTab={true}
              onSelect={(item) => console.log('Selected item:', item)}
              initialFilters={{ type: MEDIA_TYPES.VIDEO }}
            />
          </TabPane>
          
          <TabPane tab={<><SoundOutlined /> صوت</>} key="audio">
            <MediaLibrary 
              title={null}
              multiple={true} 
              showUploadTab={true}
              onSelect={(item) => console.log('Selected item:', item)}
              initialFilters={{ type: MEDIA_TYPES.AUDIO }}
            />
          </TabPane>
        </Tabs>
      </Card>
      
      <Divider />
      
      <Card title="إدارة فئات الوسائط" size="small" style={{ marginBottom: '16px' }}>
        <Paragraph>
          تنظيم الفئات يساعد في تصنيف الملفات وتسهيل الوصول إليها. 
          حاليًا يوجد <Text strong>{categories.length}</Text> فئة و <Text strong>{tags.length}</Text> وسم في النظام.
        </Paragraph>
        <div style={{ marginTop: '16px' }}>
          <Button type="primary" onClick={() => setActiveTab('all')}>
            عرض مدير الفئات والوسوم
          </Button>
        </div>
      </Card>
      
      <Card title="نصائح لإدارة الوسائط" size="small">
        <ul>
          <li>قم بتسمية الملفات بأسماء واضحة تسهل البحث عنها لاحقًا</li>
          <li>استخدم الفئات لتجميع الملفات ذات الصلة معًا</li>
          <li>أضف وسوم متعددة لتسهيل الوصول إلى الملفات من خلال مصطلحات مختلفة</li>
          <li>حافظ على ترتيب وتنظيم الملفات بانتظام لتجنب تراكم الملفات غير المستخدمة</li>
          <li>استخدم خاصية الوصف والنص البديل للصور لتحسين إمكانية الوصول وتحسين محركات البحث</li>
        </ul>
      </Card>
    </div>
  );
};

export default MediaManagement;