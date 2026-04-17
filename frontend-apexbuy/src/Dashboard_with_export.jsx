// ============================================================================
// DASHBOARD PAGE - CON EXPORTAR
// ============================================================================

import { useState } from 'react';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import StatsCards from '../components/dashboard/StatsCards';
import PriceHistoryChart from '../components/dashboard/PriceHistoryChart';
import CostComparison from '../components/dashboard/CostComparison';
import OpportunitiesTable from '../components/dashboard/OpportunitiesTable';
import { analysisAPI } from '../services/api';
import { exportStats } from '../utils/exportUtils';
import { useNotification } from '../context/NotificationContext';
import './Dashboard.css';

const Dashboard = () => {
  const { success, error } = useNotification();
  const [exporting, setExporting] = useState(false);

  const handleExportDashboard = async () => {
    try {
      setExporting(true);
      
      // Obtener stats
      const { data: globalStats } = await analysisAPI.getStats();
      const { data: opportunities } = await analysisAPI.getOpportunities();

      // Calcular métricas
      const avgMargin = opportunities.length > 0
        ? opportunities.reduce((sum, opp) => sum + parseFloat(opp.margen_porcentaje), 0) / opportunities.length
        : 0;

      const bestMargin = opportunities.length > 0
        ? Math.max(...opportunities.map(opp => parseFloat(opp.margen_porcentaje)))
        : 0;

      const priceIndex = 104.2;
      const catalogHealth = globalStats.products > 0
        ? (globalStats.opportunities / globalStats.products) * 100
        : 0;
      const alerts = opportunities.filter(opp => parseFloat(opp.margen_porcentaje) < 15).length;

      const stats = {
        ...globalStats,
        avgMargin,
        bestMargin,
        priceIndex,
        catalogHealth,
        alerts,
      };

      // Exportar
      exportStats(stats);
      success('Dashboard exportado exitosamente');
      
    } catch (err) {
      console.error('Error exportando dashboard:', err);
      error('Error al exportar dashboard');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="dashboard-container">
      <Header />
      <div className="dashboard-body">
        <Sidebar />
        <main className="dashboard-main">
          <div className="dashboard-content">
            {/* Header */}
            <div className="dashboard-header">
              <div>
                <h1>Dashboard de Inteligencia de Negocio</h1>
                <p className="dashboard-subtitle">
                  Análisis de competitividad y rentabilidad - Datos en tiempo real
                </p>
              </div>
              <div className="dashboard-actions">
                <button 
                  className="btn-secondary"
                  onClick={handleExportDashboard}
                  disabled={exporting}
                >
                  {exporting ? 'Exportando...' : '📊 Exportar BI Data'}
                </button>
              </div>
            </div>

            {/* Stats Cards */}
            <StatsCards />

            {/* Charts Section */}
            <div className="dashboard-charts">
              {/* Price History Chart */}
              <div className="chart-main">
                <PriceHistoryChart />
              </div>

              {/* Cost Comparison Card */}
              <div className="chart-sidebar">
                <CostComparison />
              </div>
            </div>

            {/* Opportunities Table */}
            <OpportunitiesTable />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;