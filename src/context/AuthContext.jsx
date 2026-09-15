import { createContext, useContext, useState } from 'react';
import { login as apiLogin } from '../services/api';

const AuthContext = createContext(null);

const ROLES = {
  admin:     { label: 'Administrador (Logística)', permisos: ['crear', 'editar', 'eliminar', 'consultar', 'exportar', 'gestionar_usuarios'] },
  asistente: { label: 'Asistente Comercial',       permisos: ['crear', 'consultar'] },
  colision:  { label: 'Área de Colisión',           permisos: ['consultar', 'subir_cotizacion'] },
};

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const login = async (email, password) => {
    setLoginLoading(true);
    setLoginError('');
    try {
      const { usuario: u } = await apiLogin(email, password);
      const rolInfo = ROLES[u.rol] ?? { label: u.rol, permisos: ['consultar'] };
      setUsuario({ ...u, permisos: rolInfo.permisos, rolLabel: rolInfo.label });
    } catch (e) {
      setLoginError(e.message || 'Credenciales incorrectas');
    } finally {
      setLoginLoading(false);
    }
  };

  const logout = () => setUsuario(null);

  const tienePermiso = (permiso) => {
    if (!usuario) return false;
    return usuario.permisos.includes(permiso);
  };

  /** Loguea directamente desde un magic link, sin contraseña. */
  const loginDirecto = (usuarioData) => {
    const rolInfo = ROLES[usuarioData.rol] ?? { label: usuarioData.rol, permisos: ['consultar'] };
    setUsuario({ ...usuarioData, permisos: rolInfo.permisos, rolLabel: rolInfo.label });
  };

  return (
    <AuthContext.Provider value={{ usuario, login, loginDirecto, logout, tienePermiso, loginError, loginLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
