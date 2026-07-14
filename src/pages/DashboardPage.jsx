import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getDashboardStats, getReclamaciones } from '../services/api';
import { ESTADOS_RECLAMACION } from '../data/mockData';
import {
  AlertTriangle, FileText, Clock, CheckCircle,
  TrendingUp, Truck, ArrowRight
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function DashboardPage() {
  const { usuario, tienePermiso } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [recientes, setRecientes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function cargar() {
      try {
        const [s, recs] = await Promise.all([
          getDashboardStats(),
          getReclamaciones(),
        ]);
        setStats(s);
        setRecientes(recs.slice(0, 3));
      } catch (e) {
        console.error('Error cargando dashboard:', e);
      } finally {
        setLoading(false);
      }
    }
    cargar();
  }, []);

  if (loading) {
    return (
      <>
        <div className="page-header"><h1>Dashboard</h1></div>
        <div className="page-body">
          <div style={{ textAlign: 'center', padding: '60px', color: 'var(--gray-400)' }}>
            Cargando datos...
          </div>
        </div>
      </>
    );
  }

  const urgentes = recientes.filter(
    r => r.diasHabiles >= 7 && !['cerrada', 'radicada_vigia', 'aprobada', 'en_facturacion'].includes(r.estado)
  );

  return (
    <>
      <div className="page-header">
        <div className="page-header-top">
          <div>
            <h1>Dashboard</h1>
            <p>Bienvenido, {usuario?.nombre} · Vista general del área logística</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {tienePermiso('crear') && (
              <button className="btn btn-primary" onClick={() => navigate('/reclamaciones/nueva')}>
                <AlertTriangle size={16} />
                Nueva Reclamación
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="page-body">
        {stats?.proximas_vencer > 0 && (
          <div className="alert-banner danger">
            <Clock size={18} />
            <span>
              <strong>¡Atención!</strong> {stats.proximas_vencer} reclamación(es) próximas a vencer el plazo de 10 días hábiles.
            </span>
          </div>
        )}

        <div className="dashboard-stats">
          <div className="stat-card red">
            <div className="stat-icon red"><AlertTriangle size={22} /></div>
            <div className="stat-info">
              <h3>{stats?.abiertas ?? 0}</h3>
              <p>Reclamaciones Abiertas</p>
            </div>
          </div>
          <div className="stat-card yellow">
            <div className="stat-icon yellow"><Clock size={22} /></div>
            <div className="stat-info">
              <h3>{stats?.en_gestion ?? 0}</h3>
              <p>En Gestión</p>
            </div>
          </div>
          <div className="stat-card blue">
            <div className="stat-icon blue"><Truck size={22} /></div>
            <div className="stat-info">
              <h3>{stats?.radicadas ?? 0}</h3>
              <p>Radicadas en Vigía</p>
            </div>
          </div>
          <div className="stat-card green">
            <div className="stat-icon green"><CheckCircle size={22} /></div>
            <div className="stat-info">
              <h3>{(stats?.aprobadas ?? 0) + (stats?.cerradas ?? 0)}</h3>
              <p>Aprobadas / Cerradas</p>
            </div>
          </div>
          <div className="stat-card purple">
            <div className="stat-icon purple"><FileText size={22} /></div>
            <div className="stat-info">
              <h3>{stats?.total ?? 0}</h3>
              <p>Total Reclamaciones</p>
            </div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div className="card">
            <div className="card-header">
              <h3>Reclamaciones Recientes</h3>
              <button className="btn btn-sm btn-secondary" onClick={() => navigate('/reclamaciones')}>
                Ver todas <ArrowRight size={14} />
              </button>
            </div>
            <div className="card-body" style={{ padding: 0 }}>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Vehículo</th>
                      <th>Novedad</th>
                      <th>Estado</th>
                      <th>Días</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recientes.map(rec => {
                      const daysClass = rec.diasHabiles <= 5 ? 'safe' : rec.diasHabiles <= 8 ? 'warning' : 'danger';
                      const estadoInfo = ESTADOS_RECLAMACION.find(e => e.id === rec.estado);
                      return (
                        <tr key={rec.id} className="clickable-row" onClick={() => navigate(`/reclamaciones/${rec.id}`)}>
                          <td style={{ fontWeight: 600, color: 'var(--primary-600)' }}>{rec.id}</td>
                          <td>
                            <div style={{ fontSize: '13px', fontWeight: 500 }}>{rec.vehiculo.split(' - ')[0]}</div>
                            <div className="vin-display">{rec.vin}</div>
                          </td>
                          <td><span className="badge-tipo">{rec.tipoNovedad}</span></td>
                          <td><span className={`badge badge-${rec.estado}`}>{estadoInfo?.label}</span></td>
                          <td>
                            <div className={`days-counter ${daysClass}`}>
                              {rec.diasHabiles}d
                              <div className="days-bar">
                                <div className={`days-bar-fill ${daysClass}`}
                                  style={{ width: `${Math.min((rec.diasHabiles / rec.diasLimite) * 100, 100)}%` }} />
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-header"><h3>Resumen por Estado</h3></div>
            <div className="card-body">
              {ESTADOS_RECLAMACION.map(estado => {
                const count = stats?.[estado.id] ?? 0;
                const total = stats?.total ?? 1;
                const pct = total > 0 ? (count / total) * 100 : 0;
                return (
                  <div key={estado.id} style={{ marginBottom: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--gray-700)' }}>{estado.label}</span>
                      <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--gray-800)' }}>{count}</span>
                    </div>
                    <div style={{ height: '8px', background: 'var(--gray-100)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: estado.color, borderRadius: '4px', transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
