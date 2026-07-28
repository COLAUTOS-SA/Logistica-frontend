import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Component } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ReclamacionesPage from './pages/ReclamacionesPage';
import ReclamacionDetallePage from './pages/ReclamacionDetallePage';
import NuevaReclamacionPage from './pages/NuevaReclamacionPage';
import DocumentosPage from './pages/DocumentosPage';
import UsuariosPage from './pages/UsuariosPage';
import './index.css';

class ErrorBoundary extends Component {
  constructor(props) { super(props); this.state = { error: null }; }
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, textAlign: 'center' }}>
          <h2 style={{ color: '#dc2626', marginBottom: 12 }}>Algo salió mal</h2>
          <p style={{ color: '#6b7280', marginBottom: 8, fontSize: 14 }}>
            {this.state.error?.message || 'Error inesperado'}
          </p>
          <button
            onClick={() => { this.setState({ error: null }); window.location.reload(); }}
            style={{ padding: '8px 20px', background: '#1d4ed8', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer' }}
          >
            Recargar página
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function ProtectedRoute({ children }) {
  const { usuario } = useAuth();
  if (!usuario) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  const { usuario } = useAuth();

  return (
    <Routes>
      <Route path="/" element={usuario ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/reclamaciones" element={<ReclamacionesPage />} />
        <Route path="/reclamaciones/nueva" element={<NuevaReclamacionPage />} />
        <Route path="/reclamaciones/:id" element={<ReclamacionDetallePage />} />
        <Route path="/documentos" element={<DocumentosPage />} />
        <Route path="/usuarios" element={<UsuariosPage />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
          <AppRoutes />
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  );
}
