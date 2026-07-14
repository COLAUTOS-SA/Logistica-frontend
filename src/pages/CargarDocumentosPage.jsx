import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getReclamaciones, subirCotizacion, subirFactura } from '../services/api';
import { ESTADOS_RECLAMACION } from '../data/mockData';
import {
  Upload, FileText, Clipboard, ShieldAlert,
  CheckCircle, FileDown, AlertTriangle, Search, Car, X
} from 'lucide-react';

export default function CargarDocumentosPage() {
  const { usuario } = useAuth();
  // Búsqueda por VIN
  const [vinBusqueda, setVinBusqueda] = useState('');
  const [reclamacionEncontrada, setReclamacionEncontrada] = useState(null);
  const [vinBuscado, setVinBuscado] = useState(false);

  // Campos del formulario
  const [valorCotizacion, setValorCotizacion] = useState('');
  const [descripcionTrabajo, setDescripcionTrabajo] = useState('');

  // Archivos
  const [facturaFile, setFacturaFile] = useState(null);
  const [certificadoFile, setCertificadoFile] = useState(null);
  const [cotizacionFile, setCotizacionFile] = useState(null);

  // Estado del flujo
  const [errorValidation, setErrorValidation] = useState('');
  const [submitted, setSubmitted] = useState(false);

  // Toast flotante
  const [toast, setToast] = useState(null); // { mensaje, visible }
  const toastTimerRef = useRef(null);

  const mostrarToast = (mensaje) => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setToast({ mensaje, visible: true });
    toastTimerRef.current = setTimeout(() => {
      setToast(t => t ? { ...t, visible: false } : null);
      setTimeout(() => setToast(null), 350);
    }, 4000);
  };

  useEffect(() => () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); }, []);

  // Refs para inputs de archivo
  const facturaInputRef = useRef(null);
  const certificadoInputRef = useRef(null);
  const cotizacionInputRef = useRef(null);

  // Determinar si la reclamación necesita cotización o factura
  const necesitaCotizacion = reclamacionEncontrada &&
    ['abierta', 'en_gestion'].includes(reclamacionEncontrada.estado);
  const necesitaFactura = reclamacionEncontrada &&
    ['aprobada', 'en_facturacion'].includes(reclamacionEncontrada.estado);

  const handleBuscarVin = async () => {
    const vin = vinBusqueda.trim().toUpperCase();
    if (!vin) {
      mostrarToast('Ingrese un número de VIN para buscar.');
      return;
    }
    setVinBuscado(true);
    setReclamacionEncontrada(null);
    try {
      const resultados = await getReclamaciones({ vin });
      const encontrada = resultados.find(r => r.vin.toUpperCase() === vin) ?? resultados[0] ?? null;
      setReclamacionEncontrada(encontrada);
    } catch (err) {
      mostrarToast('Error al buscar: ' + err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!reclamacionEncontrada) {
      mostrarToast('Primero busque y seleccione una reclamación por VIN.');
      return;
    }
    if (necesitaCotizacion && !cotizacionFile) {
      mostrarToast('Debe adjuntar el archivo de cotización para continuar.');
      return;
    }
    if (necesitaFactura && (!facturaFile || !certificadoFile)) {
      mostrarToast('Debe adjuntar la factura y el certificado de novedad para continuar.');
      return;
    }

    const nombreUsuario = usuario?.nombre ?? 'Área Colisión';
    try {
      if (necesitaCotizacion) {
        await subirCotizacion(
          reclamacionEncontrada.id,
          valorCotizacion,
          descripcionTrabajo,
          cotizacionFile,
          nombreUsuario
        );
      } else {
        await subirFactura(
          reclamacionEncontrada.id,
          facturaFile,
          certificadoFile,
          nombreUsuario,
          descripcionTrabajo
        );
      }
      setSubmitted(true);
    } catch (err) {
      mostrarToast('Error al enviar: ' + err.message);
    }
  };

  const handleReset = () => {
    setVinBusqueda('');
    setReclamacionEncontrada(null);
    setVinBuscado(false);
    setValorCotizacion('');
    setDescripcionTrabajo('');
    setFacturaFile(null);
    setCertificadoFile(null);
    setCotizacionFile(null);
    setErrorValidation('');
    setSubmitted(false);
  };

  if (submitted) {
    const estadoInfo = ESTADOS_RECLAMACION.find(e => e.id === reclamacionEncontrada.estado);
    return (
      <>
        <div className="page-header">
          <h1>Área de Colisión — Carga de Documentos</h1>
        </div>
        <div className="page-body">
          <div style={{
            textAlign: 'center', padding: '60px 24px',
            background: 'white', borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--gray-200)'
          }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'var(--success-50)', color: 'var(--success-600)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 16px'
            }}>
              <CheckCircle size={32} />
            </div>
            <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '8px' }}>
              {necesitaCotizacion ? 'Cotización enviada exitosamente' : 'Factura y certificado enviados'}
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--gray-500)', maxWidth: '500px', margin: '0 auto 24px' }}>
              Reclamación <strong>{reclamacionEncontrada.id}</strong> — VIN <strong>{reclamacionEncontrada.vin}</strong>.
              El área de logística ha sido notificada.
            </p>
            <button className="btn btn-primary" onClick={handleReset}>
              Cargar otro documento
            </button>
          </div>
        </div>
      </>
    );
  }

  const estadoInfoEncontrada = reclamacionEncontrada
    ? ESTADOS_RECLAMACION.find(e => e.id === reclamacionEncontrada.estado)
    : null;

  return (
    <>
      <div className="page-header">
        <div>
          <h1>Área de Colisión — Carga de Documentos</h1>
          <p>Suba la cotización de la novedad o la factura final vinculada a una reclamación por VIN.</p>
        </div>
      </div>

      <div className="page-body">
        {/* Toast flotante de error */}
        {toast && (
          <div style={{
            position: 'fixed',
            bottom: '32px',
            left: '50%',
            transform: `translateX(-50%) translateY(${toast.visible ? '0' : '12px'})`,
            opacity: toast.visible ? 1 : 0,
            transition: 'opacity 0.3s ease, transform 0.3s ease',
            background: '#1e1e1e',
            color: '#fff',
            padding: '14px 20px',
            borderRadius: '10px',
            boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '14px',
            fontWeight: 500,
            zIndex: 9999,
            maxWidth: '460px',
            width: 'calc(100% - 48px)',
          }}>
            <AlertTriangle size={18} style={{ color: '#f87171', flexShrink: 0 }} />
            <span style={{ flex: 1 }}>{toast.mensaje}</span>
            <button
              onClick={() => setToast(null)}
              style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)', cursor: 'pointer', padding: '2px', display: 'flex' }}
            >
              <X size={16} />
            </button>
          </div>
        )}

        {/* Bloque 1: Búsqueda por VIN */}
        <div className="card" style={{ marginBottom: '20px' }}>
          <div className="card-header">
            <h3>1. Buscar reclamación por número de VIN</h3>
          </div>
          <div className="card-body">
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div className="form-group" style={{ flex: 1, minWidth: '260px', marginBottom: 0 }}>
                <label style={{ fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Número de VIN <span className="required" style={{ color: 'red' }}>*</span>
                </label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej: 3MDDJ2HAAVM461828"
                  value={vinBusqueda}
                  onChange={e => setVinBusqueda(e.target.value.toUpperCase())}
                  onKeyDown={e => e.key === 'Enter' && handleBuscarVin()}
                  style={{ fontFamily: 'monospace', maxWidth: '400px' }}
                />
              </div>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleBuscarVin}
                style={{ height: '40px' }}
              >
                <Search size={16} />
                Buscar
              </button>
            </div>

            {/* Resultado de búsqueda */}
            {vinBuscado && !reclamacionEncontrada && (
              <div style={{
                marginTop: '16px', padding: '16px', background: 'var(--gray-50)',
                borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)',
                display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--gray-500)', fontSize: '14px'
              }}>
                <AlertTriangle size={18} />
                No se encontró ninguna reclamación activa con el VIN <strong style={{ fontFamily: 'monospace', marginLeft: '4px' }}>{vinBusqueda}</strong>.
              </div>
            )}

            {reclamacionEncontrada && (
              <div style={{
                marginTop: '16px', padding: '16px', background: '#f0fdf4',
                borderRadius: 'var(--radius-md)', border: '1px solid #86efac'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
                  <Car size={18} style={{ color: 'var(--success-600)' }} />
                  <span style={{ fontWeight: 700, color: 'var(--success-700)', fontSize: '15px' }}>
                    Reclamación encontrada
                  </span>
                  <span className={`badge badge-${reclamacionEncontrada.estado}`}>
                    {estadoInfoEncontrada?.label}
                  </span>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px 24px', fontSize: '13px' }}>
                  <div><span style={{ color: 'var(--gray-500)' }}>ID Reclamación:</span> <strong>{reclamacionEncontrada.id}</strong></div>
                  <div><span style={{ color: 'var(--gray-500)' }}>VIN:</span> <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{reclamacionEncontrada.vin}</span></div>
                  <div><span style={{ color: 'var(--gray-500)' }}>Vehículo:</span> {reclamacionEncontrada.vehiculo}</div>
                  <div><span style={{ color: 'var(--gray-500)' }}>Novedad:</span> <span className="badge-tipo">{reclamacionEncontrada.tipoNovedad}</span></div>
                  <div><span style={{ color: 'var(--gray-500)' }}>No. Remesa:</span> {reclamacionEncontrada.remesaNo}</div>
                  <div><span style={{ color: 'var(--gray-500)' }}>Transportadora:</span> {reclamacionEncontrada.transportadora}</div>
                </div>
                {!necesitaCotizacion && !necesitaFactura && (
                  <div style={{ marginTop: '12px', fontSize: '13px', color: 'var(--gray-600)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <AlertTriangle size={15} />
                    Esta reclamación está en estado <strong>"{estadoInfoEncontrada?.label}"</strong> y no requiere carga de documentos en este momento.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Bloque 2: Formulario de carga (solo si aplica) */}
        {reclamacionEncontrada && (necesitaCotizacion || necesitaFactura) && (
          <form onSubmit={handleSubmit}>
            <div className="card" style={{ marginBottom: '20px' }}>
              <div className="card-header">
                <h3>2. {necesitaCotizacion ? 'Cargar cotización de la novedad' : 'Cargar factura y certificado de novedad'}</h3>
              </div>
              <div className="card-body">
                <p style={{ fontSize: '13px', color: 'var(--gray-600)', marginBottom: '16px' }}>
                  {necesitaCotizacion
                    ? 'Adjunte el archivo PDF con la cotización de reparación para que logística pueda radicar en Vigía.'
                    : 'La reclamación fue aprobada. Adjunte la factura de reparación y el certificado de novedad.'}
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: necesitaFactura ? 'repeat(2, 1fr)' : '1fr', gap: '16px', maxWidth: '680px' }}>

                  {necesitaCotizacion && (
                    <>
                      <input
                        type="file"
                        ref={cotizacionInputRef}
                        style={{ display: 'none' }}
                        accept=".pdf"
                        onChange={e => setCotizacionFile(e.target.files[0] || null)}
                      />
                      <div
                        className="upload-zone"
                        onClick={() => cotizacionInputRef.current.click()}
                        style={{
                          border: cotizacionFile ? '2px dashed var(--success-500)' : '2px dashed var(--purple-400)',
                          padding: '24px', textAlign: 'center', cursor: 'pointer',
                          borderRadius: 'var(--radius-md)',
                          background: cotizacionFile ? 'var(--success-50)' : 'var(--purple-50)'
                        }}
                      >
                        <FileDown size={28} style={{ color: cotizacionFile ? 'var(--success-600)' : 'var(--purple-500)' }} />
                        <p style={{ fontSize: '14px', fontWeight: 600, marginTop: '8px', marginBottom: '2px' }}>
                          Cotización de Reparación <span style={{ color: 'red' }}>*</span>
                        </p>
                        <span style={{ fontSize: '11px', color: 'var(--gray-500)' }}>Solo PDF</span>
                        {cotizacionFile && (
                          <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--success-700)', fontWeight: 600 }}>
                            <FileText size={12} /> {cotizacionFile.name}
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {necesitaFactura && (
                    <>
                      <input
                        type="file"
                        ref={facturaInputRef}
                        style={{ display: 'none' }}
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={e => setFacturaFile(e.target.files[0] || null)}
                      />
                      <div
                        className="upload-zone"
                        onClick={() => facturaInputRef.current.click()}
                        style={{
                          border: facturaFile ? '2px dashed var(--success-500)' : '2px dashed var(--gray-300)',
                          padding: '24px', textAlign: 'center', cursor: 'pointer',
                          borderRadius: 'var(--radius-md)',
                          background: facturaFile ? 'var(--success-50)' : 'white'
                        }}
                      >
                        <Upload size={28} style={{ color: facturaFile ? 'var(--success-600)' : 'var(--gray-400)' }} />
                        <p style={{ fontSize: '14px', fontWeight: 600, marginTop: '8px', marginBottom: '2px' }}>
                          Factura de Reparación <span style={{ color: 'red' }}>*</span>
                        </p>
                        <span style={{ fontSize: '11px', color: 'var(--gray-500)' }}>PDF, JPG, PNG</span>
                        {facturaFile && (
                          <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--success-700)', fontWeight: 600 }}>
                            <FileText size={12} /> {facturaFile.name}
                          </div>
                        )}
                      </div>

                      <input
                        type="file"
                        ref={certificadoInputRef}
                        style={{ display: 'none' }}
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={e => setCertificadoFile(e.target.files[0] || null)}
                      />
                      <div
                        className="upload-zone"
                        onClick={() => certificadoInputRef.current.click()}
                        style={{
                          border: certificadoFile ? '2px dashed var(--success-500)' : '2px dashed var(--gray-300)',
                          padding: '24px', textAlign: 'center', cursor: 'pointer',
                          borderRadius: 'var(--radius-md)',
                          background: certificadoFile ? 'var(--success-50)' : 'white'
                        }}
                      >
                        <Clipboard size={28} style={{ color: certificadoFile ? 'var(--success-600)' : 'var(--gray-400)' }} />
                        <p style={{ fontSize: '14px', fontWeight: 600, marginTop: '8px', marginBottom: '2px' }}>
                          Certificado de Novedad <span style={{ color: 'red' }}>*</span>
                        </p>
                        <span style={{ fontSize: '11px', color: 'var(--gray-500)' }}>PDF, JPG, PNG</span>
                        {certificadoFile && (
                          <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--success-700)', fontWeight: 600 }}>
                            <FileText size={12} /> {certificadoFile.name}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Bloque 3: Detalles opcionales */}
            <div className="card" style={{ marginBottom: '20px' }}>
              <div className="card-header">
                <h3>3. Detalles adicionales (opcionales)</h3>
              </div>
              <div className="card-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label style={{ fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                      Valor de la {necesitaCotizacion ? 'cotización' : 'factura'}
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Ej: $850.000"
                      value={valorCotizacion}
                      onChange={e => setValorCotizacion(e.target.value)}
                    />
                  </div>
                  <div className="form-group">
                    <label style={{ fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                      Descripción del trabajo
                    </label>
                    <textarea
                      className="form-control"
                      placeholder="Observaciones del taller..."
                      value={descripcionTrabajo}
                      onChange={e => setDescripcionTrabajo(e.target.value)}
                      style={{ height: '42px', resize: 'vertical' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ padding: '14px 32px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px' }}>
              <ShieldAlert size={18} />
              {necesitaCotizacion ? 'Enviar cotización a logística' : 'Enviar factura y certificado'}
            </button>
          </form>
        )}
      </div>
    </>
  );
}
