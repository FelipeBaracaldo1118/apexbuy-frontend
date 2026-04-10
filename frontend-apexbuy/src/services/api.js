// ============================================================================
// API SERVICE - AXIOS CONFIGURATION
// ============================================================================
// Servicio centralizado para todas las llamadas HTTP al backend
// ============================================================================

import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Crear instancia de Axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 segundos
});

// Interceptor para agregar token en cada request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para manejar respuestas y errores
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado o inválido
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ============================================================================
// ANÁLISIS - ENDPOINTS
// ============================================================================

export const analysisAPI = {
  // Obtener todas las oportunidades
  getOpportunities: () => api.get('/api/analysis/opportunities'),

  // Obtener oportunidades filtradas
  getOpportunitiesFiltered: (params) => 
    api.get('/api/analysis/opportunities/filtered', { params }),

  // Obtener estadísticas globales
  getStats: () => api.get('/api/analysis/stats'),

  // Obtener historial de precio de un producto
  getPriceHistory: (productId, limit = 30) => 
    api.get(`/api/analysis/product/${productId}/history`, { params: { limit } }),

  // Obtener cambios de precio
  getPriceChanges: (productId, threshold = 5) => 
    api.get(`/api/analysis/product/${productId}/changes`, { params: { threshold } }),

  // Obtener análisis de grupo
  getGroupAnalysis: (groupId) => 
    api.get(`/api/analysis/group/${groupId}`),
};

// ============================================================================
// ACTUALIZACIÓN - ENDPOINTS
// ============================================================================

export const updateAPI = {
  // Actualizar todos los proveedores
  updateAllProviders: () => api.get('/api/update/all-providers'),

  // Actualizar proveedor específico
  updateBose: () => api.get('/api/update/bose'),
  updateSamsung: () => api.get('/api/update/samsung'),
  updateKtronix: () => api.get('/api/update/ktronix'),
  updateMansion: () => api.get('/api/update/mansion'),
  updateFalabella: () => api.get('/api/update/falabella'),
};

// ============================================================================
// PRODUCTOS - ENDPOINTS (futuros)
// ============================================================================

export const productsAPI = {
  // Obtener todos los productos
  getAll: () => api.get('/api/products'),

  // Obtener producto por ID
  getById: (id) => api.get(`/api/products/${id}`),

  // Buscar productos
  search: (query) => api.get('/api/products/search', { params: { q: query } }),
};

// ============================================================================
// GRUPOS - ENDPOINTS (futuros)
// ============================================================================

export const groupsAPI = {
  // Obtener todos los grupos
  getAll: () => api.get('/api/groups'),

  // Obtener grupo por ID
  getById: (id) => api.get(`/api/groups/${id}`),
};

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

export default api;