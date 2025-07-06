/**
 * Migration Page - صفحة إدارة الترحيل
 * صفحة مخصصة لإدارة ترحيل البيانات إلى Supabase
 */

import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
  Alert,
  Button,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Accordion,
  AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  ExpandMore,
  Info,
  Warning,
  CheckCircle,
  Error,
  Settings,
  Storage,
  CloudUpload
} from '@mui/icons-material';

import MigrationPanel from '../../components/admin/MigrationPanel.jsx';
import connectionTester from '../../utils/connectionTester.js';
import { ENV } from '../../config/environment.js';

const MigrationPage = () => {
  const [currentTab, setCurrentTab] = useState(0);
  const [systemStatus, setSystemStatus] = useState(null);
  const [setupInstructions, setSetupInstructions] = useState([]);

  useEffect(() => {
    checkSystemReadiness();
  }, []);

  const checkSystemReadiness = async () => {
    try {
      const status = await connectionTester.runTest();
      setSystemStatus(status);
      
      if (!status.ready) {
        const instructions = connectionTester.getInstructions();
        setSetupInstructions(instructions);
      }
    } catch (error) {
      console.error('خطأ في فحص جاهزية النظام:', error);
    }
  };

  const handleTabChange = (event, newValue) => {
    setCurrentTab(newValue);
  };

  const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index}>
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          إدارة ترحيل البيانات
        </Typography>
        <Typography variant="h6" color="text.secondary">
          ترحيل البيانات من التخزين المحلي إلى قاعدة بيانات Supabase
        </Typography>
      </Box>

      {/* حالة النظام */}
      {systemStatus && (
        <Alert 
          severity={systemStatus.ready ? 'success' : 'warning'} 
          sx={{ mb: 3 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={checkSystemReadiness}
            >
              تحديث
            </Button>
          }
        >
          {systemStatus.ready ? 
            'النظام جاهز لبدء الترحيل' : 
            'النظام يحتاج إعداد قبل بدء الترحيل'
          }
        </Alert>
      )}

      <Paper sx={{ width: '100%' }}>
        <Tabs 
          value={currentTab} 
          onChange={handleTabChange}
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            icon={<CloudUpload />} 
            label="ترحيل البيانات" 
            iconPosition="start"
          />
          <Tab 
            icon={<Settings />} 
            label="إعداد النظام" 
            iconPosition="start"
          />
          <Tab 
            icon={<Info />} 
            label="معلومات النظام" 
            iconPosition="start"
          />
        </Tabs>

        {/* تبويب ترحيل البيانات */}
        <TabPanel value={currentTab} index={0}>
          {systemStatus?.ready ? (
            <MigrationPanel />
          ) : (
            <Box sx={{ p: 3 }}>
              <Alert severity="warning" sx={{ mb: 3 }}>
                يجب إكمال إعداد النظام أولاً قبل بدء الترحيل
              </Alert>
              
              <Button 
                variant="contained" 
                onClick={() => setCurrentTab(1)}
                startIcon={<Settings />}
              >
                انتقل إلى إعداد النظام
              </Button>
            </Box>
          )}
        </TabPanel>

        {/* تبويب إعداد النظام */}
        <TabPanel value={currentTab} index={1}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              إعداد النظام للترحيل
            </Typography>

            {setupInstructions.length > 0 ? (
              <Box>
                <Typography variant="body1" sx={{ mb: 3 }}>
                  يرجى إكمال الخطوات التالية لإعداد النظام:
                </Typography>

                {setupInstructions.map((instruction, index) => (
                  <Accordion key={index} sx={{ mb: 2 }}>
                    <AccordionSummary expandIcon={<ExpandMore />}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="h6" sx={{ mr: 2 }}>
                          الخطوة {instruction.step}: {instruction.title}
                        </Typography>
                      </Box>
                    </AccordionSummary>
                    <AccordionDetails>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {instruction.description}
                      </Typography>
                      
                      {instruction.details && instruction.details.length > 0 && (
                        <List>
                          {instruction.details.map((detail, detailIndex) => (
                            <ListItem key={detailIndex}>
                              <ListItemIcon>
                                <Info color="primary" />
                              </ListItemIcon>
                              <ListItemText primary={detail} />
                            </ListItem>
                          ))}
                        </List>
                      )}
                    </AccordionDetails>
                  </Accordion>
                ))}
              </Box>
            ) : (
              <Alert severity="success">
                جميع إعدادات النظام مكتملة ✅
              </Alert>
            )}

            <Box sx={{ mt: 3 }}>
              <Button 
                variant="outlined" 
                onClick={checkSystemReadiness}
                startIcon={<CheckCircle />}
              >
                فحص الإعدادات مرة أخرى
              </Button>
            </Box>
          </Box>
        </TabPanel>

        {/* تبويب معلومات النظام */}
        <TabPanel value={currentTab} index={2}>
          <Box sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              معلومات النظام
            </Typography>

            <Grid container spacing={3}>
              {/* معلومات البيئة */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      إعدادات البيئة
                    </Typography>
                    
                    <List dense>
                      <ListItem>
                        <ListItemText 
                          primary="البيئة الحالية" 
                          secondary={ENV.APP_ENV}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="رابط التطبيق" 
                          secondary={ENV.APP_URL}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="وضع التطوير" 
                          secondary={ENV.IS_DEVELOPMENT ? 'مُفعل' : 'غير مُفعل'}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemText 
                          primary="وضع الإنتاج" 
                          secondary={ENV.IS_PRODUCTION ? 'مُفعل' : 'غير مُفعل'}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              {/* إعدادات Supabase */}
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      إعدادات Supabase
                    </Typography>
                    
                    <List dense>
                      <ListItem>
                        <ListItemIcon>
                          {ENV.SUPABASE.URL ? <CheckCircle color="success" /> : <Error color="error" />}
                        </ListItemIcon>
                        <ListItemText 
                          primary="رابط المشروع" 
                          secondary={ENV.SUPABASE.URL || 'غير مُعرف'}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          {ENV.SUPABASE.ANON_KEY ? <CheckCircle color="success" /> : <Error color="error" />}
                        </ListItemIcon>
                        <ListItemText 
                          primary="المفتاح العام" 
                          secondary={ENV.SUPABASE.ANON_KEY ? 'مُعرف' : 'غير مُعرف'}
                        />
                      </ListItem>
                      <ListItem>
                        <ListItemIcon>
                          {ENV.SUPABASE.SERVICE_ROLE_KEY ? <CheckCircle color="success" /> : <Warning color="warning" />}
                        </ListItemIcon>
                        <ListItemText 
                          primary="مفتاح الخدمة" 
                          secondary={ENV.SUPABASE.SERVICE_ROLE_KEY ? 'مُعرف' : 'غير مُعرف (اختياري)'}
                        />
                      </ListItem>
                    </List>
                  </CardContent>
                </Card>
              </Grid>

              {/* الميزات المُفعلة */}
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      الميزات المُفعلة
                    </Typography>
                    
                    <Grid container spacing={2}>
                      {Object.entries(ENV.FEATURES).map(([feature, enabled]) => (
                        <Grid item xs={12} sm={6} md={4} key={feature}>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {enabled ? 
                              <CheckCircle color="success" sx={{ mr: 1 }} /> : 
                              <Error color="disabled" sx={{ mr: 1 }} />
                            }
                            <Typography>
                              {feature === 'ANALYTICS' ? 'التحليلات' :
                               feature === 'DEBUG' ? 'وضع التطوير' :
                               feature === 'MOCK_AUTH' ? 'المصادقة الوهمية' :
                               feature === 'SUPABASE' ? 'Supabase' :
                               feature === 'MIGRATION' ? 'الترحيل' : feature}
                            </Typography>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* تفاصيل حالة النظام */}
            {systemStatus && (
              <Card sx={{ mt: 3 }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    تفاصيل حالة النظام
                  </Typography>
                  
                  <pre style={{ 
                    background: '#f5f5f5', 
                    padding: '16px', 
                    borderRadius: '4px',
                    overflow: 'auto',
                    fontSize: '12px'
                  }}>
                    {JSON.stringify(systemStatus.results, null, 2)}
                  </pre>
                </CardContent>
              </Card>
            )}
          </Box>
        </TabPanel>
      </Paper>
    </Container>
  );
};

export default MigrationPage;
