// ============================================================================
// DASHBOARD PAGE - CON GRÁFICAS
// ============================================================================

import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import StatsCards from '../components/dashboard/StatsCards';
import PriceHistoryChart from '../components/dashboard/PriceHistoryChart';
import CostComparison from '../components/dashboard/CostComparison';
import './Dashboard.css';

const Dashboard = () => {
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
                <button className="btn-secondary">
                  Exportar BI Data
                </button>
                <button className="btn-primary">
                  Sincronizar Catálogo
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

            {/* Próximamente: Tabla de Oportunidades */}
            <div className="coming-soon">
              <p>Próximamente:</p>
              <ul>
                <li>📋 Tabla: Salud de Productos y Alertas</li>
                <li>🔍 Filtros Avanzados</li>
                <li>📤 Exportar a Excel/CSV</li>
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;