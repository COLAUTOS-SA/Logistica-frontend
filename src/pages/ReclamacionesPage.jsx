import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getReclamaciones, editarReclamacion } from '../services/api';
import { ESTADOS_RECLAMACION, TIPOS_NOVEDAD, TRANSPORTADORAS } from '../data/mockData';
import {
  Search, Plus, AlertTriangle, Download, Eye, Clock, Pencil, X, CheckCircle, Loader2
} from 'lucide-react';

export default function ReclamacionesPage() {
  const { tienePermiso } = useAuth();
  const navigate = useNavigate();

  const [reclamaciones, setReclamaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroTipo, setFiltroTipo] = useState('');

  // Modal editar desde lista
  const [recEditar, setRecEditar]         = useState(null);
  const [formEditar, setFormEditar]       = useState({});
  const [confirmEditar, setConfirmEditar] = useState(false);
  const [guardandoEditar, setGuardandoEditar] = useState(false);
  const [toast, setToast]                 = useState({ visible: false, msg: '', tipo: 'ok' });
  const toastTimer                        = useRef(null);

  const mostrarToast = (msg, tipo = 'ok') => {
    setToast({ visible: true, msg, tipo });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(p => ({ ...p, visible: false })), 3800);
  };

  const abrirEditar = (e, rec) => {
    e.stopPropagation();
    setFormEditar({
      vin:            rec.vin            || '',
      vehiculo:       rec.vehiculo       || '',
      tipoNovedad:    rec.tipoNovedad    || '',
      transportadora: rec.transportadora || '',
      remesaNo:       rec.remesaNo       || '',
      manifiestoNo:   rec.manifiestoNo   || '',
      descripcion:    rec.descripcion    || '',
    });
    setRecEditar(rec);
  };

  const handleGuardarEditar = async () => {
    setGuardandoEditar(true);
    try {
      const fd = new FormData();
      fd.append('vin',            formEditar.vin);
      fd.append('vehiculo',       formEditar.vehiculo);
      fd.append('tipo_novedad',   formEditar.tipoNovedad);
      fd.append('transportadora', formEditar.transportadora);
      fd.append('no_remesa',      formEditar.remesaNo);
      fd.append('no_manifiesto',  formEditar.manifiestoNo);
      fd.append('descripcion',    formEditar.descripcion);
      await editarReclamacion(recEditar.id, fd);
      setConfirmEditar(false);
      setRecEditar(null);
      mostrarToast('Se guardaron los cambios de la reclamación');
      getReclamaciones().then(setReclamaciones).catch(() => {});
    } catch (err) {
      setConfirmEditar(false);
      setRecEditar(null);
      mostrarToast(err.message || 'No se pudieron guardar los cambios', 'error');
    } finally {
      setGuardandoEditar(false);
    }
  };

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
                      <td style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        <button className="btn-icon" title="Ver detalle"><Eye size={16} /></button>
                        {tienePermiso('gestionar_usuarios') && (
                          <button className="btn-icon" title="Editar" onClick={e => abrirEditar(e, rec)} style={{ color: 'var(--primary-600)' }}>
                            <Pencil size={15} />
                          </button>
                        )}
                      </td>
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
      {/* ── Modal editar desde lista ── */}
      {recEditar && !confirmEditar && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: 12, width: '100%', maxWidth: 560, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--gray-200)' }}>
              <div>
                <h3 style={{ fontWeight: 700, fontSize: 17, marginBottom: 2 }}>Editar Reclamación</h3>
                <span style={{ fontSize: 13, color: 'var(--gray-500)' }}>{recEditar.id}</span>
              </div>
              <button onClick={() => setRecEditar(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)' }}><X size={20} /></button>
            </div>
            <div style={{ padding: '20px 24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group">
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>VIN</label>
                  <input className="form-control" style={{ fontFamily: 'monospace' }} value={formEditar.vin} onChange={e => setFormEditar(p => ({ ...p, vin: e.target.value.toUpperCase() }))} />
                </div>
                <div className="form-group">
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>Vehículo</label>
                  <input className="form-control" value={formEditar.vehiculo} onChange={e => setFormEditar(p => ({ ...p, vehiculo: e.target.value }))} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group">
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>Tipo de Novedad</label>
                  <select className="form-control" value={formEditar.tipoNovedad} onChange={e => setFormEditar(p => ({ ...p, tipoNovedad: e.target.value }))}>
                    <option value="">Seleccionar...</option>
                    {TIPOS_NOVEDAD.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>Transportadora</label>
                  <select className="form-control" value={formEditar.transportadora} onChange={e => setFormEditar(p => ({ ...p, transportadora: e.target.value }))}>
                    <option value="">Seleccionar...</option>
                    {TRANSPORTADORAS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                <div className="form-group">
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>No. Remesa</label>
                  <input className="form-control" value={formEditar.remesaNo} onChange={e => setFormEditar(p => ({ ...p, remesaNo: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>No. Manifiesto</label>
                  <input className="form-control" value={formEditar.manifiestoNo} onChange={e => setFormEditar(p => ({ ...p, manifiestoNo: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>Descripción de la Novedad</label>
                <textarea className="form-control" rows={3} value={formEditar.descripcion} onChange={e => setFormEditar(p => ({ ...p, descripcion: e.target.value }))} />
              </div>
            </div>
            <div style={{ padding: '16px 24px', borderTop: '1px solid var(--gray-200)', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button className="btn btn-secondary" onClick={() => setRecEditar(null)}>Cancelar</button>
              <button className="btn btn-primary" onClick={() => setConfirmEditar(true)} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Pencil size={15} /> Guardar cambios
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Confirmación editar ── */}
      {confirmEditar && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1010 }}>
          <div style={{ background: 'white', borderRadius: 12, width: '100%', maxWidth: 400, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', padding: '32px 28px', textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Pencil size={24} />
            </div>
            <h3 style={{ fontWeight: 700, fontSize: 17, marginBottom: 8 }}>¿Guardar cambios?</h3>
            <p style={{ fontSize: 14, color: 'var(--gray-500)', marginBottom: 24 }}>
              Los datos de la reclamación <strong>{recEditar?.id}</strong> serán actualizados.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={() => setConfirmEditar(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleGuardarEditar} disabled={guardandoEditar} style={{ display: 'flex', alignItems: 'center', gap: 6, opacity: guardandoEditar ? 0.7 : 1 }}>
                {guardandoEditar ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <CheckCircle size={15} />}
                {guardandoEditar ? 'Guardando...' : 'Sí, guardar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      <div style={{
        position: 'fixed', bottom: 32, left: '50%',
        transform: `translateX(-50%) translateY(${toast.visible ? '0' : '20px'})`,
        background: toast.tipo === 'error' ? '#b91c1c' : '#111827',
        color: 'white', padding: '13px 22px', borderRadius: 8,
        display: 'flex', alignItems: 'center', gap: 10,
        boxShadow: '0 8px 28px rgba(0,0,0,0.30)', fontSize: 14, fontWeight: 500,
        opacity: toast.visible ? 1 : 0,
        transition: 'opacity 0.28s ease, transform 0.28s ease',
        pointerEvents: 'none', zIndex: 1200, maxWidth: 420,
      }}>
        <CheckCircle size={17} style={{ color: toast.tipo === 'error' ? '#fca5a5' : '#4ade80', flexShrink: 0 }} />
        {toast.msg}
      </div>
    </>
  );
}
