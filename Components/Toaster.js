// components/AlertManager.jsx
'use client'
import React, { createContext, useContext, useState } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

// Create a context for the alert state
const AlertContext = createContext();

// Hook to access the alert context
export const useAlert = () => {
  const context = useContext(AlertContext);
  if (!context) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

// Configuration for alert styles
const alertConfig = {
  autoHideDuration: 3000,
  vertical: 'top',
  horizontal: 'right',
};

// Define the toast functions using a shared state updater
let setAlertState = () => {};

export const showSuccessToast = (message) => {
  setAlertState({
    open: true,
    message,
    severity: 'success',
  });
};

export const showErrorToast = (message) => {
  setAlertState({
    open: true,
    message,
    severity: 'error',
  });
};

export const showMessageToast = (message) => {
  setAlertState({
    open: true,
    message,
    severity: 'info',
  });
};

// Alert Provider Component
export const AlertProvider = ({ children }) => {
  const [alert, setAlert] = useState({
    open: false,
    message: '',
    severity: 'info',
  });

  // Update the shared setAlertState function
  setAlertState = setAlert;

  const handleClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setAlert((prev) => ({ ...prev, open: false }));
  };

  return (
    <AlertContext.Provider value={{ showSuccessToast, showErrorToast, showMessageToast }}>
      <Snackbar
        open={alert?.open}
        autoHideDuration={alertConfig.autoHideDuration}
        onClose={handleClose}
        anchorOrigin={{ vertical: alertConfig.vertical, horizontal: alertConfig.horizontal }}
      >
        <Alert
          onClose={handleClose}
          severity={alert?.severity}
          sx={{ width: '100%' }}
          variant="filled"
        >
          {alert?.message}
        </Alert>
      </Snackbar>
      {children}
    </AlertContext.Provider>
  );
};

// Toaster Component (renamed to AlertManager for consistency)
const AlertManager = () => {
  return null; // No need to render anything here since the Snackbar is rendered in the provider
};

export default AlertManager;