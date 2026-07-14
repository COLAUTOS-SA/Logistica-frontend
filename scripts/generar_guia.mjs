import {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  HeadingLevel, AlignmentType, WidthType, BorderStyle, ShadingType,
  VerticalAlign, Header, Footer
} from 'docx';
import { writeFileSync } from 'fs';

const COLAUTOS_BLUE = '1D4ED8';
const DARK = '0F172A';
const GRAY = '475569';
const LIGHT_GRAY = 'F1F5F9';
const GREEN = '166534';
const GREEN_BG = 'DCFCE7';
const RED = '991B1B';
const RED_BG = 'FEE2E2';
const YELLOW_BG = 'FEF3C7';
const YELLOW = '92400E';
const BLUE_BG = 'DBEAFE';
const PURPLE = '7E22CE';
const PURPLE_BG = 'F3E8FF';

const heading1 = (text) => new Paragraph({
  text,
  heading: HeadingLevel.HEADING_1,
  spacing: { before: 400, after: 150 },
  run: { color: DARK, bold: true },
});

const heading2 = (text) => new Paragraph({
  children: [new TextRun({ text, bold: true, size: 26, color: DARK })],
  spacing: { before: 320, after: 120 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' } },
});

const heading3 = (text) => new Paragraph({
  children: [new TextRun({ text, bold: true, size: 22, color: COLAUTOS_BLUE })],
  spacing: { before: 240, after: 100 },
});

const body = (text) => new Paragraph({
  children: [new TextRun({ text, size: 20, color: GRAY })],
  spacing: { before: 60, after: 60 },
});

const bold = (text) => new TextRun({ text, bold: true, size: 20, color: DARK });
const normal = (text) => new TextRun({ text, size: 20, color: GRAY });

const bullet = (text) => new Paragraph({
  children: [new TextRun({ text, size: 20, color: GRAY })],
  bullet: { level: 0 },
  spacing: { before: 40, after: 40 },
});

const alertBox = (emoji, text, color, bgColor) => new Paragraph({
  children: [
    new TextRun({ text: `${emoji}  `, size: 20 }),
    new TextRun({ text, size: 20, color }),
  ],
  spacing: { before: 120, after: 120 },
  indent: { left: 360 },
  shading: { type: ShadingType.CLEAR, fill: bgColor },
  border: {
    left: { style: BorderStyle.THICK, size: 16, color },
  },
});

const estadoBadge = (emoji, text) => new Paragraph({
  children: [new TextRun({ text: `  ${emoji}  Estado resultante: ${text}  `, bold: true, size: 20, color: DARK })],
  shading: { type: ShadingType.CLEAR, fill: LIGHT_GRAY },
  spacing: { before: 100, after: 100 },
  indent: { left: 200 },
});

const spacer = () => new Paragraph({ text: '', spacing: { before: 80, after: 80 } });

const makeCell = (text, { bold: isBold = false, bg = 'FFFFFF', color = DARK, width = 33 } = {}) =>
  new TableCell({
    children: [new Paragraph({
      children: [new TextRun({ text, bold: isBold, size: 18, color })],
    })],
    shading: { type: ShadingType.CLEAR, fill: bg },
    width: { size: width, type: WidthType.PERCENTAGE },
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 80, bottom: 80, left: 120, right: 120 },
  });

const makeHeaderRow = (cells) => new TableRow({
  children: cells.map(c => makeCell(c, { bold: true, bg: 'E2E8F0', color: '334155' })),
  tableHeader: true,
});

const makeRow = (cells, options = []) => new TableRow({
  children: cells.map((c, i) => makeCell(c, options[i] || {})),
});

const divider = () => new Paragraph({
  border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' } },
  spacing: { before: 200, after: 200 },
  text: '',
});

