import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Tabs, Button, Statistic, Modal, Form, Input, DatePicker, Select, Divider, Table, Tag, Space, Typography, Tooltip, Alert } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CalendarOutlined, PictureOutlined, LineChartOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip as ChartTooltip, Legend } from 'chart.js';
import BannerDesigner from '../../../components/banners/BannerDesigner';
import BannerPreview from '../../../components/banners/BannerPreview';
import moment from 'moment';
import { getBanners, createBanner, updateBanner, deleteBanner, BANNER_SIZES } from '../../../services/bannerService';
import { getAdvertisements, createAdvertisement, updateAdvertisement, deleteAdvertisement } from '../../../services/advertisementService';
import { getMediaItems } from '../../../services/mediaService';

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, ChartTooltip, Legend);

const { Title: TitleComponent } = Typography;
const { TabPane } = Tabs;
const { RangePicker } = DatePicker;
const { Option } = Select;

const BannerAdvertisementManagement = () => {
  // State variables
  const [banners, setBanners] = useState([]);
  const [advertisements, setAdvertisements] = useState([]);
  const [mediaItems, setMediaItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('banners');
  
  // Modal states
  const [bannerModalVisible, setBannerModalVisible] = useState(false);
  const [adModalVisible, setAdModalVisible] = useState(false);
  const [currentBanner, setCurrentBanner] = useState(null);
  const [currentAd, setCurrentAd] = useState(null);
  
  // Form instances
  const [bannerForm] = Form.useForm();
  const [adForm] = Form.useForm();

  // Design state for banner designer
  const [designState, setDesignState] = useState({
    title: '',
    subtitle: '',
    buttonText: '',
    buttonUrl: '',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    backgroundImage: '',
    size: 'large',
    opacity: 0.8,
    alignment: 'center'
  });

  // Load initial data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [bannersData, adsData, mediaData] = await Promise.all([
          getBanners(),
          getAdvertisements(),
          getMediaItems()
        ]);
        
        setBanners(bannersData);
        setAdvertisements(adsData);
        setMediaItems(mediaData);
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Statistics data for charts
  const bannerChartData = {
    labels: ['Homepage', 'Sidebar', 'Article', 'Footer', 'Mobile'],
    datasets: [
      {
        label: 'Active Banners',
        data: [
          banners.filter(b => b.location === 'homepage' && b.isActive).length,
          banners.filter(b => b.location === 'sidebar' && b.isActive).length,
          banners.filter(b => b.location === 'article' && b.isActive).length,
          banners.filter(b => b.location === 'footer' && b.isActive).length,
          banners.filter(b => b.location === 'mobile' && b.isActive).length
        ],
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }
    ]
  };

  const adChartData = {
    labels: ['Today', 'This Week', 'This Month', 'Upcoming', 'Expired'],
    datasets: [
      {
        label: 'Advertisement Count',
        data: [
          advertisements.filter(ad => moment().isSame(moment(ad.startDate), 'day') && moment().isSame(moment(ad.endDate), 'day')).length,
          advertisements.filter(ad => moment().isSame(moment(ad.startDate), 'week') && moment().isSame(moment(ad.endDate), 'week')).length,
          advertisements.filter(ad => moment().isSame(moment(ad.startDate), 'month') && moment().isSame(moment(ad.endDate), 'month')).length,
          advertisements.filter(ad => moment().isBefore(moment(ad.startDate))).length,
          advertisements.filter(ad => moment().isAfter(moment(ad.endDate))).length
        ],
        backgroundColor: 'rgba(255, 159, 64, 0.5)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 1
      }
    ]
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: activeTab === 'banners' ? 'Banner Placement Distribution' : 'Advertisement Timeline',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  };

  // Banner table columns
  const bannerColumns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <div>{text}</div>
          <small style={{ color: '#888' }}>{record.title}</small>
        </div>
      )
    },
    {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
      render: size => (
        <Tag color="blue">{size}</Tag>
      )
    },
    {
      title: 'Location',
      dataIndex: 'location',
      key: 'location',
      render: location => (
        <Tag color="green">{location}</Tag>
      )
    },
    {
      title: 'Status',
      dataIndex: 'isActive',
      key: 'isActive',
      render: isActive => (
        isActive ? 
          <Tag color="success" icon={<CheckCircleOutlined />}>Active</Tag> : 
          <Tag color="default" icon={<ClockCircleOutlined />}>Inactive</Tag>
      )
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: date => moment(date).format('YYYY-MM-DD')
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => handleEditBanner(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
              onClick={() => handleDeleteBanner(record.id)}
            />
          </Tooltip>
          <Tooltip title="Preview">
            <Button 
              type="text" 
              icon={<PictureOutlined />} 
              onClick={() => handlePreviewBanner(record)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  // Advertisement table columns
  const adColumns = [
    {
      title: 'Campaign',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <div>{text}</div>
          <small style={{ color: '#888' }}>{record.description?.substring(0, 40)}...</small>
        </div>
      )
    },
    {
      title: 'Banner',
      dataIndex: 'bannerId',
      key: 'bannerId',
      render: bannerId => {
        const banner = banners.find(b => b.id === bannerId);
        return banner ? banner.name : 'N/A';
      }
    },
    {
      title: 'Schedule',
      key: 'schedule',
      render: (_, record) => (
        <div>
          <div><CalendarOutlined /> Start: {moment(record.startDate).format('YYYY-MM-DD')}</div>
          <div><CalendarOutlined /> End: {moment(record.endDate).format('YYYY-MM-DD')}</div>
        </div>
      )
    },
    {
      title: 'Status',
      key: 'status',
      render: (_, record) => {
        const now = moment();
        const start = moment(record.startDate);
        const end = moment(record.endDate);
        
        if (now.isBefore(start)) {
          return <Tag color="processing">Scheduled</Tag>;
        } else if (now.isAfter(end)) {
          return <Tag color="default">Expired</Tag>;
        } else {
          return <Tag color="success">Active</Tag>;
        }
      }
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: priority => (
        <Tag color={priority > 7 ? 'red' : priority > 4 ? 'orange' : 'green'}>
          {priority}
        </Tag>
      )
    },
    {
      title: 'Actions',
      key: 'action',
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Edit">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => handleEditAd(record)}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
              onClick={() => handleDeleteAd(record.id)}
            />
          </Tooltip>
        </Space>
      )
    }
  ];

  // Banner handlers
  const handleAddBanner = () => {
    setCurrentBanner(null);
    setDesignState({
      title: '',
      subtitle: '',
      buttonText: '',
      buttonUrl: '',
      backgroundColor: '#ffffff',
      textColor: '#000000',
      backgroundImage: '',
      size: 'large',
      opacity: 0.8,
      alignment: 'center'
    });
    bannerForm.resetFields();
    setBannerModalVisible(true);
  };

  const handleEditBanner = (banner) => {
    setCurrentBanner(banner);
    setDesignState({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      buttonText: banner.buttonText || '',
      buttonUrl: banner.buttonUrl || '',
      backgroundColor: banner.backgroundColor || '#ffffff',
      textColor: banner.textColor || '#000000',
      backgroundImage: banner.backgroundImage || '',
      size: banner.size || 'large',
      opacity: banner.opacity || 0.8,
      alignment: banner.alignment || 'center'
    });
    
    bannerForm.setFieldsValue({
      name: banner.name,
      location: banner.location,
      isActive: banner.isActive
    });
    
    setBannerModalVisible(true);
  };

  const handleDeleteBanner = async (id) => {
    try {
      // Check if banner is used in any advertisements
      const adsUsingBanner = advertisements.filter(ad => ad.bannerId === id);
      
      if (adsUsingBanner.length > 0) {
        Modal.confirm({
          title: 'Cannot Delete Banner',
          content: `This banner is currently used in ${adsUsingBanner.length} active advertisement(s). Please remove those advertisements first.`,
          okText: 'Okay',
          cancelText: null,
          okButtonProps: {
            type: 'primary',
          }
        });
        return;
      }
      
      Modal.confirm({
        title: 'Confirm Deletion',
        content: 'Are you sure you want to delete this banner? This action cannot be undone.',
        okText: 'Delete',
        okType: 'danger',
        cancelText: 'Cancel',
        onOk: async () => {
          await deleteBanner(id);
          setBanners(banners.filter(banner => banner.id !== id));
        }
      });
    } catch (error) {
      console.error('Error handling banner deletion:', error);
    }
  };

  const handlePreviewBanner = (banner) => {
    setDesignState({
      title: banner.title || '',
      subtitle: banner.subtitle || '',
      buttonText: banner.buttonText || '',
      buttonUrl: banner.buttonUrl || '',
      backgroundColor: banner.backgroundColor || '#ffffff',
      textColor: banner.textColor || '#000000',
      backgroundImage: banner.backgroundImage || '',
      size: banner.size || 'large',
      opacity: banner.opacity || 0.8,
      alignment: banner.alignment || 'center'
    });
    
    Modal.info({
      title: 'Banner Preview',
      width: 800,
      content: (
        <div className="banner-preview-container">
          <BannerPreview design={banner} />
        </div>
      ),
      okText: 'Close'
    });
  };

  const handleBannerFormSubmit = async () => {
    try {
      const values = await bannerForm.validateFields();
      
      const bannerData = {
        ...values,
        ...designState
      };

      if (currentBanner) {
        // Update existing banner
        const updatedBanner = await updateBanner(currentBanner.id, bannerData);
        setBanners(banners.map(b => b.id === currentBanner.id ? updatedBanner : b));
      } else {
        // Create new banner
        const newBanner = await createBanner(bannerData);
        setBanners([...banners, newBanner]);
      }
      
      setBannerModalVisible(false);
    } catch (error) {
      console.error('Error submitting banner form:', error);
    }
  };

  // Advertisement handlers
  const handleAddAd = () => {
    setCurrentAd(null);
    adForm.resetFields();
    setAdModalVisible(true);
  };

  const handleEditAd = (ad) => {
    setCurrentAd(ad);
    
    adForm.setFieldsValue({
      name: ad.name,
      description: ad.description,
      bannerId: ad.bannerId,
      schedule: [moment(ad.startDate), moment(ad.endDate)],
      priority: ad.priority,
      targetUrl: ad.targetUrl,
      targetAudience: ad.targetAudience || [],
      placement: ad.placement
    });
    
    setAdModalVisible(true);
  };

  const handleDeleteAd = async (id) => {
    try {
      Modal.confirm({
        title: 'Confirm Deletion',
        content: 'Are you sure you want to delete this advertisement? This action cannot be undone.',
        okText: 'Delete',
        okType: 'danger',
        cancelText: 'Cancel',
        onOk: async () => {
          await deleteAdvertisement(id);
          setAdvertisements(advertisements.filter(ad => ad.id !== id));
        }
      });
    } catch (error) {
      console.error('Error handling advertisement deletion:', error);
    }
  };

  const handleAdFormSubmit = async () => {
    try {
      const values = await adForm.validateFields();
      
      const schedule = values.schedule || [];
      const startDate = schedule[0]?.toISOString() || new Date().toISOString();
      const endDate = schedule[1]?.toISOString() || moment().add(7, 'days').toISOString();
      
      const adData = {
        name: values.name,
        description: values.description,
        bannerId: values.bannerId,
        startDate,
        endDate,
        priority: values.priority || 5,
        targetUrl: values.targetUrl,
        targetAudience: values.targetAudience || [],
        placement: values.placement
      };

      if (currentAd) {
        // Update existing ad
        const updatedAd = await updateAdvertisement(currentAd.id, adData);
        setAdvertisements(advertisements.map(ad => ad.id === currentAd.id ? updatedAd : ad));
      } else {
        // Create new ad
        const newAd = await createAdvertisement(adData);
        setAdvertisements([...advertisements, newAd]);
      }
      
      setAdModalVisible(false);
    } catch (error) {
      console.error('Error submitting advertisement form:', error);
    }
  };

  // Banner modal content
  const renderBannerModal = () => (
    <Modal
      title={currentBanner ? 'Edit Banner' : 'Create New Banner'}
      visible={bannerModalVisible}
      onCancel={() => setBannerModalVisible(false)}
      width={900}
      footer={[
        <Button key="back" onClick={() => setBannerModalVisible(false)}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleBannerFormSubmit}>
          {currentBanner ? 'Update Banner' : 'Create Banner'}
        </Button>
      ]}
    >
      <Row gutter={16}>
        {/* Left side: Banner Details Form */}
        <Col span={10}>
          <Form
            form={bannerForm}
            layout="vertical"
            initialValues={{
              isActive: true,
              size: 'large',
              location: 'homepage'
            }}
          >
            <Form.Item
              name="name"
              label="Banner Name"
              rules={[{ required: true, message: 'Please enter banner name' }]}
            >
              <Input placeholder="Enter a name for internal reference" />
            </Form.Item>
            
            <Form.Item
              name="location"
              label="Display Location"
              rules={[{ required: true, message: 'Please select display location' }]}
            >
              <Select placeholder="Select where to display this banner">
                <Option value="homepage">Homepage</Option>
                <Option value="sidebar">Sidebar</Option>
                <Option value="article">Article Top</Option>
                <Option value="footer">Footer</Option>
                <Option value="mobile">Mobile Only</Option>
              </Select>
            </Form.Item>
            
            <Form.Item
              name="size"
              label="Banner Size"
            >
              <Select placeholder="Select banner size">
                {Object.entries(BANNER_SIZES).map(([key, value]) => (
                  <Option key={key} value={key}>
                    {value.name} ({value.width} x {value.height})
                  </Option>
                ))}
              </Select>
            </Form.Item>
            
            <Form.Item
              name="isActive"
              valuePropName="checked"
            >
              <Select>
                <Option value={true}>Active</Option>
                <Option value={false}>Inactive</Option>
              </Select>
            </Form.Item>
          </Form>
        </Col>
        
        {/* Right side: Banner Designer */}
        <Col span={14}>
          <div className="banner-designer-container" style={{ border: '1px solid #f0f0f0', padding: '15px', borderRadius: '4px' }}>
            <BannerDesigner 
              design={designState}
              onDesignChange={setDesignState}
              mediaItems={mediaItems}
            />
          </div>
        </Col>
      </Row>
    </Modal>
  );

  // Advertisement modal content
  const renderAdModal = () => (
    <Modal
      title={currentAd ? 'Edit Advertisement' : 'Create New Advertisement'}
      visible={adModalVisible}
      onCancel={() => setAdModalVisible(false)}
      width={700}
      footer={[
        <Button key="back" onClick={() => setAdModalVisible(false)}>
          Cancel
        </Button>,
        <Button key="submit" type="primary" onClick={handleAdFormSubmit}>
          {currentAd ? 'Update Advertisement' : 'Create Advertisement'}
        </Button>
      ]}
    >
      <Form
        form={adForm}
        layout="vertical"
        initialValues={{
          priority: 5,
          schedule: [moment(), moment().add(7, 'days')]
        }}
      >
        <Row gutter={16}>
          <Col span={16}>
            <Form.Item
              name="name"
              label="Campaign Name"
              rules={[{ required: true, message: 'Please enter campaign name' }]}
            >
              <Input placeholder="Enter campaign name" />
            </Form.Item>
          </Col>
          <Col span={8}>
            <Form.Item
              name="priority"
              label="Priority (1-10)"
              rules={[
                { required: true, message: 'Please set priority' },
                { type: 'number', min: 1, max: 10, message: 'Priority must be between 1-10' }
              ]}
            >
              <Input type="number" min={1} max={10} />
            </Form.Item>
          </Col>
        </Row>
        
        <Form.Item
          name="description"
          label="Description"
        >
          <Input.TextArea rows={3} placeholder="Brief description of this advertisement campaign" />
        </Form.Item>
        
        <Form.Item
          name="bannerId"
          label="Select Banner"
          rules={[{ required: true, message: 'Please select a banner' }]}
        >
          <Select placeholder="Choose which banner to display">
            {banners.map(banner => (
              <Option key={banner.id} value={banner.id}>
                {banner.name} ({banner.size}, {banner.location})
              </Option>
            ))}
          </Select>
        </Form.Item>
        
        <Form.Item
          name="schedule"
          label="Schedule"
          rules={[{ required: true, message: 'Please set a schedule' }]}
        >
          <RangePicker 
            style={{ width: '100%' }} 
            format="YYYY-MM-DD"
          />
        </Form.Item>
        
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              name="placement"
              label="Placement"
              rules={[{ required: true, message: 'Please select placement' }]}
            >
              <Select placeholder="Select location">
                <Option value="homepage">Homepage</Option>
                <Option value="sidebar">Sidebar</Option>
                <Option value="article">Article Top</Option>
                <Option value="footer">Footer</Option>
                <Option value="mobile">Mobile Only</Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              name="targetAudience"
              label="Target Audience"
              rules={[{ required: false }]}
            >
              <Select mode="multiple" placeholder="Select target audience">
                <Option value="members">Members</Option>
                <Option value="visitors">Visitors</Option>
                <Option value="researchers">Researchers</Option>
                <Option value="students">Students</Option>
              </Select>
            </Form.Item>
          </Col>
        </Row>
        
        <Form.Item
          name="targetUrl"
          label="Target URL"
          rules={[
            { required: true, message: 'Please enter destination URL' },
            { type: 'url', message: 'Please enter a valid URL' }
          ]}
        >
          <Input placeholder="https://example.com/landing-page" />
        </Form.Item>
      </Form>
    </Modal>
  );

  // Main component render
  return (
    <div className="banner-advertisement-management">
      <div className="module-header" style={{ marginBottom: 24 }}>
        <TitleComponent level={2}>Banner & Advertisement Management</TitleComponent>
        <p>Create and manage banner designs, schedule advertisements, and control their placement on the website.</p>
      </div>

      {/* Statistics Cards */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Banners"
              value={banners.length}
              prefix={<PictureOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Banners"
              value={banners.filter(b => b.isActive).length}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Campaigns"
              value={
                advertisements.filter(ad => {
                  const now = moment();
                  return moment(ad.startDate).isSameOrBefore(now) && 
                         moment(ad.endDate).isSameOrAfter(now);
                }).length
              }
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Upcoming Campaigns"
              value={advertisements.filter(ad => moment().isBefore(moment(ad.startDate))).length}
              prefix={<ClockCircleOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Chart Card */}
      <Card style={{ marginBottom: 24 }}>
        <div style={{ height: '250px' }}>
          <Bar 
            data={activeTab === 'banners' ? bannerChartData : adChartData} 
            options={chartOptions}
          />
        </div>
      </Card>

      {/* Management Tabs */}
      <Card>
        <Tabs defaultActiveKey="banners" onChange={setActiveTab}>
          <TabPane
            tab={
              <span>
                <PictureOutlined /> Banners
              </span>
            }
            key="banners"
          >
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={handleAddBanner}
              >
                Create New Banner
              </Button>
            </div>
            
            <Table 
              columns={bannerColumns} 
              dataSource={banners.map(b => ({ ...b, key: b.id }))}
              loading={loading}
              pagination={{ pageSize: 10 }}
              rowClassName={record => !record.isActive ? 'table-row-inactive' : ''}
            />
          </TabPane>
          
          <TabPane
            tab={
              <span>
                <CalendarOutlined /> Advertisements
              </span>
            }
            key="advertisements"
          >
            <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                type="primary" 
                icon={<PlusOutlined />}
                onClick={handleAddAd}
                disabled={banners.length === 0}
              >
                Schedule New Advertisement
              </Button>
            </div>

            {banners.length === 0 && (
              <Alert
                message="No Banners Available"
                description="You need to create at least one banner before scheduling advertisements."
                type="warning"
                showIcon
                style={{ marginBottom: 16 }}
                action={
                  <Button type="primary" size="small" onClick={handleAddBanner}>
                    Create Banner
                  </Button>
                }
              />
            )}
            
            <Table 
              columns={adColumns} 
              dataSource={advertisements.map(ad => ({ ...ad, key: ad.id }))}
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </TabPane>
        </Tabs>
      </Card>

      {/* Modals */}
      {renderBannerModal()}
      {renderAdModal()}
    </div>
  );
};

export default BannerAdvertisementManagement;