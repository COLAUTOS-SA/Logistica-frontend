import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const { login, loginError, loginLoading } = useAuth();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    login(email.trim(), password);
  };

  return (
    <div className="login-page">

      <div className="login-card">

        {/* Logo dentro del card */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <img
            src="/logo-colautos.png"
            alt="Colautos"
            style={{ width: '280px' }}
          />
          <h2 style={{ margin: '8px 0 0', fontSize: '18px', fontWeight: 600, color: '#1e3a5f' }}>
            Sistema de Gestión Logística
          </h2>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500, color: '#444' }}>
              Correo electrónico:
            </label>
            <input
              type="email"
              className="form-control"
              placeholder="usuario@colautos.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="username"
              required
              style={{ background: '#e8f0fb', border: '1px solid #c8d8f0', color: '#222' }}
            />
          </div>

          <div className="form-group" style={{ marginBottom: 0 }}>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: 500, color: '#444' }}>
              Contraseña:
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPass ? 'text' : 'password'}
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                style={{ paddingRight: '40px', background: '#e8f0fb', border: '1px solid #c8d8f0', color: '#222' }}
              />
              <button
                type="button"
                onClick={() => setShowPass(v => !v)}
                style={{
                  position: 'absolute', right: '10px', top: '50%',
                  transform: 'translateY(-50%)', background: 'none',
                  border: 'none', cursor: 'pointer', color: '#666',
                  display: 'flex', padding: '4px',
                }}
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {loginError && (
            <div style={{
              background: '#fdecea', border: '1px solid #f5c6cb',
              color: '#c0392b', borderRadius: '8px', padding: '10px 14px', fontSize: '13px',
            }}>
              {loginError}
            </div>
          )}

          <button
            type="submit"
            style={{
              width: '100%', padding: '13px',
              background: '#2563eb', color: '#fff',
              border: 'none', borderRadius: '8px',
              fontWeight: 700, fontSize: '14px', letterSpacing: '0.05em',
              cursor: loginLoading ? 'not-allowed' : 'pointer',
              opacity: loginLoading ? 0.7 : 1,
              marginTop: '8px',
            }}
            disabled={loginLoading}
          >
            {loginLoading ? 'Ingresando...' : 'INGRESAR'}
          </button>
        </form>
      </div>
    </div>
  );
}
