// ============================================================================
// SIDEBAR COMPONENT
// ============================================================================

import { NavLink } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
  const menuItems = [
    {
      path: '/dashboard',
      icon: '📊',
      label: 'Dashboard',
    },
    {
      path: '/products',
      icon: '📦',
      label: 'Productos',
    },
    {
      path: '/history',
      icon: '📈',
      label: 'Historial',
    },
    {
      path: '/settings',
      icon: '⚙️',
      label: 'Configuración',
    },
  ];

  return (
    <aside className="sidebar">
      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `sidebar-item ${isActive ? 'active' : ''}`
            }
          >
            <span className="sidebar-icon">{item.icon}</span>
            <span className="sidebar-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;