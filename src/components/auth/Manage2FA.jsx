/**
 * Manage 2FA Component
 * مكون إدارة المصادقة الثنائية
 * 
 * Allows users to view status, enable/disable, and manage their 2FA settings
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Alert,
  Switch,
  FormControlLabel,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Skeleton,
  Grid,
  Paper,
  Tooltip
} from '@mui/material';
import {
  Security as SecurityIcon,
  PhoneAndroid as AppIcon,
  Phone as PhoneIcon,
  Backup as BackupIcon,
  Settings as SettingsIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  Shield as ShieldIcon,
  DeviceUnknown as DeviceIcon,
  AccessTime as TimeIcon,
  HelpOutline as HelpIcon
} from '@mui/icons-material';
import { twoFactorService } from '../../services/twoFactorService';
import { useAuth } from '../../contexts/index.jsx';
import { useNotifications } from '../../contexts/index.jsx';
import Setup2FA from './Setup2FA';
import Verify2FA from './Verify2FA';

const Manage2FA = () => {
  const { user } = useAuth();
  const { showNotification } = useNotifications();
  
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSetup, setShowSetup] = useState(false);
  const [showVerify, setShowVerify] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [backupCodes, setBackupCodes] = useState([]);
  const [pendingAction, setPendingAction] = useState(null);
  const [expandedSection, setExpandedSection] = useState('status');

  // Load 2FA status on component mount
  useEffect(() => {
    loadStatus();
  }, []);

  // Load 2FA status
  const loadStatus = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await twoFactorService.getStatus();
      
      if (result.success) {
        setStatus(result.data);
      } else {
        setError(result.error || 'حدث خطأ في تحميل الحالة');
      }
    } catch (error) {
      setError(error.message || 'حدث خطأ في تحميل الحالة');
    } finally {
      setLoading(false);
    }
  };

  // Handle enable/disable 2FA
  const handleToggle2FA = async (enable) => {
    if (enable) {
      setShowSetup(true);
    } else {
      setPendingAction('disable');
      setShowVerify(true);
    }
  };

  // Handle verification completion
  const handleVerificationComplete = async (verificationData) => {
    setShowVerify(false);
    
    if (pendingAction === 'disable') {
      await handleDisable2FA(verificationData);
    } else if (pendingAction === 'backup_codes') {
      await handleGenerateBackupCodes();
    }
    
    setPendingAction(null);
  };

  // Handle disable 2FA
  const handleDisable2FA = async (verificationData) => {
    setActionLoading(true);
    
    try {
      const result = await twoFactorService.disable(verificationData.code);
      
      if (result.success) {
        showNotification('تم إلغاء تفعيل المصادقة الثنائية', 'success');
        await loadStatus();
      } else {
        setError(result.error || 'حدث خطأ في إلغاء التفعيل');
      }
    } catch (error) {
      setError(error.message || 'حدث خطأ في إلغاء التفعيل');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle setup completion
  const handleSetupComplete = async () => {
    setShowSetup(false);
    showNotification('تم تفعيل المصادقة الثنائية بنجاح', 'success');
    await loadStatus();
  };

  // Handle backup codes generation
  const handleGenerateBackupCodes = async () => {
    setActionLoading(true);
    
    try {
      const result = await twoFactorService.getBackupCodes();
      
      if (result.success) {
        setBackupCodes(result.data.backupCodes);
        setShowBackupCodes(true);
        showNotification('تم إنشاء رموز النسخ الاحتياطي', 'success');
        await loadStatus();
      } else {
        setError(result.error || 'حدث خطأ في إنشاء الرموز');
      }
    } catch (error) {
      setError(error.message || 'حدث خطأ في إنشاء الرموز');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle backup codes request
  const handleRequestBackupCodes = () => {
    setPendingAction('backup_codes');
    setShowVerify(true);
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return 'غير متاح';
    return new Date(date).toLocaleDateString('ar-SA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get method info
  const getMethodInfo = (method) => {
    return twoFactorService.getMethodInfo(method);
  };

  // Get status color
  const getStatusColor = (isEnabled) => {
    return isEnabled ? 'success' : 'default';
  };

  // Get status text
  const getStatusText = (isEnabled) => {
    return isEnabled ? 'مفعّل' : 'غير مفعّل';
  };

  // Render loading state
  if (loading) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
        <Skeleton variant="text" width="60%" height={40} />
        <Skeleton variant="rectangular" width="100%" height={200} sx={{ mt: 2 }} />
        <Skeleton variant="rectangular" width="100%" height={150} sx={{ mt: 2 }} />
      </Box>
    );
  }

  // Render error state
  if (error && !status) {
    return (
      <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
        <Alert severity="error" action={
          <Button onClick={loadStatus} size="small">
            إعادة المحاولة
          </Button>
        }>
          {error}
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <SecurityIcon />
        إدارة المصادقة الثنائية
      </Typography>

      <Typography variant="body1" color="text.secondary" paragraph>
        عزز أمان حسابك بالمصادقة الثنائية
      </Typography>

      {/* Status Overview */}
      <Accordion 
        expanded={expandedSection === 'status'} 
        onChange={() => setExpandedSection(expandedSection === 'status' ? '' : 'status')}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <ShieldIcon />
            <Typography variant="h6">حالة المصادقة الثنائية</Typography>
            <Chip
              label={getStatusText(status?.isEnabled)}
              color={getStatusColor(status?.isEnabled)}
              size="small"
            />
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  الحالة الحالية
                </Typography>
                
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <SecurityIcon color={status?.isEnabled ? 'success' : 'disabled'} />
                    </ListItemIcon>
                    <ListItemText
                      primary="المصادقة الثنائية"
                      secondary={status?.isEnabled ? 'مفعّلة' : 'غير مفعّلة'}
                    />
                  </ListItem>
                  
                  {status?.isEnabled && (
                    <>
                      <ListItem>
                        <ListItemIcon>
                          {status?.method === 'app' ? <AppIcon /> : <PhoneIcon />}
                        </ListItemIcon>
                        <ListItemText
                          primary="الطريقة المستخدمة"
                          secondary={getMethodInfo(status?.method)?.name}
                        />
                      </ListItem>
                      
                      <ListItem>
                        <ListItemIcon>
                          <TimeIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="آخر تحقق"
                          secondary={formatDate(status?.lastVerified)}
                        />
                      </ListItem>
                      
                      <ListItem>
                        <ListItemIcon>
                          <BackupIcon />
                        </ListItemIcon>
                        <ListItemText
                          primary="رموز النسخ الاحتياطي"
                          secondary={`${status?.backupCodesCount || 0} متاح`}
                        />
                      </ListItem>
                    </>
                  )}
                </List>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="h6" gutterBottom>
                  الإجراءات المتاحة
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {!status?.isEnabled ? (
                    <Button
                      variant="contained"
                      onClick={() => handleToggle2FA(true)}
                      startIcon={<AddIcon />}
                      fullWidth
                    >
                      تفعيل المصادقة الثنائية
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => handleToggle2FA(false)}
                        startIcon={<DeleteIcon />}
                        fullWidth
                      >
                        إلغاء تفعيل المصادقة الثنائية
                      </Button>
                      
                      <Button
                        variant="outlined"
                        onClick={handleRequestBackupCodes}
                        startIcon={<BackupIcon />}
                        fullWidth
                      >
                        إنشاء رموز نسخ احتياطي جديدة
                      </Button>
                    </>
                  )}
                  
                  <Button
                    variant="text"
                    onClick={loadStatus}
                    startIcon={<RefreshIcon />}
                    fullWidth
                  >
                    تحديث الحالة
                  </Button>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Security Recommendations */}
      <Accordion 
        expanded={expandedSection === 'security'} 
        onChange={() => setExpandedSection(expandedSection === 'security' ? '' : 'security')}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <InfoIcon />
            <Typography variant="h6">توصيات الأمان</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <List>
            {twoFactorService.getSecurityRecommendations().map((recommendation, index) => (
              <ListItem key={index}>
                <ListItemIcon>
                  <Box sx={{ 
                    width: 24, 
                    height: 24, 
                    borderRadius: '50%',
                    backgroundColor: recommendation.importance === 'high' ? 'error.main' : 'warning.main',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.8rem'
                  }}>
                    {recommendation.importance === 'high' ? '!' : 'i'}
                  </Box>
                </ListItemIcon>
                <ListItemText
                  primary={recommendation.title}
                  secondary={recommendation.description}
                />
              </ListItem>
            ))}
          </List>
        </AccordionDetails>
      </Accordion>

      {/* Method Information */}
      <Accordion 
        expanded={expandedSection === 'methods'} 
        onChange={() => setExpandedSection(expandedSection === 'methods' ? '' : 'methods')}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <DeviceIcon />
            <Typography variant="h6">طرق المصادقة المتاحة</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Grid container spacing={2}>
            {twoFactorService.getSupportedMethods().map((method) => (
              <Grid item xs={12} md={6} key={method.id}>
                <Card sx={{ 
                  border: status?.method === method.id ? '2px solid' : '1px solid',
                  borderColor: status?.method === method.id ? 'primary.main' : 'divider'
                }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Box sx={{ fontSize: '2rem' }}>{method.icon}</Box>
                      <Box>
                        <Typography variant="h6">
                          {method.name}
                          {method.recommended && (
                            <Chip
                              label="مُوصى به"
                              size="small"
                              color="primary"
                              sx={{ ml: 1 }}
                            />
                          )}
                          {status?.method === method.id && (
                            <Chip
                              label="مُستخدم حالياً"
                              size="small"
                              color="success"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {method.description}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </AccordionDetails>
      </Accordion>

      {/* Help */}
      <Accordion 
        expanded={expandedSection === 'help'} 
        onChange={() => setExpandedSection(expandedSection === 'help' ? '' : 'help')}
      >
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <HelpIcon />
            <Typography variant="h6">المساعدة والدعم</Typography>
          </Box>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="body2" paragraph>
            إذا واجهت أي مشاكل في استخدام المصادقة الثنائية:
          </Typography>
          
          <List>
            <ListItem>
              <ListItemText
                primary="فقدت جهازك؟"
                secondary="استخدم رموز النسخ الاحتياطي التي حفظتها مسبقاً"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="لا يعمل التطبيق؟"
                secondary="تأكد من تزامن الوقت على جهازك أو استخدم رموز النسخ الاحتياطي"
              />
            </ListItem>
            <ListItem>
              <ListItemText
                primary="لم تصلك رسالة SMS؟"
                secondary="تحقق من إعدادات الشبكة أو تواصل مع الدعم التقني"
              />
            </ListItem>
          </List>
          
          <Box sx={{ mt: 2 }}>
            <Button variant="outlined" href="/help/2fa" target="_blank">
              مركز المساعدة المفصل
            </Button>
          </Box>
        </AccordionDetails>
      </Accordion>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {/* Setup Dialog */}
      <Dialog
        open={showSetup}
        onClose={() => setShowSetup(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>إعداد المصادقة الثنائية</DialogTitle>
        <DialogContent>
          <Setup2FA 
            onComplete={handleSetupComplete}
            onCancel={() => setShowSetup(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Verification Dialog */}
      <Dialog
        open={showVerify}
        onClose={() => setShowVerify(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>تأكيد الهوية</DialogTitle>
        <DialogContent>
          <Verify2FA
            method={status?.method}
            phoneNumber={status?.phoneNumber}
            onVerify={handleVerificationComplete}
            onCancel={() => setShowVerify(false)}
            showBackupOption={true}
          />
        </DialogContent>
      </Dialog>

      {/* Backup Codes Dialog */}
      <Dialog
        open={showBackupCodes}
        onClose={() => setShowBackupCodes(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>رموز النسخ الاحتياطي الجديدة</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            <strong>مهم:</strong> احفظ هذه الرموز في مكان آمن. لن يتم عرضها مرة أخرى.
          </Alert>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
            {backupCodes.map((code, index) => (
              <Typography
                key={index}
                variant="body2"
                sx={{ 
                  fontFamily: 'monospace',
                  p: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1
                }}
              >
                {index + 1}. {code}
              </Typography>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowBackupCodes(false)}>
            إغلاق
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Manage2FA; 