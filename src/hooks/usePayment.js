// src/hooks/usePayment.js
import { useContext } from 'react';
import { PaymentContext } from '../context/PaymentContext';

export const usePayment = () => {
  const context = useContext(PaymentContext);
  
  if (!context) {
    throw new Error('usePayment must be used within a PaymentProvider');
  }

  const {
    state,
    dispatch,
    processPayment,
    updateAutoRenewal,
    deleteCard,
    addCard
  } = context;

  return {
    isProcessing: state.isProcessing,
    error: state.error,
    savedCards: state.savedCards,
    transactions: state.transactions,
    processPayment,
    updateAutoRenewal,
    deleteCard,
    addCard
  };
};