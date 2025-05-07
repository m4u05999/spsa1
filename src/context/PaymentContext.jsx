// src/context/PaymentContext.jsx
import React, { createContext, useReducer } from 'react';

export const PaymentContext = createContext(null);

const initialState = {
  isProcessing: false,
  error: null,
  savedCards: [
    {
      id: '1',
      last4: '4242',
      expMonth: '12',
      expYear: '24',
      brand: 'visa'
    }
  ],
  transactions: [],
  autoRenewal: {
    enabled: false,
    cardId: null,
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
    case 'ADD_CARD':
      return {
        ...state,
        savedCards: [...state.savedCards, action.payload]
      };
    case 'REMOVE_CARD':
      return {
        ...state,
        savedCards: state.savedCards.filter(card => card.id !== action.payload)
      };
    case 'ADD_TRANSACTION':
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

  const processPayment = async (paymentDetails) => {
    dispatch({ type: 'SET_PROCESSING', payload: true });
    try {
      // Here we would integrate with Stripe
      // For now, we'll simulate the payment process
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      dispatch({
        type: 'ADD_TRANSACTION',
        payload: {
          id: Date.now(),
          amount: paymentDetails.amount,
          status: 'success',
          date: new Date().toISOString(),
          membershipLevel: paymentDetails.membershipLevel
        }
      });
      
      dispatch({ type: 'SET_PROCESSING', payload: false });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: 'فشلت عملية الدفع. يرجى المحاولة مرة أخرى.'
      });
    }
  };

  const updateAutoRenewal = async (settings) => {
    dispatch({
      type: 'UPDATE_AUTO_RENEWAL',
      payload: settings
    });
  };

  const deleteCard = async (cardId) => {
    dispatch({
      type: 'REMOVE_CARD',
      payload: cardId
    });
  };

  const addCard = async (cardDetails) => {
    // Here we would integrate with Stripe to save the card
    const newCard = {
      id: Date.now().toString(),
      last4: cardDetails.number.slice(-4),
      expMonth: cardDetails.expiry.split('/')[0],
      expYear: cardDetails.expiry.split('/')[1],
      brand: 'visa'
    };

    dispatch({
      type: 'ADD_CARD',
      payload: newCard
    });
  };

  const value = {
    state,
    dispatch,
    processPayment,
    updateAutoRenewal,
    deleteCard,
    addCard
  };

  return (
    <PaymentContext.Provider value={value}>
      {children}
    </PaymentContext.Provider>
  );
};