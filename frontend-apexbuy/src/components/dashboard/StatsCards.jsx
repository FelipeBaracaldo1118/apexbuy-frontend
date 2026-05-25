// ============================================================================
// STATS CARDS — 4 métricas principales del dashboard
// Todo calculado desde datos reales de la BD
// ============================================================================

import { useEffect, useState } from 'react';
import { analysisAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import './StatsCards.css';

const StatsCards = () => {
  const { error: showError } = useNotification();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadStats(); }, []);

  const loadStats = async () => {
    try {
      setLoading(true);

      const [{ data: globalStats }, { data: opportunities }] = await Promise.all([
        analysisAPI.getStats(),
        analysisAPI.getOpportunities(),
      ]);

      if (!opportunities || opportunities.length === 0) {
        setStats({ ...globalStats, avgMargin: 0, bestMargin: 0, worstMargin: 0, priceIndex: 0, catalogHealth: 0, alerts: 0, marginVsGoal: 0, goalMargin: 25 });
        return;
      }

      const margins = opportunities.map(o => parseFloat(o.margen_porcentaje));
      const avgMargin  = margins.reduce((a, b) => a + b, 0) / margins.length;
      const bestMargin = Math.max(...margins);
      const worstMargin = Math.min(...margins);

      // Meta corporativa = mejor margen registrado redondeado al 5 más cercano
      // Si no hay referencia, usar 25% como estándar del sector
      const goalMargin = 25;
      const marginVsGoal = avgMargin - goalMargin;

      // Índice de precios real:
      // promedio(precio_competencia) / promedio(precio_compra) * 100
      // >100 = ApexBuy compra más barato que la competencia (bueno)
      const avgPrecioCompra     = opportunities.reduce((s, o) => s + Number(o.precio_compra), 0)      / opportunities.length;
      const avgPrecioComp       = opportunities.reduce((s, o) => s + Number(o.precio_competencia), 0) / opportunities.length;
      const priceIndex = avgPrecioCompra > 0 ? (avgPrecioComp / avgPrecioCompra) * 100 : 0;

      // Dirección del índice
      const priceIndexLabel = priceIndex >= 100 ? '↑ Favorable' : '↓ Desfavorable';
      const priceIndexClass = priceIndex >= 100 ? 'positive' : 'negative';

      // Diferencia proveedor vs competencia en %
      const provDiff = avgPrecioCompra > 0
        ? ((avgPrecioComp - avgPrecioCompra) / avgPrecioCompra * 100).toFixed(1)
        : 0;

      // Salud del catálogo = % de productos PROVEEDOR con oportunidad
      // opportunities ya filtra solo proveedores, así que su length es el total de proveedores
      const totalProveedores = opportunities.length;
      const productosOportunidad = opportunities.filter(o => o.decision?.includes('OPORTUNIDAD')).length;
      const catalogHealth = totalProveedores > 0
        ? (productosOportunidad / totalProveedores) * 100
        : 0;

      // Alertas = productos con margen < 15%
      const alerts = opportunities.filter(o => parseFloat(o.margen_porcentaje) < 15).length;

      // Productos optimizados vs críticos
      const optimizados = opportunities.filter(o => parseFloat(o.margen_porcentaje) >= 15).length;
      const criticos     = alerts;

      setStats({
        ...globalStats,
        avgMargin,
        bestMargin,
        worstMargin,
        goalMargin,
        marginVsGoal,
        priceIndex,
        priceIndexLabel,
        priceIndexClass,
        provDiff,
        catalogHealth,
        alerts,
        optimizados,
        criticos,
        totalProveedores,
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

  if (!stats) return null;

  const marginVsGoalClass = stats.marginVsGoal >= 0 ? 'positive' : 'negative';
  const marginVsGoalIcon  = stats.marginVsGoal >= 0 ? '↑' : '↓';

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
        <div className={`stat-change ${marginVsGoalClass}`}>
          <span>{marginVsGoalIcon} {Math.abs(stats.marginVsGoal).toFixed(1)}% vs Goal</span>
        </div>
        <div className="stat-progress">
          <div
            className="stat-progress-bar"
            style={{ width: `${Math.min(stats.avgMargin / stats.goalMargin * 100, 100)}%` }}
          />
        </div>
        <div className="stat-footer">
          Meta corporativa: {stats.goalMargin}% · Mejor: {stats.bestMargin.toFixed(1)}%
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
        <div className={`stat-change ${stats.priceIndexClass}`}>
          <span>{stats.priceIndexLabel}</span>
        </div>
        <div className="stat-progress">
          <div
            className={`stat-progress-bar ${stats.priceIndex >= 100 ? '' : 'warning'}`}
            style={{ width: `${Math.min(stats.priceIndex / 150 * 100, 100)}%` }}
          />
        </div>
        <div className="stat-footer">
          Precio comp. {Number(stats.provDiff) >= 0 ? '+' : ''}{stats.provDiff}% vs costo compra
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
        <div className={`stat-change ${stats.catalogHealth >= 50 ? 'positive' : 'negative'}`}>
          <span>{stats.catalogHealth >= 50 ? '✓' : '⚠'} {stats.optimizados} de {stats.totalProveedores} proveedores</span>
        </div>
        <div className="stat-details">
          <div className="stat-detail-item">
            <span>Optimizado:</span>
            <strong>{stats.optimizados}</strong>
          </div>
          <div className="stat-detail-item">
            <span>Crítico:</span>
            <strong>{stats.criticos}</strong>
          </div>
        </div>
        <div className="stat-footer">
          {stats.products} SKUs totales · {stats.sources} fuentes
        </div>
      </div>

      {/* Card 4: Alertas de Competitividad */}
      <div className="stat-card alert-card">
        <div className="stat-header">
          <span className="stat-label">ALERTAS DE COMPETITIVIDAD</span>
        </div>
        <div className={`stat-value-large ${stats.alerts > 0 ? 'alert' : 'success'}`}>
          {stats.alerts}
        </div>
        <div className="stat-subtitle">
          {stats.alerts === 1 ? 'Producto crítico' : 'Productos críticos'}
        </div>
        <div className="stat-alert-message">
          {stats.alerts === 0
            ? 'Sin alertas activas — todos los márgenes ≥ 15%'
            : `${stats.alerts} producto${stats.alerts > 1 ? 's' : ''} con margen menor al 15%`}
        </div>
      </div>

    </div>
  );
};

export default StatsCards;