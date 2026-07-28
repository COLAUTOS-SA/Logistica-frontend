import { useState, useEffect, useRef } from 'react';
import { getDocumentos, crearDocumento, editarDocumento, eliminarDocumento } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Search, FileText, Truck, Package, ArrowLeftRight,
  User, Hash, MapPin, Car, Plus, X, Upload, CheckCircle, Loader2, Pencil,
  Download, Printer, Eye, Trash2
} from 'lucide-react';

const TABS = [
  { id: 'todos',               label: 'Todos',                 icon: FileText },
  { id: 'manifiesto',          label: 'Manifiestos',           icon: Truck },
  { id: 'remesa_inventario',   label: 'Remesas e Inventarios', icon: Package },
  { id: 'inventario_traslado', label: 'Traslados',             icon: ArrowLeftRight },
];

const TIPOS_DOCUMENTO = [
  { value: 'manifiesto',          label: 'Manifiesto' },
  { value: 'remesa',              label: 'Remesa' },
  { value: 'inventario',          label: 'Inventario' },
  { value: 'inventario_traslado', label: 'Inventario de Traslado' },
];

const ICON_CLASSES = {
  manifiesto:          'manifiesto',
  remesa:              'remesa',
  inventario:          'inventario',
  inventario_traslado: 'traslado',
};

const TIPO_LABELS = {
  manifiesto:          'Manifiesto',
  remesa:              'Remesa',
  inventario:          'Inventario',
  inventario_traslado: 'Inv. Traslado',
};

const TIPO_LABELS_FULL = {
  manifiesto:          'MANIFIESTO DE CARGA',
  remesa:              'REMESA DE TRANSPORTE',
  inventario:          'INVENTARIO DE VEHÍCULOS',
  inventario_traslado: 'INVENTARIO DE TRASLADO',
};

const TRANSPORTADORAS = ['BERGE Vigía', 'Colautos', 'Otra'];

const camposPorTipo = {
  manifiesto:          ['numero', 'fecha', 'transportadora', 'origen', 'destino', 'conductor', 'placa', 'vehiculos_json'],
  remesa:              ['numero', 'fecha', 'vin', 'vehiculo', 'manifiesto_no', 'peso', 'remitente', 'destinatario'],
  inventario:          ['numero', 'fecha', 'vin', 'vehiculo', 'manifiesto_no', 'remesa_no'],
  inventario_traslado: ['numero', 'fecha', 'vin', 'vehiculo', 'manifiesto_no', 'remesa_no'],
};

const FIELD_LABELS = {
  numero:         'Número de documento *',
  fecha:          'Fecha',
  transportadora: 'Transportadora',
  origen:         'Origen',
  destino:        'Destino',
  conductor:      'Conductor',
  placa:          'Placa del vehículo',
  vehiculos_json: 'VINs del manifiesto (uno por línea)',
  vin:            'VIN del vehículo',
  vehiculo:       'Descripción del vehículo',
  manifiesto_no:  'No. Manifiesto',
  remesa_no:      'No. Remesa',
  peso:           'Peso',
  remitente:      'Remitente',
  destinatario:   'Destinatario',
};

const FIELD_LABELS_PRINT = {
  transportadora: 'Transportadora',
  origen:         'Origen',
  destino:        'Destino',
  conductor:      'Conductor',
  placa:          'Placa',
  vin:            'VIN del vehículo',
  vehiculo:       'Vehículo',
  manifiestoNo:   'No. Manifiesto',
  remesaNo:       'No. Remesa',
  peso:           'Peso',
  remitente:      'Remitente',
  destinatario:   'Destinatario',
  subidoPor:      'Registrado por',
  fechaCarga:     'Fecha de registro',
};

const formatFecha = (fecha) => {
  if (!fecha) return '—';
  try {
    const d = new Date(fecha);
    if (isNaN(d.getTime())) return fecha;
    return d.toLocaleDateString('es-CO');
  } catch { return fecha; }
};

const FIELD_PLACEHOLDERS = {
  numero:        'Ej: MAN-2026-001',
  origen:        'Ej: Bogotá',
  destino:       'Ej: Medellín',
  conductor:     'Ej: Carlos Pérez',
  placa:         'Ej: ABC-123',
  vehiculo:      'Ej: Mazda CX-30 2024',
  manifiesto_no: 'Ej: MAN-2026-001',
  remesa_no:     'Ej: REM-2026-0892',
  peso:          'Ej: 1.200 kg',
  remitente:     'Ej: BERGE Vigía S.A.',
  destinatario:  'Ej: Colautos Bogotá',
};

// Paleta monocromática para el visor formal
const DOC_COLORS = {
  manifiesto:          { bg: '#111827', accent: '#374151', light: '#f3f4f6' },
  remesa:              { bg: '#111827', accent: '#374151', light: '#f3f4f6' },
  inventario:          { bg: '#111827', accent: '#374151', light: '#f3f4f6' },
  inventario_traslado: { bg: '#111827', accent: '#374151', light: '#f3f4f6' },
};

// ── Visor de documento fullscreen ─────────────────────────────────────────────

function VisorDocumentoModal({ doc, onClose, onEditar }) {
  const tipoLabel = TIPO_LABELS_FULL[doc.tipo] || doc.tipo.toUpperCase();
  const colores   = DOC_COLORS[doc.tipo] || DOC_COLORS.manifiesto;

  const btnBarStyle = {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '7px 14px', borderRadius: 6, border: '1px solid rgba(255,255,255,0.2)',
    background: 'rgba(255,255,255,0.08)', color: 'white', cursor: 'pointer',
    fontSize: 13, fontWeight: 600, transition: 'background 0.15s',
  };

  const handleImprimir = () => {
    const html = generarHTMLImpresion(doc, tipoLabel, colores);
    const ventana = window.open('', '_blank', 'width=860,height=1000');
    if (!ventana) return;
    ventana.document.write(html);
    ventana.document.close();
    ventana.focus();
    setTimeout(() => ventana.print(), 500);
  };

  const handleDescargar = () => {
    if (doc.urlArchivo) {
      const a = document.createElement('a');
      a.href = doc.urlArchivo;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.download = doc.archivo || (doc.tipo + '-' + doc.numero + '.pdf');
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else {
      handleImprimir();
    }
  };

  const handleEditar = () => {
    onClose();
    onEditar(doc);
  };

  // Filas de datos para mostrar en el documento formal
  const filas = [];
  if (doc.transportadora) filas.push({ label: 'Transportadora',  value: doc.transportadora });
  if (doc.origen)         filas.push({ label: 'Origen',          value: doc.origen });
  if (doc.destino)        filas.push({ label: 'Destino',         value: doc.destino });
  if (doc.conductor)      filas.push({ label: 'Conductor',       value: doc.conductor });
  if (doc.placa)          filas.push({ label: 'Placa',           value: doc.placa });
  if (doc.vin)            filas.push({ label: 'VIN del vehículo', value: doc.vin });
  if (doc.vehiculo)       filas.push({ label: 'Vehículo',        value: doc.vehiculo });
  if (doc.manifiestoNo)   filas.push({ label: 'No. Manifiesto',  value: doc.manifiestoNo });
  if (doc.remesaNo)       filas.push({ label: 'No. Remesa',      value: doc.remesaNo });
  if (doc.peso)           filas.push({ label: 'Peso',            value: doc.peso });
  if (doc.remitente)      filas.push({ label: 'Remitente',       value: doc.remitente });
  if (doc.destinatario)   filas.push({ label: 'Destinatario',    value: doc.destinatario });
  if (doc.subidoPor)      filas.push({ label: 'Registrado por',  value: doc.subidoPor });

  const mitad  = Math.ceil(filas.length / 2);
  const col1   = filas.slice(0, mitad);
  const col2   = filas.slice(mitad);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1100, display: 'flex', flexDirection: 'column', background: '#111827' }}>

      {/* ── Barra de acciones ── */}
      <div style={{ background: '#0f172a', padding: '10px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.08)', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 8, height: 32, borderRadius: 4, background: colores.accent }} />
          <div>
            <div style={{ color: 'white', fontWeight: 700, fontSize: 14, lineHeight: 1.2 }}>{tipoLabel}</div>
            <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>{doc.numero} · {formatFecha(doc.fecha)}</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <button onClick={handleDescargar} style={btnBarStyle}>
            <Download size={14} />
            Descargar
          </button>
          <button onClick={handleImprimir} style={btnBarStyle}>
            <Printer size={14} />
            Imprimir
          </button>
          <button
            onClick={handleEditar}
            style={{ ...btnBarStyle, background: colores.accent, border: `1px solid ${colores.accent}` }}
          >
            <Pencil size={14} />
            Editar
          </button>
          <button onClick={onClose} style={{ ...btnBarStyle, padding: '7px 10px' }}>
            <X size={15} />
          </button>
        </div>
      </div>

      {/* ── Área del documento ── */}
      <div style={{ flex: 1, overflow: 'auto', display: 'flex', justifyContent: 'center', padding: '36px 24px 48px', background: '#1e293b' }}>
        <div style={{
          background: 'white',
          width: '100%',
          maxWidth: 740,
          boxShadow: '0 8px 80px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.3)',
          fontFamily: 'Arial, sans-serif',
        }}>

          {/* Franja superior negra */}
          <div style={{ height: 8, background: '#111827' }} />

          {/* Encabezado del documento */}
          <div style={{ padding: '32px 48px 24px', borderBottom: '1.5px solid #e5e7eb' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              {/* Logo / empresa */}
              <div>
                <img
                  src="/logo-colautos-removebg-preview.png"
                  alt="COLAUTOS"
                  style={{ height: 52, display: 'block', marginBottom: 10 }}
                />
                <div style={{ display: 'inline-block', background: '#111827', color: 'white', padding: '4px 14px', borderRadius: 2, fontSize: 10, fontWeight: 700, letterSpacing: 2 }}>
                  {tipoLabel}
                </div>
              </div>
              {/* Número y fecha */}
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 3, textTransform: 'uppercase', letterSpacing: 1 }}>No. de Documento</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#111827', letterSpacing: 1, fontFamily: 'Georgia, serif' }}>{doc.numero}</div>
                {doc.fecha && (
                  <div style={{ marginTop: 8, fontSize: 12, color: '#6b7280' }}>
                    Fecha: {formatFecha(doc.fecha)}
                  </div>
                )}
                <div style={{ marginTop: 4, fontSize: 11, color: '#9ca3af' }}>ID Sistema: {doc.id}</div>
              </div>
            </div>
          </div>

          {/* Cuerpo del documento — datos en dos columnas */}
          <div style={{ padding: '28px 48px 8px' }}>
            <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 16, paddingBottom: 6, borderBottom: '2px solid #e5e7eb' }}>
              Información del Documento
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 32px' }}>
              <div>
                {col1.map((fila, i) => (
                  <div key={i} style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 3 }}>{fila.label}</div>
                    <div style={{ fontSize: 14, color: '#111827', fontWeight: 500, wordBreak: 'break-word' }}>{fila.value}</div>
                  </div>
                ))}
              </div>
              <div>
                {col2.map((fila, i) => (
                  <div key={i} style={{ marginBottom: 16 }}>
                    <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 3 }}>{fila.label}</div>
                    <div style={{ fontSize: 14, color: '#111827', fontWeight: 500, wordBreak: 'break-word' }}>{fila.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* VINs del manifiesto (lista especial) */}
            {doc.vehiculos && doc.vehiculos.length > 0 && (
              <div style={{ marginTop: 8, marginBottom: 20 }}>
                <div style={{ fontSize: 10, color: '#9ca3af', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10, paddingBottom: 6, borderBottom: '2px solid #e5e7eb' }}>
                  Vehículos en el Manifiesto ({doc.vehiculos.length})
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '6px 12px' }}>
                  {doc.vehiculos.map((vin, i) => (
                    <div key={i} style={{ fontSize: 12, fontFamily: 'monospace', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 4, padding: '5px 10px', color: '#374151' }}>
                      {vin}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Archivo adjunto */}
            {doc.archivo && (
              <div style={{ marginBottom: 20, padding: '12px 16px', background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FileText size={16} style={{ color: colores.accent }} />
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{doc.archivo}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>Archivo adjunto al documento</div>
                  </div>
                </div>
                {doc.urlArchivo && (
                  <a href={doc.urlArchivo} target="_blank" rel="noopener noreferrer"
                    style={{ fontSize: 12, color: '#374151', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Download size={13} /> Ver archivo
                  </a>
                )}
              </div>
            )}
          </div>

          {/* Líneas de firma */}
          <div style={{ padding: '16px 48px 28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32 }}>
            <div>
              <div style={{ borderTop: '1px solid #d1d5db', paddingTop: 8 }}>
                <div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.8 }}>Elaborado por</div>
                <div style={{ fontSize: 12, color: '#374151', fontWeight: 600, marginTop: 2 }}>{doc.subidoPor || '________________________'}</div>
              </div>
            </div>
            <div>
              <div style={{ borderTop: '1px solid #d1d5db', paddingTop: 8 }}>
                <div style={{ fontSize: 10, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 0.8 }}>Revisado por</div>
                <div style={{ fontSize: 12, color: '#374151', marginTop: 2 }}>________________________</div>
              </div>
            </div>
          </div>

          {/* Pie de página del documento */}
          <div style={{ borderTop: '1px solid #f3f4f6', padding: '12px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f9fafb' }}>
            <div style={{ fontSize: 10, color: '#9ca3af' }}>COLAUTOS Logística Colombia S.A.S. — Sistema de Gestión Documental</div>
            <div style={{ fontSize: 10, color: '#9ca3af' }}>Emitido: {new Date().toLocaleDateString('es-CO')}</div>
          </div>

          {/* Franja inferior negra */}
          <div style={{ height: 5, background: '#111827' }} />
        </div>
      </div>
    </div>
  );
}

function generarHTMLImpresion(doc, tipoLabel, colores) {
  const filas = [];
  if (doc.transportadora) filas.push(['Transportadora', doc.transportadora]);
  if (doc.origen)         filas.push(['Origen', doc.origen]);
  if (doc.destino)        filas.push(['Destino', doc.destino]);
  if (doc.conductor)      filas.push(['Conductor', doc.conductor]);
  if (doc.placa)          filas.push(['Placa', doc.placa]);
  if (doc.vin)            filas.push(['VIN del vehículo', doc.vin]);
  if (doc.vehiculo)       filas.push(['Vehículo', doc.vehiculo]);
  if (doc.manifiestoNo)   filas.push(['No. Manifiesto', doc.manifiestoNo]);
  if (doc.remesaNo)       filas.push(['No. Remesa', doc.remesaNo]);
  if (doc.peso)           filas.push(['Peso', doc.peso]);
  if (doc.remitente)      filas.push(['Remitente', doc.remitente]);
  if (doc.destinatario)   filas.push(['Destinatario', doc.destinatario]);
  if (doc.subidoPor)      filas.push(['Registrado por', doc.subidoPor]);

  const filasHTML = filas.map(([label, value]) => `
    <div class="field">
      <div class="field-label">${label}</div>
      <div class="field-value">${value}</div>
    </div>
  `).join('');

  const vinsHTML = doc.vehiculos && doc.vehiculos.length > 0 ? `
    <div class="section-title" style="margin-top:20px;">Vehículos en el Manifiesto (${doc.vehiculos.length})</div>
    <div class="vins-grid">
      ${doc.vehiculos.map(v => `<div class="vin">${v}</div>`).join('')}
    </div>
  ` : '';

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>${tipoLabel} - ${doc.numero}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; background: white; color: #111; }
    .top-bar { height: 8px; background: #111827; }
    .header { padding: 28px 48px 20px; border-bottom: 1.5px solid #e5e7eb; display: flex; justify-content: space-between; align-items: flex-start; }
    .company-logo { height: 52px; display: block; margin-bottom: 10px; }
    .tipo-badge { display: inline-block; background: #111827; color: white; padding: 4px 14px; font-size: 10px; font-weight: 700; letter-spacing: 2px; }
    .doc-number { font-size: 22px; font-weight: 800; color: #111827; letter-spacing: 1px; text-align: right; font-family: Georgia, serif; }
    .doc-number-label { font-size: 10px; color: #9ca3af; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 3px; text-align: right; }
    .doc-date { font-size: 12px; color: #6b7280; text-align: right; margin-top: 8px; }
    .doc-id { font-size: 11px; color: #9ca3af; text-align: right; margin-top: 4px; }
    .body { padding: 24px 48px 0; }
    .section-title { font-size: 10px; color: #9ca3af; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; padding-bottom: 6px; border-bottom: 2px solid #e5e7eb; margin-bottom: 16px; }
    .fields-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0 32px; }
    .field { margin-bottom: 16px; }
    .field-label { font-size: 10px; color: #9ca3af; font-weight: 700; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 3px; }
    .field-value { font-size: 13px; color: #111827; font-weight: 500; }
    .vins-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px 12px; margin-top: 8px; }
    .vin { font-size: 12px; font-family: monospace; background: #f9fafb; border: 1px solid #e5e7eb; padding: 5px 10px; color: #374151; }
    .signatures { padding: 16px 48px 24px; display: grid; grid-template-columns: 1fr 1fr; gap: 32px; }
    .sig-line { border-top: 1px solid #d1d5db; padding-top: 8px; }
    .sig-label { font-size: 10px; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.8px; }
    .sig-name { font-size: 12px; color: #374151; font-weight: 600; margin-top: 2px; }
    .footer { border-top: 1px solid #f3f4f6; padding: 10px 48px; display: flex; justify-content: space-between; background: #f9fafb; }
    .footer-text { font-size: 10px; color: #9ca3af; }
    .bottom-bar { height: 5px; background: #111827; }
    @media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } }
  </style>
</head>
<body>
  <div class="top-bar"></div>
  <div class="header">
    <div>
      <img class="company-logo" src="${window.location.origin}/logo-colautos-removebg-preview.png" alt="COLAUTOS" />
      <div class="tipo-badge">${tipoLabel}</div>
    </div>
    <div>
      <div class="doc-number-label">No. de Documento</div>
      <div class="doc-number">${doc.numero}</div>
      ${doc.fecha ? `<div class="doc-date">Fecha: ${formatFecha(doc.fecha)}</div>` : ''}
      <div class="doc-id">ID Sistema: ${doc.id}</div>
    </div>
  </div>

  <div class="body">
    <div class="section-title">Información del Documento</div>
    <div class="fields-grid">
      ${filasHTML}
    </div>
    ${vinsHTML}
  </div>

  <div class="signatures">
    <div class="sig-line">
      <div class="sig-label">Elaborado por</div>
      <div class="sig-name">${doc.subidoPor || '________________________'}</div>
    </div>
    <div class="sig-line">
      <div class="sig-label">Revisado por</div>
      <div class="sig-name">________________________</div>
    </div>
  </div>

  <div class="footer">
    <div class="footer-text">COLAUTOS Logística Colombia S.A.S. — Sistema de Gestión Documental</div>
    <div class="footer-text">Emitido: ${new Date().toLocaleDateString('es-CO')}</div>
  </div>
  <div class="bottom-bar"></div>
</body>
</html>`;
}

// ── Modal editar ──────────────────────────────────────────────────────────────

function EditarDocumentoModal({ doc, onClose, onEditado, onEliminado, onError }) {
  const campos = camposPorTipo[doc.tipo] || [];
  const [form, setForm] = useState({
    numero:        doc.numero        || '',
    fecha:         doc.fecha         || '',
    transportadora: doc.transportadora || '',
    origen:        doc.origen        || '',
    destino:       doc.destino       || '',
    conductor:     doc.conductor     || '',
    placa:         doc.placa         || '',
    vehiculos_json: doc.vehiculos ? doc.vehiculos.join('\n') : '',
    vin:           doc.vin           || '',
    vehiculo:      doc.vehiculo      || '',
    manifiesto_no: doc.manifiestoNo  || '',
    remesa_no:     doc.remesaNo      || '',
    peso:          doc.peso          || '',
    remitente:     doc.remitente     || '',
    destinatario:  doc.destinatario  || '',
  });
  const [archivo, setArchivo]             = useState(null);
  const [loading, setLoading]             = useState(false);
  const [confirmando, setConfirmando]     = useState(false);
  const [confirmandoEliminar, setConfirmandoEliminar] = useState(false);
  const archivoRef = useRef(null);

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.numero?.trim()) return;
    setConfirmando(true);
  };

  const handleConfirmar = async () => {
    setConfirmando(false);
    setLoading(true);
    try {
      const fd = new FormData();
      campos.forEach(campo => {
        if (campo === 'vehiculos_json') {
          const vins = (form.vehiculos_json || '').split('\n').map(v => v.trim()).filter(Boolean);
          fd.append('vehiculos_json', JSON.stringify(vins));
        } else {
          fd.append(campo, form[campo] ?? '');
        }
      });
      if (archivo) fd.append('archivo', archivo);
      const actualizado = await editarDocumento(doc.id, fd);
      onClose();
      onEditado(actualizado);
    } catch (err) {
      onClose();
      if (onError) onError(err.message || 'No se pudieron guardar los cambios.');
    }
  };

  const handleEliminar = async () => {
    setConfirmandoEliminar(false);
    setLoading(true);
    try {
      await eliminarDocumento(doc.id);
      onClose();
      onEliminado(doc.id);
    } catch (err) {
      onClose();
      if (onError) onError(err.message || 'No se pudo eliminar el documento.');
    }
  };

  if (confirmandoEliminar) {
    return (
      <div style={overlayStyle}>
        <div style={{ ...modalStyle, maxWidth: 400 }}>
          <div style={{ padding: '32px 28px', textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#fee2e2', color: '#dc2626', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Trash2 size={24} />
            </div>
            <h3 style={{ fontWeight: 700, fontSize: 17, marginBottom: 8 }}>¿Eliminar documento?</h3>
            <p style={{ fontSize: 14, color: 'var(--gray-500)', marginBottom: 24 }}>
              El documento <strong>{doc.id}</strong> será eliminado permanentemente. Esta acción no se puede deshacer.
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={() => setConfirmandoEliminar(false)}>Cancelar</button>
              <button
                onClick={handleEliminar}
                style={{ padding: '9px 20px', borderRadius: 8, border: 'none', background: '#dc2626', color: 'white', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (confirmando) {
    return (
      <div style={overlayStyle}>
        <div style={{ ...modalStyle, maxWidth: 400 }}>
          <div style={{ padding: '32px 28px', textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#fef3c7', color: '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Pencil size={24} />
            </div>
            <h3 style={{ fontWeight: 700, fontSize: 17, marginBottom: 8 }}>¿Guardar cambios?</h3>
            <p style={{ fontSize: 14, color: 'var(--gray-500)', marginBottom: 24 }}>
              Los datos del documento <strong>{doc.id}</strong> serán actualizados. ¿Estás seguro?
            </p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={() => setConfirmando(false)}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleConfirmar}>Sí, guardar cambios</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={overlayStyle}>
      <div style={{ ...modalStyle, maxWidth: 600 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--gray-200)' }}>
          <div>
            <h3 style={{ fontWeight: 700, fontSize: 17, marginBottom: 2 }}>Editar Documento</h3>
            <span style={{ fontSize: 13, color: 'var(--gray-500)' }}>{TIPO_LABELS[doc.tipo]} · {doc.id}</span>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)' }}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 14, maxHeight: '65vh', overflowY: 'auto' }}>
            {campos.map(campo => {
              if (campo === 'transportadora') return (
                <div key={campo} className="form-group">
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>{FIELD_LABELS[campo]}</label>
                  <select className="form-control" value={form[campo] || ''} onChange={e => handleChange(campo, e.target.value)}>
                    <option value="">Seleccionar...</option>
                    {TRANSPORTADORAS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              );
              if (campo === 'fecha') return (
                <div key={campo} className="form-group">
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>{FIELD_LABELS[campo]}</label>
                  <input type="date" className="form-control" value={form[campo] || ''} onChange={e => handleChange(campo, e.target.value)} />
                </div>
              );
              if (campo === 'vehiculos_json') return (
                <div key={campo} className="form-group">
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>{FIELD_LABELS[campo]}</label>
                  <textarea className="form-control" rows={4} value={form[campo] || ''} onChange={e => handleChange(campo, e.target.value)} style={{ fontFamily: 'monospace', fontSize: 13 }} />
                </div>
              );
              if (campo === 'vin') return (
                <div key={campo} className="form-group">
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>{FIELD_LABELS[campo]}</label>
                  <input type="text" className="form-control" value={form[campo] || ''} onChange={e => handleChange(campo, e.target.value.toUpperCase())} style={{ fontFamily: 'monospace' }} />
                </div>
              );
              return (
                <div key={campo} className="form-group">
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>{FIELD_LABELS[campo]}</label>
                  <input type="text" className="form-control" placeholder={FIELD_PLACEHOLDERS[campo] || ''} value={form[campo] || ''} onChange={e => handleChange(campo, e.target.value)} />
                </div>
              );
            })}

            <div className="form-group">
              <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>
                Reemplazar archivo
                {doc.archivo && <span style={{ fontWeight: 400, color: 'var(--gray-500)', fontSize: 12 }}> (actual: {doc.archivo})</span>}
              </label>
              <input type="file" ref={archivoRef} style={{ display: 'none' }} accept=".pdf,.png,.jpg,.jpeg" onChange={e => setArchivo(e.target.files[0] || null)} />
              <div onClick={() => archivoRef.current.click()} style={{ border: `2px dashed ${archivo ? 'var(--success-500)' : 'var(--gray-300)'}`, borderRadius: 8, padding: '14px', textAlign: 'center', cursor: 'pointer', background: archivo ? 'var(--success-50)' : 'var(--gray-50)' }}>
                <Upload size={18} style={{ color: archivo ? 'var(--success-600)' : 'var(--gray-400)', marginBottom: 2 }} />
                <p style={{ fontSize: 12, color: archivo ? 'var(--success-700)' : 'var(--gray-500)', margin: 0, fontWeight: archivo ? 600 : 400 }}>
                  {archivo ? archivo.name : 'Haz clic para seleccionar un nuevo archivo (opcional)'}
                </p>
              </div>
            </div>
          </div>

          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--gray-200)', display: 'flex', gap: 10, justifyContent: 'space-between', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => setConfirmandoEliminar(true)}
              disabled={loading}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8, border: '1px solid #fca5a5', background: '#fff5f5', color: '#dc2626', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}
            >
              <Trash2 size={14} /> Eliminar
            </button>
            <div style={{ display: 'flex', gap: 10 }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: 6 }}>
                {loading ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Pencil size={15} />}
                {loading ? 'Guardando...' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Modal nuevo documento ─────────────────────────────────────────────────────

function NuevoDocumentoModal({ onClose, onCreado }) {
  const { usuario } = useAuth();
  const [tipo, setTipo]     = useState('manifiesto');
  const [form, setForm]     = useState({});
  const [archivo, setArchivo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [exito, setExito]   = useState(false);
  const [error, setError]   = useState('');
  const archivoRef = useRef(null);

  const campos = camposPorTipo[tipo] || [];

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.numero?.trim()) { setError('El número de documento es obligatorio.'); return; }
    setError('');
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('tipo', tipo);
      fd.append('subido_por', usuario?.nombre ?? 'Sistema');
      campos.forEach(campo => {
        if (campo === 'vehiculos_json') {
          const vins = (form.vehiculos_json || '').split('\n').map(v => v.trim()).filter(Boolean);
          fd.append('vehiculos_json', JSON.stringify(vins));
        } else if (form[campo]?.trim()) {
          fd.append(campo, form[campo].trim());
        }
      });
      if (archivo) fd.append('archivo', archivo);
      const nuevo = await crearDocumento(fd);
      setExito(true);
      onCreado(nuevo);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (exito) {
    return (
      <div style={overlayStyle}>
        <div style={modalStyle}>
          <div style={{ textAlign: 'center', padding: '32px 24px' }}>
            <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--success-50)', color: 'var(--success-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <CheckCircle size={28} />
            </div>
            <h3 style={{ fontWeight: 700, marginBottom: 8 }}>Documento creado exitosamente</h3>
            <p style={{ color: 'var(--gray-500)', fontSize: 14, marginBottom: 24 }}>El documento fue registrado y aparece en el listado.</p>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={() => { setExito(false); setForm({}); setArchivo(null); setTipo('manifiesto'); }}>Crear otro</button>
              <button className="btn btn-secondary" onClick={onClose}>Cerrar</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={overlayStyle}>
      <div style={{ ...modalStyle, maxWidth: 600 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid var(--gray-200)' }}>
          <h3 style={{ fontWeight: 700, fontSize: 17 }}>Nuevo Documento</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)' }}><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 16, maxHeight: '65vh', overflowY: 'auto' }}>
            <div className="form-group">
              <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>Tipo de documento *</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 8 }}>
                {TIPOS_DOCUMENTO.map(t => (
                  <button
                    key={t.value}
                    type="button"
                    onClick={() => { setTipo(t.value); setForm({}); }}
                    style={{
                      padding: '10px 12px', borderRadius: 8,
                      border: tipo === t.value ? '2px solid var(--primary-600)' : '2px solid var(--gray-200)',
                      background: tipo === t.value ? 'var(--primary-50)' : 'white',
                      color: tipo === t.value ? 'var(--primary-700)' : 'var(--gray-700)',
                      fontWeight: tipo === t.value ? 700 : 500,
                      fontSize: 13, cursor: 'pointer', textAlign: 'center',
                    }}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {campos.map(campo => {
              if (campo === 'transportadora') return (
                <div key={campo} className="form-group">
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>{FIELD_LABELS[campo]}</label>
                  <select className="form-control" value={form[campo] || ''} onChange={e => handleChange(campo, e.target.value)}>
                    <option value="">Seleccionar...</option>
                    {TRANSPORTADORAS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
              );
              if (campo === 'fecha') return (
                <div key={campo} className="form-group">
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>{FIELD_LABELS[campo]}</label>
                  <input type="date" className="form-control" value={form[campo] || ''} onChange={e => handleChange(campo, e.target.value)} />
                </div>
              );
              if (campo === 'vehiculos_json') return (
                <div key={campo} className="form-group">
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>{FIELD_LABELS[campo]}</label>
                  <textarea className="form-control" rows={4} placeholder={'3MDDJ2HAAV...\n5YJSA1E20H...'} value={form[campo] || ''} onChange={e => handleChange(campo, e.target.value)} style={{ fontFamily: 'monospace', fontSize: 13 }} />
                </div>
              );
              if (campo === 'vin') return (
                <div key={campo} className="form-group">
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>{FIELD_LABELS[campo]}</label>
                  <input type="text" className="form-control" placeholder="Ej: 3MDDJ2HAAVM461828" value={form[campo] || ''} onChange={e => handleChange(campo, e.target.value.toUpperCase())} style={{ fontFamily: 'monospace' }} />
                </div>
              );
              return (
                <div key={campo} className="form-group">
                  <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>{FIELD_LABELS[campo]}</label>
                  <input type="text" className="form-control" placeholder={FIELD_PLACEHOLDERS[campo] || ''} value={form[campo] || ''} onChange={e => handleChange(campo, e.target.value)} />
                </div>
              );
            })}

            <div className="form-group">
              <label style={{ fontWeight: 600, display: 'block', marginBottom: 6 }}>Archivo adjunto (PDF, imagen)</label>
              <input type="file" ref={archivoRef} style={{ display: 'none' }} accept=".pdf,.png,.jpg,.jpeg" onChange={e => setArchivo(e.target.files[0] || null)} />
              <div
                onClick={() => archivoRef.current.click()}
                style={{ border: `2px dashed ${archivo ? 'var(--success-500)' : 'var(--gray-300)'}`, borderRadius: 8, padding: '16px', textAlign: 'center', cursor: 'pointer', background: archivo ? 'var(--success-50)' : 'var(--gray-50)' }}
              >
                <Upload size={20} style={{ color: archivo ? 'var(--success-600)' : 'var(--gray-400)', marginBottom: 4 }} />
                <p style={{ fontSize: 13, color: archivo ? 'var(--success-700)' : 'var(--gray-500)', margin: 0, fontWeight: archivo ? 600 : 400 }}>
                  {archivo ? archivo.name : 'Haz clic para seleccionar un archivo'}
                </p>
              </div>
            </div>

            {error && <p style={{ color: 'var(--danger-500)', fontSize: 13, margin: 0 }}>{error}</p>}
          </div>

          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--gray-200)', display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancelar</button>
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ opacity: loading ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: 6 }}>
              {loading ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} /> : <Plus size={15} />}
              {loading ? 'Guardando...' : 'Crear documento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const overlayStyle = {
  position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
  display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
};
const modalStyle = {
  background: 'white', borderRadius: 12, width: '100%',
  maxWidth: 560, boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
};

// ── Página principal ──────────────────────────────────────────────────────────

export default function DocumentosPage() {
  const [tab, setTab]               = useState('todos');
  const [busqueda, setBusqueda]     = useState('');
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [docEditando, setDocEditando]   = useState(null);
  const [docViendo, setDocViendo]       = useState(null);
  const [toast, setToast]               = useState({ visible: false, msg: '', tipo: 'ok' });
  const toastTimer = useRef(null);

  useEffect(() => {
    getDocumentos()
      .then(setDocumentos)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleDocumentoCreado = (nuevo) => {
    setDocumentos(prev => [nuevo, ...prev]);
  };

  const mostrarToast = (msg, tipo = 'ok') => {
    setToast({ visible: true, msg, tipo });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 3800);
  };

  const handleDocumentoEditado = (actualizado) => {
    if (!actualizado?.id) return;
    setDocumentos(prev => prev.map(d => d.id === actualizado.id ? actualizado : d));
    mostrarToast('Se guardaron los cambios del archivo');
  };

  const handleDocumentoEliminado = (id) => {
    setDocumentos(prev => prev.filter(d => d.id !== id));
    mostrarToast('El documento fue eliminado correctamente');
  };

  const documentosFiltrados = documentos.filter(doc => {
    const matchTab = tab === 'todos'
      || (tab === 'remesa_inventario' && ['remesa', 'inventario'].includes(doc.tipo))
      || doc.tipo === tab;
    const matchBusqueda = !busqueda
      || doc.numero.toLowerCase().includes(busqueda.toLowerCase())
      || (doc.vin && doc.vin.toLowerCase().includes(busqueda.toLowerCase()))
      || (doc.vehiculo && doc.vehiculo.toLowerCase().includes(busqueda.toLowerCase()))
      || (doc.manifiestoNo && doc.manifiestoNo.toLowerCase().includes(busqueda.toLowerCase()));
    return matchTab && matchBusqueda;
  });

  return (
    <>
      {mostrarModal && (
        <NuevoDocumentoModal
          onClose={() => setMostrarModal(false)}
          onCreado={handleDocumentoCreado}
        />
      )}
      {docEditando && (
        <EditarDocumentoModal
          doc={docEditando}
          onClose={() => setDocEditando(null)}
          onEditado={handleDocumentoEditado}
          onEliminado={handleDocumentoEliminado}
          onError={(msg) => mostrarToast(msg, 'error')}
        />
      )}
      {docViendo && (
        <VisorDocumentoModal
          doc={docViendo}
          onClose={() => setDocViendo(null)}
          onEditar={(d) => { setDocViendo(null); setDocEditando(d); }}
        />
      )}

      <div className="page-header">
        <div className="page-header-top">
          <div>
            <h1>Documentos</h1>
            <p>Buscar y crear manifiestos, remesas, inventarios y traslados</p>
          </div>
          <button className="btn btn-primary" onClick={() => setMostrarModal(true)}>
            <Plus size={16} /> Nuevo Documento
          </button>
        </div>
      </div>

      <div className="page-body">
        <div className="doc-tabs">
          {TABS.map(t => (
            <button
              key={t.id}
              className={`doc-tab ${tab === t.id ? 'active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="filters-bar">
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--gray-400)' }} />
            <input
              type="text"
              className="filter-input"
              placeholder="Buscar por VIN, número de remesa, manifiesto o vehículo..."
              style={{ paddingLeft: '36px', width: '100%' }}
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>
        </div>

        <div className="doc-cards">
          {loading && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: 'var(--gray-400)' }}>
              Cargando documentos...
            </div>
          )}

          {!loading && documentosFiltrados.map(doc => (
            <div
              key={doc.id}
              className="doc-card"
              onClick={() => setDocViendo(doc)}
              style={{ cursor: 'pointer' }}
            >
              {/* Encabezado */}
              <div className={`doc-card-header ${ICON_CLASSES[doc.tipo]}`}>
                <div className="doc-card-tipo-row">
                  <span className="doc-card-tipo-badge">
                    {doc.tipo === 'manifiesto'          && <Truck size={10} />}
                    {doc.tipo === 'remesa'              && <Package size={10} />}
                    {doc.tipo === 'inventario'          && <FileText size={10} />}
                    {doc.tipo === 'inventario_traslado' && <ArrowLeftRight size={10} />}
                    {TIPO_LABELS[doc.tipo]}
                  </span>
                  <span className="doc-card-fecha-badge">
                    {formatFecha(doc.fecha)}
                  </span>
                </div>
                <div className="doc-card-numero">{doc.numero}</div>
                {doc.archivo && <div className="doc-card-archivo">{doc.archivo}</div>}
              </div>

              {/* Cuerpo */}
              <div className="doc-card-details">
                {doc.vin && (
                  <div className="doc-card-detail">
                    <Car size={13} />
                    <span><strong>VIN:</strong> {doc.vin}</span>
                  </div>
                )}
                {doc.vehiculo && (
                  <div className="doc-card-detail">
                    <Hash size={13} />
                    {doc.vehiculo}
                  </div>
                )}
                {doc.vehiculos && doc.vehiculos.length > 0 && (
                  <div className="doc-card-detail">
                    <Car size={13} />
                    <span><strong>{doc.vehiculos.length}</strong> vehículo(s)</span>
                  </div>
                )}
                {doc.transportadora && (
                  <div className="doc-card-detail">
                    <Truck size={13} />
                    {doc.transportadora}
                  </div>
                )}
                {doc.origen && (
                  <div className="doc-card-detail">
                    <MapPin size={13} />
                    {doc.origen} → {doc.destino}
                  </div>
                )}
                {doc.remesaNo && (
                  <div className="doc-card-detail">
                    <Hash size={13} />
                    <span><strong>Remesa:</strong> {doc.remesaNo}</span>
                  </div>
                )}
                {doc.manifiestoNo && (
                  <div className="doc-card-detail">
                    <FileText size={13} />
                    <span><strong>Manifiesto:</strong> {doc.manifiestoNo}</span>
                  </div>
                )}
              </div>

              {/* Pie */}
              <div className="doc-card-footer" style={{ justifyContent: 'space-between' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <User size={12} />
                  {doc.subidoPor}
                </span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDocViendo(doc); }}
                    style={{ background: 'none', border: '1px solid var(--gray-300)', borderRadius: 6, padding: '3px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--gray-600)', fontWeight: 600 }}
                  >
                    <Eye size={11} /> Ver
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setDocEditando(doc); }}
                    style={{ background: 'none', border: '1px solid var(--gray-300)', borderRadius: 6, padding: '3px 8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: 'var(--gray-600)', fontWeight: 600 }}
                  >
                    <Pencil size={11} /> Editar
                  </button>
                </div>
              </div>
            </div>
          ))}

          {!loading && documentosFiltrados.length === 0 && (
            <div style={{ gridColumn: '1 / -1' }}>
              <div className="empty-state">
                <FileText size={40} />
                <h3>No se encontraron documentos</h3>
                <p>Intenta con otro término de búsqueda o crea un nuevo documento</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Toast flotante ── */}
      <div style={{
        position: 'fixed', bottom: 32, left: '50%',
        transform: `translateX(-50%) translateY(${toast.visible ? '0' : '20px'})`,
        background: toast.tipo === 'error' ? '#b91c1c' : '#111827',
        color: 'white',
        padding: '13px 22px', borderRadius: 8,
        display: 'flex', alignItems: 'center', gap: 10,
        boxShadow: '0 8px 28px rgba(0,0,0,0.30)',
        fontSize: 14, fontWeight: 500,
        opacity: toast.visible ? 1 : 0,
        transition: 'opacity 0.28s ease, transform 0.28s ease',
        pointerEvents: 'none', zIndex: 1200,
        maxWidth: 420, textAlign: 'center',
      }}>
        <CheckCircle size={17} style={{ color: toast.tipo === 'error' ? '#fca5a5' : '#4ade80', flexShrink: 0 }} />
        {toast.msg}
      </div>
    </>
  );
}
