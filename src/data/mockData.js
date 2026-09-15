// ============================================================
// Constantes de configuración de la aplicación
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
  'Pereira',
  'Armenia',
  'Manizales',
];

export const TRANSPORTADORAS = [
  'BERGE Vigía',
  'Transportes Especiales',
  'Mobility',
];

export const ROLES = {
  admin:     { label: 'Administrador (Logística)', permisos: ['crear', 'editar', 'eliminar', 'consultar', 'exportar', 'gestionar_usuarios'] },
  asistente: { label: 'Asistente Comercial',       permisos: ['crear', 'consultar'] },
  colision:  { label: 'Área de Colisión',           permisos: ['consultar', 'subir_cotizacion'] },
};
