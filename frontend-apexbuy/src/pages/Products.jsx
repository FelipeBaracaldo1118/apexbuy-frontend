// ============================================================================
// PRODUCTS PAGE
// ============================================================================
// Catálogo completo de productos con búsqueda y filtros
// ============================================================================

import { useEffect, useState } from 'react';
import { analysisAPI } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { exportToExcel, formatOpportunitiesForExport } from '../utils/exportUtils';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import './Products.css';

const Products = () => {
  const { success, error: showError } = useNotification();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSource, setFilterSource] = useState('all');
  const [filterMargin, setFilterMargin] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    loadProducts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filterSource, filterMargin, products]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const { data } = await analysisAPI.getOpportunities();
      setProducts(data || []);
    } catch (error) {
      console.error('Error cargando productos:', error);
      showError('Error cargando catálogo de productos');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...products];

    // Filtrar por búsqueda
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.producto.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtrar por fuente
    if (filterSource !== 'all') {
      filtered = filtered.filter(product => product.fuente === filterSource);
    }

    // Filtrar por margen
    if (filterMargin !== 'all') {
      if (filterMargin === 'high') {
        filtered = filtered.filter(product => parseFloat(product.margen_porcentaje) >= 25);
      } else if (filterMargin === 'medium') {
        filtered = filtered.filter(product => 
          parseFloat(product.margen_porcentaje) >= 15 && 
          parseFloat(product.margen_porcentaje) < 25
        );
      } else if (filterMargin === 'low') {
        filtered = filtered.filter(product => parseFloat(product.margen_porcentaje) < 15);
      }
    }

    setFilteredProducts(filtered);
  };

  const handleExportProducts = () => {
    try {
      const dataToExport = formatOpportunitiesForExport(filteredProducts);
      exportToExcel(dataToExport, `productos-${new Date().toISOString().split('T')[0]}`);
      success('Productos exportados exitosamente');
    } catch (error) {
      showError('Error al exportar productos');
    }
  };

  const handleViewDetails = (product) => {
    setSelectedProduct(product);
  };

  const closeModal = () => {
    setSelectedProduct(null);
  };

  const getMarginClass = (margin) => {
    const marginNum = parseFloat(margin);
    if (marginNum >= 25) return 'high';
    if (marginNum >= 15) return 'medium';
    return 'low';
  };

  const getSourcesCount = () => {
    return [...new Set(products.map(p => p.fuente))].length;
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <Header />
        <div className="dashboard-body">
          <Sidebar />
          <main className="dashboard-main">
            <div className="products-loading">
              <div className="spinner"></div>
              <p>Cargando catálogo...</p>
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
            <div className="products-header">
              <div>
                <h1>Catálogo de Productos</h1>
                <p className="products-subtitle">
                  {filteredProducts.length} productos de {getSourcesCount()} fuentes
                </p>
              </div>
              <div className="products-actions">
                <button className="btn-secondary" onClick={handleExportProducts}>
                  📊 Exportar Catálogo
                </button>
              </div>
            </div>

            {/* Stats Summary */}
            <div className="products-stats">
              <div className="products-stat">
                <span className="stat-value">{products.length}</span>
                <span className="stat-label">Total Productos</span>
              </div>
              <div className="products-stat">
                <span className="stat-value">
                  {products.filter(p => parseFloat(p.margen_porcentaje) >= 25).length}
                </span>
                <span className="stat-label">Alto Margen (≥25%)</span>
              </div>
              <div className="products-stat">
                <span className="stat-value">
                  {products.filter(p => parseFloat(p.margen_porcentaje) < 15).length}
                </span>
                <span className="stat-label">Bajo Margen (&lt;15%)</span>
              </div>
              <div className="products-stat">
                <span className="stat-value">{getSourcesCount()}</span>
                <span className="stat-label">Fuentes Activas</span>
              </div>
            </div>

            {/* Filters */}
            <div className="products-filters">
              <input
                type="text"
                placeholder="🔍 Buscar productos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="filter-search"
              />
              <select
                value={filterSource}
                onChange={(e) => setFilterSource(e.target.value)}
                className="filter-select"
              >
                <option value="all">Todas las Fuentes</option>
                <option value="Bose">Bose</option>
                <option value="Samsung">Samsung</option>
                <option value="Ktronix">Ktronix</option>
                <option value="Mansion">Mansion</option>
                <option value="Falabella">Falabella</option>
              </select>
              <select
                value={filterMargin}
                onChange={(e) => setFilterMargin(e.target.value)}
                className="filter-select"
              >
                <option value="all">Todos los Márgenes</option>
                <option value="high">Alto (≥25%)</option>
                <option value="medium">Medio (15-25%)</option>
                <option value="low">Bajo (&lt;15%)</option>
              </select>
            </div>

            {/* Products Grid */}
            <div className="products-grid">
              {filteredProducts.length === 0 ? (
                <div className="products-empty">
                  <p>No se encontraron productos</p>
                </div>
              ) : (
                filteredProducts.map((product, index) => (
                  <div key={index} className="product-card">
                    <div className="product-header">
                      <h3>{product.producto}</h3>
                      <span className={`margin-badge ${getMarginClass(product.margen_porcentaje)}`}>
                        {product.margen_porcentaje}%
                      </span>
                    </div>
                    
                    <div className="product-details">
                      <div className="product-detail-row">
                        <span className="detail-label">Precio Compra:</span>
                        <span className="detail-value">
                          ${product.precio_compra.toLocaleString('es-CO')}
                        </span>
                      </div>
                      <div className="product-detail-row">
                        <span className="detail-label">Precio Competencia:</span>
                        <span className="detail-value">
                          ${product.precio_competencia.toLocaleString('es-CO')}
                        </span>
                      </div>
                      <div className="product-detail-row">
                        <span className="detail-label">Ganancia:</span>
                        <span className="detail-value success">
                          ${product.ganancia.toLocaleString('es-CO')}
                        </span>
                      </div>
                      <div className="product-detail-row">
                        <span className="detail-label">Fuente:</span>
                        <span className="detail-value">
                          <span className="source-badge">{product.fuente}</span>
                        </span>
                      </div>
                    </div>

                    <div className="product-decision">
                      <span className={`decision-badge ${
                        product.decision.includes('OPORTUNIDAD') ? 'opportunity' : 
                        product.decision.includes('NO CONVIENE') ? 'no-buy' : 'neutral'
                      }`}>
                        {product.decision}
                      </span>
                    </div>

                    <button 
                      className="btn-secondary btn-full"
                      onClick={() => handleViewDetails(product)}
                    >
                      Ver Detalles
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Modal de Detalles */}
      {selectedProduct && (
        <>
          <div className="modal-backdrop" onClick={closeModal}></div>
          <div className="modal">
            <div className="modal-header">
              <h2>{selectedProduct.producto}</h2>
              <button className="modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="modal-body">
              <div className="modal-section">
                <h3>Información de Precios</h3>
                <div className="modal-grid">
                  <div className="modal-item">
                    <span className="modal-label">Precio de Compra</span>
                    <span className="modal-value">
                      ${selectedProduct.precio_compra.toLocaleString('es-CO')}
                    </span>
                  </div>
                  <div className="modal-item">
                    <span className="modal-label">Precio Competencia</span>
                    <span className="modal-value">
                      ${selectedProduct.precio_competencia.toLocaleString('es-CO')}
                    </span>
                  </div>
                  <div className="modal-item">
                    <span className="modal-label">Ganancia</span>
                    <span className="modal-value success">
                      ${selectedProduct.ganancia.toLocaleString('es-CO')}
                    </span>
                  </div>
                  <div className="modal-item">
                    <span className="modal-label">Margen</span>
                    <span className={`modal-value ${getMarginClass(selectedProduct.margen_porcentaje)}`}>
                      {selectedProduct.margen_porcentaje}%
                    </span>
                  </div>
                </div>
              </div>

              <div className="modal-section">
                <h3>Información de Fuente</h3>
                <div className="modal-grid">
                  <div className="modal-item">
                    <span className="modal-label">Proveedor</span>
                    <span className="modal-value">{selectedProduct.fuente}</span>
                  </div>
                  <div className="modal-item">
                    <span className="modal-label">Decisión</span>
                    <span className={`decision-badge ${
                      selectedProduct.decision.includes('OPORTUNIDAD') ? 'opportunity' : 
                      selectedProduct.decision.includes('NO CONVIENE') ? 'no-buy' : 'neutral'
                    }`}>
                      {selectedProduct.decision}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Products;