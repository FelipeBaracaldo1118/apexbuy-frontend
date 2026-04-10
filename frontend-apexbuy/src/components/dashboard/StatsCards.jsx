// ============================================================================
// STATS CARDS COMPONENT
// ============================================================================
// 4 Cards con métricas principales del dashboard
// ============================================================================

import { useEffect, useState } from 'react';
import { analysisAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import './StatsCards.css';

const StatsCards = () => {
  const { error: showError } = useNotification();
  const [stats, setStats] = useState({
    products: 0,
    sources: 0,
    opportunities: 0,
    bestMargin: 0,
    avgMargin: 0,
    priceIndex: 0,
    catalogHealth: 0,
    alerts: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);

      // Obtener estadísticas globales
      const { data: globalStats } = await analysisAPI.getStats();

      // Obtener oportunidades para calcular métricas adicionales
      const { data: opportunities } = await analysisAPI.getOpportunities();

      // Calcular margen promedio
      const avgMargin = opportunities.length > 0
        ? opportunities.reduce((sum, opp) => sum + parseFloat(opp.margen_porcentaje), 0) / opportunities.length
        : 0;

      // Mejor margen
      const bestMargin = opportunities.length > 0
        ? Math.max(...opportunities.map(opp => parseFloat(opp.margen_porcentaje)))
        : 0;

      // Índice de precios (simulado - comparación vs competencia)
      const priceIndex = 104.2; // Placeholder - después calcular real

      // Salud del catálogo (% de productos con oportunidad)
      const catalogHealth = globalStats.products > 0
        ? (globalStats.opportunities / globalStats.products) * 100
        : 0;

      // Alertas críticas (productos con margen bajo)
      const alerts = opportunities.filter(opp => parseFloat(opp.margen_porcentaje) < 15).length;

      setStats({
        ...globalStats,
        avgMargin,
        bestMargin,
        priceIndex,
        catalogHealth,
        alerts,
      });

    } catch (error) {
      console.error('Error cargando stats:', error);
      showError('Error cargando estadísticas');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="stats-loading">
        <div className="spinner"></div>
        <p>Cargando métricas...</p>
      </div>
    );
  }

  return (
    <div className="stats-cards">
      {/* Card 1: Margen Real vs. Esperado */}
      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-label">MARGEN REAL VS. ESPERADO</span>
        </div>
        <div className="stat-value-large">
          {stats.avgMargin.toFixed(1)}%
        </div>
        <div className="stat-change negative">
          <span>↓ 2.1% vs Goal</span>
        </div>
        <div className="stat-progress">
          <div 
            className="stat-progress-bar"
            style={{ width: `${Math.min(stats.avgMargin, 100)}%` }}
          />
        </div>
        <div className="stat-footer">
          Meta corporativa: 20.3%
        </div>
      </div>

      {/* Card 2: Índice de Precios */}
      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-label">ÍNDICE DE PRECIOS (VS COMP.)</span>
        </div>
        <div className="stat-value-large">
          {stats.priceIndex.toFixed(1)}
        </div>
        <div className="stat-change positive">
          <span>↑ Caro</span>
        </div>
        <div className="stat-progress">
          <div 
            className="stat-progress-bar warning"
            style={{ width: '65%' }}
          />
        </div>
        <div className="stat-footer">
          Proveedor +8% | Competencia -4.2%
        </div>
      </div>

      {/* Card 3: Salud del Catálogo */}
      <div className="stat-card">
        <div className="stat-header">
          <span className="stat-label">SALUD DEL CATÁLOGO</span>
        </div>
        <div className="stat-value-large">
          {stats.catalogHealth.toFixed(0)}%
        </div>
        <div className="stat-change positive">
          <span>↑ 5%</span>
        </div>
        <div className="stat-details">
          <div className="stat-detail-item">
            <span>Optimizado:</span>
            <strong>{stats.opportunities}</strong>
          </div>
          <div className="stat-detail-item">
            <span>Crítico:</span>
            <strong>{stats.alerts}</strong>
          </div>
        </div>
        <div className="stat-footer">
          {stats.products} SKUs
        </div>
      </div>

      {/* Card 4: Alertas de Competitividad */}
      <div className="stat-card alert-card">
        <div className="stat-header">
          <span className="stat-label">ALERTAS DE COMPETITIVIDAD</span>
        </div>
        <div className="stat-value-large alert">
          {stats.alerts}
        </div>
        <div className="stat-subtitle">
          Críticas
        </div>
        <div className="stat-alert-message">
          Acción inmediata requerida en {stats.alerts > 0 ? Math.min(stats.alerts, 5) : 0} categorías
        </div>
      </div>
    </div>
  );
};

export default StatsCards;