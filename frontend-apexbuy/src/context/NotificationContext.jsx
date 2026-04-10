// ============================================================================
// NOTIFICATION CONTEXT
// ============================================================================
// Context para manejar notificaciones con react-hot-toast
// ============================================================================

import { createContext, useContext } from 'react';
import toast, { Toaster } from 'react-hot-toast';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  // Success notification
  const success = (message) => {
    toast.success(message, {
      duration: 3000,
      position: 'top-right',
      style: {
        background: 'var(--success)',
        color: 'white',
      },
      iconTheme: {
        primary: 'white',
        secondary: 'var(--success)',
      },
    });
  };

  // Error notification
  const error = (message) => {
    toast.error(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: 'var(--error)',
        color: 'white',
      },
      iconTheme: {
        primary: 'white',
        secondary: 'var(--error)',
      },
    });
  };

  // Info notification
  const info = (message) => {
    toast(message, {
      duration: 3000,
      position: 'top-right',
      icon: 'ℹ️',
      style: {
        background: 'var(--info)',
        color: 'white',
      },
    });
  };

  // Warning notification
  const warning = (message) => {
    toast(message, {
      duration: 3000,
      position: 'top-right',
      icon: '⚠️',
      style: {
        background: 'var(--warning)',
        color: 'white',
      },
    });
  };

  // Loading notification
  const loading = (message) => {
    return toast.loading(message, {
      position: 'top-right',
    });
  };

  // Dismiss notification
  const dismiss = (toastId) => {
    toast.dismiss(toastId);
  };

  // Promise notification (para operaciones async)
  const promise = (promise, messages) => {
    return toast.promise(
      promise,
      {
        loading: messages.loading || 'Cargando...',
        success: messages.success || '¡Éxito!',
        error: messages.error || 'Error',
      },
      {
        position: 'top-right',
      }
    );
  };

  const value = {
    success,
    error,
    info,
    warning,
    loading,
    dismiss,
    promise,
  };

  return (
    <NotificationContext.Provider value={value}>
      <Toaster 
        position="top-right"
        reverseOrder={false}
        gutter={8}
        toastOptions={{
          duration: 3000,
          style: {
            borderRadius: 'var(--border-radius-md)',
            fontFamily: 'var(--font-family)',
          },
        }}
      />
      {children}
    </NotificationContext.Provider>
  );
};