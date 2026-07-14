import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { crearReclamacion } from '../services/api';
import { TIPOS_NOVEDAD, TRANSPORTADORAS } from '../data/mockData';
import {
  ArrowLeft, Camera, Video, FileText,
  AlertTriangle, CheckCircle
} from 'lucide-react';

export default function NuevaReclamacionPage() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [nuevaId, setNuevaId] = useState(null);
  const [form, setForm] = useState({
    vin: '',
    vehiculo: '',
    tipoNovedad: '',
    transportadora: '',
    remesaNo: '',
    manifiestoNo: '',
    descripcion: '',
  });

  // Guardamos el objeto del archivo REAL completo
  const [fotos, setFotos] = useState([]);
  const [videos, setVideos] = useState([]);
  const [soportes, setSoportes] = useState([]);
  const [errors, setErrors] = useState({});

  const fileInputFotosRef = useRef(null);
  const fileInputVideosRef = useRef(null);
  const fileInputSoportesRef = useRef(null);

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    
    if (!form.vin.trim()) newErrors.vin = 'El VIN es obligatorio';
    if (!form.vehiculo.trim()) newErrors.vehiculo = 'El vehículo es obligatorio';
    if (!form.tipoNovedad) newErrors.tipoNovedad = 'Seleccione el tipo de novedad';
    if (!form.transportadora) newErrors.transportadora = 'Seleccione la transportadora';
    if (!form.remesaNo.trim()) newErrors.remesaNo = 'El número de remesa es obligatorio';
    if (!form.manifiestoNo.trim()) newErrors.manifiestoNo = 'El número de manifiesto es obligatorio';
    if (!form.descripcion.trim()) newErrors.descripcion = 'La descripción es obligatoria';
    
    if (fotos.length === 0) newErrors.fotos = 'Debe adjuntar al menos una foto';
    if (videos.length === 0) newErrors.videos = 'Debe adjuntar al menos un video';
    if (soportes.length === 0) newErrors.soportes = 'Debe adjuntar la remesa y el inventario';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validate()) return;

    const nombre = usuario?.nombre ?? 'Sistema';
    const formData = new FormData();
    formData.append('vin', form.vin);
    formData.append('vehiculo', form.vehiculo);
    formData.append('tipo_novedad', form.tipoNovedad);
    formData.append('transportadora', form.transportadora);
    formData.append('no_remesa', form.remesaNo);
    formData.append('no_manifiesto', form.manifiestoNo);
    formData.append('descripcion', form.descripcion);
    formData.append('reportado_por', nombre);
    formData.append('responsable_actual', nombre);

    fotos.forEach(f => formData.append('fotos', f));
    videos.forEach(f => formData.append('videos', f));
    soportes.forEach(f => formData.append('soportes', f));

    try {
      const nueva = await crearReclamacion(formData);
      setSubmitted(true);
      // Guardamos el id para navegar al detalle tras el éxito
      setNuevaId(nueva.id);
    } catch (error) {
      console.error('Error al crear reclamación:', error);
      alert('Error: ' + error.message);
    }
  };

  const handleFileChange = (e, setter, fieldName) => {
    const selectedFiles = Array.from(e.target.files);
    if (selectedFiles.length > 0) {
      setter(prev => [...prev, ...selectedFiles]);
      
      if (errors[fieldName]) {
        setErrors(prev => ({ ...prev, [fieldName]: null }));
      }
    }
  };

  const removeFile = (setter, index) => {
    setter(prev => prev.filter((_, i) => i !== index));
  };

  if (submitted) {
    return (
      <div className="page-body">
        <div style={{ textAlign: 'center', padding: '60px 24px', background: 'white', borderRadius: 'var(--radius-lg)', border: '1px solid var(--gray-200)' }}>
          <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--success-50)', color: 'var(--success-600)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <CheckCircle size={32} />
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: 'var(--gray-900)', marginBottom: '8px' }}>Reclamación registrada exitosamente</h2>
          {nuevaId && (
            <p style={{ fontSize: '15px', fontWeight: 600, color: 'var(--primary-600)', marginBottom: '4px' }}>{nuevaId}</p>
          )}
          <p style={{ fontSize: '14px', color: 'var(--gray-500)', marginBottom: '24px' }}>Los datos y archivos multimedia fueron cargados correctamente.</p>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
            {nuevaId && (
              <button className="btn btn-primary" onClick={() => navigate(`/reclamaciones/${nuevaId}`)}>Ver Detalle</button>
            )}
            <button className="btn btn-secondary" onClick={() => navigate('/reclamaciones')}>Ver Todas</button>
            <button className="btn btn-secondary" onClick={() => { setSubmitted(false); setNuevaId(null); setForm({ vin: '', vehiculo: '', tipoNovedad: '', transportadora: '', remesaNo: '', manifiestoNo: '', descripcion: '' }); setFotos([]); setVideos([]); setSoportes([]); }}>Crear Otra</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button className="btn-icon" onClick={() => navigate('/reclamaciones')}><ArrowLeft size={18} /></button>
          <div>
            <h1>Nueva Reclamación</h1>
            <p>Suba la información y los archivos reales para revisión del equipo</p>
          </div>
        </div>
      </div>

      <div className="page-body">
        <form onSubmit={handleSubmit}>
          {/* CONTROLADORES NATIVOS OCULTOS */}
          <input type="file" ref={fileInputFotosRef} style={{ display: 'none' }} accept="image/*" multiple onChange={(e) => handleFileChange(e, setFotos, 'fotos')} />
          <input type="file" ref={fileInputVideosRef} style={{ display: 'none' }} accept="video/*" multiple onChange={(e) => handleFileChange(e, setVideos, 'videos')} />
          <input type="file" ref={fileInputSoportesRef} style={{ display: 'none' }} accept=".pdf,image/*" multiple onChange={(e) => handleFileChange(e, setSoportes, 'soportes')} />

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
            <div>
              {/* Formulario de texto */}
              <div className="card" style={{ marginBottom: '20px' }}>
                <div className="card-header"><h3>Datos del Vehículo</h3></div>
                <div className="card-body">
                  <div className="form-row">
                    <div className="form-group">
                      <label>VIN <span className="required">*</span></label>
                      <input type="text" className="form-control" placeholder="Ej: 3MDDJ..." value={form.vin} onChange={e => handleChange('vin', e.target.value.toUpperCase())} maxLength={17} style={{ fontFamily: 'monospace' }} />
                      {errors.vin && <span style={{ color: 'var(--danger-500)', fontSize: '12px' }}>{errors.vin}</span>}
                    </div>
                    <div className="form-group">
                      <label>Vehículo <span className="required">*</span></label>
                      <input type="text" className="form-control" placeholder="Ej: Mazda CX-30" value={form.vehiculo} onChange={e => handleChange('vehiculo', e.target.value)} />
                      {errors.vehiculo && <span style={{ color: 'var(--danger-500)', fontSize: '12px' }}>{errors.vehiculo}</span>}
                    </div>
                  </div>
                </div>
              </div>

              <div className="card" style={{ marginBottom: '20px' }}>
                <div className="card-header"><h3>Datos de la Novedad</h3></div>
                <div className="card-body">
                  <div className="form-row">
                    <div className="form-group">
                      <label>Tipo de Novedad <span className="required">*</span></label>
                      <select className="form-control" value={form.tipoNovedad} onChange={e => handleChange('tipoNovedad', e.target.value)}>
                        <option value="">Seleccionar...</option>
                        {TIPOS_NOVEDAD.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      {errors.tipoNovedad && <span style={{ color: 'var(--danger-500)', fontSize: '12px' }}>{errors.tipoNovedad}</span>}
                    </div>
                    <div className="form-group">
                      <label>Transportadora <span className="required">*</span></label>
                      <select className="form-control" value={form.transportadora} onChange={e => handleChange('transportadora', e.target.value)}>
                        <option value="">Seleccionar...</option>
                        {TRANSPORTADORAS.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                      {errors.transportadora && <span style={{ color: 'var(--danger-500)', fontSize: '12px' }}>{errors.transportadora}</span>}
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="form-group">
                      <label>No. Remesa <span className="required">*</span></label>
                      <input type="text" className="form-control" placeholder="Ej: VIG-2100" value={form.remesaNo} onChange={e => handleChange('remesaNo', e.target.value.toUpperCase())} />
                      {errors.remesaNo && <span style={{ color: 'var(--danger-500)', fontSize: '12px' }}>{errors.remesaNo}</span>}
                    </div>
                    <div className="form-group">
                      <label>No. Manifiesto <span className="required">*</span></label>
                      <input type="text" className="form-control" placeholder="Ej: 41090..." value={form.manifiestoNo} onChange={e => handleChange('manifiestoNo', e.target.value)} />
                      {errors.manifiestoNo && <span style={{ color: 'var(--danger-500)', fontSize: '12px' }}>{errors.manifiestoNo}</span>}
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Descripción de la Novedad <span className="required">*</span></label>
                    <textarea className="form-control" placeholder="Describa el daño..." value={form.descripcion} onChange={e => handleChange('descripcion', e.target.value)} rows={4} />
                    {errors.descripcion && <span style={{ color: 'var(--danger-500)', fontSize: '12px' }}>{errors.descripcion}</span>}
                  </div>
                </div>
              </div>
            </div>

            {/* Carga multimedia */}
            <div>
              <div className="card" style={{ marginBottom: '20px' }}>
                <div className="card-header"><h3><Camera size={16} /> Fotos <span className="required">*</span></h3></div>
                <div className="card-body">
                  <div className="upload-zone" style={{ cursor: 'pointer' }} onClick={() => fileInputFotosRef.current.click()}>
                    <Camera size={28} />
                    <p>Buscar fotos en el dispositivo</p>
                  </div>
                  {errors.fotos && <span style={{ color: 'var(--danger-500)', fontSize: '12px' }}>{errors.fotos}</span>}
                  <div className="uploaded-files">
                    {fotos.map((f, i) => (
                      <div key={i} className="uploaded-file">
                        <Camera size={12} /> {f.name}
                        <button type="button" onClick={() => removeFile(setFotos, i)}>×</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="card" style={{ marginBottom: '20px' }}>
                <div className="card-header"><h3><Video size={16} /> Videos <span className="required">*</span></h3></div>
                <div className="card-body">
                  <div className="upload-zone" style={{ cursor: 'pointer' }} onClick={() => fileInputVideosRef.current.click()}>
                    <Video size={28} />
                    <p>Buscar videos en el dispositivo</p>
                  </div>
                  {errors.videos && <span style={{ color: 'var(--danger-500)', fontSize: '12px' }}>{errors.videos}</span>}
                  <div className="uploaded-files">
                    {videos.map((f, i) => (
                      <div key={i} className="uploaded-file">
                        <Video size={12} /> {f.name}
                        <button type="button" onClick={() => removeFile(setVideos, i)}>×</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="card" style={{ marginBottom: '20px' }}>
                <div className="card-header"><h3><FileText size={16} /> Soportes <span className="required">*</span></h3></div>
                <div className="card-body">
                  <div className="upload-zone" style={{ cursor: 'pointer' }} onClick={() => fileInputSoportesRef.current.click()}>
                    <FileText size={28} />
                    <p>Buscar Remesa e Inventario (PDF)</p>
                  </div>
                  {errors.soportes && <span style={{ color: 'var(--danger-500)', fontSize: '12px' }}>{errors.soportes}</span>}
                  <div className="uploaded-files">
                    {soportes.map((f, i) => (
                      <div key={i} className="uploaded-file">
                        <FileText size={12} /> {f.name}
                        <button type="button" onClick={() => removeFile(setSoportes, i)}>×</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', padding: '14px' }}>
                <AlertTriangle size={16} /> Radicar Reclamación Real
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
