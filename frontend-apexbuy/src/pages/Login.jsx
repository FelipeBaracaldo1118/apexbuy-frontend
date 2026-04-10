// ============================================================================
// LOGIN PAGE
// ============================================================================

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import './Login.css';

const Login = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const { success, error: showError } = useNotification();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);

  // Si ya está autenticado, redirigir a dashboard
  if (isAuthenticated) {
    navigate('/dashboard');
    return null;
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const result = await login(formData.email, formData.password);

    if (result.success) {
      success('¡Bienvenido a ApexBuy!');
      navigate('/dashboard');
    } else {
      showError(result.error || 'Error al iniciar sesión');
    }

    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        {/* Logo */}
        <div className="login-logo">
          <img src="/logo.svg" alt="ApexBuy" />
          <h1>ApexBuy</h1>
        </div>

        {/* Form */}
        <div className="login-card">
          <h2>Iniciar Sesión</h2>
          <p className="login-subtitle">
            Monitoreo inteligente de precios y oportunidades
          </p>

          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="tu@email.com"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn-primary btn-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner-small"></div>
                  Iniciando sesión...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          <div className="login-footer">
            <p>
              ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
            </p>
          </div>
        </div>

        {/* Demo credentials (temporal) */}
        <div className="demo-credentials">
          <p><strong>Demo:</strong> admin@apexbuy.com / admin123</p>
        </div>
      </div>
    </div>
  );
};

export default Login;