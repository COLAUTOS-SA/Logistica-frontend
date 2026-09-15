import { useState, useEffect } from 'react';
import { getUsuarios, crearUsuario, editarUsuario, eliminarUsuario } from '../services/api';
import { ROLES } from '../data/mockData';
import { Plus, Shield, Mail, MapPin, Edit, Trash2, X, Eye, EyeOff } from 'lucide-react';

const SEDES = [
  'Pereira',
  'Armenia',
  'Manizales',
];

const FORM_VACIO = { nombre: '', email: '', password: '', rol: '', sede: '' };

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal (sirve para crear Y editar)
  const [modalAbierto, setModalAbierto] = useState(false);
  const [usuarioEditando, setUsuarioEditando] = useState(null); // null = crear, objeto = editar
  const [form, setForm] = useState(FORM_VACIO);
  const [errores, setErrores] = useState({});
  const [guardando, setGuardando] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const cargar = () => {
    setLoading(true);
    getUsuarios()
      .then(setUsuarios)
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { cargar(); }, []);

  const abrirCrear = () => {
    setUsuarioEditando(null);
    setForm(FORM_VACIO);
    setErrores({});
    setShowPass(false);
    setModalAbierto(true);
  };

  const abrirEditar = (user) => {
    setUsuarioEditando(user);
    setForm({ nombre: user.nombre, email: user.email, password: '', rol: user.rol, sede: user.sede ?? '' });
    setErrores({});
    setShowPass(false);
    setModalAbierto(true);
  };

  const cerrarModal = () => {
    setModalAbierto(false);
    setUsuarioEditando(null);
    setForm(FORM_VACIO);
    setErrores({});
  };

  const validar = () => {
    const e = {};
    if (!form.nombre.trim()) e.nombre = 'El nombre es obligatorio';
    if (!form.email.trim()) e.email = 'El email es obligatorio';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email inválido';
    // Contraseña obligatoria solo al crear; al editar es opcional
    if (!usuarioEditando && (!form.password || form.password.length < 6))
      e.password = 'Mínimo 6 caracteres';
    if (usuarioEditando && form.password && form.password.length < 6)
      e.password = 'Si cambia la contraseña debe tener mínimo 6 caracteres';
    if (!form.rol) e.rol = 'Seleccione un rol';
    if (!form.sede) e.sede = 'Seleccione una sede';
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const handleGuardar = async (e) => {
    e.preventDefault();
    if (!validar()) return;
    setGuardando(true);
    try {
      if (usuarioEditando) {
        const payload = {
          nombre: form.nombre.trim(),
          email: form.email.trim().toLowerCase(),
          rol: form.rol,
          sede: form.sede,
        };
        if (form.password) payload.password = form.password;
        await editarUsuario(usuarioEditando.id, payload);
      } else {
        await crearUsuario({
          nombre: form.nombre.trim(),
          email: form.email.trim().toLowerCase(),
          password: form.password,
          rol: form.rol,
          sede: form.sede,
        });
      }
      cerrarModal();
      cargar();
    } catch (err) {
      setErrores({ general: err.message });
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = async (user) => {
    if (!window.confirm(`¿Desactivar a ${user.nombre}? El usuario ya no podrá ingresar al sistema.`)) return;
    try {
      await eliminarUsuario(user.id);
      cargar();
    } catch (err) {
      alert('Error: ' + err.message);
    }
  };

  const modoEditar = !!usuarioEditando;

  return (
    <>
      <div className="page-header">
        <div className="page-header-top">
          <div>
            <h1>Gestión de Usuarios</h1>
            <p>Administración de perfiles y permisos del sistema</p>
          </div>
          <button className="btn btn-primary" onClick={abrirCrear}>
            <Plus size={16} /> Nuevo Usuario
          </button>
        </div>
      </div>

      <div className="page-body">
        {/* Contadores por rol */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {Object.entries(ROLES).map(([key, rol]) => {
            const count = usuarios.filter(u => u.rol === key).length;
            return (
              <div key={key} className="card">
                <div className="card-body" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{
                    width: '44px', height: '44px', borderRadius: 'var(--radius-md)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: key === 'admin' ? 'var(--primary-50)' : key === 'asistente' ? 'var(--success-50)' : 'var(--purple-50)',
                    color: key === 'admin' ? 'var(--primary-600)' : key === 'asistente' ? 'var(--success-600)' : 'var(--purple-600)',
                  }}>
                    <Shield size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: '24px', fontWeight: 800, color: 'var(--gray-900)' }}>{count}</div>
                    <div style={{ fontSize: '13px', color: 'var(--gray-500)' }}>{rol.label}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="card">
          <div className="card-header"><h3>Usuarios Registrados</h3></div>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Usuario</th><th>Email</th><th>Rol</th>
                  <th>Sede</th><th>Permisos</th><th></th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--gray-400)' }}>Cargando usuarios...</td></tr>
                )}
                {!loading && usuarios.map(user => (
                  <tr key={user.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{
                          width: '36px', height: '36px', borderRadius: '50%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '13px', fontWeight: 700, color: 'white',
                          background: user.rol === 'admin'
                            ? 'linear-gradient(135deg, var(--primary-500), var(--primary-700))'
                            : user.rol === 'asistente'
                            ? 'linear-gradient(135deg, var(--success-500), var(--success-700))'
                            : 'linear-gradient(135deg, var(--purple-500), var(--purple-600))',
                        }}>
                          {user.nombre.split(' ').map(n => n[0]).slice(0, 2).join('')}
                        </div>
                        <span style={{ fontWeight: 500 }}>{user.nombre}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: '13px', color: 'var(--gray-500)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Mail size={13} />{user.email}
                      </div>
                    </td>
                    <td>
                      <span className={`user-role-badge ${user.rol}`}>
                        {ROLES[user.rol]?.label ?? user.rol}
                      </span>
                    </td>
                    <td style={{ fontSize: '13px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--gray-600)' }}>
                        <MapPin size={13} />{user.sede}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {(ROLES[user.rol]?.permisos ?? []).map(p => (
                          <span key={p} style={{
                            fontSize: '11px', padding: '2px 6px',
                            background: 'var(--gray-100)', borderRadius: '3px', color: 'var(--gray-600)',
                          }}>{p}</span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '4px' }}>
                        <button
                          className="btn-icon"
                          title="Editar usuario"
                          onClick={() => abrirEditar(user)}
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          className="btn-icon"
                          title="Desactivar usuario"
                          style={{ color: 'var(--danger-500)' }}
                          onClick={() => handleEliminar(user)}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {!loading && usuarios.length === 0 && (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: 'var(--gray-400)' }}>
                    No hay usuarios registrados
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ── Modal Crear / Editar Usuario ───────────────────────────────────── */}
      {modalAbierto && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '16px',
        }}>
          <div style={{
            background: 'white', borderRadius: 'var(--radius-lg)',
            width: '100%', maxWidth: '480px',
            boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          }}>
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '20px 24px', borderBottom: '1px solid var(--gray-200)',
            }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>
                {modoEditar ? `Editar: ${usuarioEditando.nombre}` : 'Nuevo Usuario'}
              </h3>
              <button className="btn-icon" onClick={cerrarModal}><X size={18} /></button>
            </div>

            {/* Form */}
            <form onSubmit={handleGuardar} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {errores.general && (
                <div style={{
                  padding: '10px 14px', background: '#fef2f2',
                  border: '1px solid #fca5a5', borderRadius: '8px',
                  color: '#b91c1c', fontSize: '13px',
                }}>
                  {errores.general}
                </div>
              )}

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '6px', fontSize: '13px' }}>
                  Nombre completo <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  className="form-control"
                  placeholder="Ej: María García"
                  value={form.nombre}
                  onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))}
                />
                {errores.nombre && <span style={{ color: 'var(--danger-500)', fontSize: '12px' }}>{errores.nombre}</span>}
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '6px', fontSize: '13px' }}>
                  Correo electrónico <span style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="email"
                  className="form-control"
                  placeholder="usuario@colautos.com"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                />
                {errores.email && <span style={{ color: 'var(--danger-500)', fontSize: '12px' }}>{errores.email}</span>}
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '6px', fontSize: '13px' }}>
                  {modoEditar ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña *'}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'}
                    className="form-control"
                    placeholder={modoEditar ? 'Dejar vacío para mantener la actual' : 'Mínimo 6 caracteres'}
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    style={{ paddingRight: '40px' }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    style={{
                      position: 'absolute', right: '10px', top: '50%',
                      transform: 'translateY(-50%)', background: 'none',
                      border: 'none', cursor: 'pointer', color: 'var(--gray-400)',
                      display: 'flex', padding: '4px',
                    }}
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errores.password && <span style={{ color: 'var(--danger-500)', fontSize: '12px' }}>{errores.password}</span>}
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: '6px', fontSize: '13px' }}>
                    Rol <span style={{ color: 'red' }}>*</span>
                  </label>
                  <select
                    className="form-control"
                    value={form.rol}
                    onChange={e => setForm(f => ({ ...f, rol: e.target.value }))}
                  >
                    <option value="">Seleccionar...</option>
                    {Object.entries(ROLES).map(([key, r]) => (
                      <option key={key} value={key}>{r.label}</option>
                    ))}
                  </select>
                  {errores.rol && <span style={{ color: 'var(--danger-500)', fontSize: '12px' }}>{errores.rol}</span>}
                </div>

                <div className="form-group" style={{ marginBottom: 0 }}>
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: '6px', fontSize: '13px' }}>
                    Sede <span style={{ color: 'red' }}>*</span>
                  </label>
                  <select
                    className="form-control"
                    value={form.sede}
                    onChange={e => setForm(f => ({ ...f, sede: e.target.value }))}
                  >
                    <option value="">Seleccionar...</option>
                    {SEDES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  {errores.sede && <span style={{ color: 'var(--danger-500)', fontSize: '12px' }}>{errores.sede}</span>}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', paddingTop: '8px' }}>
                <button type="button" className="btn btn-secondary" onClick={cerrarModal}>
                  Cancelar
                </button>
                <button type="submit" className="btn btn-primary" disabled={guardando}>
                  {guardando ? 'Guardando...' : modoEditar ? 'Guardar cambios' : 'Crear Usuario'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
