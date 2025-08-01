// src/context/PaymentContext.jsx
import React, { createContext, useReducer } from 'react';

export const PaymentContext = createContext(null);

const initialState = {
  isProcessing: false,
  error: null,
  // ❌ REMOVED: تم حذف تخزين بيانات البطاقة لانتهاكها معايير PCI DSS وقانون PDPL
  // savedCards: [] - لا يجب تخزين بيانات البطاقة محلياً أبداً
  
  // ✅ فقط معلومات المعاملات الآمنة (بدون بيانات بطاقة)
  paymentSessions: [], // جلسات دفع مؤقتة فقط
  transactions: [], // مراجع المعاملات المكتملة فقط
  
  // ✅ إعدادات التجديد التلقائي (بدون ربط بطاقة محلي)
  autoRenewal: {
    enabled: false,
    // ❌ REMOVED: cardId - لا يجب ربط البطاقة محلياً
    paymentMethodId: null, // مرجع HyperPay فقط
    reminderDays: 7,
    notificationMethods: ['email']
  }
};

const paymentReducer = (state, action) => {
  switch (action.type) {
    case 'SET_PROCESSING':
      return { ...state, isProcessing: action.payload, error: null };
    case 'SET_ERROR':
      return { ...state, error: action.payload, isProcessing: false };
    
    // ❌ REMOVED: ADD_CARD و REMOVE_CARD - لا يجب تخزين بطاقات محلياً
    
    case 'START_PAYMENT_SESSION':
      // ✅ إنشاء جلسة دفع مؤقتة فقط (بدون بيانات بطاقة)
      return {
        ...state,
        paymentSessions: [...state.paymentSessions, {
          id: action.payload.sessionId,
          amount: action.payload.amount,
          timestamp: new Date().toISOString(),
          status: 'pending'
        }]
      };
    
    case 'END_PAYMENT_SESSION':
      // ✅ إنهاء جلسة الدفع
      return {
        ...state,
        paymentSessions: state.paymentSessions.filter(
          session => session.id !== action.payload.sessionId
        )
      };
    
    case 'ADD_TRANSACTION':
      // ✅ حفظ مرجع المعاملة فقط (بدون بيانات بطاقة)
      return {
        ...state,
        transactions: [action.payload, ...state.transactions]
      };
    
    case 'UPDATE_AUTO_RENEWAL':
      return {
        ...state,
        autoRenewal: { ...state.autoRenewal, ...action.payload }
      };
    
    default:
      return state;
  }
};

export const PaymentProvider = ({ children }) => {
  const [state, dispatch] = useReducer(paymentReducer, initialState);

  // ✅ معالجة دفع آمنة عبر HyperPay (بدون تخزين بيانات بطاقة)
  const initiatePayment = async (paymentDetails) => {
    dispatch({ type: 'SET_PROCESSING', payload: true });
    
    try {
      // إنشاء جلسة دفع مؤقتة
      const sessionId = `session_${Date.now()}`;
      dispatch({
        type: 'START_PAYMENT_SESSION',
        payload: {
          sessionId,
          amount: paymentDetails.amount
        }
      });

      // ✅ إعادة توجيه لـ HyperPay (بدون تخزين بيانات بطاقة)
      // في التطبيق الحقيقي: window.location.href = hyperPayUrl;
      
      // محاكاة للاختبار
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // ✅ حفظ مرجع المعاملة فقط (بدون بيانات بطاقة)
      dispatch({
        type: 'ADD_TRANSACTION',
        payload: {
          id: Date.now(),
          transactionRef: `txn_${Date.now()}`, // مرجع HyperPay فقط
          amount: paymentDetails.amount,
          status: 'success',
          date: new Date().toISOString(),
          membershipLevel: paymentDetails.membershipLevel,
          // ❌ NO CARD DATA STORED
        }
      });
      
      // إنهاء جلسة الدفع
      dispatch({
        type: 'END_PAYMENT_SESSION',
        payload: { sessionId }
      });
      
      dispatch({ type: 'SET_PROCESSING', payload: false });
      
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: 'فشلت عملية الدفع. يرجى المحاولة مرة أخرى.'
      });
    }
  };

  // ✅ تحديث إعدادات التجديد التلقائي (بدون ربط بطاقة محلي)
  const updateAutoRenewal = async (settings) => {
    dispatch({
      type: 'UPDATE_AUTO_RENEWAL',
      payload: {
        ...settings,
        // ✅ فقط مرجع طريقة الدفع من HyperPay (بدون بيانات بطاقة)
        paymentMethodId: settings.hyperPayMethodId || null
      }
    });
  };

  // ❌ REMOVED: deleteCard و addCard - لا يجب تخزين بطاقات محلياً أبداً

  const value = {
    state,
    dispatch,
    // ✅ وظائف آمنة فقط (بدون تخزين بيانات بطاقة)
    initiatePayment,     // بدلاً من processPayment
    updateAutoRenewal,   // محدثة لتكون آمنة
    // ❌ REMOVED: deleteCard, addCard - لا يجب تخزين بطاقات محلياً
  };

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
};

// Custom hook to use Payment Context
export const usePayment = () => {
  const context = React.useContext(PaymentContext);
  if (!context) {
    throw new Error('usePayment must be used within PaymentProvider');
  }
  return context;
};