// ============================================================================
// OPPORTUNITIES TABLE COMPONENT - CON EXPORT (CORREGIDO)
// ============================================================================

import { useEffect, useState } from 'react';
import { analysisAPI, updateAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import { exportToExcel, exportToCSV, formatOpportunitiesForExport } from '../../utils/exportUtils';
import './OpportunitiesTable.css';

const OpportunitiesTable = () => {
  const { success, error: showError, promise } = useNotification();
  const [opportunities, setOpportunities] = useState([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterAlert, setFilterAlert] = useState('all');

  const loadOpportunities = async () => {
    try {
      setLoading(true);
      const { data } = await analysisAPI.getOpportunities();
      setOpportunities(data || []);
    } catch (error) {
      console.error('Error cargando oportunidades:', error);
      showError('Error cargando datos de productos');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...opportunities];

    if (searchTerm) {
      filtered = filtered.filter(opp =>
        opp.producto.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterAlert !== 'all') {
      if (filterAlert === 'critical') {
        filtered = filtered.filter(opp => parseFloat(opp.margen_porcentaje) < 15);
      } else if (filterAlert === 'optimized') {
        filtered = filtered.filter(opp => parseFloat(opp.margen_porcentaje) >= 20);
      } else if (filterAlert === 'oportunidad') {
        filtered = filtered.filter(opp => opp.decision.includes('OPORTUNIDAD'));
      }
    }

    setFilteredOpportunities(filtered);
  };

  useEffect(() => {
    loadOpportunities();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    applyFilters();
  }, [searchTerm, filterAlert, opportunities]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleUpdatePrices = async () => {
    const updatePromise = updateAPI.updateAllProviders();
    
    promise(updatePromise, {
      loading: 'Actualizando precios de todos los proveedores...',
      success: 'Precios actualizados exitosamente',
      error: 'Error actualizando precios'
    }).then(() => {
      loadOpportunities();
    });
  };

  const handleExportExcel = () => {
    try {
      const dataToExport = formatOpportunitiesForExport(filteredOpportunities);
      exportToExcel(dataToExport, `oportunidades-${new Date().toISOString().split('T')[0]}`);
      success('Datos exportados a Excel exitosamente');
    } catch (err) {
      showError('Error al exportar a Excel');
    }
  };

  const handleExportCSV = () => {
    try {
      const dataToExport = formatOpportunitiesForExport(filteredOpportunities);
      exportToCSV(dataToExport, `oportunidades-${new Date().toISOString().split('T')[0]}`);
      success('Datos exportados a CSV exitosamente');
    } catch (err) {
      showError('Error al exportar a CSV');
    }
  };

  const getHealthStatus = (margin) => {
    const marginNum = parseFloat(margin);
    if (marginNum >= 25) return { label: 'OPTIMIZADO', class: 'optimized' };
    if (marginNum >= 15) return { label: 'BUENO', class: 'good' };
    if (marginNum >= 10) return { label: 'ALERTA PRECIO', class: 'warning' };
    return { label: 'PÉRDIDA DE COMPETITIVIDAD', class: 'critical' };
  };

  const getAction = (margin, decision) => {
    const marginNum = parseFloat(margin);
    if (decision.includes('NO CONVIENE')) return { label: 'No Comprar', class: 'no-buy' };
    if (marginNum >= 25) return { label: 'Monitorear', class: 'monitor' };
    if (marginNum >= 15) return { label: 'Mantener', class: 'maintain' };
    return { label: 'Re-Pricing', class: 'repricing' };
  };

  const getDemand = () => {
    const demands = ['Alta', 'Media', 'Baja'];
    return demands[Math.floor(Math.random() * demands.length)];
  };

  if (loading) {
    return (
      <div className="table-card">
        <div className="table-loading">
          <div className="spinner"></div>
          <p>Cargando productos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="table-card">
      {/* Header */}
      <div className="table-header">
        <div>
          <h3>Salud de Productos y Alertas</h3>
          <p className="table-subtitle">
            Monitoreo de competitividad y márgenes por producto
          </p>
        </div>
        <div className="table-actions">
          <div className="export-buttons">
            <button 
              className="btn-secondary btn-sm"
              onClick={handleExportExcel}
              title="Exportar a Excel"
            >
              📊 Excel
            </button>
            <button 
              className="btn-secondary btn-sm"
              onClick={handleExportCSV}
              title="Exportar a CSV"
            >
              📄 CSV
            </button>
          </div>
          <button 
            className="btn-primary"
            onClick={handleUpdatePrices}
          >
            Sincronizar Catálogo
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="table-filters">
        <div className="filter-group">
          <input
            type="text"
            placeholder="Buscar por producto o SKU..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="filter-search"
          />
        </div>
        <div className="filter-group">
          <select
            value={filterAlert}
            onChange={(e) => setFilterAlert(e.target.value)}
            className="filter-select"
          >
            <option value="all">Todas las Alertas</option>
            <option value="critical">Solo Críticas</option>
            <option value="optimized">Solo Optimizadas</option>
            <option value="oportunidad">Solo Oportunidades</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrapper">
        <table className="opportunities-table">
          <thead>
            <tr>
              <th>PRODUCTO / SKU</th>
              <th>MARGEN ACTUAL</th>
              <th>PRECIO VS COMP.</th>
              <th>DEMANDA (7D)</th>
              <th>ESTADO SALUD</th>
              <th>ACCIÓN BI</th>
            </tr>
          </thead>
          <tbody>
            {filteredOpportunities.length === 0 ? (
              <tr>
                <td colSpan="6" className="table-empty">
                  No se encontraron productos
                </td>
              </tr>
            ) : (
              filteredOpportunities.map((opp, index) => {
                const health = getHealthStatus(opp.margen_porcentaje);
                const action = getAction(opp.margen_porcentaje, opp.decision);
                const demand = getDemand();
                
                const priceDiff = ((opp.precio_compra - opp.precio_competencia) / opp.precio_competencia * 100).toFixed(1);
                
                return (
                  <tr key={index}>
                    <td>
                      <div className="product-cell">
                        <strong>{opp.producto}</strong>
                        <span className="product-sku">SKU: PROD-{String(index + 1).padStart(5, '0')}</span>
                      </div>
                    </td>
                    <td>
                      <div className="margin-cell">
                        <strong className={parseFloat(opp.margen_porcentaje) < 15 ? 'text-error' : 'text-success'}>
                          {opp.margen_porcentaje}%
                        </strong>
                        <span className="margin-expected">Esperado: 20%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`price-diff ${parseFloat(priceDiff) > 0 ? 'positive' : 'negative'}`}>
                        {parseFloat(priceDiff) > 0 ? '+' : ''}{priceDiff}%
                      </span>
                    </td>
                    <td>
                      <span className={`demand-badge ${demand.toLowerCase()}`}>
                        {demand}
                      </span>
                    </td>
                    <td>
                      <span className={`health-badge ${health.class}`}>
                        {health.label}
                      </span>
                    </td>
                    <td>
                      <span className={`action-badge ${action.class}`}>
                        {action.label}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="table-footer">
        <p>Analizar Catálogo Completo ({opportunities.length} items)</p>
      </div>
    </div>
  );
};

export default OpportunitiesTable;