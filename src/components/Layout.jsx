import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getDashboardStats } from '../services/api';
import {
  LayoutDashboard, AlertTriangle, FileText,
  Users, LogOut
} from 'lucide-react';

export default function Layout() {
  const { usuario, logout, tienePermiso } = useAuth();
  const navigate = useNavigate();
  const [reclamacionesAbiertas, setReclamacionesAbiertas] = useState(0);

  useEffect(() => {
    getDashboardStats()
      .then(s => setReclamacionesAbiertas(s?.abiertas ?? 0))
      .catch(() => {});
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="app-layout">
      <aside className="sidebar">
        
        <div className="sidebar-header" style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '12px 16px'
        }}>
          <img
            src="/logo-colautos-removebg-preview.png"
            alt="Colautos"
            style={{
              width: '170px',
              objectFit: 'contain',
            }}
          />
        </div>

        <nav className="sidebar-nav">
          <div className="sidebar-section-title">Principal</div>
          <NavLink to="/dashboard" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <LayoutDashboard size={18} />
            Panel
          </NavLink>

          <div className="sidebar-section-title">Operaciones</div>
          <NavLink to="/reclamaciones" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <AlertTriangle size={18} />
            Reclamaciones
            {reclamacionesAbiertas > 0 && (
              <span className="sidebar-badge">{reclamacionesAbiertas}</span>
            )}
          </NavLink>
          {usuario?.rol !== 'colision' && (
            <NavLink to="/documentos" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
              <FileText size={18} />
              Documentos
            </NavLink>
          )}

          {tienePermiso('gestionar_usuarios') && (
            <>
              <div className="sidebar-section-title">Administración</div>
              <NavLink to="/usuarios" className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
                <Users size={18} />
                Usuarios
              </NavLink>
            </>
          )}
        </nav>

        <div className="sidebar-user">
          <div className="sidebar-user-avatar">
            {usuario?.nombre?.split(' ').map(n => n[0]).slice(0, 2).join('')}
          </div>
          <div className="sidebar-user-info">
            <h4>{usuario?.nombre}</h4>
            <span>{usuario?.rolLabel}</span>
          </div>
          <button className="sidebar-logout" onClick={handleLogout} title="Cerrar sesión">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}