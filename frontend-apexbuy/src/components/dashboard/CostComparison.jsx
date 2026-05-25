// ============================================================================
// COST COMPARISON CARD — Panel lateral del dashboard
// Todo calculado desde datos reales de la BD
// ============================================================================

import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { analysisAPI } from '../../services/api';
import './CostComparison.css';

const formatCOP = (v) => '$' + Math.round(Number(v) || 0).toLocaleString('es-CO');

const CostComparison = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      const { data: opportunities } = await analysisAPI.getOpportunities();

      if (!opportunities || opportunities.length === 0) {
        setData(null);
        return;
      }

      // Margen bruto promedio real
      const avgMargin = opportunities.reduce((s, o) => s + parseFloat(o.margen_porcentaje), 0) / opportunities.length;

      // Costo de proveedor promedio como % del precio de competencia
      const avgSupplierCost = 100 - avgMargin;

      // Gap real = (precio_competencia - precio_compra) / precio_competencia * 100
      const totalComp  = opportunities.reduce((s, o) => s + Number(o.precio_competencia), 0);
      const totalCosto = opportunities.reduce((s, o) => s + Number(o.precio_compra), 0);
      const gapReal = totalComp > 0
        ? ((totalComp - totalCosto) / totalComp * 100)
        : 0;

      // Ganancia total potencial
      const totalGanancia = opportunities.reduce((s, o) => s + Number(o.ganancia), 0);

      // Mejor oportunidad
      const mejor = opportunities.reduce((prev, curr) =>
        parseFloat(curr.margen_porcentaje) > parseFloat(prev.margen_porcentaje) ? curr : prev
      );

      // Meta corporativa
      const goalMargin = 25;
      const vsGoal = avgMargin - goalMargin;

      // Potencial de re-negociación basado en margen real
      const renegotiationPotential =
        avgMargin < 20 ? 'Alta' :
        avgMargin < 25 ? 'Media' : 'Baja';

      const renegClass =
        renegotiationPotential === 'Alta'  ? 'alta' :
        renegotiationPotential === 'Media' ? 'media' : 'baja';

      setData({
        avgMargin:              avgMargin.toFixed(1),
        avgSupplierCost:        avgSupplierCost.toFixed(1),
        gapReal:                gapReal.toFixed(1),
        totalGanancia,
        vsGoal:                 vsGoal.toFixed(1),
        vsGoalPositive:         vsGoal >= 0,
        mejorProducto:          mejor.producto,
        mejorMargen:            parseFloat(mejor.margen_porcentaje).toFixed(1),
        renegotiationPotential,
        renegClass,
      });

    } catch (error) {
      console.error('Error cargando comparativa de costos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="cost-card">
        <div className="cost-loading"><div className="spinner"></div></div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="cost-card">
        <h3>Comparativa de Costos</h3>
        <p style={{ color: 'var(--secondary-gray)', fontSize: '0.85rem', padding: '16px 0' }}>
          Sin datos disponibles aún.
        </p>
      </div>
    );
  }

  return (
    <div className="cost-card">
      <h3>Comparativa de Costos</h3>

      <div className="cost-main">
        <div className="cost-label">MARGEN BRUTO PROMEDIO</div>
        <div className="cost-value-large">{data.avgMargin}%</div>
        <div className={`cost-change ${data.vsGoalPositive ? 'positive' : 'negative'}`}>
          {data.vsGoalPositive ? '+' : ''}{data.vsGoal}% vs Meta (25%)
        </div>
      </div>

      <div className="cost-metrics">

        <div className="cost-metric">
          <div className="cost-metric-label">Costo de Proveedor (Base)</div>
          <div className="cost-metric-value">{data.avgSupplierCost}%</div>
          <div className="cost-metric-bar">
            <div
              className="cost-metric-bar-fill"
              style={{ width: `${Math.min(parseFloat(data.avgSupplierCost), 100)}%` }}
            />
          </div>
        </div>

        <div className="cost-metric">
          <div className="cost-metric-label">Gap con Competencia</div>
          <div className="cost-metric-value success">+{data.gapReal}%</div>
          <div className="cost-metric-bar">
            <div
              className="cost-metric-bar-fill success"
              style={{ width: `${Math.min(parseFloat(data.gapReal), 100)}%` }}
            />
          </div>
          <div style={{ fontSize: '0.7rem', color: 'var(--secondary-gray)', marginTop: '2px' }}>
            La competencia vende {data.gapReal}% más caro que tu costo
          </div>
        </div>

        <div className="cost-metric">
          <div className="cost-metric-label">Ganancia Total Potencial</div>
          <div className="cost-metric-value success">{formatCOP(data.totalGanancia)}</div>
        </div>

        <div className="cost-metric">
          <div className="cost-metric-label">Mejor Oportunidad</div>
          <div className="cost-metric-best" title={data.mejorProducto}>
            {data.mejorProducto?.length > 30
              ? data.mejorProducto.substring(0, 30) + '…'
              : data.mejorProducto}
          </div>
          <div className="cost-metric-value success">{data.mejorMargen}% margen</div>
        </div>

        <div className="cost-metric">
          <div className="cost-metric-label">Potencial de Re-negociación</div>
          <div className={`cost-metric-badge ${data.renegClass}`}>
            {data.renegotiationPotential}
          </div>
        </div>

      </div>

      <button
        className="btn-secondary btn-full cost-btn"
        onClick={() => navigate(`/products?open=${encodeURIComponent(data.mejorProducto)}`)}
      >
        Ver Detalle por Proveedor →
      </button>
    </div>
  );
};

export default CostComparison;