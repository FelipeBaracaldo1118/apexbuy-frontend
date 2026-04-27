import React, { useState, useEffect } from 'react';
import apiService from '../services/api';
import ProductCompetitorModal from '../components/products/ProductCompetitorModal';
import './Products.css';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    source: 'all',
    margin: 'all',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await apiService.analysis.getCompetitorsDetail();
      setProducts(response.data || response);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price) => {
    return `$${Math.round(price).toLocaleString('es-CO')}`;
  };

  // Aplicar filtros
  const filteredProducts = products.filter(product => {
    // Búsqueda
    if (filters.search && !product.producto.toLowerCase().includes(filters.search.toLowerCase())) {
      return false;
    }

    // Fuente
    if (filters.source !== 'all' && product.fuente !== filters.source) {
      return false;
    }

    // Margen
    if (filters.margin === 'high' && product.margen_promedio < 25) {
      return false;
    }
    if (filters.margin === 'low' && product.margen_promedio >= 15) {
      return false;
    }

    return true;
  });

  // Stats
  const stats = {
    total: filteredProducts.length,
    highMargin: filteredProducts.filter(p => p.margen_promedio >= 25).length,
    lowMargin: filteredProducts.filter(p => p.margen_promedio < 15).length,
    sources: [...new Set(filteredProducts.map(p => p.fuente))].length,
  };

  if (loading) {
    return (
      <div className="products-container">
        <div className="loading">Cargando productos...</div>
      </div>
    );
  }

  return (
    <div className="products-container">
      <div className="products-header">
        <div>
          <h1>Catálogo de Productos</h1>
          <p>{products.length} productos de {stats.sources} fuentes</p>
        </div>
        <button className="btn-primary" onClick={fetchProducts}>
          📊 Exportar Catálogo
        </button>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stats-card">
          <div className="stat-number">{stats.total}</div>
          <div className="stat-label">TOTAL PRODUCTOS</div>
        </div>
        <div className="stats-card">
          <div className="stat-number">{stats.highMargin}</div>
          <div className="stat-label">ALTO MARGEN (≥25%)</div>
        </div>
        <div className="stats-card">
          <div className="stat-number">{stats.lowMargin}</div>
          <div className="stat-label">BAJO MARGEN (&lt;15%)</div>
        </div>
        <div className="stats-card">
          <div className="stat-number">{stats.sources}</div>
          <div className="stat-label">FUENTES ACTIVAS</div>
        </div>
      </div>

      {/* Filtros */}
      <div className="filters-container">
        <input
          type="text"
          className="filter-search"
          placeholder="🔍 Buscar productos..."
          value={filters.search}
          onChange={(e) => setFilters({ ...filters, search: e.target.value })}
        />

        <select
          className="filter-select"
          value={filters.source}
          onChange={(e) => setFilters({ ...filters, source: e.target.value })}
        >
          <option value="all">Todas las Fuentes</option>
          {[...new Set(products.map(p => p.fuente))].map(source => (
            <option key={source} value={source}>{source}</option>
          ))}
        </select>

        <select
          className="filter-select"
          value={filters.margin}
          onChange={(e) => setFilters({ ...filters, margin: e.target.value })}
        >
          <option value="all">Todos los Márgenes</option>
          <option value="high">Alto Margen (≥25%)</option>
          <option value="low">Bajo Margen (&lt;15%)</option>
        </select>
      </div>

      {/* Products Grid */}
      <div className="products-grid">
        {filteredProducts.map((product, index) => (
          <div key={index} className="product-card">
            {/* Imagen */}
            {product.imagen && (
              <div className="product-image">
                <img src={product.imagen} alt={product.producto} />
              </div>
            )}

            {/* Info */}
            <div className="product-info">
              <h3>{product.producto}</h3>
              <p className="product-source">Fuente: {product.fuente}</p>

              <div className="product-prices">
                <div className="price-item">
                  <span className="price-label">Precio Compra:</span>
                  <span className="price-value">{formatPrice(product.precio_compra)}</span>
                </div>
                <div className="price-item">
                  <span className="price-label">Precio Venta Sugerido:</span>
                  <span className="price-value">{formatPrice(product.precio_promedio)}</span>
                </div>
                <div className="price-item">
                  <span className="price-label">Ganancia Estimada:</span>
                  <span className="price-value success">{formatPrice(product.ganancia_promedio)}</span>
                </div>
              </div>

              {/* Margen badge */}
              <div className={`margin-badge ${product.margen_promedio >= 25 ? 'high' : 'low'}`}>
                {product.margen_promedio}% Margen
              </div>

              {/* Indicador de oportunidad */}
              {product.margen_promedio >= 20 && (
                <div className="opportunity-badge">
                  ✅ OPORTUNIDAD
                </div>
              )}

              {/* Botón análisis */}
              <button
                className="btn-analysis"
                onClick={() => setSelectedProduct(product)}
              >
                📊 Ver Análisis Detallado
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="empty-state">
          <p>No hay productos que coincidan con los filtros</p>
        </div>
      )}

      {/* Modal */}
      {selectedProduct && (
        <ProductCompetitorModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
};

export default Products;