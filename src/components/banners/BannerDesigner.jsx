import React, { useState, useEffect, useRef } from 'react';
import { 
  Form, 
  Input, 
  InputNumber, 
  Select, 
  Button, 
  Row, 
  Col, 
  Card, 
  Switch, 
  Divider, 
  Typography, 
  ColorPicker, 
  Tabs, 
  Slider, 
  Space, 
  message,
  Tooltip
} from 'antd';
import { 
  PictureOutlined, 
  LinkOutlined, 
  EditOutlined, 
  SaveOutlined, 
  EyeOutlined,
  SettingOutlined,
  FontSizeOutlined,
  BgColorsOutlined,
  BorderOutlined,
  FormatPainterOutlined
} from '@ant-design/icons';
import { BANNER_TYPES, BANNER_SIZES, BANNER_STATUS } from '../../models/Banner';
import bannerService from '../../services/bannerService';
import MediaLibrary from '../media/MediaLibrary';
import BannerPreview from './BannerPreview';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

/**
 * مصمم البانرات - واجهة لتصميم وتخصيص البانرات
 */
const BannerDesigner = ({ initialData = null, onSave, onCancel }) => {
  const [form] = Form.useForm();
  const [bannerData, setBannerData] = useState(initialData || {
    title: '',
    type: BANNER_TYPES.HERO,
    mediaId: null,
    link: '',
    status: BANNER_STATUS.DRAFT,
    description: '',
    tags: [],
    category: 'uncategorized',
    design: {
      width: BANNER_SIZES[BANNER_TYPES.HERO].width,
      height: BANNER_SIZES[BANNER_TYPES.HERO].height,
      backgroundColor: '#ffffff',
      textColor: '#000000',
      alignment: 'center',
      animation: 'none',
      responsive: true,
      borderRadius: 0,
      padding: 16,
      overlay: false,
      overlayColor: 'rgba(0,0,0,0.5)',
      buttonText: '',
      buttonColor: '#3366cc',
      buttonTextColor: '#ffffff',
      buttonBorderRadius: 4,
      headline: '',
      headlineSize: 24,
      subtext: '',
      subtextSize: 16
    }
  });
  
  const [mediaModalVisible, setMediaModalVisible] = useState(false);
  const [selectedMedia, setSelectedMedia] = useState(null);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [bannerTypes, setBannerTypes] = useState([]);
  
  // تهيئة البيانات
  useEffect(() => {
    // جلب بيانات الفئات والوسوم من الخدمة
    const fetchCategories = async () => {
      try {
        const categoriesList = bannerService.getCategories();
        setCategories(categoriesList);
      } catch (error) {
        console.error('خطأ في جلب الفئات:', error);
      }
    };

    const fetchTags = async () => {
      try {
        const tagsList = bannerService.getTags();
        setTags(tagsList);
      } catch (error) {
        console.error('خطأ في جلب الوسوم:', error);
      }
    };

    const fetchBannerTypes = async () => {
      try {
        const types = bannerService.getBannerTypes();
        setBannerTypes(types);
      } catch (error) {
        console.error('خطأ في جلب أنواع البانرات:', error);
      }
    };

    fetchCategories();
    fetchTags();
    fetchBannerTypes();

    // تعيين قيم النموذج الأولية إذا كانت متوفرة
    if (initialData) {
      form.setFieldsValue({
        ...initialData,
        design: {
          ...initialData.design
        }
      });
      setBannerData(initialData);
    }
  }, [form, initialData]);

  // تحديث الأبعاد الافتراضية عند تغيير نوع البانر
  const handleTypeChange = (type) => {
    const standardSize = bannerService.getStandardSizeForType(type) || BANNER_SIZES[type] || { width: 300, height: 250 };
    
    form.setFieldsValue({
      design: {
        ...form.getFieldValue('design'),
        width: standardSize.width,
        height: standardSize.height
      }
    });

    const updatedBannerData = {
      ...bannerData,
      type,
      design: {
        ...bannerData.design,
        width: standardSize.width,
        height: standardSize.height
      }
    };
    
    setBannerData(updatedBannerData);
  };

  // معالجة تغييرات النموذج
  const handleFormValuesChange = (changedValues, allValues) => {
    const updatedBannerData = { ...bannerData };

    // التحقق من وجود تغييرات في الخصائص الرئيسية
    if (changedValues.title !== undefined) updatedBannerData.title = changedValues.title;
    if (changedValues.link !== undefined) updatedBannerData.link = changedValues.link;
    if (changedValues.description !== undefined) updatedBannerData.description = changedValues.description;
    if (changedValues.tags !== undefined) updatedBannerData.tags = changedValues.tags;
    if (changedValues.category !== undefined) updatedBannerData.category = changedValues.category;

    // التحقق من وجود تغييرات في التصميم
    if (changedValues.design) {
      updatedBannerData.design = {
        ...bannerData.design,
        ...changedValues.design
      };
    }

    setBannerData(updatedBannerData);
  };

  // معالجة تقديم النموذج
  const handleSubmit = (values) => {
    // التأكد من وجود وسائط محددة
    if (!selectedMedia && !bannerData.mediaId) {
      message.error('يرجى اختيار صورة للبانر');
      return;
    }

    const finalBannerData = {
      ...bannerData,
      ...values,
      mediaId: selectedMedia?.id || bannerData.mediaId,
    };

    try {
      onSave(finalBannerData);
      message.success('تم حفظ البانر بنجاح');
    } catch (error) {
      console.error('خطأ في حفظ البانر:', error);
      message.error(`حدث خطأ أثناء حفظ البانر: ${error.message}`);
    }
  };

  // معالجة اختيار وسائط من معرض الوسائط
  const handleMediaSelect = (media) => {
    setSelectedMedia(media);
    setMediaModalVisible(false);
    
    setBannerData({
      ...bannerData,
      mediaId: media.id
    });
  };

  // إنشاء فئة جديدة
  const handleAddCategory = async (name) => {
    try {
      await bannerService.createCategory(name);
      // تحديث قائمة الفئات
      setCategories(bannerService.getCategories());
      return name;
    } catch (error) {
      message.error(`خطأ في إضافة الفئة: ${error.message}`);
      return false;
    }
  };

  return (
    <div className="banner-designer-container">
      <Card
        title={
          <Space>
            <EditOutlined />
            <span>{initialData ? 'تعديل البانر' : 'تصميم بانر جديد'}</span>
          </Space>
        }
        extra={
          <Space>
            <Button icon={<EyeOutlined />} onClick={() => setPreviewVisible(true)}>
              معاينة
            </Button>
            <Button type="primary" icon={<SaveOutlined />} onClick={() => form.submit()}>
              حفظ
            </Button>
          </Space>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          onValuesChange={handleFormValuesChange}
          initialValues={bannerData}
        >
          <Tabs defaultActiveKey="basic">
            <TabPane tab="المعلومات الأساسية" key="basic">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="title"
                    label="عنوان البانر"
                    rules={[{ required: true, message: 'الرجاء إدخال عنوان للبانر' }]}
                  >
                    <Input placeholder="أدخل عنوانًا وصفيًا للبانر" />
                  </Form.Item>
                </Col>
                
                <Col span={12}>
                  <Form.Item
                    name="type"
                    label="نوع البانر"
                    rules={[{ required: true, message: 'الرجاء اختيار نوع البانر' }]}
                  >
                    <Select 
                      placeholder="اختر نوع البانر"
                      onChange={handleTypeChange}
                      options={bannerTypes.map(type => ({
                        value: type.id,
                        label: type.name,
                      }))}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    label="صورة البانر"
                    required
                    tooltip="اختر صورة من مكتبة الوسائط"
                  >
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      <Button
                        icon={<PictureOutlined />}
                        onClick={() => setMediaModalVisible(true)}
                        style={{ marginLeft: 8 }}
                      >
                        اختيار من مكتبة الوسائط
                      </Button>
                      
                      {(selectedMedia || bannerData.mediaId) && (
                        <Text type="success" style={{ marginRight: 16 }}>
                          تم اختيار الصورة
                        </Text>
                      )}
                    </div>
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={24}>
                  <Form.Item
                    name="link"
                    label="رابط البانر"
                    rules={[{ required: true, message: 'الرجاء إدخال الرابط الذي سيتم التوجيه إليه عند النقر على البانر' }]}
                  >
                    <Input 
                      placeholder="أدخل عنوان URL (مثل: https://example.com)" 
                      prefix={<LinkOutlined />} 
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="status"
                    label="الحالة"
                    rules={[{ required: true, message: 'الرجاء اختيار حالة البانر' }]}
                  >
                    <Select
                      placeholder="اختر حالة البانر"
                      options={[
                        { value: 'draft', label: 'مسودة' },
                        { value: 'active', label: 'نشط' },
                        { value: 'inactive', label: 'غير نشط' },
                        { value: 'scheduled', label: 'مجدول' },
                      ]}
                    />
                  </Form.Item>
                </Col>
                
                <Col span={12}>
                  <Form.Item
                    name="category"
                    label="الفئة"
                  >
                    <Select
                      placeholder="اختر فئة البانر"
                      options={categories.map(category => ({
                        value: category.id,
                        label: category.name,
                      }))}
                      showSearch
                      allowClear
                      dropdownRender={(menu) => (
                        <>
                          {menu}
                          <Divider style={{ margin: '8px 0' }} />
                          <div style={{ display: 'flex', justifyContent: 'space-between', padding: '0 8px 4px' }}>
                            <Input
                              placeholder="اسم الفئة الجديدة"
                              id="new-category"
                            />
                            <Button
                              type="text"
                              onClick={() => {
                                const input = document.getElementById('new-category');
                                handleAddCategory(input.value);
                                input.value = '';
                              }}
                            >
                              إضافة
                            </Button>
                          </div>
                        </>
                      )}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="description"
                label="وصف البانر"
              >
                <Input.TextArea
                  placeholder="أدخل وصفًا للبانر (اختياري)"
                  autoSize={{ minRows: 3, maxRows: 6 }}
                />
              </Form.Item>

              <Form.Item
                name="tags"
                label="الوسوم"
              >
                <Select
                  mode="tags"
                  placeholder="أضف وسوم للبانر"
                  options={tags.map(tag => ({ value: tag, label: tag }))}
                />
              </Form.Item>
            </TabPane>

            <TabPane tab="تصميم البانر" key="design">
              <Row gutter={24}>
                <Col span={12}>
                  <Card title="الأبعاد والخلفية" size="small">
                    <Row gutter={16}>
                      <Col span={12}>
                        <Form.Item
                          name={['design', 'width']}
                          label="العرض (بكسل)"
                        >
                          <InputNumber min={50} max={2000} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          name={['design', 'height']}
                          label="الارتفاع (بكسل)"
                        >
                          <InputNumber min={50} max={2000} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                    </Row>

                    <Form.Item
                      name={['design', 'responsive']}
                      label="متجاوب مع أحجام الشاشة"
                      valuePropName="checked"
                    >
                      <Switch />
                    </Form.Item>

                    <Form.Item
                      name={['design', 'backgroundColor']}
                      label="لون الخلفية"
                    >
                      <ColorPicker format="hex" />
                    </Form.Item>

                    <Form.Item
                      name={['design', 'borderRadius']}
                      label="تدوير الزوايا"
                    >
                      <Slider min={0} max={50} />
                    </Form.Item>

                    <Form.Item
                      name={['design', 'padding']}
                      label="المسافة الداخلية (بكسل)"
                    >
                      <Slider min={0} max={40} />
                    </Form.Item>
                  </Card>
                </Col>

                <Col span={12}>
                  <Card title="النصوص والأزرار" size="small">
                    <Form.Item
                      name={['design', 'headline']}
                      label="العنوان الرئيسي"
                    >
                      <Input placeholder="أدخل العنوان الرئيسي للبانر" />
                    </Form.Item>

                    <Form.Item
                      name={['design', 'headlineSize']}
                      label="حجم العنوان الرئيسي"
                    >
                      <Slider min={14} max={60} />
                    </Form.Item>

                    <Form.Item
                      name={['design', 'subtext']}
                      label="النص الفرعي"
                    >
                      <Input.TextArea placeholder="أدخل نصًا فرعيًا للبانر" rows={2} />
                    </Form.Item>

                    <Form.Item
                      name={['design', 'subtextSize']}
                      label="حجم النص الفرعي"
                    >
                      <Slider min={10} max={32} />
                    </Form.Item>

                    <Form.Item
                      name={['design', 'textColor']}
                      label="لون النص"
                    >
                      <ColorPicker format="hex" />
                    </Form.Item>
                  </Card>
                </Col>
              </Row>

              <div style={{ marginTop: 16 }}>
                <Card title="خيارات الزر" size="small">
                  <Row gutter={16}>
                    <Col span={24}>
                      <Form.Item
                        name={['design', 'buttonText']}
                        label="نص الزر"
                      >
                        <Input placeholder="مثال: اقرأ المزيد" />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item
                        name={['design', 'buttonColor']}
                        label="لون الزر"
                      >
                        <ColorPicker format="hex" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        name={['design', 'buttonTextColor']}
                        label="لون نص الزر"
                      >
                        <ColorPicker format="hex" />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item
                        name={['design', 'buttonBorderRadius']}
                        label="تدوير زوايا الزر"
                      >
                        <Slider min={0} max={20} />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              </div>

              <div style={{ marginTop: 16 }}>
                <Card title="طبقة التراكب" size="small">
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        name={['design', 'overlay']}
                        label="تفعيل طبقة التراكب"
                        valuePropName="checked"
                        tooltip="إضافة طبقة شفافة فوق الصورة لتحسين وضوح النص"
                      >
                        <Switch />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        name={['design', 'overlayColor']}
                        label="لون طبقة التراكب"
                      >
                        <ColorPicker format="rgb" />
                      </Form.Item>
                    </Col>
                  </Row>
                </Card>
              </div>
            </TabPane>

            <TabPane tab="معاينة مباشرة" key="preview">
              <div className="banner-live-preview">
                <BannerPreview 
                  banner={bannerData}
                  mediaId={selectedMedia?.id || bannerData.mediaId}
                />
              </div>
            </TabPane>
          </Tabs>
        </Form>
      </Card>

      {/* مكتبة الوسائط */}
      <MediaLibrary
        visible={mediaModalVisible}
        onClose={() => setMediaModalVisible(false)}
        onSelect={handleMediaSelect}
        title="اختيار صورة البانر"
        multiple={false}
        initialFilters={{ type: 'image' }}
      />

      {/* معاينة البانر */}
      {previewVisible && (
        <BannerPreview 
          banner={bannerData}
          mediaId={selectedMedia?.id || bannerData.mediaId}
          visible={previewVisible}
          onClose={() => setPreviewVisible(false)}
          preview={true}
        />
      )}
    </div>
  );
};

export default BannerDesigner;