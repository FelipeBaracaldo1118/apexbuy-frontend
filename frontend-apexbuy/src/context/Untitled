// ============================================================================
// AUTH CONTEXT
// ============================================================================
// Context para manejar el estado de autenticación del usuario
// ============================================================================

import { createContext, useContext, useState, useEffect } from 'react';
import * as authService from '../services/auth';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFirstTime, setIsFirstTime] = useState(false);

  // Cargar usuario al montar el componente
  useEffect(() => {
    const initAuth = () => {
      const currentUser = authService.getCurrentUser();
      const firstTime = authService.isFirstTime();
      
      setUser(currentUser);
      setIsFirstTime(firstTime);
      setLoading(false);
    };

    initAuth();
  }, []);

  // Login
  const login = async (email, password) => {
    try {
      const { user: loggedUser } = await authService.login(email, password);
      setUser(loggedUser);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.message 
      };
    }
  };

  // Register
  const register = async (name, email, password) => {
    try {
      const { user: registeredUser } = await authService.register(name, email, password);
      setUser(registeredUser);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error.message 
      };
    }
  };

  // Logout
  const logout = () => {
    authService.logout();
    setUser(null);
  };

  // Marcar tutorial como visto
  const markTutorialSeen = () => {
    authService.markTutorialSeen();
    setIsFirstTime(false);
  };

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    isFirstTime,
    login,
    register,
    logout,
    markTutorialSeen,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};