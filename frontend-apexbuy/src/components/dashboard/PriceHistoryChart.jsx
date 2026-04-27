// ============================================================================
// PRICE HISTORY CHART COMPONENT
// ============================================================================
// Gráfica de líneas: Histórico de Precios de Mercado
// Línea roja: PRECIO APEXBUY
// Línea gris punteada: PROMEDIO COMPETENCIA
// ============================================================================

import { useEffect, useState } from 'react';
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

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const PriceHistoryChart = () => {
  const { error: showError } = useNotification();
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState('all');

  useEffect(() => {
    loadChartData();
  }, [selectedProduct]);

  const loadChartData = async () => {
    try {
      setLoading(true);

      // Obtener oportunidades para tener datos
      const { data: opportunities } = await analysisAPI.getOpportunities();

      if (!opportunities || opportunities.length === 0) {
        setChartData(null);
        return;
      }

      // Generar datos simulados de histórico (últimos 10 meses)
      const months = ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL', 'AGO', 'SEP', 'OCT'];
      
      // Precio promedio ApexBuy (precio de compra)
      const avgBuyPrice = opportunities.reduce((sum, opp) => 
        sum + opp.precio_compra, 0) / opportunities.length;
      
      // Precio promedio Competencia
      const avgCompPrice = opportunities.reduce((sum, opp) => 
        sum + opp.precio_competencia, 0) / opportunities.length;

      // Generar tendencia (simulada - después usar datos reales)
      const apexBuyPrices = months.map((_, i) => {
        const variation = Math.random() * 0.1 - 0.05; // ±5% variación
        return Math.round(avgBuyPrice * (1 + variation));
      });

      const competitionPrices = months.map((_, i) => {
        const variation = Math.random() * 0.08 - 0.04; // ±4% variación
        return Math.round(avgCompPrice * (1 + variation));
      });

      const data = {
        labels: months,
        datasets: [
          {
            label: 'PRECIO APEXBUY',
            data: apexBuyPrices,
            borderColor: '#E12613',
            backgroundColor: 'rgba(225, 38, 19, 0.1)',
            borderWidth: 3,
            tension: 0.4,
            fill: false,
            pointRadius: 5,
            pointHoverRadius: 7,
            pointBackgroundColor: '#E12613',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
          },
          {
            label: 'PROMEDIO COMPETENCIA',
            data: competitionPrices,
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
      };

      setChartData(data);

    } catch (error) {
      console.error('Error cargando datos de gráfica:', error);
      showError('Error cargando histórico de precios');
    } finally {
      setLoading(false);
    }
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12,
            family: 'var(--font-family)',
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          size: 13,
          family: 'var(--font-family)',
        },
        bodyFont: {
          size: 12,
          family: 'var(--font-family)',
        },
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            label += '$' + context.parsed.y.toLocaleString('es-CO');
            return label;
          }
        }
      },
    },
    scales: {
      y: {
        beginAtZero: false,
        ticks: {
          callback: function(value ) {
            return '$' + ' precio';
          },
          font: {
            size: 11,
            family: 'var(--font-family)',
          },
          color: '#828280',
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
          drawBorder: false,
        },
      },
      x: {
        ticks: {
          font: {
            size: 11,
            family: 'var(--font-family)',
          },
          color: '#828280',
        },
        grid: {
          display: false,
        },
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
          <p>No hay datos disponibles</p>
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
            Seguimiento de precios promedio para los 10 productos top
          </p>
        </div>
        <select 
          className="chart-select"
          value={selectedProduct}
          onChange={(e) => setSelectedProduct(e.target.value)}
        >
          <option value="all">Todos los Productos Top</option>
        </select>
      </div>
      <div className="chart-body">
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default PriceHistoryChart;