import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getReclamacion, cambiarEstado, subirCotizacion, subirFactura } from '../services/api';
import { ESTADOS_RECLAMACION } from '../data/mockData';
import {
  ArrowLeft, Clock, FileText, Image, Video,
  User, CheckCircle, AlertTriangle, Download, Upload,
  DollarSign, Receipt, ChevronRight, X
} from 'lucide-react';

export default function ReclamacionDetallePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { usuario, tienePermiso } = useAuth();

  const [rec, setRec] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal cambio estado
  const [showCambioEstado, setShowCambioEstado] = useState(false);
  const [guardandoEstado, setGuardandoEstado] = useState(false);

  // Sección cotización/factura
  const [showCotizacionForm, setShowCotizacionForm] = useState(false);
  const [cotizacionData, setCotizacionData] = useState({ valor: '', descripcion: '' });
  const [cotizacionFile, setCotizacionFile] = useState(null);
  const [facturaFile, setFacturaFile] = useState(null);
  const [certificadoFile, setCertificadoFile] = useState(null);
  const [enviando, setEnviando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState('');

  const cargar = () => {
    setLoading(true);
    getReclamacion(id)
      .then(setRec)
      .catch(() => setError('No se pudo cargar la reclamación'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { cargar(); }, [id]);

  if (loading) return <div className="page-body" style={{ padding: '60px', textAlign: 'center', color: 'var(--gray-400)' }}>Cargando...</div>;
  if (error || !rec) return (
    <>
      <div className="page-header"><h1>Reclamación no encontrada</h1></div>
      <div className="page-body"><button className="btn btn-secondary" onClick={() => navigate('/reclamaciones')}><ArrowLeft size={16} /> Volver</button></div>
    </>
  );

  const estadoInfo  = ESTADOS_RECLAMACION.find(e => e.id === rec.estado);
  const estadoIndex = ESTADOS_RECLAMACION.findIndex(e => e.id === rec.estado);
  const daysClass   = rec.diasHabiles <= 5 ? 'safe' : rec.diasHabiles <= 8 ? 'warning' : 'danger';
  const showDays    = !['cerrada', 'radicada_vigia', 'aprobada', 'en_facturacion'].includes(rec.estado);

  const canUploadCotizacion = tienePermiso('subir_cotizacion') && ['abierta', 'en_gestion'].includes(rec.estado);
  const canUploadFactura    = tienePermiso('subir_cotizacion') && ['aprobada', 'en_facturacion'].includes(rec.estado);

  const handleCambiarEstado = async (nuevoEstado) => {
    setGuardandoEstado(true);
    try {
      await cambiarEstado(rec.id, nuevoEstado, usuario?.nombre);
      setShowCambioEstado(false);
      cargar();
    } catch (e) {
      alert('Error al cambiar estado: ' + e.message);
    } finally {
      setGuardandoEstado(false);
    }
  };

  const handleEnviarCotizacion = async () => {
    if (!cotizacionFile) { alert('Debe adjuntar el archivo de cotización'); return; }
    setEnviando(true);
    try {
      await subirCotizacion(rec.id, cotizacionData.valor, cotizacionData.descripcion, cotizacionFile, usuario?.nombre);
      setMensajeExito('Cotización enviada exitosamente.');
      setShowCotizacionForm(false);
      cargar();
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setEnviando(false);
    }
  };

  const handleEnviarFactura = async () => {
    if (!facturaFile || !certificadoFile) { alert('Debe adjuntar factura y certificado'); return; }
    setEnviando(true);
    try {
      await subirFactura(rec.id, facturaFile, certificadoFile, usuario?.nombre, cotizacionData.descripcion);
      setMensajeExito('Factura y certificado enviados exitosamente.');
      setShowCotizacionForm(false);
      cargar();
    } catch (e) {
      alert('Error: ' + e.message);
    } finally {
      setEnviando(false);
    }
  };

  return (
    <>
      <div className="page-header">
        <div className="page-header-top">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button className="btn-icon" onClick={() => navigate('/reclamaciones')}><ArrowLeft size={18} /></button>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h1>{rec.id}</h1>
                <span className={`badge badge-${rec.estado}`}>{estadoInfo?.label}</span>
              </div>
              <p>{rec.vehiculo}</p>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="btn btn-secondary" onClick={() => window.print()}>
              <Download size={16} /> Exportar / Imprimir
            </button>
            {rec.estado !== 'cerrada' && usuario?.rol === 'admin' && (
              <button className="btn btn-primary" onClick={() => setShowCambioEstado(true)}>
                <ChevronRight size={16} /> Cambiar Estado
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Modal cambio estado */}
      {showCambioEstado && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: 'white', borderRadius: 'var(--radius-lg)', padding: '24px', width: '420px', maxWidth: '90vw', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700 }}>Cambiar Estado</h3>
              <button className="btn-icon" onClick={() => setShowCambioEstado(false)}><X size={18} /></button>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--gray-500)', marginBottom: '16px' }}>
              Estado actual: <strong>{estadoInfo?.label}</strong>
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {ESTADOS_RECLAMACION.filter(e => e.id !== rec.estado).map(e => (
                <button key={e.id}
                  onClick={() => handleCambiarEstado(e.id)}
                  disabled={guardandoEstado}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius-md)', background: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: 500, textAlign: 'left' }}
                  onMouseEnter={ev => ev.currentTarget.style.background = 'var(--gray-50)'}
                  onMouseLeave={ev => ev.currentTarget.style.background = 'white'}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ width: '10px', height: '10px', borderRadius: '50%', background: e.color, flexShrink: 0 }} />
                    {e.label}
                  </span>
                  <ChevronRight size={16} style={{ color: 'var(--gray-400)' }} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="page-body">
        {/* Status flow */}
        <div className="status-flow">
          {ESTADOS_RECLAMACION.map((estado, i) => (
            <div key={estado.id} style={{ display: 'flex', alignItems: 'center', gap: '4px', flex: 1 }}>
              <div className={`status-step ${i === estadoIndex ? 'active' : i < estadoIndex ? 'completed' : ''}`}>
                {i < estadoIndex && <CheckCircle size={12} style={{ marginRight: '4px' }} />}
                {estado.label}
              </div>
              {i < ESTADOS_RECLAMACION.length - 1 && (
                <div className={`status-connector ${i < estadoIndex ? 'completed' : ''}`} />
              )}
            </div>
          ))}
        </div>

        {showDays && (
          <div className={`alert-banner ${rec.diasHabiles >= 8 ? 'danger' : rec.diasHabiles >= 6 ? 'warning' : 'info'}`}>
            <Clock size={18} />
            <span>
              <strong>{rec.diasHabiles} de {rec.diasLimite} días hábiles</strong> transcurridos para radicar en Vigía.
              {rec.diasHabiles >= 8 && ' ¡Próximo a vencer!'}
            </span>
          </div>
        )}

        {mensajeExito && (
          <div className="alert-banner info" style={{ background: '#f0fdf4', borderColor: '#86efac', color: '#166534' }}>
            <CheckCircle size={18} />
            <span><strong>{mensajeExito}</strong></span>
          </div>
        )}

        <div className="detail-grid">
          <div>
            {/* Información General */}
            <div className="detail-section">
              <div className="card">
                <div className="card-header"><h3><AlertTriangle size={16} /> Información de la Reclamación</h3></div>
                <div className="card-body">
                  {[
                    ['ID Reclamación', rec.id],
                    ['VIN', <span className="vin-display">{rec.vin}</span>],
                    ['Vehículo', rec.vehiculo],
                    ['Tipo de Novedad', <span className="badge-tipo">{rec.tipoNovedad}</span>],
                    ['Descripción', rec.descripcion],
                    ['Fecha de Reporte', new Date(rec.fechaReporte).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })],
                    ['Transportadora', rec.transportadora],
                    ['No. Remesa', <span style={{ fontWeight: 600, color: 'var(--primary-600)' }}>{rec.remesaNo}</span>],
                    ['No. Manifiesto', rec.manifiestoNo],
                    rec.radicadoVigia && ['Radicado Vigía', <span style={{ fontWeight: 600, color: 'var(--success-600)' }}>{rec.radicadoVigia}</span>],
                    rec.cotizacion   && ['Cotización', <span style={{ fontWeight: 600 }}>{rec.cotizacion}</span>],
                    ['Reportado por', rec.reportadoPor],
                    ['Responsable actual', rec.responsableActual],
                  ].filter(Boolean).map(([label, val], i) => (
                    <div key={i} className="detail-field">
                      <span className="detail-label">{label}</span>
                      <span className="detail-value">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sección Colisión */}
            {(canUploadCotizacion || canUploadFactura) && (
              <div className="detail-section">
                <div className="card" style={{ border: '2px solid var(--purple-500)' }}>
                  <div className="card-header" style={{ background: 'var(--purple-50)' }}>
                    <h3 style={{ color: 'var(--purple-600)' }}>
                      <Receipt size={16} />
                      {canUploadCotizacion ? ' Subir Cotización' : ' Subir Factura'}
                      <span style={{ fontSize: '11px', fontWeight: 400, marginLeft: '8px', color: 'var(--gray-500)' }}>(Área de Colisión)</span>
                    </h3>
                  </div>
                  <div className="card-body">
                    {!showCotizacionForm ? (
                      <div style={{ textAlign: 'center', padding: '20px' }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--purple-50)', color: 'var(--purple-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                          {canUploadCotizacion ? <DollarSign size={28} /> : <Receipt size={28} />}
                        </div>
                        <p style={{ fontSize: '14px', color: 'var(--gray-600)', marginBottom: '16px' }}>
                          {canUploadCotizacion ? 'Evalúe la novedad y suba la cotización.' : 'Suba la factura de reparación y el certificado de novedad.'}
                        </p>
                        <button className="btn btn-primary" style={{ background: 'var(--purple-600)' }} onClick={() => setShowCotizacionForm(true)}>
                          <Upload size={16} /> {canUploadCotizacion ? 'Subir Cotización' : 'Subir Factura'}
                        </button>
                      </div>
                    ) : (
                      <div>
                        {canUploadCotizacion && (
                          <>
                            <div className="form-group">
                              <label>Valor <span className="required">*</span></label>
                              <input type="text" className="form-control" placeholder="Ej: $850.000"
                                value={cotizacionData.valor} onChange={e => setCotizacionData(d => ({ ...d, valor: e.target.value }))} />
                            </div>
                            <div className="form-group">
                              <label>Descripción</label>
                              <textarea className="form-control" rows={2} placeholder="Descripción del trabajo..."
                                value={cotizacionData.descripcion} onChange={e => setCotizacionData(d => ({ ...d, descripcion: e.target.value }))} />
                            </div>
                            <div className="form-group">
                              <label>Archivo PDF <span className="required">*</span></label>
                              <input type="file" accept=".pdf" onChange={e => setCotizacionFile(e.target.files[0])} />
                            </div>
                          </>
                        )}
                        {canUploadFactura && (
                          <>
                            <div className="form-group">
                              <label>Factura <span className="required">*</span></label>
                              <input type="file" accept=".pdf,.jpg,.png" onChange={e => setFacturaFile(e.target.files[0])} />
                            </div>
                            <div className="form-group">
                              <label>Certificado de Novedad <span className="required">*</span></label>
                              <input type="file" accept=".pdf,.jpg,.png" onChange={e => setCertificadoFile(e.target.files[0])} />
                            </div>
                          </>
                        )}
                        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          <button className="btn btn-secondary" onClick={() => setShowCotizacionForm(false)}>Cancelar</button>
                          <button className="btn btn-primary" style={{ background: 'var(--purple-600)' }}
                            onClick={canUploadCotizacion ? handleEnviarCotizacion : handleEnviarFactura}
                            disabled={enviando}>
                            <CheckCircle size={16} /> {enviando ? 'Enviando...' : (canUploadCotizacion ? 'Enviar Cotización' : 'Enviar Factura')}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Historial */}
            <div className="detail-section">
              <div className="card">
                <div className="card-header"><h3><Clock size={16} /> Historial de Movimientos</h3></div>
                <div className="card-body">
                  <div className="timeline">
                    {rec.historial.map((item, i) => (
                      <div key={i} className="timeline-item">
                        <div className="timeline-dot" />
                        <div className="timeline-date">
                          {new Date(item.fecha).toLocaleDateString('es-CO', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </div>
                        <div className="timeline-action">{item.accion}</div>
                        <div className="timeline-user"><User size={12} style={{ display: 'inline', marginRight: '4px' }} />{item.usuario}</div>
                        {item.detalle && <div className="timeline-detail">{item.detalle}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar archivos */}
          <div>
            {[
              { label: 'Fotos', icon: <Image size={16} />, items: rec.fotos },
              { label: 'Videos', icon: <Video size={16} />, items: rec.videos },
              { label: 'Soportes', icon: <FileText size={16} />, items: rec.soportes },
            ].map(({ label, icon, items }) => (
              <div key={label} className="detail-section">
                <div className="card">
                  <div className="card-header"><h3>{icon} {label} ({items.length})</h3></div>
                  <div className="card-body">
                    {items.length > 0 ? (
                      <div className="files-list">
                        {items.map((f, i) => (
                          <a key={i} href={f.url} target="_blank" rel="noreferrer" className="file-item" style={{ textDecoration: 'none', color: 'inherit' }}>
                            <div className="file-icon photo">{icon}</div>
                            {f.nombre}
                          </a>
                        ))}
                      </div>
                    ) : (
                      <p style={{ fontSize: '13px', color: 'var(--gray-400)', textAlign: 'center', padding: '12px' }}>Sin archivos adjuntos</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
