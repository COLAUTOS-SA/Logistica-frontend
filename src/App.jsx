import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ReclamacionesPage from './pages/ReclamacionesPage';
import ReclamacionDetallePage from './pages/ReclamacionDetallePage';
import NuevaReclamacionPage from './pages/NuevaReclamacionPage';
import DocumentosPage from './pages/DocumentosPage';
import CargarDocumentosPage from './pages/CargarDocumentosPage';
import UsuariosPage from './pages/UsuariosPage';
import './index.css';

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
        <Route path="/cargar" element={<CargarDocumentosPage />} />
        <Route path="/usuarios" element={<UsuariosPage />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
