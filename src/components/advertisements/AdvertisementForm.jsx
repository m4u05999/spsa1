import React, { useState, useEffect } from 'react';
import { 
  Form,
  Input,
  Select,
  DatePicker,
  Switch,
  Button,
  Card,
  Row,
  Col,
  Typography,
  Space,
  Divider,
  InputNumber,
  Tag,
  Tooltip,
  Alert,
  Modal,
  Checkbox,
  Radio,
  message,
  Tabs,
  Statistic
} from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  GlobalOutlined,
  EnvironmentOutlined,
  UserOutlined,
  AimOutlined,
  MobileOutlined,
  FlagOutlined,
  TranslationOutlined,
  BarChartOutlined,
  TagOutlined,
  PictureOutlined,
  PlusOutlined,
  SaveOutlined,
  CloseOutlined,
  EyeOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { AD_PLACEMENT_LOCATIONS, AD_STATUS } from '../../models/Advertisement';
import bannerService from '../../services/bannerService';
import advertisementService from '../../services/advertisementService';
import BannerPreview from '../banners/BannerPreview';

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Option } = Select;

/**
 * نموذج الإعلانات - يتيح إنشاء وتعديل إعلانات وجدولتها
 */
const AdvertisementForm = ({ initialData = null, onSave, onCancel }) => {
  const [form] = Form.useForm();
  const [banners, setBanners] = useState([]);
  const [selectedBanner, setSelectedBanner] = useState(null);
  const [placements, setPlacements] = useState([]);
  const [adStatuses, setAdStatuses] = useState([]);
  const [bannerPreviewVisible, setBannerPreviewVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitDisabled, setSubmitDisabled] = useState(false);
  const [customPages, setCustomPages] = useState([
    { id: 'home', name: 'الصفحة الرئيسية' },
    { id: 'about', name: 'من نحن' },
    { id: 'events', name: 'الفعاليات' },
    { id: 'news', name: 'الأخبار' },
    { id: 'contact', name: 'اتصل بنا' },
    { id: 'members', name: 'الأعضاء' }
  ]);

  // تهيئة البيانات
  useEffect(() => {
    const fetchBanners = () => {
      try {
        const bannersList = bannerService.getAll({ status: 'active' });
        setBanners(bannersList);
      } catch (error) {
        console.error('خطأ في جلب البانرات:', error);
        message.error('حدث خطأ أثناء جلب قائمة البانرات');
      }
    };

    const fetchAdPlacements = () => {
      try {
        const placementsList = advertisementService.getAdPlacements();
        setPlacements(placementsList);
      } catch (error) {
        console.error('خطأ في جلب مواقع الإعلانات:', error);
      }
    };

    const fetchAdStatuses = () => {
      try {
        const statusesList = advertisementService.getAdStatuses();
        setAdStatuses(statusesList);
      } catch (error) {
        console.error('خطأ في جلب حالات الإعلانات:', error);
      }
    };

    fetchBanners();
    fetchAdPlacements();
    fetchAdStatuses();

    // تعيين البيانات الأولية إذا كانت متوفرة
    if (initialData) {
      let formValues = {
        ...initialData,
        schedule: [
          dayjs(initialData.startDate),
          initialData.endDate ? dayjs(initialData.endDate) : null
        ].filter(Boolean)
      };

      // جلب البانر المختار
      try {
        if (initialData.bannerId) {
          const banner = bannerService.getById(initialData.bannerId);
          setSelectedBanner(banner);
        }
      } catch (error) {
        console.error('خطأ في جلب البانر المحدد:', error);
      }

      form.setFieldsValue(formValues);
    } else {
      // قيم افتراضية للإعلان الجديد
      form.setFieldsValue({
        status: AD_STATUS.DRAFT,
        priority: 0,
        isSponsored: false
      });
    }
  }, [form, initialData]);

  // معالجة تغيير البانر
  const handleBannerChange = (bannerId) => {
    try {
      if (bannerId) {
        const banner = bannerService.getById(bannerId);
        setSelectedBanner(banner);
      } else {
        setSelectedBanner(null);
      }
    } catch (error) {
      console.error('خطأ في جلب البانر المحدد:', error);
      setSelectedBanner(null);
    }
  };

  // التحقق من صلاحية النموذج بشكل مستمر
  useEffect(() => {
    form
      .validateFields(['name', 'bannerId', 'location', 'schedule'])
      .then(() => {
        setSubmitDisabled(false);
      })
      .catch(() => {
        setSubmitDisabled(true);
      });
  }, [form]);

  // معالجة تقديم النموذج
  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      
      // استخراج تواريخ البداية والنهاية
      let startDate = null;
      let endDate = null;
      
      if (values.schedule && values.schedule.length > 0) {
        startDate = values.schedule[0].toDate();
        if (values.schedule.length > 1 && values.schedule[1]) {
          endDate = values.schedule[1].toDate();
        }
      }

      // تجهيز البيانات النهائية للإعلان
      const adData = {
        ...values,
        startDate,
        endDate,
        // حذف بيانات الجدول الزمني لأننا استخدمناها بالفعل
        schedule: undefined
      };
      
      // إذا كان تعديلاً، نضيف معرف الإعلان الأصلي
      if (initialData && initialData.id) {
        adData.id = initialData.id;
      }
      
      await onSave(adData);
      message.success(`تم ${initialData ? 'تحديث' : 'إنشاء'} الإعلان بنجاح`);

    } catch (error) {
      console.error('خطأ في حفظ الإعلان:', error);
      message.error(`حدث خطأ أثناء ${initialData ? 'تحديث' : 'إنشاء'} الإعلان: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // تجميع المواقع حسب المجموعة
  const groupedPlacements = placements.reduce((groups, placement) => {
    if (!groups[placement.group]) {
      groups[placement.group] = [];
    }
    groups[placement.group].push(placement);
    return groups;
  }, {});

  return (
    <div className="advertisement-form">
      <Card
        title={
          <Space>
            <CalendarOutlined />
            <span>{initialData ? 'تعديل إعلان' : 'إنشاء إعلان جديد'}</span>
          </Space>
        }
        extra={
          <Space>
            <Button onClick={onCancel}>
              إلغاء
            </Button>
            <Button 
              type="primary" 
              icon={<SaveOutlined />} 
              onClick={() => form.submit()}
              loading={loading}
              disabled={submitDisabled}
            >
              حفظ
            </Button>
          </Space>
        }
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark="optional"
        >
          <Tabs defaultActiveKey="basic">
            <TabPane tab="المعلومات الأساسية" key="basic">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="name"
                    label="اسم الإعلان"
                    rules={[{ required: true, message: 'الرجاء إدخال اسم للإعلان' }]}
                    tooltip="اسم وصفي للإعلان (للاستخدام الإداري فقط)"
                  >
                    <Input placeholder="مثال: إعلان الصفحة الرئيسية" />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="status"
                    label="الحالة"
                    rules={[{ required: true, message: 'الرجاء اختيار حالة الإعلان' }]}
                  >
                    <Select placeholder="اختر حالة الإعلان">
                      {adStatuses.map(status => (
                        <Option key={status.id} value={status.id}>
                          {status.name}
                        </Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="bannerId"
                label="البانر"
                rules={[{ required: true, message: 'الرجاء اختيار بانر للإعلان' }]}
                tooltip="اختر البانر الذي سيتم عرضه"
              >
                <Select 
                  placeholder="اختر بانر" 
                  onChange={handleBannerChange}
                  optionLabelProp="label"
                >
                  {banners.map(banner => (
                    <Option key={banner.id} value={banner.id} label={banner.title}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <PictureOutlined style={{ marginLeft: 8, color: '#1890ff' }} />
                        <div>
                          <div>{banner.title}</div>
                          <div style={{ fontSize: '12px', color: '#999' }}>{`${banner.design.width}x${banner.design.height} - ${banner.type}`}</div>
                        </div>
                      </div>
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              {selectedBanner && (
                <div style={{ marginBottom: '24px' }}>
                  <Divider orientation="right">
                    <Space>
                      <PictureOutlined />
                      معاينة البانر المحدد
                    </Space>
                  </Divider>
                  <div style={{ maxWidth: '100%', overflow: 'auto', padding: '16px 0' }}>
                    <BannerPreview banner={selectedBanner} mediaId={selectedBanner.mediaId} showLink={true} />
                  </div>
                  <Button 
                    type="link" 
                    icon={<EyeOutlined />}
                    onClick={() => setBannerPreviewVisible(true)}
                  >
                    عرض البانر بالحجم الكامل
                  </Button>
                </div>
              )}

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="location"
                    label="موقع الظهور"
                    rules={[{ required: true, message: 'الرجاء اختيار موقع ظهور الإعلان' }]}
                    tooltip="مكان ظهور الإعلان في الموقع"
                  >
                    <Select 
                      placeholder="اختر موقع الظهور"
                      optionLabelProp="label"
                    >
                      {Object.keys(groupedPlacements).map(group => (
                        <Select.OptGroup key={group} label={group}>
                          {groupedPlacements[group].map(placement => (
                            <Option 
                              key={placement.id} 
                              value={placement.id}
                              label={placement.name}
                            >
                              <div>
                                <div>{placement.name}</div>
                                {placement.description && (
                                  <div style={{ fontSize: '12px', color: '#999' }}>
                                    {placement.description}
                                  </div>
                                )}
                              </div>
                            </Option>
                          ))}
                        </Select.OptGroup>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="schedule"
                    label="الجدول الزمني"
                    rules={[{ required: true, message: 'الرجاء تحديد الجدول الزمني للإعلان' }]}
                    tooltip="فترة عرض الإعلان"
                  >
                    <RangePicker 
                      showTime={{ format: 'HH:mm' }}
                      format="YYYY-MM-DD HH:mm"
                      placeholder={['تاريخ البداية', 'تاريخ الانتهاء (اختياري)']}
                      style={{ width: '100%' }}
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Form.Item
                name="priority"
                label="الأولوية"
                tooltip="أولوية عرض الإعلان (الأرقام الأعلى تعني أولوية أعلى)"
                initialValue={0}
              >
                <InputNumber min={0} max={100} style={{ width: '100%' }} />
              </Form.Item>

              <Form.Item
                name="isSponsored"
                label="إعلان مدفوع"
                valuePropName="checked"
                tooltip="حدد إذا كان هذا إعلانًا مدفوعًا أو مموّلًا"
              >
                <Switch />
              </Form.Item>
            </TabPane>

            <TabPane tab="استهداف متقدم" key="targeting">
              <Alert
                message="خيارات الاستهداف المتقدم"
                description="استخدم هذه الإعدادات لتحديد أين ومتى يظهر الإعلان بدقة أكبر"
                type="info"
                showIcon
                style={{ marginBottom: 24 }}
              />

              <Form.Item
                name="pages"
                label="الصفحات المخصصة"
                tooltip="اختر صفحات محددة لعرض الإعلان فيها. إذا لم يتم تحديد أي صفحة، سيظهر الإعلان في جميع الصفحات المناسبة"
              >
                <Select
                  mode="multiple"
                  placeholder="اختر الصفحات المخصصة (اختياري)"
                  style={{ width: '100%' }}
                >
                  {customPages.map(page => (
                    <Option key={page.id} value={page.id}>
                      {page.name}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
              
              <Form.Item label="استهداف المستخدمين">
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name={['targeting', 'roles']}
                      label="أدوار المستخدمين"
                    >
                      <Select
                        mode="multiple"
                        placeholder="اختر أدوار المستخدمين المستهدفة (اختياري)"
                      >
                        <Option value="visitor">زائر</Option>
                        <Option value="member">عضو</Option>
                        <Option value="subscriber">مشترك</Option>
                        <Option value="contributor">مساهم</Option>
                        <Option value="admin">مسؤول</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name={['targeting', 'countries']}
                      label="الدول"
                    >
                      <Select
                        mode="multiple"
                        placeholder="اختر الدول المستهدفة (اختياري)"
                      >
                        <Option value="SA">المملكة العربية السعودية</Option>
                        <Option value="AE">الإمارات العربية المتحدة</Option>
                        <Option value="KW">الكويت</Option>
                        <Option value="BH">البحرين</Option>
                        <Option value="QA">قطر</Option>
                        <Option value="OM">عمان</Option>
                        <Option value="EG">مصر</Option>
                        <Option value="JO">الأردن</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      name={['targeting', 'languages']}
                      label="اللغات"
                    >
                      <Select
                        mode="multiple"
                        placeholder="اختر اللغات المستهدفة (اختياري)"
                      >
                        <Option value="ar">العربية</Option>
                        <Option value="en">الإنجليزية</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item
                      name={['targeting', 'devices']}
                      label="الأجهزة"
                    >
                      <Select
                        mode="multiple"
                        placeholder="اختر الأجهزة المستهدفة (اختياري)"
                      >
                        <Option value="desktop">سطح المكتب</Option>
                        <Option value="mobile">الهاتف المحمول</Option>
                        <Option value="tablet">الأجهزة اللوحية</Option>
                      </Select>
                    </Form.Item>
                  </Col>
                </Row>
              </Form.Item>
            </TabPane>

            <TabPane tab="الإحصائيات والحدود" key="metrics">
              <Alert
                message="حدود الإعلان وإحصائياته"
                description="حدد الحد الأقصى لعدد مرات الظهور والنقرات"
                type="info"
                showIcon
                style={{ marginBottom: 24 }}
              />

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="maxImpressions"
                    label="الحد الأقصى لمرات الظهور"
                    tooltip="أقصى عدد من مرات عرض الإعلان، سيتوقف الإعلان بعد الوصول إلى هذا العدد"
                  >
                    <InputNumber 
                      min={0} 
                      placeholder="غير محدود" 
                      style={{ width: '100%' }} 
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="maxClicks"
                    label="الحد الأقصى للنقرات"
                    tooltip="أقصى عدد من مرات النقر على الإعلان، سيتوقف الإعلان بعد الوصول إلى هذا العدد"
                  >
                    <InputNumber 
                      min={0} 
                      placeholder="غير محدود" 
                      style={{ width: '100%' }} 
                    />
                  </Form.Item>
                </Col>
              </Row>

              {initialData && (
                <div className="ad-metrics">
                  <Divider orientation="right">
                    <Space>
                      <BarChartOutlined />
                      إحصائيات الإعلان
                    </Space>
                  </Divider>
                  
                  <Row gutter={16}>
                    <Col span={8}>
                      <Card size="small">
                        <Statistic
                          title="مرات الظهور"
                          value={initialData.impressions || 0}
                          suffix={initialData.maxImpressions ? `/ ${initialData.maxImpressions}` : ''}
                        />
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card size="small">
                        <Statistic
                          title="النقرات"
                          value={initialData.clicks || 0}
                          suffix={initialData.maxClicks ? `/ ${initialData.maxClicks}` : ''}
                        />
                      </Card>
                    </Col>
                    <Col span={8}>
                      <Card size="small">
                        <Statistic
                          title="معدل النقر إلى الظهور (CTR)"
                          value={initialData.impressions ? (initialData.clicks / initialData.impressions * 100).toFixed(2) : 0}
                          suffix="%"
                          precision={2}
                        />
                      </Card>
                    </Col>
                  </Row>
                </div>
              )}
            </TabPane>
          </Tabs>
        </Form>
      </Card>

      {/* معاينة البانر */}
      {selectedBanner && (
        <Modal
          title={`معاينة البانر: ${selectedBanner.title}`}
          visible={bannerPreviewVisible}
          onCancel={() => setBannerPreviewVisible(false)}
          footer={[
            <Button key="close" onClick={() => setBannerPreviewVisible(false)}>
              إغلاق
            </Button>
          ]}
          width={Math.min(selectedBanner.design.width + 48, window.innerWidth - 48)}
        >
          <BannerPreview
            banner={selectedBanner}
            mediaId={selectedBanner.mediaId}
            preview={true}
          />
        </Modal>
      )}
    </div>
  );
};

export default AdvertisementForm;