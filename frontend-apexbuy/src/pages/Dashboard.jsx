// ============================================================================
// DASHBOARD PAGE
// ============================================================================

import { useState } from 'react';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import StatsCards from '../components/dashboard/StatsCards';
import PriceHistoryChart from '../components/dashboard/PriceHistoryChart';
import CostComparison from '../components/dashboard/CostComparison';
import { updateAPI } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import './Dashboard.css';

const Dashboard = () => {
  const { success, error: showError } = useNotification();
  const [syncing, setSyncing] = useState(false);
  const [lastSync, setLastSync] = useState(null);

  const handleSync = async () => {
    try {
      setSyncing(true);
      await updateAPI.updateAllProviders();
      const now = new Date();
      setLastSync(now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' }));
      success('Catálogo sincronizado exitosamente');
    } catch (error) {
      showError('Error al sincronizar. Intenta de nuevo.');
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="dashboard-container">
      <Header />
      <div className="dashboard-body">
        <Sidebar />
        <main className="dashboard-main">
          <div className="dashboard-content">

            {/* ── Header ── */}
            <div className="dashboard-header">
              <div>
                <h1>Dashboard de Inteligencia de Negocio</h1>
                <p className="dashboard-subtitle">
                  Análisis de competitividad y rentabilidad
                  {lastSync && (
                    <span className="last-sync"> · Último sync: {lastSync}</span>
                  )}
                </p>
              </div>
              <div className="dashboard-actions">
                <button className="btn-secondary">
                  Exportar BI Data
                </button>
                <button
                  className={`btn-primary ${syncing ? 'btn-loading' : ''}`}
                  onClick={handleSync}
                  disabled={syncing}
                >
                  {syncing ? (
                    <><span className="btn-spinner" /> Sincronizando...</>
                  ) : (
                    'Sincronizar Catálogo'
                  )}
                </button>
              </div>
            </div>

            {/* ── Stats Cards ── */}
            <StatsCards />

            {/* ── Charts ── */}
            <div className="dashboard-charts">
              <div className="chart-main">
                <PriceHistoryChart />
              </div>
              <div className="chart-sidebar">
                <CostComparison />
              </div>
            </div>



          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;