const BASE_URL = import.meta.env.VITE_API_URL || 'https://logistica.colautos.co/api';

// ── Helper fetch ─────────────────────────────────────────────────────────────

async function request(path, options = {}) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 10000);
  try {
    const res = await fetch(`${BASE_URL}${path}`, {
      headers: { 'Content-Type': 'application/json', ...options.headers },
      signal: controller.signal,
      ...options,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: res.statusText }));
      throw new Error(err.detail || 'Error del servidor');
    }
    return res.json();
  } catch (e) {
    if (e.name === 'AbortError') throw new Error('El servidor no respondió. Verifica que el backend esté corriendo.');
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

// ── Mapeo API (snake_case) → Frontend (camelCase) ────────────────────────────

function mapReclamacion(r) {
  const fotos     = r.archivos?.filter(a => a.categoria === 'foto')        .map(a => ({ nombre: a.nombre_original, url: a.url, id: a.id })) ?? [];
  const videos    = r.archivos?.filter(a => a.categoria === 'video')       .map(a => ({ nombre: a.nombre_original, url: a.url, id: a.id })) ?? [];
  const soportes  = r.archivos?.filter(a => a.categoria === 'soporte')     .map(a => ({ nombre: a.nombre_original, url: a.url, id: a.id })) ?? [];
  const cotDocs   = r.archivos?.filter(a => a.categoria === 'cotizacion')  .map(a => ({ nombre: a.nombre_original, url: a.url, id: a.id })) ?? [];
  const facturas  = r.archivos?.filter(a => ['factura','certificado'].includes(a.categoria)).map(a => ({ nombre: a.nombre_original, url: a.url, id: a.id })) ?? [];

  return {
    id:                 r.id,
    vin:                r.vin,
    vehiculo:           r.vehiculo,
    tipoNovedad:        r.tipo_novedad,
    descripcion:        r.descripcion,
    transportadora:     r.transportadora,
    remesaNo:           r.no_remesa,
    manifiestoNo:       r.no_manifiesto,
    sede:               r.sede,
    estado:             r.estado,
    fechaReporte:       r.fecha_reporte,
    fechaRadicacion:    r.fecha_radicacion,
    radicadoVigia:      r.no_radicado_vigia,
    cotizacion:         r.cotizacion,
    reportadoPor:       r.reportado_por,
    responsableActual:  r.responsable_actual,
    diasLimite:         r.dias_limite,
    diasHabiles:        r.dias_habiles,
    fotos,
    videos,
    soportes,
    cotizacionDocs:     cotDocs,
    facturasDocs:       facturas,
    historial:          (r.historial ?? []).map(h => ({
      fecha:    h.fecha,
      accion:   h.accion,
      usuario:  h.usuario,
      detalle:  h.detalle,
    })),
  };
}

function mapDocumento(d) {
  return {
    id:             d.id,
    tipo:           d.tipo,
    numero:         d.numero,
    fecha:          d.fecha,
    vin:            d.vin,
    vehiculo:       d.vehiculo,
    manifiestoNo:   d.manifiesto_no,
    remesaNo:       d.remesa_no,
    archivo:        d.nombre_archivo,
    urlArchivo:     d.url_archivo,
    subidoPor:      d.subido_por,
    fechaCarga:     d.fecha_carga,
    transportadora: d.transportadora,
    origen:         d.origen,
    destino:        d.destino,
    conductor:      d.conductor,
    placa:          d.placa,
    vehiculos:      d.vehiculos,
    peso:           d.peso,
    remitente:      d.remitente,
    destinatario:   d.destinatario,
  };
}

// ── Auth ─────────────────────────────────────────────────────────────────────

export async function login(email, password) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  return { token: data.access_token, usuario: data.usuario };
}

// ── Reclamaciones ─────────────────────────────────────────────────────────────

export async function getReclamaciones(filtros = {}) {
  const params = new URLSearchParams();
  if (filtros.estado) params.set('estado', filtros.estado);
  if (filtros.vin)    params.set('vin', filtros.vin);
  const qs = params.toString();
  const data = await request(`/reclamaciones/${qs ? '?' + qs : ''}`);
  return data.map(mapReclamacion);
}

export async function getReclamacion(id) {
  const data = await request(`/reclamaciones/${id}`);
  return mapReclamacion(data);
}

export async function crearReclamacion(formData) {
  // formData ya es un FormData con fotos/videos/soportes
  const res = await fetch(`${BASE_URL}/reclamaciones/`, {
    method: 'POST',
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || 'Error al crear reclamación');
  }
  return mapReclamacion(await res.json());
}

