// ============================================================================
// AUTH SERVICE - CON MOCK AUTH ACTIVADO
// ============================================================================

import api from './api';

// ============================================================================
// MOCK AUTH (para desarrollo sin backend)
// ============================================================================

const USE_MOCK = true; // ← Cambiar a false cuando conectes backend real

/**
 * Login de usuario (MOCK)
 */
const loginMock = async (email, password) => {
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

  throw new Error('Credenciales inválidas. Usa: admin@apexbuy.com / admin123');
};

/**
 * Register de usuario (MOCK)
 */
const registerMock = async (name, email, password) => {
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

// ============================================================================
// FUNCIONES REALES (para backend real)
// ============================================================================

const loginReal = async (email, password) => {
  try {
    const response = await api.post('/api/auth/login', {
      email,
      password,
    });

    const { token, user } = response.data;

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    return { token, user };
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Error al iniciar sesión'
    );
  }
};

const registerReal = async (name, email, password) => {
  try {
    const response = await api.post('/api/auth/register', {
      name,
      email,
      password,
    });

    const { token, user } = response.data;

    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));

    return { token, user };
  } catch (error) {
    throw new Error(
      error.response?.data?.message || 'Error al registrarse'
    );
  }
};

// ============================================================================
// EXPORTS - Usa Mock o Real según USE_MOCK
// ============================================================================

export const login = USE_MOCK ? loginMock : loginReal;
export const register = USE_MOCK ? registerMock : registerReal;

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
 */
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  return !!token;
};

/**
 * Obtener usuario actual del localStorage
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
 */
export const getToken = () => {
  return localStorage.getItem('token');
};

/**
 * Verificar si es primera vez que el usuario usa la app
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