// ============================================================================
// PRODUCT HISTORY MODAL
// ============================================================================
// Modal con gráfica de evolución de precio y timeline completo
// ============================================================================

import { useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';
import './ProductHistoryModal.css';

const ProductHistoryModal = ({ product, onClose }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (chartRef.current) {
      createChart();
    }

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [product]);

  const createChart = () => {
    const ctx = chartRef.current.getContext('2d');

    // Destruir gráfica anterior si existe
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Preparar datos (más reciente a más antiguo)
    const sortedHistory = [...product.history].reverse();
    const labels = sortedHistory.map(h => 
      h.date.toLocaleDateString('es-CO', { day: '2-digit', month: 'short' })
    );
    const prices = sortedHistory.map(h => h.currentPrice);

    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Precio de Compra',
          data: prices,
          borderColor: '#E12613',
          backgroundColor: 'rgba(225, 38, 19, 0.1)',
          borderWidth: 3,
          tension: 0.4,
          fill: true,
          pointBackgroundColor: '#E12613',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
          pointRadius: 4,
          pointHoverRadius: 6,
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false,
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleFont: { size: 14, weight: 'bold' },
            bodyFont: { size: 13 },
            displayColors: false,
            callbacks: {
              label: (context) => {
                return `$${context.parsed.y.toLocaleString('es-CO')}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            ticks: {
              callback: (value) => {
                if (value >= 1000000) return '$' + (value / 1000000).toFixed(1) + 'M';
                if (value >= 1000) return '$' + Math.round(value / 1000) + 'K';
                return '$' + value;
              },
              font: { size: 11 }
            },
            grid: {
              color: 'rgba(0, 0, 0, 0.05)',
            }
          },
          x: {
            ticks: {
              font: { size: 11 },
              maxRotation: 45,
              minRotation: 45
            },
            grid: {
              display: false,
            }
          }
        }
      }
    });
  };

  const formatDate = (date) => {
    return date.toLocaleDateString('es-CO', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStats = () => {
    const changes = product.history.map(h => h.change);
    const maxIncrease = Math.max(...changes);
    const maxDecrease = Math.min(...changes);
    const avgChange = (changes.reduce((a, b) => a + b, 0) / changes.length).toFixed(1);
    
    const prices = product.history.map(h => h.currentPrice);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);

    return { maxIncrease, maxDecrease, avgChange, minPrice, maxPrice };
  };

  const formatCOP = (value) =>
    '$' + Math.round(Number(value) || 0).toLocaleString('es-CO');

  const stats = getStats();

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="modal-header">
          <div>
            <h2>{product.producto}</h2>
            <p className="modal-subtitle">Historial completo de cambios de precio</p>
          </div>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        {/* Content */}
        <div className="modal-content">
          {/* Stats Summary */}
          <div className="modal-stats">
            <div className="modal-stat">
              <span className="stat-label">Precio Actual</span>
              <span className="stat-value primary">
                {formatCOP(product.currentPrice)}
              </span>
            </div>
            <div className="modal-stat">
              <span className="stat-label">Precio Mínimo</span>
              <span className="stat-value success">
                {formatCOP(stats.minPrice)}
              </span>
            </div>
            <div className="modal-stat">
              <span className="stat-label">Precio Máximo</span>
              <span className="stat-value error">
                {formatCOP(stats.maxPrice)}
              </span>
            </div>
            <div className="modal-stat">
              <span className="stat-label">Variación Promedio</span>
              <span className={`stat-value ${parseFloat(stats.avgChange) > 0 ? 'error' : 'success'}`}>
                {stats.avgChange > 0 ? '+' : ''}{stats.avgChange}%
              </span>
            </div>
          </div>

          {/* Chart */}
          <div className="modal-chart">
            <h3>Evolución de Precio</h3>
            <div className="chart-container">
              <canvas ref={chartRef}></canvas>
            </div>
          </div>

          {/* Timeline */}
          <div className="modal-timeline">
            <h3>Historial de Cambios ({product.history.length})</h3>
            <div className="timeline-list">
              {product.history.map((change, index) => (
                <div key={index} className="timeline-item-modal">
                  <div className={`timeline-badge ${change.type}`}>
                    {change.change > 0 ? '↑' : '↓'}
                  </div>
                  <div className="timeline-item-content">
                    <div className="timeline-item-header">
                      <span className="timeline-date">{formatDate(change.date)}</span>
                      <span className={`timeline-change ${change.type}`}>
                        {change.change > 0 ? '+' : ''}{change.change}%
                      </span>
                    </div>
                    <div className="timeline-item-body">
                      <span className="timeline-price">
                        {formatCOP(change.previousPrice)} → {formatCOP(change.currentPrice)}
                      </span>
                      <span className="timeline-system">{change.system}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductHistoryModal;