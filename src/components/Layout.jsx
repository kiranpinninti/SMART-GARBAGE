import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { Home, Trash2, Bell, Settings } from 'lucide-react';

export default function Layout() {
  const location = useLocation();

  return (
    <>
      <div className="page-container">
        <Outlet />
      </div>

      <div className="bottom-nav">
        <NavLink 
          to="/dashboard" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Home size={24} />
          <span>Home</span>
        </NavLink>
        
        <NavLink 
          to="/bins" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Trash2 size={24} />
          <span>Bins</span>
        </NavLink>

        <NavLink 
          to="/notifications" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Bell size={24} />
          <span>Alerts</span>
        </NavLink>

        <NavLink 
          to="/admin" 
          className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
        >
          <Settings size={24} />
          <span>Admin</span>
        </NavLink>
      </div>
    </>
  );
}
