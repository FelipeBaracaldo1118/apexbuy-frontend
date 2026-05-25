// ============================================================================
// DASHBOARD PAGE
// ============================================================================

import { useState } from 'react';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import StatsCards from '../components/dashboard/StatsCards';
import PriceHistoryChart from '../components/dashboard/PriceHistoryChart';
import CostComparison from '../components/dashboard/CostComparison';
import OpportunitiesTable from '../components/dashboard/OpportunitiesTable_with_export';
import OnboardingTutorial from '../components/tutorial/OnboardingTutorial';
import { updateAPI, analysisAPI } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import * as XLSX from 'xlsx';
import './Dashboard.css';

const Dashboard = () => {
  const { success, error: showError } = useNotification();
  const [syncing, setSyncing]       = useState(false);
  const [exporting, setExporting]   = useState(false);
  const [lastSync, setLastSync]     = useState(null);
  const [showTutorial, setShowTutorial] = useState(false);

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

  const handleExport = async () => {
    try {
      setExporting(true);

      const [{ data: opportunities }, { data: stats }, { data: history }] = await Promise.all([
        analysisAPI.getOpportunities(),
        analysisAPI.getStats(),
        analysisAPI.getAggregatedHistory(30),
      ]);

      const wb = XLSX.utils.book_new();
      const fecha = new Date().toLocaleDateString('es-CO').replace(/\//g, '-');

      // ── Hoja 1: Oportunidades ──────────────────────────────────────────────
      const oppRows = (opportunities || []).map(o => ({
        'Producto':              o.producto,
        'Fuente':                o.fuente,
        'Precio Lista (COP)':    Number(o.precio_compra),
        'Precio Competencia':    Number(o.precio_competencia),
        'Ganancia Potencial':    Number(o.ganancia),
        'Margen (%)':            parseFloat(o.margen_porcentaje).toFixed(1),
        'Decisión':              o.decision,
      }));
      const wsOpp = XLSX.utils.json_to_sheet(oppRows);
      wsOpp['!cols'] = [{ wch: 50 }, { wch: 12 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 10 }, { wch: 15 }];
      XLSX.utils.book_append_sheet(wb, wsOpp, 'Oportunidades');

      // ── Hoja 2: Estadísticas globales ─────────────────────────────────────
      const statsRows = [
        { 'Métrica': 'Total Productos',         'Valor': stats?.products || 0 },
        { 'Métrica': 'Fuentes Activas',          'Valor': stats?.sources || 0 },
        { 'Métrica': 'Grupos de Productos',      'Valor': stats?.groups || 0 },
        { 'Métrica': 'Registros de Precio',      'Valor': stats?.price_records || 0 },
        { 'Métrica': 'Oportunidades Detectadas', 'Valor': stats?.opportunities || 0 },
        { 'Métrica': 'No Conviene',              'Valor': stats?.no_conviene || 0 },
        { 'Métrica': 'Margen Promedio (%)',       'Valor': opportunities?.length > 0
            ? (opportunities.reduce((s, o) => s + parseFloat(o.margen_porcentaje), 0) / opportunities.length).toFixed(1)
            : 0 },
        { 'Métrica': 'Fecha de exportación',     'Valor': new Date().toLocaleString('es-CO') },
      ];
      const wsStats = XLSX.utils.json_to_sheet(statsRows);
      wsStats['!cols'] = [{ wch: 28 }, { wch: 20 }];
      XLSX.utils.book_append_sheet(wb, wsStats, 'Estadísticas');

      // ── Hoja 3: Historial de precios (30 días) ────────────────────────────
      if (history && history.length > 0) {
        const histRows = history.map(h => ({
          'Fecha':                    new Date(h.fecha).toLocaleDateString('es-CO'),
          'Precio Compra Prom. (COP)': Number(h.precio_compra_avg) || 0,
          'Precio Comp. Prom. (COP)':  Number(h.precio_competencia_avg) || 0,
        }));
        const wsHist = XLSX.utils.json_to_sheet(histRows);
        wsHist['!cols'] = [{ wch: 14 }, { wch: 22 }, { wch: 22 }];
        XLSX.utils.book_append_sheet(wb, wsHist, 'Historial 30 días');
      }

      // ── Descargar ─────────────────────────────────────────────────────────
      XLSX.writeFile(wb, `ApexBuy_BI_${fecha}.xlsx`);
      success('Archivo exportado exitosamente');

    } catch (error) {
      console.error('Error exportando:', error);
      showError('Error al exportar. Intenta de nuevo.');
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
                <button
                  className="btn-ghost-help"
                  onClick={() => setShowTutorial(true)}
                  title="Ver tutorial"
                >
                  ? Ayuda
                </button>
                <button
                  className={`btn-secondary ${exporting ? 'btn-loading' : ''}`}
                  onClick={handleExport}
                  disabled={exporting}
                >
                  {exporting ? (
                    <><span className="btn-spinner" /> Exportando...</>
                  ) : (
                    'Exportar BI Data'
                  )}
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

      {/* Tutorial */}
      <OnboardingTutorial
        forceOpen={showTutorial}
        onClose={() => setShowTutorial(false)}
      />
    </div>
  );
};

export default Dashboard;