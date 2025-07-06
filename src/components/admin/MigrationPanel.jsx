/**
 * Migration Panel Component - لوحة إدارة الترحيل
 * مكون لإدارة ترحيل البيانات من التخزين المحلي إلى Supabase
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  LinearProgress,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid
} from '@mui/material';
import {
  CloudUpload,
  CheckCircle,
  Error,
  Warning,
  Info,
  Storage,
  Sync
} from '@mui/icons-material';

import dataMigration from '../../utils/dataMigration.js';
import connectionTester from '../../utils/connectionTester.js';
import databaseChecker from '../../utils/databaseChecker.js';

const MigrationPanel = () => {
  const [migrationStatus, setMigrationStatus] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState(null);
  const [databaseStatus, setDatabaseStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [activeStep, setActiveStep] = useState(0);

  // خطوات الترحيل
  const migrationSteps = [
    {
      label: 'فحص الاتصال',
      description: 'التحقق من الاتصال بـ Supabase وحالة قاعدة البيانات'
    },
    {
      label: 'ترحيل الفئات',
      description: 'نقل فئات المحتوى إلى قاعدة البيانات'
    },
    {
      label: 'ترحيل العلامات',
      description: 'نقل العلامات والكلمات المفتاحية'
    },
    {
      label: 'ترحيل المحتوى',
      description: 'نقل المقالات والأخبار والمحتوى'
    },
    {
      label: 'إنشاء المستخدمين',
      description: 'إنشاء حسابات المستخدمين الأساسية'
    },
    {
      label: 'التحقق النهائي',
      description: 'التأكد من نجاح الترحيل وسلامة البيانات'
    }
  ];

  // فحص الحالة عند تحميل المكون
  useEffect(() => {
    checkSystemStatus();
  }, []);

  // فحص حالة النظام
  const checkSystemStatus = async () => {
    setIsLoading(true);
    
    try {
      // فحص الاتصال
      const connectionResult = await connectionTester.runTest();
      setConnectionStatus(connectionResult);

      // فحص قاعدة البيانات
      const databaseResult = await databaseChecker.check();
      setDatabaseStatus(databaseResult);

      // فحص حالة الترحيل
      const migrationResult = dataMigration.getStatus();
      setMigrationStatus(migrationResult);

    } catch (error) {
      console.error('خطأ في فحص حالة النظام:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // بدء عملية الترحيل
  const startMigration = async () => {
    setShowConfirmDialog(false);
    setIsLoading(true);
    setActiveStep(0);

    try {
      const result = await dataMigration.migrate();
      setMigrationStatus(result);
      
      if (result.success) {
        setActiveStep(migrationSteps.length);
      }
    } catch (error) {
      console.error('خطأ في الترحيل:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // التحقق من نتائج الترحيل
  const verifyMigration = async () => {
    setIsLoading(true);
    
    try {
      const result = await dataMigration.verify();
      console.log('نتائج التحقق:', result);
      await checkSystemStatus(); // إعادة فحص الحالة
    } catch (error) {
      console.error('خطأ في التحقق:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // الحصول على لون الحالة
  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  // الحصول على أيقونة الحالة
  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle color="success" />;
      case 'warning': return <Warning color="warning" />;
      case 'error': return <Error color="error" />;
      default: return <Info color="info" />;
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        لوحة إدارة ترحيل البيانات
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        ترحيل البيانات من التخزين المحلي إلى قاعدة بيانات Supabase
      </Typography>

      {/* حالة النظام */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* حالة الاتصال */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Sync sx={{ mr: 1 }} />
                <Typography variant="h6">حالة الاتصال</Typography>
              </Box>
              
              {connectionStatus ? (
                <Box>
                  <Chip
                    icon={getStatusIcon(connectionStatus.results?.overall?.status)}
                    label={connectionStatus.ready ? 'متصل' : 'غير متصل'}
                    color={getStatusColor(connectionStatus.results?.overall?.status)}
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    النتيجة: {connectionStatus.results?.overall?.score || 0}/100
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2">جاري الفحص...</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* حالة قاعدة البيانات */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Storage sx={{ mr: 1 }} />
                <Typography variant="h6">قاعدة البيانات</Typography>
              </Box>
              
              {databaseStatus ? (
                <Box>
                  <Chip
                    icon={getStatusIcon(databaseStatus.results?.overall?.status)}
                    label={databaseStatus.results?.overall?.status === 'success' ? 'جاهزة' : 'تحتاج إعداد'}
                    color={getStatusColor(databaseStatus.results?.overall?.status)}
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    النتيجة: {databaseStatus.results?.overall?.score || 0}/100
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2">جاري الفحص...</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* حالة الترحيل */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Storage sx={{ mr: 1 }} />
                <Typography variant="h6">حالة الترحيل</Typography>
              </Box>
              
              {migrationStatus ? (
                <Box>
                  <Chip
                    icon={getStatusIcon(migrationStatus.isRunning ? 'warning' : 'success')}
                    label={migrationStatus.isRunning ? 'قيد التشغيل' : 'متوقف'}
                    color={migrationStatus.isRunning ? 'warning' : 'default'}
                    sx={{ mb: 1 }}
                  />
                  <Typography variant="body2" color="text.secondary">
                    التقدم: {migrationStatus.progress || 0}%
                  </Typography>
                </Box>
              ) : (
                <Typography variant="body2">لم يبدأ بعد</Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* تقدم الترحيل */}
      {migrationStatus?.isRunning && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              تقدم الترحيل
            </Typography>
            
            <Box sx={{ mb: 2 }}>
              <Typography variant="body2" color="text.secondary">
                {migrationStatus.currentStep}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={migrationStatus.progress} 
                sx={{ mt: 1 }}
              />
              <Typography variant="body2" sx={{ mt: 1 }}>
                {migrationStatus.progress}%
              </Typography>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* نتائج الترحيل */}
      {migrationStatus?.results && (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              نتائج الترحيل
            </Typography>
            
            <Grid container spacing={2}>
              {Object.entries(migrationStatus.results).map(([key, result]) => (
                <Grid item xs={12} sm={6} md={3} key={key}>
                  <Box sx={{ textAlign: 'center', p: 2, border: 1, borderColor: 'divider', borderRadius: 1 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      {key === 'categories' ? 'الفئات' :
                       key === 'tags' ? 'العلامات' :
                       key === 'content' ? 'المحتوى' :
                       key === 'users' ? 'المستخدمون' : key}
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {result.migrated}/{result.total}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {result.errors > 0 && `${result.errors} أخطاء`}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>
      )}

      {/* أزرار التحكم */}
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            إجراءات الترحيل
          </Typography>
          
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              startIcon={<CloudUpload />}
              onClick={() => setShowConfirmDialog(true)}
              disabled={isLoading || migrationStatus?.isRunning || !connectionStatus?.ready}
            >
              بدء الترحيل
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<CheckCircle />}
              onClick={verifyMigration}
              disabled={isLoading}
            >
              التحقق من النتائج
            </Button>
            
            <Button
              variant="outlined"
              startIcon={<Sync />}
              onClick={checkSystemStatus}
              disabled={isLoading}
            >
              تحديث الحالة
            </Button>
          </Box>

          {/* تحذيرات */}
          {!connectionStatus?.ready && (
            <Alert severity="warning" sx={{ mt: 2 }}>
              يجب إعداد الاتصال بـ Supabase أولاً قبل بدء الترحيل
            </Alert>
          )}
          
          {migrationStatus?.errors?.length > 0 && (
            <Alert severity="error" sx={{ mt: 2 }}>
              يوجد {migrationStatus.errors.length} خطأ في الترحيل
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* مربع حوار التأكيد */}
      <Dialog open={showConfirmDialog} onClose={() => setShowConfirmDialog(false)}>
        <DialogTitle>تأكيد بدء الترحيل</DialogTitle>
        <DialogContent>
          <Typography>
            هل أنت متأكد من بدء عملية ترحيل البيانات؟ 
            ستقوم هذه العملية بنقل جميع البيانات المحلية إلى قاعدة بيانات Supabase.
          </Typography>
          
          <Alert severity="info" sx={{ mt: 2 }}>
            تأكد من إعداد قاعدة البيانات بشكل صحيح قبل المتابعة
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmDialog(false)}>
            إلغاء
          </Button>
          <Button onClick={startMigration} variant="contained">
            بدء الترحيل
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MigrationPanel;
