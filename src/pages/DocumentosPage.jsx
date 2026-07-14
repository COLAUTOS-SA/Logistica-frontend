import { useState, useEffect } from 'react';
import { getDocumentos } from '../services/api';
import {
  Search, FileText, Truck, Package, ArrowLeftRight,
  Calendar, User, Hash, MapPin, Car
} from 'lucide-react';

const TABS = [
  { id: 'todos', label: 'Todos', icon: FileText },
  { id: 'manifiesto', label: 'Manifiestos', icon: Truck },
  { id: 'remesa_inventario', label: 'Remesas e Inventarios', icon: Package },
  { id: 'inventario_traslado', label: 'Traslados', icon: ArrowLeftRight },
];

const ICON_CLASSES = {
  manifiesto: 'manifiesto',
  remesa: 'remesa',
  inventario: 'inventario',
  inventario_traslado: 'traslado',
};

const TIPO_LABELS = {
  manifiesto: 'Manifiesto',
  remesa: 'Remesa',
  inventario: 'Inventario',
  inventario_traslado: 'Inv. Traslado',
};

export default function DocumentosPage() {
  const [tab, setTab] = useState('todos');
  const [busqueda, setBusqueda] = useState('');
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDocumentos()
      .then(setDocumentos)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const documentosFiltrados = documentos.filter(doc => {
    const matchTab = tab === 'todos'
      || (tab === 'remesa_inventario' && ['remesa', 'inventario'].includes(doc.tipo))
      || doc.tipo === tab;
    const matchBusqueda = !busqueda ||
      doc.numero.toLowerCase().includes(busqueda.toLowerCase()) ||
      (doc.vin && doc.vin.toLowerCase().includes(busqueda.toLowerCase())) ||
      (doc.vehiculo && doc.vehiculo.toLowerCase().includes(busqueda.toLowerCase())) ||
      (doc.manifiestoNo && doc.manifiestoNo.toLowerCase().includes(busqueda.toLowerCase()));

    return matchTab && matchBusqueda;
  });

  return (
    <>
      <div className="page-header">
        <div className="page-header-top">
          <div>
            <h1>Documentos</h1>
            <p>Buscar manifiestos, remesas, inventarios y traslados</p>
          </div>
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
            <div key={doc.id} className="doc-card">
              <div className="doc-card-header">
                <div className={`doc-card-icon ${ICON_CLASSES[doc.tipo]}`}>
                  {doc.tipo === 'manifiesto' && <Truck size={20} />}
                  {doc.tipo === 'remesa' && <Package size={20} />}
                  {doc.tipo === 'inventario' && <FileText size={20} />}
                  {doc.tipo === 'inventario_traslado' && <ArrowLeftRight size={20} />}
                </div>
                <div>
                  <div className="doc-card-title">
                    {TIPO_LABELS[doc.tipo]} · {doc.numero}
                  </div>
                  <div className="doc-card-subtitle">
                    {doc.archivo}
                  </div>
                </div>
              </div>
              <div className="doc-card-details">
                <div className="doc-card-detail">
                  <Calendar size={14} />
                  {new Date(doc.fecha).toLocaleDateString('es-CO')}
                </div>
                {doc.vin && (
                  <div className="doc-card-detail">
                    <Car size={14} />
                    <span className="vin-display">{doc.vin}</span>
                  </div>
                )}
                {doc.vehiculo && (
                  <div className="doc-card-detail">
                    <Hash size={14} />
                    {doc.vehiculo}
                  </div>
                )}
                {doc.vehiculos && (
                  <div className="doc-card-detail">
                    <Car size={14} />
                    {doc.vehiculos.length} vehículo(s)
                  </div>
                )}
                {doc.transportadora && (
                  <div className="doc-card-detail">
                    <Truck size={14} />
                    {doc.transportadora}
                  </div>
                )}
                {doc.origen && (
                  <div className="doc-card-detail">
                    <MapPin size={14} />
                    {doc.origen} → {doc.destino}
                  </div>
                )}
                <div className="doc-card-detail">
                  <User size={14} />
                  Cargado por: {doc.subidoPor}
                </div>
              </div>
            </div>
          ))}

          {!loading && documentosFiltrados.length === 0 && (
            <div style={{ gridColumn: '1 / -1' }}>
              <div className="empty-state">
                <FileText size={40} />
                <h3>No se encontraron documentos</h3>
                <p>Intenta con otro término de búsqueda</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
