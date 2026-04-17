// ============================================================================
// EXPORT UTILITIES
// ============================================================================
// Funciones para exportar datos a Excel y CSV
// ============================================================================

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

/**
 * Exportar datos a Excel
 * @param {Array} data - Array de objetos con los datos
 * @param {String} filename - Nombre del archivo (sin extensión)
 */
export const exportToExcel = (data, filename = 'export') => {
  try {
    // Crear workbook
    const wb = XLSX.utils.book_new();
    
    // Convertir datos a worksheet
    const ws = XLSX.utils.json_to_sheet(data);
    
    // Agregar worksheet al workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Datos');
    
    // Generar archivo
    const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
    
    // Guardar archivo
    const dataBlob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    
    saveAs(dataBlob, `${filename}.xlsx`);
    
    return true;
  } catch (error) {
    console.error('Error exportando a Excel:', error);
    throw new Error('Error al exportar a Excel');
  }
};

/**
 * Exportar datos a CSV
 * @param {Array} data - Array de objetos con los datos
 * @param {String} filename - Nombre del archivo (sin extensión)
 */
export const exportToCSV = (data, filename = 'export') => {
  try {
    if (!data || data.length === 0) {
      throw new Error('No hay datos para exportar');
    }

    // Obtener headers
    const headers = Object.keys(data[0]);
    
    // Crear CSV
    let csv = headers.join(',') + '\n';
    
    // Agregar filas
    data.forEach(row => {
      const values = headers.map(header => {
        const value = row[header];
        // Escapar comillas y comas
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      });
      csv += values.join(',') + '\n';
    });
    
    // Crear blob y descargar
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, `${filename}.csv`);
    
    return true;
  } catch (error) {
    console.error('Error exportando a CSV:', error);
    throw new Error('Error al exportar a CSV');
  }
};

/**
 * Formatear datos de oportunidades para exportar
 * @param {Array} opportunities - Array de oportunidades
 */
export const formatOpportunitiesForExport = (opportunities) => {
  return opportunities.map(opp => ({
    'Producto': opp.producto,
    'Precio Compra': opp.precio_compra,
    'Precio Competencia': opp.precio_competencia,
    'Ganancia': opp.ganancia,
    'Margen %': opp.margen_porcentaje,
    'Fuente': opp.fuente,
    'Decisión': opp.decision,
  }));
};

/**
 * Exportar stats del dashboard
 * @param {Object} stats - Objeto con estadísticas
 */
export const exportStats = (stats, filename = 'dashboard-stats') => {
  const data = [
    { 'Métrica': 'Total Productos', 'Valor': stats.products },
    { 'Métrica': 'Total Fuentes', 'Valor': stats.sources },
    { 'Métrica': 'Oportunidades', 'Valor': stats.opportunities },
    { 'Métrica': 'Mejor Margen', 'Valor': `${stats.bestMargin}%` },
    { 'Métrica': 'Margen Promedio', 'Valor': `${stats.avgMargin}%` },
    { 'Métrica': 'Índice de Precios', 'Valor': stats.priceIndex },
    { 'Métrica': 'Salud del Catálogo', 'Valor': `${stats.catalogHealth}%` },
    { 'Métrica': 'Alertas Críticas', 'Valor': stats.alerts },
  ];
  
  return exportToExcel(data, filename);
};