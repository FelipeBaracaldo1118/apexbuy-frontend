import React from 'react';
import './ProductCompetitorModal.css';

const ProductCompetitorModal = ({ product, onClose }) => {
  if (!product) return null;

  const formatPrice = (price) => {
    return `$${Math.round(price).toLocaleString('es-CO')}`;
  };

  const formatNumber = (num) => {
    return Math.round(num).toLocaleString('es-CO');
  };

  // Ordenar competidores por precio (menor a mayor)
  const sortedCompetitors = [...product.competidores].sort((a, b) => a.precio - b.precio);

  const bestPrice = sortedCompetitors[0];
  const worstPrice = sortedCompetitors[sortedCompetitors.length - 1];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container competitor-modal-redesign" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="modal-header-redesign">
          <div>
            <h2 className="modal-title-redesign">Análisis de Competencia</h2>
            <p className="modal-product-name">{product.producto}</p>
          </div>
          <button className="modal-close-redesign" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body-redesign">
          
          {/* Tu Precio */}
          <div className="your-price-card">
            <div className="price-header">
              <span className="price-label">Tu Precio de Compra</span>
              <span className="price-source">Fuente: {product.fuente}</span>
            </div>
            <div className="price-amount">{formatPrice(product.precio_compra)}</div>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid-redesign">
            <div className="stat-card-redesign">
              <div className="stat-icon">📊</div>
              <div className="stat-content">
                <div className="stat-label">Precio Promedio</div>
                <div className="stat-value">{formatPrice(product.precio_promedio)}</div>
              </div>
            </div>

            <div className="stat-card-redesign">
              <div className="stat-icon">💰</div>
              <div className="stat-content">
                <div className="stat-label">Ganancia Promedio</div>
                <div className="stat-value success-text">{formatPrice(product.ganancia_promedio)}</div>
              </div>
            </div>

            <div className="stat-card-redesign">
              <div className="stat-icon">📈</div>
              <div className="stat-content">
                <div className="stat-label">Margen Promedio</div>
                <div className="stat-value">{product.margen_promedio}%</div>
              </div>
            </div>
          </div>

          {/* Competidores */}
          <div className="competitors-section-redesign">
            <h3 className="section-title">Comparativa de Precios</h3>
            
            <div className="competitors-list">
              {sortedCompetitors.map((competitor, index) => {
                const isBest = competitor.nombre === bestPrice.nombre;
                const isWorst = competitor.nombre === worstPrice.nombre;
                
                return (
                  <div 
                    key={index} 
                    className={`competitor-item ${isBest ? 'best-price' : ''} ${isWorst ? 'worst-price' : ''}`}
                  >
                    <div className="competitor-main">
                      <div className="competitor-left">
                        <div className="competitor-name">{competitor.nombre}</div>
                        <div className="competitor-badges">
                          {isBest && <span className="badge badge-success">Más Barato</span>}
                          {isWorst && <span className="badge badge-warning">Más Caro</span>}
                        </div>
                      </div>
                      <div className="competitor-right">
                        <div className="competitor-price">{formatPrice(competitor.precio)}</div>
                        <div className="competitor-margin">{competitor.margen}% margen</div>
                      </div>
                    </div>

                    <div className="competitor-details">
                      <div className="detail-item">
                        <span className="detail-label">Ganancia:</span>
                        <span className="detail-value success-text">+{formatPrice(competitor.ganancia)}</span>
                      </div>
                      
                      {/* Barra de margen */}
                      <div className="margin-bar-wrapper">
                        <div 
                          className="margin-bar-fill"
                          style={{ 
                            width: `${Math.min(competitor.margen, 100)}%`,
                            background: competitor.margen > 40 ? 
                              'linear-gradient(90deg, #10b981, #34d399)' : 
                              competitor.margen > 25 ? 
                              'linear-gradient(90deg, #f59e0b, #fbbf24)' : 
                              'linear-gradient(90deg, #ef4444, #f87171)'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recomendación */}
          <div className="recommendation-card">
            <div className="recommendation-header">
              <span className="recommendation-icon">💡</span>
              <span className="recommendation-title">Recomendación de Precio</span>
            </div>
            <div className="recommendation-body">
              <div className="recommendation-row">
                <span className="rec-label">Rango competitivo:</span>
                <span className="rec-value">{formatPrice(bestPrice.precio)} - {formatPrice(worstPrice.precio)}</span>
              </div>
              <div className="recommendation-row">
                <span className="rec-label">Precio sugerido:</span>
                <span className="rec-value highlight">{formatPrice(product.precio_promedio)}</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductCompetitorModal;