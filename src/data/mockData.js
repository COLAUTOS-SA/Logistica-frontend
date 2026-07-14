// ============================================================
// DATOS MOCK - Modelo completo de datos para el prototipo
// ============================================================

export const ESTADOS_RECLAMACION = [
  { id: 'abierta', label: 'Abierta', color: '#ef4444' },
  { id: 'en_gestion', label: 'En gestión', color: '#f59e0b' },
  { id: 'radicada_vigia', label: 'Radicada en Vigía', color: '#3b82f6' },
  { id: 'aprobada', label: 'Aprobada', color: '#10b981' },
  { id: 'en_facturacion', label: 'En facturación', color: '#8b5cf6' },
  { id: 'cerrada', label: 'Cerrada', color: '#6b7280' },
];

export const TIPOS_NOVEDAD = [
  'Desconche',
  'Rayón',
  'Abolladura',
  'Faltante de accesorios',
  'Vidrio roto',
  'Daño en pintura',
  'Daño en tapicería',
  'Daño mecánico',
  'Otro',
];

export const SEDES = [
  'Pereira - Av 30 de Agosto',
  'Pereira - Geely',
  'Dosquebradas',
];

export const TRANSPORTADORAS = [
  'BERGE Vigía',
  'Transportes Especiales',
  'Coltanques',
];

export const USUARIOS = [
  { id: 1, nombre: 'Carolina Aricapa', email: 'carolina.aricapa@colautos.com', rol: 'admin', sede: 'Pereira - Av 30 de Agosto' },
  { id: 2, nombre: 'Lorena Gómez', email: 'lorena.gomez@colautos.com', rol: 'asistente', sede: 'Pereira - Av 30 de Agosto' },
  { id: 3, nombre: 'Pilar Piedrahita', email: 'pilar.piedrahita@colautos.com', rol: 'asistente', sede: 'Dosquebradas' },
  { id: 4, nombre: 'Miguel Colisión', email: 'miguel.colision@colautos.com', rol: 'colision', sede: 'Pereira - Av 30 de Agosto' },
  { id: 5, nombre: 'Kendry Iván', email: 'kendry.ivan@colautos.com', rol: 'asistente', sede: 'Pereira - Av 30 de Agosto' },
];

export const ROLES = {
  admin: { label: 'Administrador (Logística)', permisos: ['crear', 'editar', 'eliminar', 'consultar', 'exportar', 'gestionar_usuarios'] },
  asistente: { label: 'Asistente Comercial', permisos: ['crear', 'consultar'] },
  colision: { label: 'Área de Colisión', permisos: ['consultar', 'subir_cotizacion'] },
};

// Calcular días hábiles entre dos fechas
function diasHabiles(fechaInicio, fechaFin) {
  let count = 0;
  const current = new Date(fechaInicio);
  const end = new Date(fechaFin);
  while (current <= end) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) count++;
    current.setDate(current.getDate() + 1);
  }
  return count;
}

const hoy = new Date();
const hace3Dias = new Date(hoy); hace3Dias.setDate(hoy.getDate() - 3);
const hace5Dias = new Date(hoy); hace5Dias.setDate(hoy.getDate() - 7);
const hace10Dias = new Date(hoy); hace10Dias.setDate(hoy.getDate() - 14);
const hace20Dias = new Date(hoy); hace20Dias.setDate(hoy.getDate() - 25);
const hace30Dias = new Date(hoy); hace30Dias.setDate(hoy.getDate() - 35);

export const RECLAMACIONES = [
  {
    id: 'REC-2026-001',
    vin: '3MDDJ2HAAVM461828',
    vehiculo: 'Mazda CX-30 2026 - Machine Gray',
    fechaReporte: hace3Dias.toISOString().split('T')[0],
    fechaRadicacion: null,
    tipoNovedad: 'Desconche',
    descripcion: 'Desconche en la nave trasera del vehículo. Se detectó al momento de la recepción en bodega Pereira.',
    estado: 'abierta',
    reportadoPor: 'Lorena Gómez',
    responsableActual: 'Carolina Aricapa',
    transportadora: 'BERGE Vigía',
    remesaNo: 'VIG-2100766',
    manifiestoNo: '410900097167',
    diasHabiles: diasHabiles(hace3Dias, hoy),
    diasLimite: 10,
    radicadoVigia: null,
    cotizacion: null,
    fotos: ['foto_desconche_1.jpg', 'foto_desconche_2.jpg', 'foto_desconche_3.jpg'],
    videos: ['video_novedad.mp4'],
    soportes: ['remesa_VIG-2100766.pdf', 'inventario_VIG-2100766.pdf'],
    historial: [
      { fecha: hace3Dias.toISOString().split('T')[0], accion: 'Reclamación creada', usuario: 'Lorena Gómez', detalle: 'Se reporta desconche en nave trasera' },
    ],
  },
  {
    id: 'REC-2026-002',
    vin: '3MVDM2W7AVL319047',
    vehiculo: 'Mazda CX-5 2026 - Blanco Nieve Perlado',
    fechaReporte: hace5Dias.toISOString().split('T')[0],
    fechaRadicacion: null,
    tipoNovedad: 'Rayón',
    descripcion: 'Rayón profundo en puerta delantera derecha. Posiblemente durante el transporte.',
    estado: 'en_gestion',
    reportadoPor: 'Pilar Piedrahita',
    responsableActual: 'Miguel Colisión',
    transportadora: 'BERGE Vigía',
    remesaNo: 'VIG-2100765',
    manifiestoNo: '410900097167',
    diasHabiles: diasHabiles(hace5Dias, hoy),
    diasLimite: 10,
    radicadoVigia: null,
    cotizacion: '$850.000',
    fotos: ['foto_rayon_1.jpg', 'foto_rayon_2.jpg'],
    videos: [],
    soportes: ['remesa_VIG-2100765.pdf', 'inventario_VIG-2100765.pdf', 'cotizacion_colision.pdf'],
    historial: [
      { fecha: hace5Dias.toISOString().split('T')[0], accion: 'Reclamación creada', usuario: 'Pilar Piedrahita', detalle: 'Se reporta rayón en puerta delantera derecha' },
      { fecha: new Date(hace5Dias.getTime() + 86400000).toISOString().split('T')[0], accion: 'Enviada a Colisión', usuario: 'Carolina Aricapa', detalle: 'Se solicita evaluación y cotización' },
      { fecha: new Date(hace5Dias.getTime() + 86400000 * 3).toISOString().split('T')[0], accion: 'Cotización recibida', usuario: 'Miguel Colisión', detalle: 'Cotización: $850.000 - Reparación pintura puerta' },
    ],
  },
  {
    id: 'REC-2026-003',
    vin: '3MDDJ2SAAVM461905',
    vehiculo: 'Mazda CX-30 2026 - Rojo Cristal',
    fechaReporte: hace10Dias.toISOString().split('T')[0],
    fechaRadicacion: new Date(hace10Dias.getTime() + 86400000 * 5).toISOString().split('T')[0],
    tipoNovedad: 'Abolladura',
    descripcion: 'Abolladura en capó. Se identificó al realizar el inventario de llegada.',
    estado: 'radicada_vigia',
    reportadoPor: 'Lorena Gómez',
    responsableActual: 'Carolina Aricapa',
    transportadora: 'BERGE Vigía',
    remesaNo: 'VIG-2100764',
    manifiestoNo: '410900097167',
    diasHabiles: diasHabiles(hace10Dias, hoy),
    diasLimite: 10,
    radicadoVigia: 'RAD-VIG-2026-4521',
    cotizacion: '$1.200.000',
    fotos: ['foto_abolladura_1.jpg', 'foto_abolladura_2.jpg'],
    videos: ['video_abolladura.mp4'],
    soportes: ['remesa_VIG-2100764.pdf', 'inventario_VIG-2100764.pdf', 'cotizacion_colision.pdf'],
    historial: [
      { fecha: hace10Dias.toISOString().split('T')[0], accion: 'Reclamación creada', usuario: 'Lorena Gómez', detalle: 'Se reporta abolladura en capó' },
      { fecha: new Date(hace10Dias.getTime() + 86400000).toISOString().split('T')[0], accion: 'Enviada a Colisión', usuario: 'Carolina Aricapa', detalle: 'Se solicita evaluación y cotización' },
      { fecha: new Date(hace10Dias.getTime() + 86400000 * 3).toISOString().split('T')[0], accion: 'Cotización recibida', usuario: 'Miguel Colisión', detalle: 'Cotización: $1.200.000 - Reparación capó completo' },
      { fecha: new Date(hace10Dias.getTime() + 86400000 * 5).toISOString().split('T')[0], accion: 'Radicada en Vigía', usuario: 'Carolina Aricapa', detalle: 'Radicado No. RAD-VIG-2026-4521' },
    ],
  },
  {
    id: 'REC-2026-004',
    vin: '3MVDM2W7AVL320112',
    vehiculo: 'Mazda CX-5 2026 - Gris Platino',
    fechaReporte: hace20Dias.toISOString().split('T')[0],
    fechaRadicacion: new Date(hace20Dias.getTime() + 86400000 * 4).toISOString().split('T')[0],
    tipoNovedad: 'Faltante de accesorios',
    descripcion: 'Faltante de kit de herramientas y gato. No venían en el vehículo al momento de la entrega.',
    estado: 'aprobada',
    reportadoPor: 'Kendry Iván',
    responsableActual: 'Carolina Aricapa',
    transportadora: 'BERGE Vigía',
    remesaNo: 'VIG-2100750',
    manifiestoNo: '410900097150',
    diasHabiles: diasHabiles(hace20Dias, hoy),
    diasLimite: 10,
    radicadoVigia: 'RAD-VIG-2026-4495',
    cotizacion: '$350.000',
    fotos: ['foto_faltante_1.jpg'],
    videos: [],
    soportes: ['remesa_VIG-2100750.pdf', 'inventario_VIG-2100750.pdf'],
    historial: [
      { fecha: hace20Dias.toISOString().split('T')[0], accion: 'Reclamación creada', usuario: 'Kendry Iván', detalle: 'Se reporta faltante de herramientas y gato' },
      { fecha: new Date(hace20Dias.getTime() + 86400000 * 2).toISOString().split('T')[0], accion: 'Enviada a Colisión', usuario: 'Carolina Aricapa', detalle: 'Se solicita evaluación' },
      { fecha: new Date(hace20Dias.getTime() + 86400000 * 3).toISOString().split('T')[0], accion: 'Cotización recibida', usuario: 'Miguel Colisión', detalle: 'Cotización: $350.000 - Kit herramientas + gato' },
      { fecha: new Date(hace20Dias.getTime() + 86400000 * 4).toISOString().split('T')[0], accion: 'Radicada en Vigía', usuario: 'Carolina Aricapa', detalle: 'Radicado No. RAD-VIG-2026-4495' },
      { fecha: new Date(hace20Dias.getTime() + 86400000 * 12).toISOString().split('T')[0], accion: 'Aprobada por Vigía', usuario: 'Sistema Vigía', detalle: 'Reclamación aprobada. Valor aprobado: $350.000' },
    ],
  },
  {
    id: 'REC-2026-005',
    vin: '3MDDJ2HAAVM462001',
    vehiculo: 'Mazda CX-30 2026 - Negro Jet',
    fechaReporte: hace30Dias.toISOString().split('T')[0],
    fechaRadicacion: new Date(hace30Dias.getTime() + 86400000 * 3).toISOString().split('T')[0],
    tipoNovedad: 'Daño en pintura',
    descripcion: 'Daño generalizado en pintura del techo. Aparentes marcas de granizo durante el transporte.',
    estado: 'cerrada',
    reportadoPor: 'Lorena Gómez',
    responsableActual: 'Carolina Aricapa',
    transportadora: 'BERGE Vigía',
    remesaNo: 'VIG-2100720',
    manifiestoNo: '410900097100',
    diasHabiles: diasHabiles(hace30Dias, hoy),
    diasLimite: 10,
    radicadoVigia: 'RAD-VIG-2026-4410',
    cotizacion: '$2.500.000',
    fotos: ['foto_granizo_1.jpg', 'foto_granizo_2.jpg', 'foto_granizo_3.jpg', 'foto_granizo_4.jpg'],
    videos: ['video_granizo.mp4'],
    soportes: ['remesa_VIG-2100720.pdf', 'inventario_VIG-2100720.pdf', 'factura_reparacion.pdf', 'certificado_novedad.pdf'],
    historial: [
      { fecha: hace30Dias.toISOString().split('T')[0], accion: 'Reclamación creada', usuario: 'Lorena Gómez', detalle: 'Se reporta daño por granizo en techo' },
      { fecha: new Date(hace30Dias.getTime() + 86400000).toISOString().split('T')[0], accion: 'Enviada a Colisión', usuario: 'Carolina Aricapa', detalle: 'Se solicita evaluación y cotización' },
      { fecha: new Date(hace30Dias.getTime() + 86400000 * 2).toISOString().split('T')[0], accion: 'Cotización recibida', usuario: 'Miguel Colisión', detalle: 'Cotización: $2.500.000 - Restauración completa techo' },
      { fecha: new Date(hace30Dias.getTime() + 86400000 * 3).toISOString().split('T')[0], accion: 'Radicada en Vigía', usuario: 'Carolina Aricapa', detalle: 'Radicado No. RAD-VIG-2026-4410' },
      { fecha: new Date(hace30Dias.getTime() + 86400000 * 15).toISOString().split('T')[0], accion: 'Aprobada por Vigía', usuario: 'Sistema Vigía', detalle: 'Reclamación aprobada. Valor aprobado: $2.500.000' },
      { fecha: new Date(hace30Dias.getTime() + 86400000 * 18).toISOString().split('T')[0], accion: 'Factura enviada', usuario: 'Carolina Aricapa', detalle: 'Orden de facturación enviada. Factura y certificado adjuntos' },
      { fecha: new Date(hace30Dias.getTime() + 86400000 * 22).toISOString().split('T')[0], accion: 'Reclamación cerrada', usuario: 'Carolina Aricapa', detalle: 'Proceso completado. Factura pagada y novedad certificada' },
    ],
  },
];

