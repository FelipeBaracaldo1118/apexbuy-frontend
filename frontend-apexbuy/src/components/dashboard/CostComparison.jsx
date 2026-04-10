// ============================================================================
// COST COMPARISON CARD
// ============================================================================
// Card lateral: Comparativa de Costos
// ============================================================================

import { useEffect, useState } from 'react';
import { analysisAPI } from '../../services/api';
import './CostComparison.css';

const CostComparison = () => {
  const [data, setData] = useState({
    avgMargin: 0,
    supplierCost: 0,
    competitionGap: 0,
    renegotiationPotential: 'Baja',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const { data: opportunities } = await analysisAPI.getOpportunities();

      if (opportunities && opportunities.length > 0) {
        // Calcular margen bruto promedio
        const avgMargin = opportunities.reduce((sum, opp) => 
          sum + parseFloat(opp.margen_porcentaje), 0) / opportunities.length;

        // Calcular costo de proveedor promedio (% del precio final)
        const avgSupplierCost = 100 - avgMargin;

        // Gap con competencia (simulado)
        const competitionGap = 3.8;

        // Potencial de re-negociación
        const renegotiationPotential = avgMargin < 20 ? 'Alta' : avgMargin < 25 ? 'Media' : 'Baja';

        setData({
          avgMargin: avgMargin.toFixed(1),
          supplierCost: avgSupplierCost.toFixed(1),
          competitionGap: competitionGap.toFixed(1),
          renegotiationPotential,
        });
      }
    } catch (error) {
      console.error('Error cargando comparativa de costos:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="cost-card">
        <div className="cost-loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="cost-card">
      <h3>Comparativa de Costos</h3>
      
      <div className="cost-main">
        <div className="cost-label">MARGEN BRUTO PROMEDIO</div>
        <div className="cost-value-large">{data.avgMargin}%</div>
        <div className="cost-change negative">-$1,240 vs Plan</div>
      </div>

      <div className="cost-metrics">
        <div className="cost-metric">
          <div className="cost-metric-label">Costo de Proveedor (Base)</div>
          <div className="cost-metric-value">{data.supplierCost}%</div>
          <div className="cost-metric-bar">
            <div 
              className="cost-metric-bar-fill"
              style={{ width: `${data.supplierCost}%` }}
            />
          </div>
        </div>

        <div className="cost-metric">
          <div className="cost-metric-label">Gap con Competencia</div>
          <div className="cost-metric-value alert">+{data.competitionGap}%</div>
          <div className="cost-metric-bar">
            <div 
              className="cost-metric-bar-fill alert"
              style={{ width: '38%' }}
            />
          </div>
        </div>

        <div className="cost-metric">
          <div className="cost-metric-label">Potencial de Re-negociación</div>
          <div className={`cost-metric-badge ${data.renegotiationPotential.toLowerCase()}`}>
            {data.renegotiationPotential}
          </div>
        </div>
      </div>

      <button className="btn-secondary btn-full cost-btn">
        Ver Detalle por Proveedor
      </button>
    </div>
  );
};

export default CostComparison;