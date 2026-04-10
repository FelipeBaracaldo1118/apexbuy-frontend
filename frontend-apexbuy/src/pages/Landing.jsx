// ============================================================================
// LANDING PAGE - TEMPORAL
// ============================================================================

import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Landing.css';

const Landing = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="landing-page">
      {/* Header */}
      <header className="landing-header">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <img src="/logo.svg" alt="ApexBuy" />
              <span>ApexBuy</span>
            </div>
            <nav className="nav">
              {isAuthenticated ? (
                <Link to="/dashboard" className="btn-primary">
                  Ir al Dashboard
                </Link>
              ) : (
                <>
                  <Link to="/login" className="btn-secondary">
                    Iniciar Sesión
                  </Link>
                  <Link to="/register" className="btn-primary">
                    Empezar Gratis
                  </Link>
                </>
              )}
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="container">
          <h1>Monitoreo Inteligente de Precios</h1>
          <p className="hero-subtitle">
            Descubre las mejores oportunidades de negocio automáticamente
          </p>
          <div className="hero-cta">
            <Link to="/register" className="btn-primary btn-large">
              Comenzar Ahora
            </Link>
            <Link to="/login" className="btn-secondary btn-large">
              Ver Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <h3>25+</h3>
              <p>Productos Monitoreados</p>
            </div>
            <div className="stat-card">
              <h3>5</h3>
              <p>Fuentes de Datos</p>
            </div>
            <div className="stat-card">
              <h3>24/7</h3>
              <p>Monitoreo Automático</p>
            </div>
            <div className="stat-card">
              <h3>Real-time</h3>
              <p>Análisis en Tiempo Real</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features">
        <div className="container">
          <h2>¿Cómo Funciona?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">📊</div>
              <h3>Scraping Automático</h3>
              <p>
                Recopilamos precios de proveedores y competidores automáticamente
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">💰</div>
              <h3>Análisis de Márgenes</h3>
              <p>
                Calculamos márgenes y rentabilidad en tiempo real
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <h3>Oportunidades</h3>
              <p>
                Te mostramos las mejores oportunidades de compra
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <p>&copy; 2024 ApexBuy. Todos los derechos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;