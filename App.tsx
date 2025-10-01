import React, { useState, useCallback } from 'react';
import { LoginPage } from './components/LoginPage';
import { FormPage } from './components/FormPage';
import { Toast } from './components/Toast';
import { ThankYouPage } from './components/ThankYouPage';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleLoginSuccess = useCallback(() => {
    setIsAuthenticated(true);
    setToast({ message: 'Login successful!', type: 'success' });
  }, []);

  const handleFormSuccess = useCallback(() => {
    setIsSubmitted(true);
  }, []);

  const handleReset = useCallback(() => {
    setIsSubmitted(false);
  }, []);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
  };
  
  const renderContent = () => {
    if (!isAuthenticated) {
      return <LoginPage onLoginSuccess={handleLoginSuccess} />;
    }
    if (isSubmitted) {
      return <ThankYouPage onReset={handleReset} />;
    }
    return <FormPage showToast={showToast} onFormSuccess={handleFormSuccess} />;
  }

  return (
    <>
      {renderContent()}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </>
  );
};

export default App;
