import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { validarAccesoDirecto } from '../services/api';

export default function AccesoDirectoPage() {
  const { token } = useParams();
  const navigate  = useNavigate();
  const { loginDirecto } = useAuth();

  const [estado, setEstado] = useState('verificando'); // verificando | error
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    if (!token) {
      setEstado('error');
      setMensaje('Enlace inválido.');
      return;
    }

    validarAccesoDirecto(token)
      .then(({ usuario, redirigir_a }) => {
        loginDirecto(usuario);
        navigate(redirigir_a || '/dashboard', { replace: true });
      })
      .catch((err) => {
        setEstado('error');
        setMensaje(err.message || 'El enlace no es válido o ya fue utilizado.');
      });
  }, [token]);

  if (estado === 'verificando') {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f4f4f4',
        fontFamily: "'Montserrat', sans-serif",
      }}>
        <div style={{
          background: '#fff',
          borderRadius: 12,
          padding: '48px 56px',
          boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          textAlign: 'center',
          maxWidth: 400,
          width: '90%',
        }}>
          <div style={{
            width: 48, height: 48,
            border: '4px solid #e5e7eb',
            borderTopColor: '#1e4d2b',
            borderRadius: '50%',
            animation: 'spin 0.9s linear infinite',
            margin: '0 auto 24px',
          }} />
          <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: '0 0 8px' }}>
            Verificando acceso...
          </h2>
          <p style={{ fontSize: 13, color: '#6b7280', margin: 0 }}>
            Estamos validando tu enlace. Un momento.
          </p>
        </div>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // estado === 'error'
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f4f4f4',
      fontFamily: "'Montserrat', sans-serif",
    }}>
      <div style={{
        background: '#fff',
        borderRadius: 12,
        padding: '48px 56px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        textAlign: 'center',
        maxWidth: 420,
        width: '90%',
      }}>
        <div style={{
          width: 52, height: 52,
          borderRadius: '50%',
          background: '#fef2f2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          fontSize: 24,
        }}>
          ⚠️
        </div>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: '#111827', margin: '0 0 10px' }}>
          Enlace no disponible
        </h2>
        <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 28px', lineHeight: 1.6 }}>
          {mensaje}
        </p>
        <button
          onClick={() => navigate('/', { replace: true })}
          style={{
            background: '#1e4d2b',
            color: '#fff',
            border: 'none',
            borderRadius: 6,
            padding: '11px 28px',
            fontSize: 13,
            fontWeight: 700,
            cursor: 'pointer',
            fontFamily: 'inherit',
          }}
        >
          Ir al inicio de sesión
        </button>
      </div>
    </div>
  );
}
