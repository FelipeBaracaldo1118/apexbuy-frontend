// ============================================================================
// PRICE HISTORY CHART COMPONENT
// ============================================================================
// Gráfica de líneas: Histórico de Precios de Mercado
// Línea roja: PRECIO APEXBUY
// Línea gris punteada: PROMEDIO COMPETENCIA
// Eje X: días o semanas reales (según rango seleccionado)
// Eje Y: precios en COP formateados correctamente ($X.Xm / $XXXk)
// ============================================================================

import { useEffect, useState, useCallback } from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { analysisAPI } from '../../services/api';
import { useNotification } from '../../context/NotificationContext';
import './PriceHistoryChart.css';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement,
  Title, Tooltip, Legend, Filler
);

// ── Helpers ──────────────────────────────────────────────────────────────────

const formatCOP = (value) => {
  if (value >= 1_000_000) {
    const m = value / 1_000_000;
    return '$' + (Number.isInteger(m) ? m : m.toFixed(1)) + 'M';
  }
  if (value >= 1_000) return '$' + Math.round(value / 1_000) + 'K';
  return '$' + value.toLocaleString('es-CO');
};

const formatCOPFull = (value) =>
  '$' + Math.round(value).toLocaleString('es-CO');

const formatDateLabel = (dateStr, range) => {
  const date = new Date(dateStr);
  if (range === '7d')
    return date.toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric' });
  if (range === '30d')
    return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
  return 'Sem ' + date.toLocaleDateString('es-CO', { day: 'numeric', month: 'short' });
};

const groupByWeek = (records) => {
  const weeks = {};
  records.forEach(({ fecha, precio }) => {
    const d = new Date(fecha);
    const monday = new Date(d);
    monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    const key = monday.toISOString().split('T')[0];
    if (!weeks[key]) weeks[key] = { sum: 0, count: 0 };
    weeks[key].sum += precio;
    weeks[key].count += 1;
  });
  return Object.entries(weeks)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([fecha, { sum, count }]) => ({ fecha, precio: sum / count }));
};

// ─────────────────────────────────────────────────────────────────────────────

const RANGE_OPTIONS = [
  { value: '7d',  label: '7D' },
  { value: '30d', label: '30D' },
  { value: '90d', label: '12S' },
];

const RANGE_LIMIT = { '7d': 7, '30d': 30, '90d': 90 };

// ─────────────────────────────────────────────────────────────────────────────