export async function editarReclamacion(id, formData) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE_URL}/reclamaciones/${id}`, {
    method: 'PUT',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const mensajes = {
      404: 'Reclamación no encontrada.',
      401: 'No autorizado. Inicie sesión nuevamente.',
      403: 'No tiene permisos para realizar esta acción.',
      500: 'Error interno del servidor. Intente de nuevo.',
    };
    throw new Error(mensajes[res.status] || err.detail || `Error al guardar (código ${res.status})`);
  }
  return mapReclamacion(await res.json());
}

export async function cambiarEstado(recId, nuevoEstado, usuario, detalle = null) {
  return request(`/reclamaciones/${recId}/estado`, {
    method: 'PATCH',
    body: JSON.stringify({ nuevo_estado: nuevoEstado, usuario, detalle }),
  });
}

export async function registrarRadicado(recId, noRadicado, usuario) {
  const fd = new FormData();
  fd.append('no_radicado', noRadicado);
  fd.append('usuario', usuario);
  const res = await fetch(`${BASE_URL}/reclamaciones/${recId}/radicado-vigia`, {
    method: 'POST', body: fd,
  });
  if (!res.ok) throw new Error('Error al registrar radicado');
  return res.json();
}

export async function subirCotizacion(recId, valor, descripcion, archivo, usuario) {
  const fd = new FormData();
  fd.append('valor', valor);
  fd.append('descripcion', descripcion || '');
  fd.append('usuario', usuario);
  fd.append('archivo', archivo);
  const res = await fetch(`${BASE_URL}/reclamaciones/${recId}/cotizacion`, {
    method: 'POST', body: fd,
  });
  if (!res.ok) throw new Error('Error al subir cotización');
  return res.json();
}

export async function subirFactura(recId, factura, certificado, usuario, descripcion = '') {
  const fd = new FormData();
  fd.append('usuario', usuario);
  fd.append('descripcion', descripcion);
  fd.append('factura', factura);
  fd.append('certificado', certificado);
  const res = await fetch(`${BASE_URL}/reclamaciones/${recId}/factura`, {
    method: 'POST', body: fd,
  });
  if (!res.ok) throw new Error('Error al subir factura');
  return res.json();
}

export async function getDashboardStats() {
  return request('/reclamaciones/dashboard/stats');
}

// ── Documentos ────────────────────────────────────────────────────────────────

export async function getDocumentos(filtros = {}) {
  const params = new URLSearchParams();
  if (filtros.tipo)   params.set('tipo', filtros.tipo);
  if (filtros.vin)    params.set('vin', filtros.vin);
  if (filtros.numero) params.set('numero', filtros.numero);
  const qs = params.toString();
  const data = await request(`/documentos/${qs ? '?' + qs : ''}`);
  return data.map(mapDocumento);
}

export async function editarDocumento(id, formData) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE_URL}/documentos/${id}`, {
    method: 'PUT',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    const mensajes = {
      405: 'Operación no disponible aún en el servidor. Contacte a soporte técnico.',
      401: 'No autorizado. Inicie sesión nuevamente.',
      403: 'No tiene permisos para realizar esta acción.',
      404: 'Documento no encontrado.',
      500: 'Error interno del servidor. Intente de nuevo.',
    };
    // Los mensajes en español tienen prioridad sobre el detail en inglés del servidor
    throw new Error(mensajes[res.status] || err.detail || `Error al guardar (código ${res.status})`);
  }
  return mapDocumento(await res.json());
}

export async function eliminarDocumento(id) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE_URL}/documentos/${id}`, {
    method: 'DELETE',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Error al eliminar (código ${res.status})`);
  }
}

export async function crearDocumento(formData) {
  const token = localStorage.getItem('token');
  const res = await fetch(`${BASE_URL}/documentos/`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `Error ${res.status}`);
  }
  return mapDocumento(await res.json());
}

// ── Usuarios ──────────────────────────────────────────────────────────────────

export async function getUsuarios() {
  return request('/usuarios/');
}

export async function crearUsuario(payload) {
  return request('/usuarios/', { method: 'POST', body: JSON.stringify(payload) });
}

export async function editarUsuario(id, payload) {
  return request(`/usuarios/${id}`, { method: 'PUT', body: JSON.stringify(payload) });
}

export async function eliminarUsuario(id) {
  const res = await fetch(`${BASE_URL}/usuarios/${id}`, { method: 'DELETE' });
  if (!res.ok && res.status !== 204) throw new Error('No se pudo eliminar el usuario');
}
