// ============================================================================
// REGISTER PAGE
// ============================================================================

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import './Login.css'; // Reutilizamos los estilos del login

const Register = () => {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();
  const { success, error: showError } = useNotification();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

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
    // Limpiar error del campo cuando el usuario escribe
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: '',
      });
    }
  };

  const validate = () => {
    const newErrors = {};

    // Validar nombre
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (formData.name.length < 3) {
      newErrors.name = 'El nombre debe tener al menos 3 caracteres';
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Email inválido';
    }

    // Validar contraseña
    if (!formData.password) {
      newErrors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    // Validar confirmación de contraseña
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Las contraseñas no coinciden';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setLoading(true);

    const result = await register(
      formData.name,
      formData.email,
      formData.password
    );

    if (result.success) {
      success('¡Cuenta creada exitosamente!');
      navigate('/dashboard');
    } else {
      showError(result.error || 'Error al crear la cuenta');
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
          <h2>Crear Cuenta</h2>
          <p className="login-subtitle">
            Únete y descubre oportunidades de negocio
          </p>

          <form onSubmit={handleSubmit} className="login-form">
            {/* Nombre */}
            <div className="form-group">
              <label htmlFor="name">Nombre completo</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Juan Pérez"
                className={errors.name ? 'input-error' : ''}
              />
              {errors.name && (
                <span className="error-message">{errors.name}</span>
              )}
            </div>

            {/* Email */}
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="tu@email.com"
                className={errors.email ? 'input-error' : ''}
              />
              {errors.email && (
                <span className="error-message">{errors.email}</span>
              )}
            </div>

            {/* Contraseña */}
            <div className="form-group">
              <label htmlFor="password">Contraseña</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={errors.password ? 'input-error' : ''}
              />
              {errors.password && (
                <span className="error-message">{errors.password}</span>
              )}
            </div>

            {/* Confirmar Contraseña */}
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmar contraseña</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className={errors.confirmPassword ? 'input-error' : ''}
              />
              {errors.confirmPassword && (
                <span className="error-message">{errors.confirmPassword}</span>
              )}
            </div>

            <button 
              type="submit" 
              className="btn-primary btn-full"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="spinner-small"></div>
                  Creando cuenta...
                </>
              ) : (
                'Crear Cuenta'
              )}
            </button>
          </form>

          <div className="login-footer">
            <p>
              ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;