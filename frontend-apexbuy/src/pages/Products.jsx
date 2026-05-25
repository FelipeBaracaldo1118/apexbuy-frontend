// ============================================================================
// PRODUCTS PAGE — Cards compactas + Modal con tabla de competidores
// ============================================================================

import { useEffect, useState, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { analysisAPI } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import './Products.css';

// ── URLs de scraping por fuente (para validación externa) ─────────────────────
const SOURCE_URLS = {
  'Ktronix':                 'https://www.ktronix.com',
  'Mansion Electrodomesticos': 'https://www.grupomansion.com',
  'Falabella':               'https://www.falabella.com.co',
  'Bose':                    'https://bose.co',
  'Samsung':                 'https://www.samsung.com/co',
};

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatCOP = (v) => '$' + Math.round(Number(v) || 0).toLocaleString('es-CO');

const getMarginClass = (m) => {
  const n = parseFloat(m);
  if (n >= 25) return 'high';
  if (n >= 15) return 'medium';
  return 'low';
};

const getDecisionClass = (d = '') => {
  if (d.includes('OPORTUNIDAD')) return 'opportunity';
  if (d.includes('NO CONVIENE'))  return 'no-buy';
  return 'neutral';
};

// ─────────────────────────────────────────────────────────────────────────────

const Products = () => {
  const { error: showError } = useNotification();
  const location = useLocation();
  const [products, setProducts]                   = useState([]);
  const [filteredProducts, setFilteredProducts]   = useState([]);
  const [loading, setLoading]                     = useState(true);
  const [searchTerm, setSearchTerm]               = useState('');
  const [filterSource, setFilterSource]           = useState('all');
  const [filterMargin, setFilterMargin]           = useState('all');
  const [filterDecision, setFilterDecision]       = useState('all');
  const [sortBy, setSortBy]                       = useState('margen_desc');
  const [selectedProduct, setSelectedProduct]     = useState(null);

  useEffect(() => { loadProducts(); }, []);
  useEffect(() => { applyFilters(); }, [searchTerm, filterSource, filterMargin, filterDecision, sortBy, products]);

  // Auto-abrir modal si viene query param ?open=nombre desde el dashboard
  useEffect(() => {
    if (products.length === 0) return;
    const params = new URLSearchParams(location.search);
    const openName = params.get('open');
    if (openName) {
      const match = products.find(p =>
        (p.producto || '').toLowerCase() === decodeURIComponent(openName).toLowerCase()
      );
      if (match) setSelectedProduct(match);
    }
  }, [products, location.search]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      // Usar endpoint con detalle de competidores
      const { data } = await analysisAPI.getOpportunitiesDetail();
      setProducts(data || []);
    } catch (error) {
      console.error('Error:', error);
      showError('Error cargando catálogo');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = useCallback(() => {
    let f = [...products];
    if (searchTerm) f = f.filter(p => (p.producto||'').toLowerCase().includes(searchTerm.toLowerCase()));
    if (filterSource !== 'all') f = f.filter(p => p.fuente === filterSource);
    if (filterMargin === 'high')   f = f.filter(p => parseFloat(p.margen_porcentaje) >= 25);
    if (filterMargin === 'medium') f = f.filter(p => parseFloat(p.margen_porcentaje) >= 15 && parseFloat(p.margen_porcentaje) < 25);
    if (filterMargin === 'low')    f = f.filter(p => parseFloat(p.margen_porcentaje) < 15);
    if (filterDecision === 'opportunity') f = f.filter(p => p.decision?.includes('OPORTUNIDAD'));
    if (filterDecision === 'no-buy')      f = f.filter(p => p.decision?.includes('NO CONVIENE'));

    f.sort((a, b) => {
      if (sortBy === 'margen_desc') return parseFloat(b.margen_porcentaje) - parseFloat(a.margen_porcentaje);
      if (sortBy === 'margen_asc')  return parseFloat(a.margen_porcentaje) - parseFloat(b.margen_porcentaje);
      if (sortBy === 'ganancia')    return Number(b.ganancia) - Number(a.ganancia);
      if (sortBy === 'nombre')      return (a.producto||'').localeCompare(b.producto||'');
      return 0;
    });
    setFilteredProducts(f);
  }, [products, searchTerm, filterSource, filterMargin, filterDecision, sortBy]);

  const clearFilters = () => {
    setSearchTerm(''); setFilterSource('all');
    setFilterMargin('all'); setFilterDecision('all'); setSortBy('margen_desc');
  };

  const dynamicSources = [...new Set(products.map(p => p.fuente))].filter(Boolean);
  const countOpp = products.filter(p => p.decision?.includes('OPORTUNIDAD')).length;

  if (loading) return (
    <div className="dashboard-container">
      <Header /><div className="dashboard-body"><Sidebar />
        <main className="dashboard-main">
          <div className="products-loading"><div className="spinner"/><p>Cargando catálogo...</p></div>
        </main>
      </div>
    </div>
  );

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
                  {filteredProducts.length} de {products.length} productos · {countOpp} oportunidades
                </p>
              </div>
              <button className="btn-secondary" onClick={loadProducts}>🔄 Actualizar</button>
            </div>

            {/* Stats */}
            <div className="products-stats">
              <div className="products-stat">
                <span className="stat-value">{products.length}</span>
                <span className="stat-label">Total</span>
              </div>
              <div className="products-stat success">
                <span className="stat-value">{countOpp}</span>
                <span className="stat-label">Oportunidades</span>
              </div>
              <div className="products-stat warning">
                <span className="stat-value">{products.filter(p => parseFloat(p.margen_porcentaje) >= 25).length}</span>
                <span className="stat-label">Alto Margen</span>
              </div>
              <div className="products-stat danger">
                <span className="stat-value">{products.filter(p => parseFloat(p.margen_porcentaje) < 15).length}</span>
                <span className="stat-label">Bajo Margen</span>
              </div>
              <div className="products-stat">
                <span className="stat-value">{dynamicSources.length}</span>
                <span className="stat-label">Fuentes</span>
              </div>
            </div>

            {/* Filters */}
            <div className="products-filters">
              <input type="text" placeholder="🔍 Buscar..." value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)} className="filter-search" />
              <select value={filterSource} onChange={e => setFilterSource(e.target.value)} className="filter-select">
                <option value="all">Todas las Fuentes</option>
                {dynamicSources.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <select value={filterMargin} onChange={e => setFilterMargin(e.target.value)} className="filter-select">
                <option value="all">Todos los Márgenes</option>
                <option value="high">Alto (≥25%)</option>
                <option value="medium">Medio (15–25%)</option>
                <option value="low">Bajo (&lt;15%)</option>
              </select>
              <select value={filterDecision} onChange={e => setFilterDecision(e.target.value)} className="filter-select">
                <option value="all">Todas las Decisiones</option>
                <option value="opportunity">Oportunidad</option>
                <option value="no-buy">No Conviene</option>
              </select>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="filter-select">
                <option value="margen_desc">Mayor Margen</option>
                <option value="margen_asc">Menor Margen</option>
                <option value="ganancia">Mayor Ganancia</option>
                <option value="nombre">Nombre A–Z</option>
              </select>
              {(searchTerm || filterSource !== 'all' || filterMargin !== 'all' || filterDecision !== 'all') && (
                <button className="btn-ghost" onClick={clearFilters}>✕ Limpiar</button>
              )}
            </div>

            {/* Grid */}
            {filteredProducts.length === 0 ? (
              <div className="products-empty">
                <p>No se encontraron productos.</p>
                <button className="btn-secondary" onClick={clearFilters} style={{marginTop:'12px'}}>Limpiar filtros</button>
              </div>
            ) : (
              <div className="products-grid">
                {filteredProducts.map((product, i) => (
                  <ProductCard key={i} product={product} onOpen={setSelectedProduct} />
                ))}
              </div>
            )}

          </div>
        </main>
      </div>

      {/* Modal */}
      {selectedProduct && (
        <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
      )}
    </div>
  );
};

