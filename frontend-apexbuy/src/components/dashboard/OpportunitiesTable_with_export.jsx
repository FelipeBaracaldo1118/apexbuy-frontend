// ============================================================================
// OPPORTUNITIES TABLE — Top oportunidades en el dashboard
// ============================================================================

import { useEffect, useState } from 'react';
import { analysisAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import './OpportunitiesTable.css';

const formatCOP = (v) => '$' + Math.round(Number(v) || 0).toLocaleString('es-CO');

const getDecisionClass = (d = '') => {
  if (d.includes('OPORTUNIDAD')) return 'opportunity';
  if (d.includes('NO CONVIENE'))  return 'no-buy';
  return 'neutral';
};

const getMarginClass = (m) => {
  const n = parseFloat(m);
  if (n >= 25) return 'high';
  if (n >= 15) return 'medium';
  return 'low';
};

const OpportunitiesTable = () => {
  const { error: showError } = useNotification();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const { data } = await analysisAPI.getOpportunities();
      // Ordenar por ganancia descendente
      const sorted = (data || []).sort((a, b) => Number(b.ganancia) - Number(a.ganancia));
      setOpportunities(sorted);
    } catch (error) {
      console.error('Error cargando oportunidades:', error);
      showError('Error cargando tabla de oportunidades');
    } finally {
      setLoading(false);
    }
  };

  const displayed = showAll ? opportunities : opportunities.slice(0, 8);

  if (loading) {
    return (
      <div className="opp-table-card">
        <div className="opp-table-loading">
          <div className="spinner" />
          <p>Cargando oportunidades...</p>
        </div>
      </div>
    );
  }

  if (opportunities.length === 0) {
    return (
      <div className="opp-table-card">
        <div className="opp-table-empty">
          <p>No hay oportunidades disponibles. Sincroniza el catálogo.</p>
        </div>
      </div>
    );
  }

  const countOpp = opportunities.filter(o => o.decision?.includes('OPORTUNIDAD')).length;

  return (
    <div className="opp-table-card">
      <div className="opp-table-header">
        <div>
          <h3>Oportunidades de Negocio</h3>
          <p className="opp-table-subtitle">
            {countOpp} oportunidades · {opportunities.length} productos analizados
          </p>
        </div>
      </div>

      <div className="opp-table-wrapper">
        <table className="opp-table">
          <thead>
            <tr>
              <th>Producto</th>
              <th>Fuente</th>
              <th>Precio Compra</th>
              <th>Competencia</th>
              <th>Ganancia</th>
              <th>Margen</th>
              <th>Decisión</th>
            </tr>
          </thead>
          <tbody>
            {displayed.map((opp, i) => (
              <tr key={i} className={getDecisionClass(opp.decision)}>
                <td className="opp-name" title={opp.producto}>
                  {opp.producto}
                </td>
                <td>
                  <span className="opp-source">{opp.fuente}</span>
                </td>
                <td className="opp-price">{formatCOP(opp.precio_compra)}</td>
                <td className="opp-price comp">{formatCOP(opp.precio_competencia)}</td>
                <td className="opp-price gain">{formatCOP(opp.ganancia)}</td>
                <td>
                  <span className={`opp-margin ${getMarginClass(opp.margen_porcentaje)}`}>
                    {parseFloat(opp.margen_porcentaje).toFixed(1)}%
                  </span>
                </td>
                <td>
                  <span className={`opp-decision ${getDecisionClass(opp.decision)}`}>
                    {opp.decision?.includes('OPORTUNIDAD') ? '✅ Oportunidad' : '❌ No Conviene'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {opportunities.length > 8 && (
        <div className="opp-table-footer">
          <button className="btn-ghost-table" onClick={() => setShowAll(!showAll)}>
            {showAll
              ? `Mostrar menos`
              : `Ver todos (${opportunities.length - 8} más)`}
          </button>
        </div>
      )}
    </div>
  );
};

export default OpportunitiesTable;