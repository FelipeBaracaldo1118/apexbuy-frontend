// ============================================================================
// AUTH SERVICE
// ============================================================================
// Servicio de autenticación con JWT
// ============================================================================

import api from './api';

// ============================================================================
// FUNCIONES DE AUTENTICACIÓN
// ============================================================================

/**
 * Login de usuario
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise} User data + token
 */
export const login = async (email, password) => {
  try {
    const response = await api.post('/api/auth/login', {
      email,
      password,
    });

    const { token, user } = response.data;

    // Guardar token y usuario en localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    return { token, user };
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Error al iniciar sesión'
    );
  }
};

/**
 * Registro de nuevo usuario
 * @param {string} name 
 * @param {string} email 
 * @param {string} password 
 * @returns {Promise} User data + token
 */
export const register = async (name, email, password) => {
  try {
    const response = await api.post('/api/auth/register', {
      name,
      email,
      password,
    });

    const { token, user } = response.data;

    // Guardar token y usuario en localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    return { token, user };
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Error al registrarse'
    );
  }
};

/**
 * Logout de usuario
 */
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

/**
 * Verificar si el usuario está autenticado
 * @returns {boolean}
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

/**
 * Obtener usuario actual del localStorage
 * @returns {Object|null}
 */
export const getCurrentUser = () => {
  const userStr = localStorage.getItem('user');
  if (!userStr) return null;
  
  try {
    return JSON.parse(userStr);
  } catch (error) {
    console.error('Error parsing user from localStorage:', error);
    return null;
  }
};

/**
 * Obtener token del localStorage
 * @returns {string|null}
 */
export const getToken = () => {
  return localStorage.getItem('token');
};

/**
 * Verificar si es primera vez que el usuario usa la app
 * @returns {boolean}
 */
export const isFirstTime = () => {
  return !localStorage.getItem('hasSeenTutorial');
};

/**
 * Marcar que el usuario ya vio el tutorial
 */
export const markTutorialSeen = () => {
  localStorage.setItem('hasSeenTutorial', 'true');
};

// ============================================================================
// MOCK AUTH (para desarrollo sin backend de auth)
// ============================================================================
// Descomenta estas funciones si quieres probar sin backend real

/*
export const loginMock = async (email, password) => {
  // Simular delay de red
  await new Promise(resolve => setTimeout(resolve, 1000));

  if (email === 'admin@apexbuy.com' && password === 'admin123') {
    const mockUser = {
      id: '1',
      name: 'Admin ApexBuy',
      email: 'admin@apexbuy.com',
      role: 'admin',
    };
    
    const mockToken = 'mock-jwt-token-' + Date.now();

    localStorage.setItem('token', mockToken);
    localStorage.setItem('user', JSON.stringify(mockUser));

    return { token: mockToken, user: mockUser };
  }

  throw new Error('Credenciales inválidas');
};

export const registerMock = async (name, email, password) => {
  await new Promise(resolve => setTimeout(resolve, 1000));

  const mockUser = {
    id: Date.now().toString(),
    name,
    email,
    role: 'user',
  };
  
  const mockToken = 'mock-jwt-token-' + Date.now();

  localStorage.setItem('token', mockToken);
  localStorage.setItem('user', JSON.stringify(mockUser));

  return { token: mockToken, user: mockUser };
};
*/