export const DOCUMENTOS = [
  {
    id: 'DOC-001',
    tipo: 'manifiesto',
    numero: '410900097167',
    fecha: '2026-03-14',
    transportadora: 'BERGE Vigía',
    origen: 'Carport-Yotoco',
    destino: 'Pereira - Av 30 de Agosto',
    vehiculos: ['3MDDJ2SAAVM461905', '3MVDM2W7AVL319047', '3MDDJ2HAAVM461828'],
    conductor: 'López Alzate Diego',
    placa: 'JOW572',
    archivo: 'manifiesto_410900097167.pdf',
    subidoPor: 'Carolina Aricapa',
    fechaCarga: '2026-03-14',
  },
  {
    id: 'DOC-002',
    tipo: 'remesa',
    numero: 'VIG-2100764',
    vin: '3MDDJ2SAAVM461905',
    fecha: '2026-03-14',
    vehiculo: 'Mazda CX-30 2026 - Rojo Cristal',
    manifiestoNo: '410900097167',
    peso: '1542 Kg',
    remitente: 'MAZDA DE COLOMBIA S.A.S',
    destinatario: 'COLOMBIANA DE AUTOS S.A. COLAUTOS S.A',
    archivo: 'remesa_VIG-2100764.pdf',
    subidoPor: 'Pilar Piedrahita',
    fechaCarga: '2026-03-14',
  },
  {
    id: 'DOC-003',
    tipo: 'remesa',
    numero: 'VIG-2100765',
    vin: '3MVDM2W7AVL319047',
    fecha: '2026-03-14',
    vehiculo: 'Mazda CX-5 2026 - Blanco Nieve Perlado',
    manifiestoNo: '410900097167',
    peso: '1931 Kg',
    remitente: 'MAZDA DE COLOMBIA S.A.S',
    destinatario: 'COLOMBIANA DE AUTOS S.A. COLAUTOS S.A',
    archivo: 'remesa_VIG-2100765.pdf',
    subidoPor: 'Pilar Piedrahita',
    fechaCarga: '2026-03-14',
  },
  {
    id: 'DOC-004',
    tipo: 'remesa',
    numero: 'VIG-2100766',
    vin: '3MDDJ2HAAVM461828',
    fecha: '2026-03-14',
    vehiculo: 'Mazda CX-30 2026 - Machine Gray',
    manifiestoNo: '410900097167',
    peso: '1522 Kg',
    remitente: 'MAZDA DE COLOMBIA S.A.S',
    destinatario: 'COLOMBIANA DE AUTOS S.A. COLAUTOS S.A',
    archivo: 'remesa_VIG-2100766.pdf',
    subidoPor: 'Lorena Gómez',
    fechaCarga: '2026-03-14',
  },
  {
    id: 'DOC-005',
    tipo: 'inventario',
    numero: 'INV-2026-001',
    vin: '3MDDJ2HAAVM461828',
    fecha: '2026-03-14',
    vehiculo: 'Mazda CX-30 2026 - Machine Gray',
    remesaNo: 'VIG-2100766',
    archivo: 'inventario_3MDDJ2HAAVM461828.pdf',
    subidoPor: 'Lorena Gómez',
    fechaCarga: '2026-03-14',
  },
  {
    id: 'DOC-006',
    tipo: 'inventario',
    numero: 'INV-2026-002',
    vin: '3MVDM2W7AVL319047',
    fecha: '2026-03-14',
    vehiculo: 'Mazda CX-5 2026 - Blanco Nieve Perlado',
    remesaNo: 'VIG-2100765',
    archivo: 'inventario_3MVDM2W7AVL319047.pdf',
    subidoPor: 'Pilar Piedrahita',
    fechaCarga: '2026-03-14',
  },
  {
    id: 'DOC-007',
    tipo: 'inventario_traslado',
    numero: 'TRS-2026-001',
    vin: '3MDDJ2HAAVM461828',
    fecha: '2026-03-16',
    vehiculo: 'Mazda CX-30 2026 - Machine Gray',
    origen: 'Pereira - Av 30 de Agosto',
    destino: 'Dosquebradas',
    archivo: 'traslado_3MDDJ2HAAVM461828.pdf',
    subidoPor: 'Carolina Aricapa',
    fechaCarga: '2026-03-16',
  },
];
