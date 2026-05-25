// ============================================================================
// ONBOARDING TUTORIAL — Overlay paso a paso sobre la interfaz real
// Aparece automáticamente la primera vez (localStorage) + botón para repetirlo
// ============================================================================

import { useState, useEffect, useRef } from 'react';
import './OnboardingTutorial.css';

// ── Pasos del tutorial ────────────────────────────────────────────────────────
const STEPS = [
  {
    id: 'welcome',
    title: '¡Bienvenido a ApexBuy! 👋',
    description: 'Tu plataforma de inteligencia competitiva de precios. En los próximos pasos te mostramos cómo sacarle el máximo provecho al sistema.',
    target: null,
    position: 'center',
  },
  {
    id: 'sync',
    title: 'Sincroniza el catálogo',
    description: 'Este botón lanza el scraping automático de todas las fuentes: Bose, Samsung, Ktronix, Mansion y Falabella. Úsalo para actualizar los precios antes de tomar decisiones de compra.',
    target: '.btn-primary',
    position: 'bottom-left',
  },
  {
    id: 'stats',
    title: 'Indicadores clave',
    description: 'Aquí ves de un vistazo el margen promedio, el índice de precios frente a la competencia, la salud del catálogo y las alertas activas. Todo se calcula en tiempo real desde los precios scrapeados.',
    target: '.stats-cards',
    position: 'bottom',
  },
  {
    id: 'chart',
    title: 'Histórico de precios',
    description: 'La gráfica muestra la evolución del precio de compra de ApexBuy vs el promedio de la competencia. Usa los botones 7D, 30D y 12S para cambiar el rango de tiempo, y el selector para filtrar por producto.',
    target: '.chart-card',
    position: 'top',
  },
  {
    id: 'cost',
    title: 'Comparativa de costos',
    description: 'Panel resumen con el margen bruto promedio, el gap real con la competencia y la mejor oportunidad del catálogo. El botón "Ver Detalle" abre el análisis completo del producto con mayor margen.',
    target: '.cost-card',
    position: 'left',
  },
  {
    id: 'opportunities',
    title: 'Tabla de oportunidades',
    description: 'Lista todos los productos ordenados por ganancia potencial. Un producto en verde es una oportunidad real: su precio de compra mayorista está por debajo del precio de la competencia.',
    target: '.opp-table-card',
    position: 'top',
  },
  {
    id: 'products',
    title: 'Módulo de Productos',
    description: 'En la sección "Productos" puedes ver el catálogo completo con filtros, y abrir el modal de análisis detallado de cada producto para comparar precio por precio con cada competidor y validar directamente en su sitio.',
    target: null,
    position: 'center',
  },
];

const STORAGE_KEY = 'apexbuy_tutorial_completed';

const getElementRect = (selector) => {
  if (!selector) return null;
  const el = document.querySelector(selector);
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  return {
    top:    rect.top    + window.scrollY,
    left:   rect.left   + window.scrollX,
    width:  rect.width,
    height: rect.height,
    bottom: rect.bottom + window.scrollY,
    right:  rect.right  + window.scrollX,
  };
};

const getTooltipStyle = (rect, position, tw = 340, th = 200) => {
  if (!rect || position === 'center') return {};
  const gap = 16;
  const vw = window.innerWidth;
  const vh = window.innerHeight + window.scrollY;
  let top, left;

  switch (position) {
    case 'bottom':
      top  = rect.bottom + gap;
      left = rect.left + rect.width / 2 - tw / 2;
      break;
    case 'bottom-left':
      top  = rect.bottom + gap;
      left = rect.right - tw;
      break;
    case 'top':
      top  = rect.top - th - gap;
      left = rect.left + rect.width / 2 - tw / 2;
      break;
    case 'left':
      top  = rect.top + rect.height / 2 - th / 2;
      left = rect.left - tw - gap;
      break;
    case 'right':
      top  = rect.top + rect.height / 2 - th / 2;
      left = rect.right + gap;
      break;
    default:
      top  = rect.bottom + gap;
      left = rect.left;
  }

  left = Math.max(12, Math.min(left, vw - tw - 12));
  top  = Math.max(12, Math.min(top,  vh - th - 12));
  return { top, left };
};

