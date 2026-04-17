// ============================================================================
// HEADER COMPONENT
// ============================================================================

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import logo from '../../assets/Logo APEX BUY.svg'
import './Header.css';

const Header = () => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="header">
      <div className="header-content">
        {/* Logo */}
        <Link to="/dashboard" className="header-logo">
          <img src="../../assets/Logo APEX BUY.svg" alt="ApexBuy" />
          <span>ApexBuy</span>
        </Link>

        {/* Right side */}
        <div className="header-actions">
          {/* Dark Mode Toggle */}
          <button 
            className="btn-icon" 
            onClick={toggleTheme}
            title={isDark ? 'Modo claro' : 'Modo oscuro'}
          >
            {isDark ? '☀️' : '🌙'}
          </button>

          {/* User Menu */}
          <div className="user-menu">
            <button 
              className="user-button"
              onClick={() => setShowUserMenu(!showUserMenu)}
            >
              <div className="user-avatar">
                {user?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <span className="user-name">{user?.name || 'Usuario'}</span>
              <span className="chevron">▼</span>
            </button>

            {/* Dropdown */}
            {showUserMenu && (
              <>
                <div 
                  className="dropdown-backdrop"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="dropdown-menu">
                  <div className="dropdown-header">
                    <div className="dropdown-user-info">
                      <strong>{user?.name}</strong>
                      <span>{user?.email}</span>
                    </div>
                  </div>
                  <div className="dropdown-divider" />
                  <Link 
                    to="/settings" 
                    className="dropdown-item"
                    onClick={() => setShowUserMenu(false)}
                  >
                    ⚙️ Configuración
                  </Link>
                  <button 
                    className="dropdown-item"
                    onClick={logout}
                  >
                    🚪 Cerrar Sesión
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;