// ── Product Card — resumen compacto ───────────────────────────────────────────
const ProductCard = ({ product, onOpen }) => {
  const bestComp = product.competidores?.length > 0
    ? product.competidores.reduce((a, b) => a.precio < b.precio ? a : b)
    : null;

  return (
    <div className={`product-card ${getDecisionClass(product.decision)}`}>
      {/* Decision ribbon */}
      <div className={`product-ribbon ${getDecisionClass(product.decision)}`}>
        {product.decision?.includes('OPORTUNIDAD') ? '✅ Oportunidad' : '❌ No Conviene'}
      </div>

      <div className="product-card-body">
        {/* Nombre + fuente */}
        <div className="product-card-header">
          <h3 className="product-name" title={product.producto}>{product.producto}</h3>
          <span className="source-badge">{product.fuente}</span>
        </div>

        {/* Precios clave */}
        <div className="product-key-prices">
          <div className="key-price-item">
            <span className="key-price-label">Costo compra</span>
            <span className="key-price-value buy">{formatCOP(product.precio_compra)}</span>
          </div>
          <div className="key-price-divider">→</div>
          <div className="key-price-item">
            <span className="key-price-label">Mejor competencia</span>
            <span className="key-price-value comp">
              {bestComp ? formatCOP(bestComp.precio) : formatCOP(product.precio_competencia)}
            </span>
            {bestComp && <span className="key-price-source">{bestComp.fuente}</span>}
          </div>
        </div>

        {/* Margen */}
        <div className="product-margin-row">
          <span className="margin-label">Margen</span>
          <span className={`margin-badge ${getMarginClass(product.margen_porcentaje)}`}>
            {parseFloat(product.margen_porcentaje).toFixed(1)}%
          </span>
          <span className="gain-value">{formatCOP(product.ganancia)}</span>
        </div>

        {/* Competidores mini */}
        {product.competidores?.length > 0 && (
          <div className="product-competitors-mini">
            <span className="comp-mini-label">{product.competidores.length} fuente{product.competidores.length > 1 ? 's' : ''} competidora{product.competidores.length > 1 ? 's' : ''}:</span>
            <div className="comp-mini-badges">
              {product.competidores.map((c, i) => (
                <span key={i} className="comp-mini-badge">{c.fuente}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      <button className="btn-detail" onClick={() => onOpen(product)}>
        Ver análisis completo →
      </button>
    </div>
  );
};

// ── Product Modal — tabla detallada con links ─────────────────────────────────
const ProductModal = ({ product, onClose }) => {
  const bestComp = product.competidores?.length > 0
    ? Math.min(...product.competidores.map(c => c.precio))
    : null;

  return (
    <>
      <div className="modal-backdrop" onClick={onClose} />
      <div className="modal modal-wide">
        <div className="modal-header">
          <div>
            <h2>{product.producto}</h2>
            <div className="modal-header-meta">
              <span className="source-badge">{product.fuente}</span>
              <span className={`decision-badge ${getDecisionClass(product.decision)}`}>
                {product.decision}
              </span>
            </div>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">

          {/* Resumen superior */}
          <div className="modal-summary-grid">
            <div className="modal-summary-item">
              <span className="modal-label">Precio Lista</span>
              <span className="modal-value">{formatCOP(product.precio_lista)}</span>
            </div>
            <div className="modal-summary-item">
              <span className="modal-label">Costo Compra (-{Math.round((1 - product.precio_compra / product.precio_lista) * 100)}% desc.)</span>
              <span className="modal-value buy">{formatCOP(product.precio_compra)}</span>
            </div>
            <div className="modal-summary-item">
              <span className="modal-label">Promedio Competencia</span>
              <span className="modal-value comp">{formatCOP(product.precio_competencia)}</span>
            </div>
            <div className="modal-summary-item">
              <span className="modal-label">Ganancia Potencial</span>
              <span className="modal-value gain">{formatCOP(product.ganancia)}</span>
            </div>
            <div className="modal-summary-item">
              <span className="modal-label">Margen</span>
              <span className={`modal-value margin ${getMarginClass(product.margen_porcentaje)}`}>
                {parseFloat(product.margen_porcentaje).toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Barra de margen */}
          <div className="modal-section">
            <div className="margin-bar-track">
              <div className={`margin-bar-fill ${getMarginClass(product.margen_porcentaje)}`}
                style={{ width: `${Math.min(Math.max(parseFloat(product.margen_porcentaje), 0), 100)}%` }} />
            </div>
            <div className="margin-bar-labels">
              <span>0%</span><span className="danger-label">15% mín.</span>
              <span className="good-label">25% meta</span><span>100%</span>
            </div>
          </div>

          {/* Tabla de competidores */}
          <div className="modal-section">
            <h3 className="modal-section-title">Precios por fuente competidora</h3>
            {product.competidores?.length === 0 ? (
              <p className="modal-no-comp">No hay datos de competidores para este producto aún.</p>
            ) : (
              <table className="comp-table">
                <thead>
                  <tr>
                    <th>Fuente</th>
                    <th>Precio</th>
                    <th>vs. Costo Compra</th>
                    <th>Última actualización</th>
                    <th>Validar</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Fila del proveedor */}
                  <tr className="comp-row provider-row">
                    <td><span className="comp-source-badge provider">{product.fuente}</span></td>
                    <td className="comp-price">{formatCOP(product.precio_lista)}</td>
                    <td><span className="comp-diff neutral">Precio base</span></td>
                    <td className="comp-date">—</td>
                    <td>
                      <a href={SOURCE_URLS[product.fuente] || '#'} target="_blank"
                        rel="noopener noreferrer" className="comp-link">Ver sitio →</a>
                    </td>
                  </tr>
                  {/* Fila costo con descuento */}
                  <tr className="comp-row cost-row">
                    <td><span className="comp-source-badge cost">Costo mayorista</span></td>
                    <td className="comp-price buy">{formatCOP(product.precio_compra)}</td>
                    <td><span className="comp-diff neutral">Tu precio</span></td>
                    <td className="comp-date">—</td>
                    <td>—</td>
                  </tr>
                  {/* Competidores */}
                  {[...product.competidores]
                    .sort((a, b) => a.precio - b.precio)
                    .map((c, i) => {
                      const diff = c.precio - product.precio_compra;
                      const pct  = ((diff / c.precio) * 100).toFixed(1);
                      const isBest = c.precio === bestComp;
                      return (
                        <tr key={i} className={`comp-row ${isBest ? 'best-row' : ''}`}>
                          <td>
                            <span className="comp-source-badge competitor">{c.fuente}</span>
                            {isBest && <span className="best-badge">Mejor precio</span>}
                          </td>
                          <td className="comp-price comp">{formatCOP(c.precio)}</td>
                          <td>
                            <span className={`comp-diff ${diff > 0 ? 'positive' : 'negative'}`}>
                              {diff > 0 ? '+' : ''}{formatCOP(diff)} ({diff > 0 ? '+' : ''}{pct}%)
                            </span>
                          </td>
                          <td className="comp-date">
                            {new Date(c.fecha).toLocaleDateString('es-CO', {day:'numeric', month:'short', hour:'2-digit', minute:'2-digit'})}
                          </td>
                          <td>
                            <a href={c.source_url || SOURCE_URLS[c.fuente] || '#'}
                              target="_blank" rel="noopener noreferrer" className="comp-link">
                              Ver producto →
                            </a>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            )}
          </div>

          <p className="modal-disclaimer">
            * Los precios de competidores son extraídos automáticamente. Verifica en el sitio oficial para confirmar disponibilidad y precio actual.
          </p>
        </div>
      </div>
    </>
  );
};

export default Products;