// ─────────────────────────────────────────────────────────────────────────────

const OnboardingTutorial = ({ forceOpen = false, onClose }) => {
  const [active, setActive]           = useState(false);
  const [stepIdx, setStepIdx]         = useState(0);
  const [rect, setRect]               = useState(null);
  const [tooltipStyle, setTooltipStyle] = useState({});
  const tooltipRef                    = useRef(null);

  const step = STEPS[stepIdx];

  useEffect(() => {
    const completed = localStorage.getItem(STORAGE_KEY);
    if (!completed || forceOpen) {
      setTimeout(() => setActive(true), 600);
    }
  }, [forceOpen]);

  useEffect(() => {
    if (!active) return;
    const update = () => {
      const r = getElementRect(step.target);
      setRect(r);
      const tw = tooltipRef.current?.offsetWidth  || 340;
      const th = tooltipRef.current?.offsetHeight || 220;
      setTooltipStyle(getTooltipStyle(r, step.position, tw, th));
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [active, stepIdx, step]);

  useEffect(() => {
    if (!active || !step.target) return;
    const el = document.querySelector(step.target);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [active, stepIdx, step]);

  const next = () => {
    if (stepIdx < STEPS.length - 1) setStepIdx(i => i + 1);
    else finish();
  };

  const prev = () => {
    if (stepIdx > 0) setStepIdx(i => i - 1);
  };

  const finish = () => {
    localStorage.setItem(STORAGE_KEY, 'true');
    setActive(false);
    setStepIdx(0);
    onClose?.();
  };

  if (!active) return null;

  const isCentered = step.position === 'center' || !rect;
  const progress   = ((stepIdx + 1) / STEPS.length) * 100;

  return (
    <div className="tutorial-root">

      {/* Masks + highlight */}
      {!isCentered && rect ? (
        <>
          <div className="tutorial-mask" style={{ top: 0, left: 0, right: 0, height: rect.top }} />
          <div className="tutorial-mask" style={{ top: rect.bottom, left: 0, right: 0, bottom: 0 }} />
          <div className="tutorial-mask" style={{ top: rect.top, left: 0, width: rect.left, height: rect.height }} />
          <div className="tutorial-mask" style={{ top: rect.top, left: rect.right, right: 0, height: rect.height }} />
          <div className="tutorial-highlight" style={{
            top:    rect.top    - 4,
            left:   rect.left   - 4,
            width:  rect.width  + 8,
            height: rect.height + 8,
          }} />
        </>
      ) : (
        <div className="tutorial-mask tutorial-mask--full" />
      )}

      {/* Tooltip */}
      <div
        ref={tooltipRef}
        className={`tutorial-tooltip${isCentered ? ' tutorial-tooltip--center' : ''}`}
        style={isCentered ? {} : { position: 'absolute', ...tooltipStyle }}
      >
        {/* Progress bar */}
        <div className="tutorial-progress-track">
          <div className="tutorial-progress-fill" style={{ width: `${progress}%` }} />
        </div>

        <div className="tutorial-step-label">Paso {stepIdx + 1} de {STEPS.length}</div>
        <h3 className="tutorial-title">{step.title}</h3>
        <p className="tutorial-desc">{step.description}</p>

        {/* Dots navigation */}
        <div className="tutorial-dots">
          {STEPS.map((_, i) => (
            <button
              key={i}
              className={`tutorial-dot${i === stepIdx ? ' active' : ''}${i < stepIdx ? ' done' : ''}`}
              onClick={() => setStepIdx(i)}
              aria-label={`Paso ${i + 1}`}
            />
          ))}
        </div>

        <div className="tutorial-actions">
          <button className="tutorial-skip" onClick={finish}>
            Saltar tutorial
          </button>
          <div className="tutorial-nav">
            {stepIdx > 0 && (
              <button className="tutorial-btn tutorial-btn--secondary" onClick={prev}>
                ← Anterior
              </button>
            )}
            <button className="tutorial-btn tutorial-btn--primary" onClick={next}>
              {stepIdx === STEPS.length - 1 ? '¡Listo! 🎉' : 'Siguiente →'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingTutorial;