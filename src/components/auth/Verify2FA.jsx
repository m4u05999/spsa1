/**
 * Verify 2FA Component
 * مكون التحقق من المصادقة الثنائية
 * 
 * Used during login process to verify 2FA codes
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Divider,
  Link,
  IconButton,
  InputAdornment,
  LinearProgress,
  Chip
} from '@mui/material';
import {
  Security as SecurityIcon,
  PhoneAndroid as AppIcon,
  Phone as PhoneIcon,
  Backup as BackupIcon,
  Refresh as RefreshIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Timer as TimerIcon,
  Check as CheckIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { twoFactorService } from '../../services/twoFactorService';
import { useNotifications } from '../../contexts/index.jsx';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const Verify2FA = ({ 
  method, 
  phoneNumber, 
  onVerify, 
  onCancel,
  onSwitchMethod,
  sessionToken,
  maxAttempts = 5,
  lockoutTime = 300, // 5 minutes
  showBackupOption = true
}) => {
  const { showNotification } = useNotifications();
  
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(30);
  const [showCode, setShowCode] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimeRemaining, setLockTimeRemaining] = useState(0);
  
  const codeInputRef = useRef(null);
  const timerRef = useRef(null);
  const resendTimerRef = useRef(null);
  const lockTimerRef = useRef(null);

  // Determine available methods
  const availableMethods = [
    { id: 'app', label: 'تطبيق المصادقة', icon: <AppIcon /> },
    { id: 'sms', label: 'رسالة نصية', icon: <PhoneIcon /> },
    ...(showBackupOption ? [{ id: 'backup', label: 'رموز النسخ الاحتياطي', icon: <BackupIcon /> }] : [])
  ];

  // Form validation
  const formik = useFormik({
    initialValues: {
      code: ''
    },
    validationSchema: Yup.object({
      code: Yup.string()
        .matches(/^\d{6}$/, 'رمز التحقق يجب أن يكون 6 أرقام')
        .required('رمز التحقق مطلوب')
    }),
    onSubmit: async (values) => {
      await handleVerify(values.code);
    }
  });

  // Backup code form validation
  const backupFormik = useFormik({
    initialValues: {
      backupCode: ''
    },
    validationSchema: Yup.object({
      backupCode: Yup.string()
        .matches(/^\d{8}$/, 'رمز النسخ الاحتياطي يجب أن يكون 8 أرقام')
        .required('رمز النسخ الاحتياطي مطلوب')
    }),
    onSubmit: async (values) => {
      await handleVerify(values.backupCode, 'backup');
    }
  });

  // Timer for TOTP codes
  useEffect(() => {
    if (method === 'app') {
      timerRef.current = setInterval(() => {
        const remaining = twoFactorService.getTimeRemaining();
        setTimeRemaining(remaining);
      }, 1000);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [method]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown > 0) {
      resendTimerRef.current = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) {
            clearInterval(resendTimerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (resendTimerRef.current) {
        clearInterval(resendTimerRef.current);
      }
    };
  }, [resendCooldown]);

  // Lockout timer
  useEffect(() => {
    if (lockTimeRemaining > 0) {
      lockTimerRef.current = setInterval(() => {
        setLockTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(lockTimerRef.current);
            setIsLocked(false);
            setAttempts(0);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (lockTimerRef.current) {
        clearInterval(lockTimerRef.current);
      }
    };
  }, [lockTimeRemaining]);

  // Focus on input when component mounts
  useEffect(() => {
    if (codeInputRef.current) {
      codeInputRef.current.focus();
    }
  }, []);

  // Handle verification
  const handleVerify = async (code, verificationMethod = method) => {
    if (isLocked) {
      setError('تم قفل الحساب مؤقتاً');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await twoFactorService.verify(code, verificationMethod);
      
      if (result.success) {
        showNotification('تم التحقق بنجاح', 'success');
        if (onVerify) {
          onVerify(result.data);
        }
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        
        if (newAttempts >= maxAttempts) {
          setIsLocked(true);
          setLockTimeRemaining(lockoutTime);
          setError(`تم قفل الحساب لمدة ${Math.ceil(lockoutTime / 60)} دقيقة`);
        } else {
          setError(`رمز التحقق غير صحيح (${newAttempts}/${maxAttempts})`);
        }
        
        // Clear form
        formik.resetForm();
        backupFormik.resetForm();
      }
    } catch (error) {
      setError(error.message || 'حدث خطأ في التحقق');
    } finally {
      setLoading(false);
    }
  };

  // Handle SMS resend
  const handleResendSMS = async () => {
    if (resendCooldown > 0 || method !== 'sms') return;

    setLoading(true);
    try {
      const result = await twoFactorService.sendSMSCode();
      if (result.success) {
        showNotification('تم إرسال رمز التحقق', 'success');
        setResendCooldown(60); // 1 minute cooldown
      } else {
        setError(result.error || 'حدث خطأ في إرسال الرمز');
      }
    } catch (error) {
      setError(error.message || 'حدث خطأ في إرسال الرمز');
    } finally {
      setLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    setError('');
    formik.resetForm();
    backupFormik.resetForm();
  };

  // Format time remaining
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Get current method info
  const getCurrentMethodInfo = () => {
    const methodId = activeTab === 2 ? 'backup' : (activeTab === 1 ? 'sms' : 'app');
    return availableMethods.find(m => m.id === methodId);
  };

  // Render TOTP verification
  const renderTOTPVerification = () => (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <AppIcon color="primary" />
        <Box>
          <Typography variant="h6">
            تطبيق المصادقة
          </Typography>
          <Typography variant="body2" color="text.secondary">
            أدخل الرمز من تطبيق المصادقة
          </Typography>
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <TimerIcon color="primary" />
        <Box>
          <Typography variant="body2">
            الوقت المتبقي: {timeRemaining} ثانية
          </Typography>
          <LinearProgress 
            variant="determinate" 
            value={(timeRemaining / 30) * 100} 
            sx={{ mt: 1, height: 6, borderRadius: 3 }}
          />
        </Box>
      </Box>

      <form onSubmit={formik.handleSubmit}>
        <TextField
          inputRef={codeInputRef}
          fullWidth
          name="code"
          label="رمز التحقق"
          placeholder="000000"
          value={formik.values.code}
          onChange={formik.handleChange}
          error={formik.touched.code && Boolean(formik.errors.code)}
          helperText={formik.touched.code && formik.errors.code}
          inputProps={{
            maxLength: 6,
            pattern: '[0-9]*',
            inputMode: 'numeric',
            style: { textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5em' }
          }}
          disabled={loading || isLocked}
          sx={{ mb: 2 }}
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading || isLocked}
          startIcon={loading ? <CircularProgress size={20} /> : <CheckIcon />}
          sx={{ mb: 2 }}
        >
          {loading ? 'جاري التحقق...' : 'تحقق'}
        </Button>
      </form>
    </Box>
  );

  // Render SMS verification
  const renderSMSVerification = () => (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <PhoneIcon color="primary" />
        <Box>
          <Typography variant="h6">
            رسالة نصية
          </Typography>
          <Typography variant="body2" color="text.secondary">
            أدخل الرمز المرسل إلى {twoFactorService.formatPhoneNumber(phoneNumber)}
          </Typography>
        </Box>
      </Box>

      <form onSubmit={formik.handleSubmit}>
        <TextField
          inputRef={codeInputRef}
          fullWidth
          name="code"
          label="رمز التحقق"
          placeholder="000000"
          value={formik.values.code}
          onChange={formik.handleChange}
          error={formik.touched.code && Boolean(formik.errors.code)}
          helperText={formik.touched.code && formik.errors.code}
          inputProps={{
            maxLength: 6,
            pattern: '[0-9]*',
            inputMode: 'numeric',
            style: { textAlign: 'center', fontSize: '1.5rem', letterSpacing: '0.5em' }
          }}
          disabled={loading || isLocked}
          sx={{ mb: 2 }}
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading || isLocked}
          startIcon={loading ? <CircularProgress size={20} /> : <CheckIcon />}
          sx={{ mb: 2 }}
        >
          {loading ? 'جاري التحقق...' : 'تحقق'}
        </Button>
      </form>

      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
        <Button
          variant="text"
          onClick={handleResendSMS}
          disabled={resendCooldown > 0 || loading || isLocked}
          startIcon={<RefreshIcon />}
        >
          {resendCooldown > 0 ? `إعادة الإرسال (${resendCooldown}s)` : 'إعادة إرسال الرمز'}
        </Button>
      </Box>
    </Box>
  );

  // Render backup code verification
  const renderBackupCodeVerification = () => (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
        <BackupIcon color="primary" />
        <Box>
          <Typography variant="h6">
            رموز النسخ الاحتياطي
          </Typography>
          <Typography variant="body2" color="text.secondary">
            أدخل أحد رموز النسخ الاحتياطي
          </Typography>
        </Box>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          يمكن استخدام كل رمز نسخ احتياطي مرة واحدة فقط. 
          احرص على حفظ الرموز المتبقية في مكان آمن.
        </Typography>
      </Alert>

      <form onSubmit={backupFormik.handleSubmit}>
        <TextField
          fullWidth
          name="backupCode"
          label="رمز النسخ الاحتياطي"
          placeholder="12345678"
          value={backupFormik.values.backupCode}
          onChange={backupFormik.handleChange}
          error={backupFormik.touched.backupCode && Boolean(backupFormik.errors.backupCode)}
          helperText={backupFormik.touched.backupCode && backupFormik.errors.backupCode}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  onClick={() => setShowCode(!showCode)}
                  edge="end"
                >
                  {showCode ? <VisibilityOffIcon /> : <VisibilityIcon />}
                </IconButton>
              </InputAdornment>
            )
          }}
          inputProps={{
            maxLength: 8,
            pattern: '[0-9]*',
            inputMode: 'numeric',
            style: { 
              textAlign: 'center', 
              fontSize: '1.2rem', 
              letterSpacing: '0.3em',
              fontFamily: 'monospace'
            }
          }}
          type={showCode ? 'text' : 'password'}
          disabled={loading || isLocked}
          sx={{ mb: 2 }}
        />

        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading || isLocked}
          startIcon={loading ? <CircularProgress size={20} /> : <CheckIcon />}
          sx={{ mb: 2 }}
        >
          {loading ? 'جاري التحقق...' : 'تحقق'}
        </Button>
      </form>
    </Box>
  );

  return (
    <Box sx={{ maxWidth: 400, mx: 'auto', p: 2 }}>
      <Card>
        <CardContent sx={{ textAlign: 'center' }}>
          <SecurityIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
          
          <Typography variant="h5" gutterBottom>
            التحقق من الهوية
          </Typography>
          
          <Typography variant="body2" color="text.secondary" paragraph>
            لحماية حسابك، يُرجى إدخال رمز التحقق الثنائي
          </Typography>

          {/* Lockout message */}
          {isLocked && (
            <Alert severity="error" sx={{ mb: 3 }}>
              <Typography variant="body2">
                تم قفل الحساب لمدة {formatTime(lockTimeRemaining)} بسبب المحاولات المتكررة
              </Typography>
            </Alert>
          )}

          {/* Attempts warning */}
          {attempts > 0 && attempts < maxAttempts && !isLocked && (
            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="body2">
                محاولات متبقية: {maxAttempts - attempts}
              </Typography>
            </Alert>
          )}

          {/* Method tabs */}
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            variant="fullWidth"
            sx={{ mb: 3 }}
          >
            <Tab 
              label="تطبيق" 
              icon={<AppIcon />}
              iconPosition="start"
              disabled={loading || isLocked}
            />
            <Tab 
              label="SMS" 
              icon={<PhoneIcon />}
              iconPosition="start"
              disabled={loading || isLocked}
            />
            {showBackupOption && (
              <Tab 
                label="نسخ احتياطي" 
                icon={<BackupIcon />}
                iconPosition="start"
                disabled={loading || isLocked}
              />
            )}
          </Tabs>

          {/* Verification content */}
          {activeTab === 0 && renderTOTPVerification()}
          {activeTab === 1 && renderSMSVerification()}
          {activeTab === 2 && renderBackupCodeVerification()}

          {/* Error message */}
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <Divider sx={{ my: 3 }} />

          {/* Action buttons */}
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
            <Button
              variant="outlined"
              onClick={onCancel}
              disabled={loading}
            >
              إلغاء
            </Button>
            
            {onSwitchMethod && (
              <Button
                variant="text"
                onClick={onSwitchMethod}
                disabled={loading}
              >
                تغيير الطريقة
              </Button>
            )}
          </Box>

          {/* Help text */}
          <Typography variant="caption" display="block" sx={{ mt: 2, color: 'text.secondary' }}>
            واجهت مشكلة؟ 
            <Link href="/help/2fa" target="_blank" sx={{ ml: 1 }}>
              اطلب المساعدة
            </Link>
          </Typography>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Verify2FA; 