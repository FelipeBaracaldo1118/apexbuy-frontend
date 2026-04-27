// ============================================================================
// HISTORY PAGE - REDISEÑO UX MEJORADO
// ============================================================================
// Muestra 1 card por producto con último cambio
// Modal con gráfica completa al hacer click en "Ver detalles"
// ============================================================================

import { useEffect, useState } from 'react';
import { analysisAPI } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { exportToExcel } from '../utils/exportUtils';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import ProductHistoryModal from '../components/history/ProductHistoryModal';
import './History.css';

const History = () => {
  const { success, error: showError } = useNotification();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSource, setFilterSource] = useState('all');
  const [viewMode, setViewMode] = useState('list');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filterSource, searchTerm, products]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const { data } = await analysisAPI.getOpportunities();
      
      // Generar historial por producto
      const productsWithHistory = generateProductHistory(data);
      
      setProducts(productsWithHistory);
    } catch (error) {
      console.error('Error cargando productos:', error);
      showError('Error cargando historial de productos');
    } finally {
      setLoading(false);
    }
  };

  const generateProductHistory = (opportunities) => {
    if (!opportunities || opportunities.length === 0) return [];

    const productsMap = new Map();

    opportunities.forEach((product, index) => {
      const productKey = product.producto;

      if (!productsMap.has(productKey)) {
        // Generar historial simulado para este producto (últimos 30 días)
        const history = generateHistoryForProduct(product);
        
        // Último cambio
        const latestChange = history[0];

        productsMap.set(productKey, {
          id: `product-${index}`,
          producto: product.producto,
          fuente: product.fuente || 'Desconocido',
          imagen: product.imagen || product.image || product.img || null,
          currentPrice: product.precio_compra,
          latestChange: latestChange,
          history: history, // Historial completo para el modal
        });
      }
    });

    return Array.from(productsMap.values());
  };

  const generateHistoryForProduct = (product) => {
    const history = [];
    const now = new Date();
    const systems = ['Algoritmo de Precios v4', 'Regla de Margen Crítico', 'Usuario: Admin'];

    // Precio actual del producto
    const currentPrice = product.precio_compra;
    
    // Generar historial de 15 cambios secuenciales hacia atrás en el tiempo
    let runningPrice = currentPrice;
    
    for (let i = 0; i < 15; i++) {
      // Fecha secuencial: más reciente primero
      const daysAgo = i * 2; // Cada cambio es 2 días atrás
      const date = new Date(now);
      date.setDate(date.getDate() - daysAgo);
      
      // Para el cambio más reciente (i=0), usar precio actual
      if (i === 0) {
        // Generar un precio anterior aleatorio
        const variation = 0.92 + Math.random() * 0.16; // -8% a +8%
        const previousPrice = Math.round(currentPrice / variation);
        const change = ((currentPrice - previousPrice) / previousPrice * 100).toFixed(1);
        const changeNum = parseFloat(change);
        
        history.push({
          date: date,
          previousPrice: previousPrice,
          currentPrice: currentPrice,
          change: changeNum,
          type: changeNum > 0 ? 'bad' : 'good',
          system: systems[Math.floor(Math.random() * systems.length)],
        });
        
        runningPrice = previousPrice;
      } else {
        // Para cambios históricos, generar secuencialmente
        const variation = 0.92 + Math.random() * 0.16; // -8% a +8%
        const newPrice = Math.round(runningPrice * variation);
        const change = ((runningPrice - newPrice) / newPrice * 100).toFixed(1);
        const changeNum = parseFloat(change);
        
        history.push({
          date: date,
          previousPrice: newPrice,
          currentPrice: runningPrice,
          change: changeNum,
          type: changeNum > 0 ? 'bad' : 'good',
          system: systems[Math.floor(Math.random() * systems.length)],
        });
        
        runningPrice = newPrice;
      }
    }

    // Ya está ordenado de más reciente a más antiguo
    return history;
  };

  const applyFilters = () => {
    let filtered = [...products];

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.producto.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterSource !== 'all') {
      filtered = filtered.filter(item => item.fuente === filterSource);
    }

    setFilteredProducts(filtered);
  };

  const handleViewDetails = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleExport = () => {
    try {
      const dataToExport = filteredProducts.map(product => ({
        'Producto': product.producto,
        'Fuente': product.fuente,
        'Precio Actual': product.currentPrice,
        'Último Cambio': `${product.latestChange.change > 0 ? '+' : ''}${product.latestChange.change}%`,
        'Fecha Último Cambio': product.latestChange.date.toLocaleDateString('es-CO'),
        'Total Actualizaciones': product.history.length,
      }));

      exportToExcel(dataToExport, `historial-productos-${new Date().toISOString().split('T')[0]}`);
      success('Historial exportado exitosamente');
    } catch (err) {
      showError('Error al exportar historial');
    }
  };

  const formatDate = (date) => {
    const now = new Date();
    const diffTime = now - date;
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Hoy ' + date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' });
    } else if (diffDays === 1) {
      return 'Ayer';
    } else if (diffDays < 7) {
      return `Hace ${diffDays} días`;
    } else {
      return date.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
    }
  };

  const getStats = () => {
    const totalUpdates = products.reduce((sum, p) => sum + p.history.length, 0);
    const increments = products.filter(p => p.latestChange.change > 0).length;
    const decrements = products.filter(p => p.latestChange.change < 0).length;
    
    const avgChange = products.length > 0
      ? (products.reduce((sum, p) => sum + p.latestChange.change, 0) / products.length).toFixed(1)
      : 0;

    return { totalUpdates, increments, decrements, avgChange };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="dashboard-container">
        <Header />
        <div className="dashboard-body">
          <Sidebar />
          <main className="dashboard-main">
            <div className="history-loading">
              <div className="spinner"></div>
              <p>Cargando historial...</p>
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Header />
      <div className="dashboard-body">
        <Sidebar />
        <main className="dashboard-main">
          <div className="dashboard-content">
            {/* Header */}
            <div className="history-header">
              <div>
                <h1>Historial de Productos</h1>
                <p className="history-subtitle">
                  Seguimiento de {products.length} productos con {stats.totalUpdates} actualizaciones totales
                </p>
              </div>
              <div className="history-actions">
                <button className="btn-secondary" onClick={handleExport}>
                  📤 Exportar Reporte
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="history-stats-new">
              <div className="history-stat-card">
                <div className="stat-icon neutral">📦</div>
                <div className="stat-info">
                  <span className="stat-label">PRODUCTOS</span>
                  <span className="stat-value">{products.length}</span>
                  <span className="stat-sublabel">CON HISTORIAL</span>
                </div>
              </div>

              <div className="history-stat-card">
                <div className="stat-icon bad">📈</div>
                <div className="stat-info">
                  <span className="stat-label">ÚLTIMOS CAMBIOS</span>
                  <span className="stat-value bad">{stats.increments}</span>
                  <span className="stat-sublabel">INCREMENTOS</span>
                </div>
              </div>

              <div className="history-stat-card">
                <div className="stat-icon good">📉</div>
                <div className="stat-info">
                  <span className="stat-label">ÚLTIMOS CAMBIOS</span>
                  <span className="stat-value good">{stats.decrements}</span>
                  <span className="stat-sublabel">DECREMENTOS</span>
                </div>
              </div>

              <div className="history-stat-card">
                <div className="stat-icon">●</div>
                <div className="stat-info">
                  <span className="stat-label">PROMEDIO</span>
                  <span className={`stat-value ${parseFloat(stats.avgChange) > 0 ? 'bad' : 'good'}`}>
                    {stats.avgChange}%
                  </span>
                  <span className="stat-sublabel">VARIACIÓN</span>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="history-filters-new">
              <input
                type="text"
                placeholder="🔍 Buscar producto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="filter-search"
              />

              <select
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
                className="filter-select"
              >
                <option value="all">📁 Todas las Fuentes</option>
                <option value="Bose">Bose</option>
                <option value="Samsung">Samsung</option>
                <option value="Ktronix">Ktronix</option>
                <option value="Mansion">Mansion</option>
                <option value="Falabella">Falabella</option>
              </select>

              <div className="view-toggle">
                <button
                  className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  title="Vista lista"
                >
                  ☰
                </button>
                <button
                  className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  title="Vista grid"
                >
                  ▦
                </button>
              </div>
            </div>

            {/* Products List */}
            <div className={`updates-container ${viewMode}`}>
              {filteredProducts.length === 0 ? (
                <div className="history-empty">
                  <p>No hay productos que coincidan con los filtros</p>
                  <p className="empty-hint">Prueba cambiando los filtros o la búsqueda</p>
                </div>
              ) : (
                filteredProducts.map((product) => (
                  <div key={product.id} className="update-card">
                    {/* Imagen */}
                    <div className="update-image">
                      <div className="product-placeholder">
                        {product.imagen ? (
                          <img 
                            src={product.imagen} 
                            alt={product.producto}
                            className="product-img"
                            onError={(e) => {
                              e.target.style.display = 'none';
                              e.target.nextSibling.style.display = 'flex';
                            }}
                          />
                        ) : null}
                        <span className="product-letter" style={{ display: product.imagen ? 'none' : 'flex' }}>
                          {product.fuente.charAt(0)}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="update-content">
                      <div className="update-header-section">
                        <div className="update-title-group">
                          <h3 className="update-product-name">{product.producto}</h3>
                          <span className="update-sku">Fuente: {product.fuente}</span>
                        </div>
                        <span className={`update-badge-pill ${product.latestChange.type}`}>
                          {product.latestChange.change > 0 ? 'INCREMENTO' : 
                           product.latestChange.change < -5 ? 'AJUSTE COMPETITIVO' : 
                           'AJUSTE MENOR'}
                        </span>
                      </div>

                      <div className="update-price-section">
                        <div className={`price-change-indicator ${product.latestChange.type}`}>
                          <span className="change-icon">
                            {product.latestChange.change > 0 ? '↑' : '↓'}
                          </span>
                          <span className="change-percentage">
                            {Math.abs(product.latestChange.change)}%
                          </span>
                        </div>

                        <div className="price-evolution-box">
                          <span className="evolution-label">ÚLTIMO CAMBIO</span>
                          <div className="price-flow">
                            <span className="price-before">
                              ${Math.round(product.latestChange.previousPrice).toLocaleString('es-CO')}
                            </span>
                            <span className="price-separator">→</span>
                            <span className="price-after">
                              ${Math.round(product.currentPrice).toLocaleString('es-CO')}
                            </span>
                          </div>
                        </div>

                        <div className="update-metadata">
                          <div className="meta-item">
                            <span className="meta-time">
                              {formatDate(product.latestChange.date)}
                            </span>
                          </div>
                          <div className="meta-item">
                            <span className="meta-system">
                              {product.history.length} actualizaciones
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="update-actions">
                        <button 
                          className="btn-view-details"
                          onClick={() => handleViewDetails(product)}
                        >
                          <span>📊</span> Ver historial completo
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Modal de Detalles */}
      {showModal && selectedProduct && (
        <ProductHistoryModal
          product={selectedProduct}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  );
};

export default History;