// ─────────────────────────────────────────────────────────────
const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: 'Calibri', size: 20, color: GRAY },
        paragraph: { spacing: { line: 276 } },
      },
    },
  },
  sections: [{
    properties: {},
    headers: {
      default: new Header({
        children: [new Paragraph({
          children: [
            new TextRun({ text: 'COLAUTOS — Sistema de Gestión Logística', bold: true, size: 18, color: COLAUTOS_BLUE }),
            new TextRun({ text: '   |   Guía Completa de Uso', size: 18, color: GRAY }),
          ],
          alignment: AlignmentType.RIGHT,
          border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' } },
        })],
      }),
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          children: [
            new TextRun({ text: 'Confidencial — Uso interno COLAUTOS', size: 16, color: GRAY }),
          ],
          alignment: AlignmentType.CENTER,
          border: { top: { style: BorderStyle.SINGLE, size: 4, color: 'E2E8F0' } },
        })],
      }),
    },
    children: [

      // ── PORTADA ──
      spacer(), spacer(),
      new Paragraph({
        children: [new TextRun({ text: '🚗  COLAUTOS', bold: true, size: 52, color: COLAUTOS_BLUE })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 800, after: 200 },
      }),
      new Paragraph({
        children: [new TextRun({ text: 'Sistema de Gestión Logística', size: 36, color: DARK })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 160 },
      }),
      new Paragraph({
        children: [new TextRun({ text: 'Guía Completa de Uso, Flujos y Procesos', size: 26, color: GRAY })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 600 },
      }),
      new Paragraph({
        children: [new TextRun({ text: 'Versión: Prototipo 1.0  |  Área: Logística  |  Confidencial', size: 18, color: GRAY })],
        alignment: AlignmentType.CENTER,
        spacing: { before: 0, after: 800 },
      }),
      divider(),

      // ── SECCIÓN 1: QUÉ ES ──
      heading1('1. ¿Qué es el sistema y qué problema resuelve?'),
      new Paragraph({
        children: [bold('El problema actual: '), normal('Cuando Mazda envía vehículos nuevos a COLAUTOS, estos viajan en niñeras (camiones especializados) operadas por la transportadora BERGE Vigía. A veces los vehículos llegan con daños: rayones, abolladuras, desconches, faltantes, etc.')],
        spacing: { before: 80, after: 80 },
      }),
      new Paragraph({
        children: [bold('El punto crítico: '), normal('COLAUTOS tiene exactamente 10 días hábiles desde que detecta el daño para radicar la reclamación en la plataforma de Vigía. Si se pasa de ese plazo, pierde el derecho a reclamar y la empresa asume el costo.')],
        spacing: { before: 80, after: 80 },
      }),
      alertBox('⚠️', 'Antes de este sistema, todo se manejaba en Excel, carpetas sueltas y correos. Eso dificultaba la trazabilidad, el control del plazo y el acceso rápido a los soportes.', YELLOW, YELLOW_BG),
      spacer(),
      body('El sistema centraliza cuatro módulos en un solo lugar:'),
      bullet('📋 Reclamaciones — Seguimiento del ciclo completo desde el reporte hasta el cierre'),
      bullet('📄 Documentos — Almacenamiento digital de manifiestos, remesas e inventarios escaneados'),
      bullet('🔔 Alertas — Control visual del plazo de 10 días hábiles por reclamación'),
      bullet('👥 Usuarios — Gestión de accesos y permisos según el rol de cada persona'),

      divider(),

      // ── SECCIÓN 2: ROLES ──
      heading1('2. ¿Quién usa el sistema? — Los 3 roles'),
      body('Hay tres tipos de usuario. Cada uno tiene funciones específicas y ve exactamente lo que le corresponde.'),
      spacer(),

      heading3('👑 Administrador de Logística — Carolina Aricapa'),
      body('Es la dueña del proceso. Tiene acceso total al sistema, gestiona el flujo completo y es quien radica en Vigía.'),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          makeHeaderRow(['Puede hacer', 'Descripción']),
          makeRow(['✅ Ver todo el sistema', 'Dashboard, reclamaciones, documentos, usuarios'], [{ color: GREEN }, { color: GRAY }]),
          makeRow(['✅ Crear reclamaciones', 'Registrar nuevas novedades'], [{ color: GREEN }, { color: GRAY }]),
          makeRow(['✅ Cambiar estados', 'Mover una reclamación de un estado a otro'], [{ color: GREEN }, { color: GRAY }]),
          makeRow(['✅ Radicar en Vigía', 'Es el único que radica en la plataforma externa'], [{ color: GREEN }, { color: GRAY }]),
          makeRow(['✅ Exportar reportes', 'Descargar información del sistema'], [{ color: GREEN }, { color: GRAY }]),
          makeRow(['✅ Gestionar usuarios', 'Crear, editar y eliminar usuarios'], [{ color: GREEN }, { color: GRAY }]),
        ],
      }),
      spacer(),

      heading3('📋 Asistente Comercial — Lorena Gómez · Pilar Piedrahita · Kendry Iván'),
      body('Son quienes reciben los vehículos en bodega. Cuando detectan un daño, lo documentan y lo reportan en el sistema.'),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          makeHeaderRow(['Acción', '¿Puede?']),
          makeRow(['Crear reclamaciones (reportar novedades)', '✅ Sí — es su función principal'], [{}, { color: GREEN }]),
          makeRow(['Adjuntar fotos, videos y soportes', '✅ Sí'], [{}, { color: GREEN }]),
          makeRow(['Consultar estado de reclamaciones', '✅ Sí'], [{}, { color: GREEN }]),
          makeRow(['Cargar documentos escaneados', '✅ Sí'], [{}, { color: GREEN }]),
          makeRow(['Cambiar estados de reclamaciones', '❌ No'], [{}, { color: RED }]),
          makeRow(['Gestionar usuarios', '❌ No'], [{}, { color: RED }]),
          makeRow(['Exportar reportes', '❌ No'], [{}, { color: RED }]),
        ],
      }),
      spacer(),

      heading3('🔧 Área de Colisión — Miguel Colisión'),
      body('Es el técnico que evalúa el daño físico del vehículo y determina cuánto cuesta la reparación.'),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          makeHeaderRow(['Acción', '¿Puede?']),
          makeRow(['Ver reclamaciones asignadas', '✅ Sí'], [{}, { color: GREEN }]),
          makeRow(['Subir cotización del daño', '✅ Sí — es su función principal'], [{}, { color: GREEN }]),
          makeRow(['Subir factura de reparación', '✅ Sí (después de aprobación de Vigía)'], [{}, { color: GREEN }]),
          makeRow(['Crear reclamaciones', '❌ No'], [{}, { color: RED }]),
          makeRow(['Cambiar estados', '❌ No'], [{}, { color: RED }]),
          makeRow(['Cargar documentos escaneados', '❌ No'], [{}, { color: RED }]),
          makeRow(['Gestionar usuarios', '❌ No'], [{}, { color: RED }]),
        ],
      }),

      divider(),

      // ── SECCIÓN 3: FLUJO ──
      heading1('3. Flujo completo de una reclamación (7 pasos)'),
      new Paragraph({
        children: [normal('Ejemplo: Lorena recibe un camión y detecta un rayón en la puerta de un Mazda CX-5. Esto es lo que ocurre, paso a paso.')],
        spacing: { before: 80, after: 160 },
      }),

      // PASO 1
      heading2('Paso 1 — Detección y reporte de la novedad'),
      new Paragraph({ children: [new TextRun({ text: '  👤 Quién actúa: Asistente Comercial (Lorena)', bold: true, size: 20, color: GREEN })], shading: { type: ShadingType.CLEAR, fill: GREEN_BG }, spacing: { before: 80, after: 80 } }),
      body('Lorena entra al sistema y hace clic en "Nueva Reclamación". Llena el formulario:'),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          makeHeaderRow(['Campo', 'Ejemplo', '¿Obligatorio?']),
          makeRow(['VIN', '3MVDM2W7AVL319047', '✅ Sí'], [{}, {}, { color: GREEN }]),
          makeRow(['Vehículo', 'Mazda CX-5 2026', '✅ Sí'], [{}, {}, { color: GREEN }]),
          makeRow(['Tipo de novedad', 'Rayón', '✅ Sí'], [{}, {}, { color: GREEN }]),
          makeRow(['Transportadora', 'BERGE Vigía', '✅ Sí'], [{}, {}, { color: GREEN }]),
          makeRow(['No. Remesa', 'VIG-2100765', '✅ Sí'], [{}, {}, { color: GREEN }]),
          makeRow(['No. Manifiesto', '410900097167', 'Opcional'], [{}, {}, { color: GRAY }]),
          makeRow(['Descripción del daño', '"Rayón profundo en puerta delantera..."', '✅ Sí'], [{}, {}, { color: GREEN }]),
          makeRow(['Fotos del daño', 'foto_rayon_1.jpg, foto_rayon_2.jpg', '✅ OBLIGATORIO'], [{}, {}, { bold: true, color: RED }]),
          makeRow(['Videos', 'video_novedad.mp4', 'Opcional'], [{}, {}, { color: GRAY }]),
          makeRow(['Soportes', 'Remesa + inventario escaneados', '✅ OBLIGATORIO'], [{}, {}, { bold: true, color: RED }]),
        ],
      }),
      spacer(),
      alertBox('🚨', 'Sin fotos y sin soportes, el sistema NO permite enviar la reclamación. Esto garantiza que siempre haya evidencia desde el primer momento.', RED, RED_BG),
      estadoBadge('🔴', 'ABIERTA — El contador de 10 días hábiles empieza a correr.'),

      // PASO 2
      heading2('Paso 2 — Revisión y envío a Colisión'),
      new Paragraph({ children: [new TextRun({ text: '  👤 Quién actúa: Administrador de Logística (Carolina)', bold: true, size: 20, color: COLAUTOS_BLUE })], shading: { type: ShadingType.CLEAR, fill: BLUE_BG }, spacing: { before: 80, after: 80 } }),
      body('Carolina entra al sistema. En el Dashboard ve las reclamaciones abiertas y una alerta si alguna está próxima a vencer el plazo. Entra al detalle, revisa fotos y soportes, y hace clic en "Cambiar Estado" para enviarla a Colisión.'),
      estadoBadge('🟡', 'EN GESTIÓN'),

      // PASO 3
      heading2('Paso 3 — Evaluación del daño y cotización'),
      new Paragraph({ children: [new TextRun({ text: '  👤 Quién actúa: Área de Colisión (Miguel)', bold: true, size: 20, color: PURPLE })], shading: { type: ShadingType.CLEAR, fill: PURPLE_BG }, spacing: { before: 80, after: 80 } }),
      body('Miguel entra al sistema. En el detalle de la reclamación encuentra una sección exclusiva marcada en morado: "Subir Cotización (Área de Colisión)". Ingresa:'),
      bullet('Valor de la cotización — ej: $850.000'),
      bullet('Descripción del trabajo — ej: "Reparación pintura puerta delantera derecha"'),
      bullet('Archivo PDF de la cotización'),
      alertBox('ℹ️', 'Esta sección solo la ve Miguel (Colisión). Si Lorena o Carolina abren la misma reclamación, no ven el formulario de cotización.', COLAUTOS_BLUE, BLUE_BG),

      // PASO 4
      heading2('Paso 4 — Radicación en Vigía (paso crítico)'),
      new Paragraph({ children: [new TextRun({ text: '  👤 Quién actúa: Administrador de Logística (Carolina)', bold: true, size: 20, color: COLAUTOS_BLUE })], shading: { type: ShadingType.CLEAR, fill: BLUE_BG }, spacing: { before: 80, after: 80 } }),
      body('Con la cotización lista, Carolina va a la plataforma externa de Vigía y radica la reclamación. Vigía asigna un número de radicado (ej: RAD-VIG-2026-4521). Carolina regresa al sistema y registra ese número.'),
      alertBox('🚨', 'PLAZO CRÍTICO: Este paso debe completarse antes de los 10 días hábiles. Si se pasa, COLAUTOS pierde el derecho a reclamar. El sistema muestra alertas de color: Verde (1-5 días: OK) | Amarillo (6-8 días: Precaución) | Rojo (9-10 días: ¡URGENTE!)', RED, RED_BG),
      estadoBadge('🔵', 'RADICADA EN VIGÍA — El contador de días ya no se muestra.'),

      // PASO 5
      heading2('Paso 5 — Respuesta de Vigía'),
      new Paragraph({ children: [new TextRun({ text: '  👤 Quién actúa: Vigía (externo) → Carolina actualiza en el sistema', bold: true, size: 20, color: COLAUTOS_BLUE })], shading: { type: ShadingType.CLEAR, fill: BLUE_BG }, spacing: { before: 80, after: 80 } }),
      body('Vigía evalúa la reclamación radicada. Esto puede tardar días o semanas. Si aprueba, Carolina actualiza el estado en el sistema.'),
      estadoBadge('🟢', 'APROBADA'),

      // PASO 6
      heading2('Paso 6 — Reparación y carga de factura'),
      new Paragraph({ children: [new TextRun({ text: '  👤 Quién actúa: Colisión (Miguel) + Logística (Carolina)', bold: true, size: 20, color: PURPLE })], shading: { type: ShadingType.CLEAR, fill: PURPLE_BG }, spacing: { before: 80, after: 80 } }),
      body('Con la aprobación de Vigía, se procede a reparar el vehículo. La sección de Colisión ahora dice "Subir Factura". Miguel sube:'),
      bullet('Factura de reparación'),
      bullet('Certificado de novedad'),
      bullet('Evidencia de destrucción de partes (si aplica)'),
      estadoBadge('🟣', 'EN FACTURACIÓN'),

      // PASO 7
      heading2('Paso 7 — Cierre'),
      new Paragraph({ children: [new TextRun({ text: '  👤 Quién actúa: Administrador de Logística (Carolina)', bold: true, size: 20, color: COLAUTOS_BLUE })], shading: { type: ShadingType.CLEAR, fill: BLUE_BG }, spacing: { before: 80, after: 80 } }),
      body('Carolina envía la orden de facturación a Vigía. Cuando Vigía paga, cierra la reclamación. Todo el historial queda guardado: fechas, personas, valores y documentos.'),
      estadoBadge('⚫', 'CERRADA — Proceso completado.'),

      divider(),

      // ── SECCIÓN 4: DOCUMENTOS ──
      heading1('4. Los documentos del sistema'),
      body('Además de las reclamaciones, el sistema almacena digitalmente 4 tipos de documentos que normalmente son físicos (papel). Se escanean y se suben para tenerlos siempre disponibles.'),
      spacer(),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          makeHeaderRow(['Tipo de Documento', '¿Qué es?', 'Se busca por']),
          makeRow(['📄 Manifiesto de carga', 'Documento maestro del viaje. Lista todos los vehículos que transporta la niñera en ese despacho.', 'VIN del vehículo']),
          makeRow(['📦 Remesa', 'Documento individual por vehículo. Confirma el envío de Mazda a COLAUTOS. Contiene peso, remitente y destinatario.', 'No. Remesa (ej: VIG-2100766)']),
          makeRow(['📋 Inventario de llegada', 'Checklist que se hace al recibir el vehículo en bodega. Si hay daño, es la primera evidencia del proceso.', 'No. Remesa']),
          makeRow(['🔄 Inventario de traslado', 'Cuando un vehículo se mueve entre sedes (ej: Pereira → Dosquebradas), se hace un nuevo inventario.', 'VIN del vehículo']),
        ],
      }),
      spacer(),

      heading3('¿Por qué existe "Cargar Documentos" si ya se adjuntan archivos en una reclamación?'),
      body('Son propósitos distintos:'),
      bullet('Los adjuntos en una reclamación son evidencia puntual de un daño específico.'),
      bullet('La sección "Cargar Documentos" es el repositorio digital oficial: vehículos sin daño también tienen remesas e inventarios que deben guardarse.'),
      bullet('Un manifiesto cubre 10 vehículos a la vez — no puede adjuntarse a una sola reclamación.'),
      bullet('El correo original del área de logística pide estos 4 módulos como procesos independientes.'),

      heading3('¿Cómo se cargan los documentos? — 3 pasos'),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          makeHeaderRow(['Paso', 'Acción', 'Detalle']),
          makeRow(['1', 'Seleccionar tipo', 'Manifiesto, Remesa, Inventario o Traslado']),
          makeRow(['2', 'Ingresar identificador', 'VIN (Manifiesto/Traslado) o No. Remesa (Remesa/Inventario)']),
          makeRow(['3', 'Subir el archivo', 'PDF, JPG o PNG del documento escaneado']),
        ],
      }),

      divider(),

      // ── SECCIÓN 5: PANTALLAS ──
      heading1('5. Las pantallas del sistema'),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          makeHeaderRow(['Pantalla', 'Para qué sirve', '¿Quién la ve?']),
          makeRow(['🔐 Login', 'Selección de perfil para ingresar', 'Todos']),
          makeRow(['📊 Dashboard', 'Resumen: conteos, alertas de vencimiento, reclamaciones recientes', 'Todos']),
          makeRow(['⚠️ Lista de Reclamaciones', 'Tabla completa con filtros, búsqueda y contador de días hábiles', 'Todos']),
          makeRow(['📋 Detalle de Reclamación', 'Pipeline visual de estados, historial, fotos, soportes y sección de cotización', 'Todos (cotización solo Colisión)']),
          makeRow(['➕ Nueva Reclamación', 'Formulario para reportar novedad con validaciones obligatorias', 'Admin + Asistentes']),
          makeRow(['📁 Documentos', 'Catálogo de documentos escaneados con filtros y buscador', 'Todos']),
          makeRow(['⬆️ Cargar Documentos', 'Wizard de 3 pasos para subir un documento escaneado', 'Admin + Asistentes']),
          makeRow(['👥 Usuarios', 'Crear, editar y eliminar usuarios y asignar permisos', 'Solo Admin']),
        ],
      }),

      divider(),

      // ── SECCIÓN 6: REGLAS ──
      heading1('6. Reglas de negocio importantes'),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          makeHeaderRow(['Regla', 'Detalle']),
          makeRow(['⏱️ Plazo de 10 días hábiles', 'Desde que se detecta la novedad hasta radicar en Vigía. Si se pasa, COLAUTOS pierde el derecho a reclamar y asume el costo.']),
          makeRow(['📸 Fotos obligatorias', 'No se puede crear una reclamación sin adjuntar al menos una foto del daño.']),
          makeRow(['📄 Soportes obligatorios', 'Debe adjuntarse la remesa e inventario escaneados para poder enviar la reclamación.']),
          makeRow(['🔒 Permisos estrictos', 'Colisión no puede crear reclamaciones. Asistentes no pueden cambiar estados.']),
          makeRow(['🔢 VIN de 17 caracteres', 'El VIN identifica un vehículo de forma única en todo el mundo. Siempre tiene exactamente 17 caracteres alfanuméricos.']),
          makeRow(['📦 Formato de remesa', 'Las remesas de Vigía siempre tienen formato VIG-XXXXXXX (ej: VIG-2100766).']),
          makeRow(['📅 Días hábiles', 'El contador excluye sábados, domingos y festivos colombianos.']),
        ],
      }),

      divider(),

      // ── SECCIÓN 7: GLOSARIO ──
      heading1('7. Glosario de términos'),
      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [
          makeHeaderRow(['Término', 'Definición']),
          makeRow(['VIN', 'Vehicle Identification Number. Código único de 17 caracteres que identifica un vehículo en todo el mundo. Ej: 3MVDM2W7AVL319047']),
          makeRow(['Remesa', 'Documento de transporte individual por vehículo. Contiene remitente (Mazda), destinatario (COLAUTOS), peso y VIN.']),
          makeRow(['Manifiesto', 'Documento maestro del viaje del camión-niñera. Lista todos los vehículos que transporta en ese despacho.']),
          makeRow(['Niñera', 'Camión de varios pisos diseñado para transportar vehículos nuevos sin dañarlos.']),
          makeRow(['BERGE Vigía', 'Empresa transportadora contratada por Mazda de Colombia para entregar vehículos a los concesionarios.']),
          makeRow(['Radicar', 'Registrar oficialmente la reclamación en la plataforma web de Vigía. Es el paso formal que da inicio al cobro.']),
          makeRow(['Novedad', 'Cualquier daño o faltante detectado en un vehículo al recibirlo: rayón, desconche, abolladura, vidrio roto, faltante de accesorios.']),
          makeRow(['Cotización', 'Documento del área de Colisión que estima el costo de la reparación del daño.']),
          makeRow(['Inventario de llegada', 'Formulario que se diligencia al recibir cada vehículo. Se revisa pieza por pieza y se registra cualquier daño.']),
          makeRow(['Carport-Yotoco', 'Centro de distribución de Mazda de Colombia en el Valle del Cauca. Origen de los vehículos.']),
          makeRow(['Días hábiles', 'Conteo de días laborables (lunes a viernes, sin festivos). El plazo de 10 días es en días hábiles, no corridos.']),
        ],
      }),

      divider(),
      spacer(),

      // ── RESUMEN ──
      heading1('Resumen ejecutivo'),
      alertBox('📌', 'COLAUTOS recibe vehículos → Si llegan dañados → Asistente los documenta y reporta → Carolina gestiona y envía a Colisión → Miguel evalúa y cotiza → Carolina radica en Vigía (máx 10 días hábiles) → Vigía aprueba → Se repara y factura → Se cierra. Todo queda registrado con fotos, documentos, historial y trazabilidad completa.', COLAUTOS_BLUE, BLUE_BG),

      spacer(),
    ],
  }],
});

Packer.toBuffer(doc).then(buffer => {
  writeFileSync('./public/guia_sistema_colautos.docx', buffer);
  console.log('✅ Documento generado: public/guia_sistema_colautos.docx');
});