const PriceHistoryChart = () => {
  const { error: showError } = useNotification();
  const [chartData, setChartData]           = useState(null);
  const [loading, setLoading]               = useState(true);
  const [products, setProducts]             = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('all');
  const [selectedRange, setSelectedRange]     = useState('30d');

  // Cargar lista de productos con UUID reales al montar
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data } = await analysisAPI.getProductsList();
        setProducts(data || []);
      } catch { /* silencioso — el selector queda en "Todos" */ }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    loadChartData();
  }, [selectedProduct, selectedRange]);

  const buildChart = (apexbuyRecords, compRecords) => {
    const labels = apexbuyRecords.map(({ fecha }) => formatDateLabel(fecha, selectedRange));
    setChartData({
      labels,
      datasets: [
        {
          label: 'PRECIO APEXBUY',
          data: apexbuyRecords.map(({ precio }) => precio),
          borderColor: '#E12613',
          backgroundColor: 'rgba(225, 38, 19, 0.08)',
          borderWidth: 3,
          tension: 0.4,
          fill: false,
          pointRadius: apexbuyRecords.length <= 15 ? 5 : 3,
          pointHoverRadius: 7,
          pointBackgroundColor: '#E12613',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
        },
        {
          label: 'PROMEDIO COMPETENCIA',
          data: compRecords.map(({ precio }) => precio),
          borderColor: '#828280',
          backgroundColor: 'rgba(130, 130, 128, 0.05)',
          borderWidth: 2,
          borderDash: [8, 4],
          tension: 0.4,
          fill: false,
          pointRadius: 0,
          pointHoverRadius: 5,
          pointBackgroundColor: '#828280',
          pointBorderColor: '#fff',
          pointBorderWidth: 2,
        },
      ],
    });
  };

  const loadChartData = async () => {
    try {
      setLoading(true);
      const limit = RANGE_LIMIT[selectedRange];

      if (selectedProduct === 'all') {
        // ── Modo "Todos": historial agregado del backend (no necesita UUID) ──
        const { data: history } = await analysisAPI.getAggregatedHistory(limit);

        if (!history || history.length === 0) { setChartData(null); return; }

        let apexbuyRecords = history.map(({ fecha, precio_compra_avg }) => ({
          fecha: fecha.split('T')[0], precio: Number(precio_compra_avg),
        })).filter(r => r.precio > 0);

        let compRecords = history.map(({ fecha, precio_competencia_avg }) => ({
          fecha: fecha.split('T')[0], precio: Number(precio_competencia_avg),
        })).filter(r => r.precio > 0);

        if (selectedRange === '90d') {
          apexbuyRecords = groupByWeek(apexbuyRecords);
          compRecords    = groupByWeek(compRecords);
        }

        buildChart(apexbuyRecords, compRecords);

      } else {
        const { data: history } = await analysisAPI.getPriceHistory(selectedProduct, limit);
        if (!history || history.length === 0) { setChartData(null); return; }

        let apexbuyRecords = history.map(({ fecha, precio_compra }) => ({
          fecha: fecha.split('T')[0], precio: precio_compra,
        }));
        let compRecords = history.map(({ fecha, precio_competencia }) => ({
          fecha: fecha.split('T')[0], precio: precio_competencia,
        }));

        if (selectedRange === '90d') {
          apexbuyRecords = groupByWeek(apexbuyRecords);
          compRecords    = groupByWeek(compRecords);
        }

        buildChart(apexbuyRecords, compRecords);
      }

    } catch (error) {
      console.error('Error cargando datos de gráfica:', error);
      showError('Error cargando histórico de precios');
      setChartData(null);
    } finally {
      setLoading(false);
    }
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: 'index', intersect: false },
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { size: 12, family: 'var(--font-family)' },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0,0,0,0.82)',
        titleFont: { size: 13, family: 'var(--font-family)', weight: '600' },
        bodyFont:  { size: 12, family: 'var(--font-family)' },
        padding: 14,
        displayColors: true,
        callbacks: {
          label: (ctx) => `  ${ctx.dataset.label}: ${formatCOPFull(ctx.parsed.y)}`,
          afterBody: (ctxArr) => {
            const apex = ctxArr.find((c) => c.dataset.label === 'PRECIO APEXBUY');
            const comp = ctxArr.find((c) => c.dataset.label === 'PROMEDIO COMPETENCIA');
            if (apex && comp) {
              const diff = apex.parsed.y - comp.parsed.y;
              const pct  = ((diff / comp.parsed.y) * 100).toFixed(1);
              const sign = diff >= 0 ? '+' : '';
              return [
                '  ─────────────────',
                `  Diferencia: ${sign}${formatCOPFull(diff)} (${sign}${pct}%)`,
              ];
            }
            return [];
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: (value) => formatCOP(value),
          font:  { size: 11, family: 'var(--font-family)' },
          color: '#828280',
          maxTicksLimit: 6,
        },
        grid: { color: 'rgba(0,0,0,0.05)', drawBorder: false },
      },
      x: {
        ticks: {
          font:  { size: 11, family: 'var(--font-family)' },
          color: '#828280',
          maxRotation: 35,
          autoSkip: true,
          maxTicksLimit: selectedRange === '7d' ? 7 : selectedRange === '30d' ? 10 : 12,
        },
        grid: { display: false },
      },
    },
  };

  if (loading) {
    return (
      <div className="chart-card">
        <div className="chart-loading">
          <div className="spinner"></div>
          <p>Cargando histórico...</p>
        </div>
      </div>
    );
  }

  if (!chartData) {
    return (
      <div className="chart-card">
        <div className="chart-empty">
          <p>No hay datos de historial disponibles aún.</p>
          <p style={{ fontSize: '0.85rem', color: '#aaa', marginTop: '6px' }}>
            Los datos aparecerán aquí una vez que el scraper haya registrado precios.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="chart-card">
      <div className="chart-header">
        <div>
          <h3>Histórico de Precios de Mercado</h3>
          <p className="chart-subtitle">
            Evolución de precios — ApexBuy vs. Competencia
          </p>
        </div>

        <div className="chart-controls">
          <div className="chart-range-tabs">
            {RANGE_OPTIONS.map(({ value, label }) => (
              <button
                key={value}
                className={`range-tab${selectedRange === value ? ' active' : ''}`}
                onClick={() => setSelectedRange(value)}
              >
                {label}
              </button>
            ))}
          </div>

          <select
            className="chart-select"
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
          >
            <option value="all">Todos los Productos Top</option>
            {products.map((p, i) => (
              <option key={i} value={p.id}>
                {p.name}{p.brand ? ` — ${p.brand}` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="chart-body">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default PriceHistoryChart;