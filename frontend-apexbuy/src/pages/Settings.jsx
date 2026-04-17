// ============================================================================
// SETTINGS PAGE
// ============================================================================
// Configuración de usuario y preferencias
// ============================================================================

import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useNotification } from '../context/NotificationContext';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import './Settings.css';

const Settings = () => {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const { success, error: showError } = useNotification();

  const [activeTab, setActiveTab] = useState('profile');
  const [profile, setProfile] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || 'user',
  });

  const [notifications, setNotifications] = useState({
    priceChanges: true,
    newOpportunities: true,
    weeklyReport: false,
    criticalAlerts: true,
  });

  const [sources, setSources] = useState([
    { id: 1, name: 'Bose', active: true, lastUpdate: '2024-04-15 10:30' },
    { id: 2, name: 'Samsung', active: true, lastUpdate: '2024-04-15 10:28' },
    { id: 3, name: 'Ktronix', active: true, lastUpdate: '2024-04-15 10:25' },
    { id: 4, name: 'Mansion', active: false, lastUpdate: '2024-04-14 18:45' },
    { id: 5, name: 'Falabella', active: true, lastUpdate: '2024-04-15 10:32' },
  ]);

  const handleSaveProfile = (e) => {
    e.preventDefault();
    try {
      // Aquí iría la llamada al API para actualizar perfil
      success('Perfil actualizado exitosamente');
    } catch (err) {
      showError('Error al actualizar perfil');
    }
  };

  const handleSaveNotifications = () => {
    try {
      // Aquí iría la llamada al API para guardar preferencias
      success('Preferencias de notificaciones guardadas');
    } catch (err) {
      showError('Error al guardar preferencias');
    }
  };

  const toggleSource = (sourceId) => {
    setSources(sources.map(s => 
      s.id === sourceId ? { ...s, active: !s.active } : s
    ));
    success('Estado de fuente actualizado');
  };

  return (
    <div className="dashboard-container">
      <Header />
      <div className="dashboard-body">
        <Sidebar />
        <main className="dashboard-main">
          <div className="dashboard-content">
            {/* Header */}
            <div className="settings-header">
              <div>
                <h1>Configuración</h1>
                <p className="settings-subtitle">
                  Gestiona tu cuenta y preferencias
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div className="settings-tabs">
              <button
                className={`settings-tab ${activeTab === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveTab('profile')}
              >
                👤 Perfil
              </button>
              <button
                className={`settings-tab ${activeTab === 'notifications' ? 'active' : ''}`}
                onClick={() => setActiveTab('notifications')}
              >
                🔔 Notificaciones
              </button>
              <button
                className={`settings-tab ${activeTab === 'sources' ? 'active' : ''}`}
                onClick={() => setActiveTab('sources')}
              >
                🔌 Fuentes
              </button>
              <button
                className={`settings-tab ${activeTab === 'appearance' ? 'active' : ''}`}
                onClick={() => setActiveTab('appearance')}
              >
                🎨 Apariencia
              </button>
            </div>

            {/* Tab Content */}
            <div className="settings-content">
              {/* PROFILE TAB */}
              {activeTab === 'profile' && (
                <div className="settings-section">
                  <h2>Información de Perfil</h2>
                  <p className="section-description">
                    Actualiza tu información personal
                  </p>

                  <form onSubmit={handleSaveProfile} className="settings-form">
                    <div className="form-group">
                      <label htmlFor="name">Nombre Completo</label>
                      <input
                        type="text"
                        id="name"
                        value={profile.name}
                        onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="email">Correo Electrónico</label>
                      <input
                        type="email"
                        id="email"
                        value={profile.email}
                        onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="role">Rol</label>
                      <input
                        type="text"
                        id="role"
                        value={profile.role}
                        disabled
                        className="form-input"
                      />
                      <span className="form-hint">El rol solo puede ser cambiado por un administrador</span>
                    </div>

                    <div className="form-actions">
                      <button type="submit" className="btn-primary">
                        Guardar Cambios
                      </button>
                    </div>
                  </form>

                  <div className="settings-divider"></div>

                  <h3>Cambiar Contraseña</h3>
                  <p className="section-description">
                    Por seguridad, necesitas tu contraseña actual
                  </p>

                  <form className="settings-form">
                    <div className="form-group">
                      <label htmlFor="currentPassword">Contraseña Actual</label>
                      <input
                        type="password"
                        id="currentPassword"
                        placeholder="••••••••"
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="newPassword">Nueva Contraseña</label>
                      <input
                        type="password"
                        id="newPassword"
                        placeholder="••••••••"
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label htmlFor="confirmPassword">Confirmar Contraseña</label>
                      <input
                        type="password"
                        id="confirmPassword"
                        placeholder="••••••••"
                        className="form-input"
                      />
                    </div>

                    <div className="form-actions">
                      <button type="button" className="btn-primary">
                        Actualizar Contraseña
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* NOTIFICATIONS TAB */}
              {activeTab === 'notifications' && (
                <div className="settings-section">
                  <h2>Preferencias de Notificaciones</h2>
                  <p className="section-description">
                    Selecciona qué notificaciones quieres recibir
                  </p>

                  <div className="settings-list">
                    <div className="settings-item">
                      <div className="settings-item-info">
                        <h3>Cambios de Precios</h3>
                        <p>Recibe alertas cuando los precios cambien significativamente</p>
                      </div>
                      <label className="toggle">
                        <input
                          type="checkbox"
                          checked={notifications.priceChanges}
                          onChange={(e) => setNotifications({
                            ...notifications,
                            priceChanges: e.target.checked
                          })}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>

                    <div className="settings-item">
                      <div className="settings-item-info">
                        <h3>Nuevas Oportunidades</h3>
                        <p>Notificación cuando se detecten nuevas oportunidades de compra</p>
                      </div>
                      <label className="toggle">
                        <input
                          type="checkbox"
                          checked={notifications.newOpportunities}
                          onChange={(e) => setNotifications({
                            ...notifications,
                            newOpportunities: e.target.checked
                          })}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>

                    <div className="settings-item">
                      <div className="settings-item-info">
                        <h3>Reporte Semanal</h3>
                        <p>Resumen semanal de métricas y tendencias</p>
                      </div>
                      <label className="toggle">
                        <input
                          type="checkbox"
                          checked={notifications.weeklyReport}
                          onChange={(e) => setNotifications({
                            ...notifications,
                            weeklyReport: e.target.checked
                          })}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>

                    <div className="settings-item">
                      <div className="settings-item-info">
                        <h3>Alertas Críticas</h3>
                        <p>Notificaciones urgentes sobre pérdida de competitividad</p>
                      </div>
                      <label className="toggle">
                        <input
                          type="checkbox"
                          checked={notifications.criticalAlerts}
                          onChange={(e) => setNotifications({
                            ...notifications,
                            criticalAlerts: e.target.checked
                          })}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>

                  <div className="form-actions">
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={handleSaveNotifications}
                    >
                      Guardar Preferencias
                    </button>
                  </div>
                </div>
              )}

              {/* SOURCES TAB */}
              {activeTab === 'sources' && (
                <div className="settings-section">
                  <h2>Gestión de Fuentes</h2>
                  <p className="section-description">
                    Administra las fuentes de datos activas
                  </p>

                  <div className="sources-list">
                    {sources.map((source) => (
                      <div key={source.id} className="source-card">
                        <div className="source-info">
                          <h3>{source.name}</h3>
                          <p>Última actualización: {source.lastUpdate}</p>
                        </div>
                        <div className="source-status">
                          <span className={`status-badge ${source.active ? 'active' : 'inactive'}`}>
                            {source.active ? '● Activo' : '○ Inactivo'}
                          </span>
                          <button
                            className="btn-secondary btn-sm"
                            onClick={() => toggleSource(source.id)}
                          >
                            {source.active ? 'Desactivar' : 'Activar'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* APPEARANCE TAB */}
              {activeTab === 'appearance' && (
                <div className="settings-section">
                  <h2>Apariencia</h2>
                  <p className="section-description">
                    Personaliza cómo se ve la aplicación
                  </p>

                  <div className="settings-list">
                    <div className="settings-item">
                      <div className="settings-item-info">
                        <h3>Modo Oscuro</h3>
                        <p>Usa un tema oscuro para reducir la fatiga visual</p>
                      </div>
                      <label className="toggle">
                        <input
                          type="checkbox"
                          checked={isDark}
                          onChange={toggleTheme}
                        />
                        <span className="toggle-slider"></span>
                      </label>
                    </div>
                  </div>

                  <div className="settings-divider"></div>

                  <h3>Información de la Aplicación</h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Versión</span>
                      <span className="info-value">1.0.0</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Última Actualización</span>
                      <span className="info-value">Abril 2024</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Estado del Sistema</span>
                      <span className="info-value success">● Operacional</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Settings;