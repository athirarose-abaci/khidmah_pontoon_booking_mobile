import React, {createContext, useState} from 'react';

const ToastContext = createContext(null);
const {Provider} = ToastContext;

const ToastProvider = ({children}) => {
  const colors = {
    success: 'rgba(102, 190, 80, 0.74)',
    warning: 'rgba(245, 184, 0, 0.74)',
    error: 'rgba(245, 4, 0, 0.62)',
  };
  const durationTypes = {
    short: 1500,
    long: 3500,
  };
  const [toastVisibility, setToastVisibility] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState(colors['success']);

  const showToast = (message, duration = 'short', type = 'success') => {
    // Here we can either give 'short or 'long' choices or the duration in milliseconds.
    const delay =
      typeof duration === 'number' ? duration : durationTypes[duration];
    setToastMessage(message);
    setToastVisibility(true);
    setToastType(colors[type]);
    setTimeout(() => {
      setToastMessage('');
      setToastVisibility(false);
    }, delay);
  };
  return (
    <Provider
      value={{
        showToast,
        toastVisibility,
        toastMessage,
        toastType,
      }}>
      {children}
    </Provider>
  );
};

export {ToastContext, ToastProvider};