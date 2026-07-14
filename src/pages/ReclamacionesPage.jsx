import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getReclamaciones } from '../services/api';
import { ESTADOS_RECLAMACION, TIPOS_NOVEDAD } from '../data/mockData';
import {
  Search, Plus, AlertTriangle, Download, Eye, Clock
} from 'lucide-react';

export default function ReclamacionesPage() {
  const { tienePermiso } = useAuth();
  const navigate = useNavigate();

  const [reclamaciones, setReclamaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');

  useEffect(() => {
    getReclamaciones()
      .then(setReclamaciones)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const exportarCSV = () => {
    const cols = ['ID', 'Fecha', 'VIN', 'Vehículo', 'Tipo Novedad', 'Transportadora', 'No. Remesa', 'Estado', 'Días Hábiles', 'Responsable'];
    const filas = reclamacionesFiltradas.map(r => [
      r.id,
      new Date(r.fechaReporte).toLocaleDateString('es-CO'),
      r.vin,
      r.vehiculo,
      r.tipoNovedad,
      r.transportadora,
      r.remesaNo,
      ESTADOS_RECLAMACION.find(e => e.id === r.estado)?.label ?? r.estado,
      r.diasHabiles,
      r.responsableActual,
    ].map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','));

    const csv = [cols.join(','), ...filas].join('\n');
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reclamaciones_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const reclamacionesFiltradas = reclamaciones.filter(rec => {
    const matchBusqueda = !busqueda ||
      rec.id.toLowerCase().includes(busqueda.toLowerCase()) ||
      rec.vin.toLowerCase().includes(busqueda.toLowerCase()) ||
      rec.vehiculo.toLowerCase().includes(busqueda.toLowerCase()) ||
      rec.remesaNo.toLowerCase().includes(busqueda.toLowerCase());
    const matchEstado = !filtroEstado || rec.estado === filtroEstado;
    const matchTipo   = !filtroTipo   || rec.tipoNovedad === filtroTipo;
    return matchBusqueda && matchEstado && matchTipo;
  });

  return (
    <>
      <div className="page-header">
        <div className="page-header-top">
          <div>
            <h1>Reclamaciones</h1>
            <p>Gestión y seguimiento de reclamaciones a transportadoras</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary" onClick={exportarCSV} disabled={reclamacionesFiltradas.length === 0}>
              <Download size={16} /> Exportar CSV ({reclamacionesFiltradas.length})
            </button>
            {tienePermiso('crear') && (
              <button className="btn btn-primary" onClick={() => navigate('/reclamaciones/nueva')}>
                <Plus size={16} /> Nueva Reclamación
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="page-body">
        <div className="filters-bar">
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
            <input
              type="text"
              className="filter-input"
              placeholder="Buscar por ID, VIN, vehículo o número de remesa..."
              style={{ paddingLeft: '36px', width: '100%' }}
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>
          <select className="filter-select" value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
            <option value="">Todos los estados</option>
            {ESTADOS_RECLAMACION.map(e => <option key={e.id} value={e.id}>{e.label}</option>)}
          </select>
          <select className="filter-select" value={filtroTipo} onChange={e => setFiltroTipo(e.target.value)}>
            <option value="">Todos los tipos</option>
            {TIPOS_NOVEDAD.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className="card">
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>ID</th><th>Fecha</th><th>Vehículo / VIN</th>
                  <th>Novedad</th><th>Transportadora</th><th>Estado</th>
                  <th>Días hábiles</th><th>Responsable</th><th></th>
                </tr>
              </thead>
              <tbody>
                {loading && (
                  <tr><td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: 'var(--gray-400)' }}>Cargando...</td></tr>
                )}
                {!loading && reclamacionesFiltradas.map(rec => {
                  const daysClass  = rec.diasHabiles <= 5 ? 'safe' : rec.diasHabiles <= 8 ? 'warning' : 'danger';
                  const estadoInfo = ESTADOS_RECLAMACION.find(e => e.id === rec.estado);
                  const showDays   = !['cerrada', 'radicada_vigia', 'aprobada', 'en_facturacion'].includes(rec.estado);
                  return (
                    <tr key={rec.id} className="clickable-row" onClick={() => navigate(`/reclamaciones/${rec.id}`)}>
                      <td style={{ fontWeight: 600, color: 'var(--primary-600)', whiteSpace: 'nowrap' }}>{rec.id}</td>
                      <td style={{ whiteSpace: 'nowrap', fontSize: '13px', color: 'var(--gray-600)' }}>
                        {new Date(rec.fechaReporte).toLocaleDateString('es-CO')}
                      </td>
                      <td>
                        <div style={{ fontSize: '14px', fontWeight: 500 }}>{rec.vehiculo.split(' - ')[0]}</div>
                        <span className="vin-display">{rec.vin}</span>
                      </td>
                      <td><span className="badge-tipo">{rec.tipoNovedad}</span></td>
                      <td style={{ fontSize: '13px' }}>{rec.transportadora}</td>
                      <td><span className={`badge badge-${rec.estado}`}>{estadoInfo?.label}</span></td>
                      <td>
                        {showDays ? (
                          <div className={`days-counter ${daysClass}`}>
                            <Clock size={14} />
                            {rec.diasHabiles}/{rec.diasLimite}
                            <div className="days-bar">
                              <div className={`days-bar-fill ${daysClass}`}
                                style={{ width: `${Math.min((rec.diasHabiles / rec.diasLimite) * 100, 100)}%` }} />
                            </div>
                          </div>
                        ) : (
                          <span style={{ fontSize: '13px', color: 'var(--gray-400)' }}>—</span>
                        )}
                      </td>
                      <td style={{ fontSize: '13px' }}>{rec.responsableActual}</td>
                      <td><button className="btn-icon" title="Ver detalle"><Eye size={16} /></button></td>
                    </tr>
                  );
                })}
                {!loading && reclamacionesFiltradas.length === 0 && (
                  <tr><td colSpan={9}>
                    <div className="empty-state">
                      <AlertTriangle size={40} />
                      <h3>No se encontraron reclamaciones</h3>
                      <p>Intenta ajustar tus filtros de búsqueda</p>
                    </div>
                  </td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
