/**
 * Setup 2FA Component
 * مكون إعداد المصادقة الثنائية
 * 
 * Complete 2FA setup wizard with method selection, QR code, and verification
 */

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  Tooltip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip
} from '@mui/material';
import {
  Phone as PhoneIcon,
  PhoneAndroid as AppIcon,
  QrCode as QrCodeIcon,
  Security as SecurityIcon,
  Check as CheckIcon,
  ContentCopy as CopyIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Download as DownloadIcon,
  Print as PrintIcon
} from '@mui/icons-material';
import { useAuth } from '../../contexts/index.jsx';
import { twoFactorService } from '../../services/twoFactorService';
import { useNotifications } from '../../contexts/index.jsx';
import { useFormik } from 'formik';
import * as Yup from 'yup';

const Setup2FA = ({ onComplete, onCancel }) => {
  const { user } = useAuth();
  const { showNotification } = useNotifications();
  
  const [activeStep, setActiveStep] = useState(0);
  const [selectedMethod, setSelectedMethod] = useState('app');
  const [qrCodeData, setQrCodeData] = useState(null);
  const [backupCodes, setBackupCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showBackupCodes, setShowBackupCodes] = useState(false);
  const [error, setError] = useState('');

  const steps = [
    {
      label: 'اختيار طريقة التحقق',
      description: 'اختر الطريقة المناسبة لك'
    },
    {
      label: 'إعداد الطريقة',
      description: 'اتبع التعليمات لإعداد الطريقة المختارة'
    },
    {
      label: 'التحقق من الإعداد',
      description: 'تحقق من صحة الإعداد بإدخال رمز التحقق'
    },
    {
      label: 'رموز النسخ الاحتياطي',
      description: 'احفظ رموز النسخ الاحتياطي بأمان'
    }
  ];

  const methods = twoFactorService.getSupportedMethods();

  // Form validation for phone number
  const phoneFormik = useFormik({
    initialValues: {
      phoneNumber: ''
    },
    validationSchema: Yup.object({
      phoneNumber: Yup.string()
        .matches(/^(\+966|0)[5-9]\d{8}$/, 'رقم الهاتف غير صحيح')
        .required('رقم الهاتف مطلوب')
    }),
    onSubmit: async (values) => {
      await handleSetup(values.phoneNumber);
    }
  });

  // Form validation for verification code
  const verificationFormik = useFormik({
    initialValues: {
      code: ''
    },
    validationSchema: Yup.object({
      code: Yup.string()
        .matches(/^\d{6}$/, 'رمز التحقق يجب أن يكون 6 أرقام')
        .required('رمز التحقق مطلوب')
    }),
    onSubmit: async (values) => {
      await handleVerification(values.code);
    }
  });

  // Handle method selection
  const handleMethodChange = (event) => {
    setSelectedMethod(event.target.value);
    setError('');
  };

  // Handle setup initiation
  const handleSetup = async (phoneNumber = null) => {
    setLoading(true);
    setError('');

    try {
      const result = await twoFactorService.setup(selectedMethod, phoneNumber);
      
      if (result.success) {
        if (selectedMethod === 'app') {
          setQrCodeData(result.data);
        }
        setActiveStep(2); // Move to verification step
        showNotification('تم بدء إعداد المصادقة الثنائية', 'success');
      } else {
        setError(result.error || 'حدث خطأ في الإعداد');
      }
    } catch (error) {
      setError(error.message || 'حدث خطأ غير متوقع');
    } finally {
      setLoading(false);
    }
  };

  // Handle verification
  const handleVerification = async (code) => {
    setLoading(true);
    setError('');

    try {
      const result = await twoFactorService.verifySetup(code);
      
      if (result.success) {
        setBackupCodes(result.data.backupCodes || []);
        setActiveStep(3); // Move to backup codes step
        showNotification('تم تفعيل المصادقة الثنائية بنجاح', 'success');
      } else {
        setError(result.error || 'رمز التحقق غير صحيح');
      }
    } catch (error) {
      setError(error.message || 'حدث خطأ في التحقق');
    } finally {
      setLoading(false);
    }
  };

  // Handle completion
  const handleComplete = () => {
    if (onComplete) {
      onComplete();
    }
  };

  // Copy to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(() => {
      showNotification('تم النسخ إلى الحافظة', 'success');
    });
  };

  // Download backup codes
  const downloadBackupCodes = () => {
    const content = `رموز النسخ الاحتياطي للمصادقة الثنائية - ${user.name}

${backupCodes.map((code, index) => `${index + 1}. ${code}`).join('\n')}

تاريخ الإنشاء: ${new Date().toLocaleDateString('ar-SA')}

تعليمات مهمة:
- احفظ هذه الرموز في مكان آمن
- يمكن استخدام كل رمز مرة واحدة فقط
- استخدم هذه الرموز إذا لم تتمكن من الوصول إلى جهازك
- لا تشارك هذه الرموز مع أي شخص`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup-codes-${user.name}-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Print backup codes
  const printBackupCodes = () => {
    const printContent = `
      <html>
        <head>
          <title>رموز النسخ الاحتياطي</title>
          <style>
            body { font-family: Arial, sans-serif; direction: rtl; }
            .header { text-align: center; margin-bottom: 30px; }
            .codes { margin: 20px 0; }
            .code { margin: 10px 0; padding: 10px; border: 1px solid #ddd; }
            .footer { margin-top: 30px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>رموز النسخ الاحتياطي للمصادقة الثنائية</h1>
            <p>المستخدم: ${user.name}</p>
            <p>التاريخ: ${new Date().toLocaleDateString('ar-SA')}</p>
          </div>
          <div class="codes">
            ${backupCodes.map((code, index) => `
              <div class="code">${index + 1}. ${code}</div>
            `).join('')}
          </div>
          <div class="footer">
            <p><strong>تعليمات مهمة:</strong></p>
            <ul>
              <li>احفظ هذه الرموز في مكان آمن</li>
              <li>يمكن استخدام كل رمز مرة واحدة فقط</li>
              <li>استخدم هذه الرموز إذا لم تتمكن من الوصول إلى جهازك</li>
              <li>لا تشارك هذه الرموز مع أي شخص</li>
            </ul>
          </div>
        </body>
      </html>
    `;
    
    const printWindow = window.open('', '_blank');
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  // Send SMS code
  const sendSMSCode = async () => {
    setLoading(true);
    try {
      const result = await twoFactorService.sendSMSCode();
      if (result.success) {
        showNotification('تم إرسال رمز التحقق', 'success');
      } else {
        setError(result.error || 'حدث خطأ في إرسال الرمز');
      }
    } catch (error) {
      setError(error.message || 'حدث خطأ في إرسال الرمز');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Method Selection
  const renderMethodSelection = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        اختر طريقة المصادقة الثنائية
      </Typography>
      <Typography variant="body2" color="text.secondary" paragraph>
        اختر الطريقة التي تناسبك أكثر لتأمين حسابك
      </Typography>
      
      <FormControl component="fieldset" fullWidth>
        <RadioGroup value={selectedMethod} onChange={handleMethodChange}>
          {methods.map((method) => (
            <Card key={method.id} sx={{ mb: 2 }}>
              <CardContent>
                <FormControlLabel
                  value={method.id}
                  control={<Radio />}
                  label={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
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
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {method.description}
                        </Typography>
                      </Box>
                    </Box>
                  }
                />
              </CardContent>
            </Card>
          ))}
        </RadioGroup>
      </FormControl>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
        <Button
          variant="contained"
          onClick={() => setActiveStep(1)}
          disabled={loading}
        >
          التالي
        </Button>
        <Button
          variant="outlined"
          onClick={onCancel}
          disabled={loading}
        >
          إلغاء
        </Button>
      </Box>
    </Box>
  );

  // Step 2: Setup Configuration
  const renderSetupConfiguration = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        إعداد {twoFactorService.getMethodInfo(selectedMethod)?.name}
      </Typography>
      
      {selectedMethod === 'app' ? (
        <Box>
          <Typography variant="body2" paragraph>
            اتبع الخطوات التالية لإعداد تطبيق المصادقة:
          </Typography>
          
          <List>
            <ListItem>
              <ListItemIcon>
                <Typography variant="h6">1</Typography>
              </ListItemIcon>
              <ListItemText
                primary="حمّل تطبيق المصادقة"
                secondary="مثل Google Authenticator أو Authy أو Microsoft Authenticator"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Typography variant="h6">2</Typography>
              </ListItemIcon>
              <ListItemText
                primary="امسح رمز QR"
                secondary="أو أدخل المفتاح السري يدوياً"
              />
            </ListItem>
            <ListItem>
              <ListItemIcon>
                <Typography variant="h6">3</Typography>
              </ListItemIcon>
              <ListItemText
                primary="أدخل رمز التحقق"
                secondary="من التطبيق للتأكد من الإعداد"
              />
            </ListItem>
          </List>

          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              variant="contained"
              onClick={() => handleSetup()}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={20} /> : <QrCodeIcon />}
            >
              إنشاء رمز QR
            </Button>
            <Button
              variant="outlined"
              onClick={() => setActiveStep(0)}
              disabled={loading}
            >
              السابق
            </Button>
          </Box>
        </Box>
      ) : (
        <Box>
          <Typography variant="body2" paragraph>
            أدخل رقم هاتفك لاستلام رموز التحقق عبر الرسائل النصية
          </Typography>
          
          <form onSubmit={phoneFormik.handleSubmit}>
            <TextField
              fullWidth
              name="phoneNumber"
              label="رقم الهاتف"
              placeholder="05xxxxxxxx"
              value={phoneFormik.values.phoneNumber}
              onChange={phoneFormik.handleChange}
              error={phoneFormik.touched.phoneNumber && Boolean(phoneFormik.errors.phoneNumber)}
              helperText={phoneFormik.touched.phoneNumber && phoneFormik.errors.phoneNumber}
              InputProps={{
                startAdornment: <PhoneIcon sx={{ mr: 1, color: 'text.secondary' }} />
              }}
              sx={{ mb: 2 }}
            />
            
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                type="submit"
                variant="contained"
                disabled={loading}
                startIcon={loading ? <CircularProgress size={20} /> : <PhoneIcon />}
              >
                إعداد رقم الهاتف
              </Button>
              <Button
                variant="outlined"
                onClick={() => setActiveStep(0)}
                disabled={loading}
              >
                السابق
              </Button>
            </Box>
          </form>
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );

  // Step 3: Verification
  const renderVerification = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        التحقق من الإعداد
      </Typography>
      
      {selectedMethod === 'app' && qrCodeData ? (
        <Box>
          <Typography variant="body2" paragraph>
            امسح رمز QR التالي بتطبيق المصادقة:
          </Typography>
          
          <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
            <Card sx={{ p: 2, textAlign: 'center' }}>
              <img
                src={qrCodeData.qrCodeUrl}
                alt="QR Code"
                style={{ maxWidth: '200px', height: 'auto' }}
              />
              <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                لا يمكن مسح الرمز؟
              </Typography>
              <Button
                size="small"
                onClick={() => copyToClipboard(qrCodeData.secret)}
                startIcon={<CopyIcon />}
              >
                انسخ المفتاح السري
              </Button>
            </Card>
          </Box>
        </Box>
      ) : selectedMethod === 'sms' && (
        <Box>
          <Typography variant="body2" paragraph>
            تم إرسال رمز التحقق إلى رقم هاتفك
          </Typography>
          
          <Button
            variant="outlined"
            onClick={sendSMSCode}
            disabled={loading}
            startIcon={<PhoneIcon />}
            sx={{ mb: 2 }}
          >
            إعادة إرسال الرمز
          </Button>
        </Box>
      )}

      <Typography variant="body2" paragraph>
        أدخل رمز التحقق المكون من 6 أرقام:
      </Typography>
      
      <form onSubmit={verificationFormik.handleSubmit}>
        <TextField
          fullWidth
          name="code"
          label="رمز التحقق"
          placeholder="000000"
          value={verificationFormik.values.code}
          onChange={verificationFormik.handleChange}
          error={verificationFormik.touched.code && Boolean(verificationFormik.errors.code)}
          helperText={verificationFormik.touched.code && verificationFormik.errors.code}
          inputProps={{
            maxLength: 6,
            pattern: '[0-9]*',
            inputMode: 'numeric'
          }}
          sx={{ mb: 2 }}
        />
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            type="submit"
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <CheckIcon />}
          >
            تحقق من الرمز
          </Button>
          <Button
            variant="outlined"
            onClick={() => setActiveStep(1)}
            disabled={loading}
          >
            السابق
          </Button>
        </Box>
      </form>

      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}
    </Box>
  );

  // Step 4: Backup Codes
  const renderBackupCodes = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        رموز النسخ الاحتياطي
      </Typography>
      
      <Alert severity="warning" sx={{ mb: 3 }}>
        <Typography variant="body2">
          <strong>مهم جداً:</strong> احفظ هذه الرموز في مكان آمن. يمكن استخدام كل رمز مرة واحدة فقط.
          استخدم هذه الرموز إذا لم تتمكن من الوصول إلى جهازك.
        </Typography>
      </Alert>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            رموز النسخ الاحتياطي ({backupCodes.length})
          </Typography>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 1 }}>
            {backupCodes.map((code, index) => (
              <Box
                key={index}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  p: 1,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  fontFamily: 'monospace'
                }}
              >
                <Typography variant="body2" sx={{ flex: 1 }}>
                  {code}
                </Typography>
                <IconButton
                  size="small"
                  onClick={() => copyToClipboard(code)}
                  title="نسخ"
                >
                  <CopyIcon fontSize="small" />
                </IconButton>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button
          variant="outlined"
          onClick={downloadBackupCodes}
          startIcon={<DownloadIcon />}
        >
          تحميل كملف
        </Button>
        <Button
          variant="outlined"
          onClick={printBackupCodes}
          startIcon={<PrintIcon />}
        >
          طباعة
        </Button>
        <Button
          variant="outlined"
          onClick={() => copyToClipboard(backupCodes.join('\n'))}
          startIcon={<CopyIcon />}
        >
          نسخ الكل
        </Button>
      </Box>

      <Alert severity="info" sx={{ mb: 3 }}>
        <Typography variant="body2">
          تم تفعيل المصادقة الثنائية بنجاح! سيُطلب منك إدخال رمز التحقق عند تسجيل الدخول.
        </Typography>
      </Alert>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="contained"
          onClick={handleComplete}
          startIcon={<CheckIcon />}
        >
          إنهاء الإعداد
        </Button>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', p: 2 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <SecurityIcon />
        إعداد المصادقة الثنائية
      </Typography>
      
      <Typography variant="body1" color="text.secondary" paragraph>
        عزز أمان حسابك بإضافة طبقة حماية إضافية
      </Typography>

      <Stepper activeStep={activeStep} orientation="vertical" sx={{ mb: 3 }}>
        {steps.map((step, index) => (
          <Step key={index}>
            <StepLabel>{step.label}</StepLabel>
            <StepContent>
              <Typography variant="body2" color="text.secondary">
                {step.description}
              </Typography>
            </StepContent>
          </Step>
        ))}
      </Stepper>

      <Card>
        <CardContent>
          {activeStep === 0 && renderMethodSelection()}
          {activeStep === 1 && renderSetupConfiguration()}
          {activeStep === 2 && renderVerification()}
          {activeStep === 3 && renderBackupCodes()}
        </CardContent>
      </Card>

      {/* Backup Codes Dialog */}
      <Dialog
        open={showBackupCodes}
        onClose={() => setShowBackupCodes(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>رموز النسخ الاحتياطي</DialogTitle>
        <DialogContent>
          <Alert severity="warning" sx={{ mb: 2 }}>
            احفظ هذه الرموز في مكان آمن. لن يتم عرضها مرة أخرى.
          </Alert>
          
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1 }}>
            {backupCodes.map((code, index) => (
              <Typography key={index} variant="body2" sx={{ fontFamily: 'monospace', p: 1 }}>
                {index + 1}. {code}
              </Typography>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={downloadBackupCodes} startIcon={<DownloadIcon />}>
            تحميل
          </Button>
          <Button onClick={printBackupCodes} startIcon={<PrintIcon />}>
            طباعة
          </Button>
          <Button onClick={() => setShowBackupCodes(false)}>
            إغلاق
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Setup2FA; 