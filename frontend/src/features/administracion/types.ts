// ============================================================
// GENERALES
// ============================================================

export interface PeonSimple {
  id: number;
  nombre: string;
}

export interface ProveedorSimple {
  id: number;
  nombre: string;
}

export type EstadoLiquidacion =
  | "ACTIVA"
  | "ANULADA";

export type TipoTractor =
  | "SERGIO"
  | "TERCERO";


// ============================================================
// PERSONAL - PENDIENTES
// ============================================================

export interface TarjaPendiente {
  id: number;

  fecha: string;

  fraccion: string;
  fraccion_display: string;

  tarea: string;
  tarea_display: string;

  destino: string;

  observacion: string;

  valor_jornal: string;
  importe: string;
}


export interface CuentaFinancieraSimple {
  id: number;
  nombre: string;
}



export interface HoraExtraPendiente {
  id: number;

  fecha: string;

  cantidad_horas: number;

  motivo: string;
  motivo_display: string;

  valor_jornal_aplicado: string;
  valor_hora: string;

  importe: string;
}


export interface PersonalPendienteResponse {
  peon: PeonSimple;

  fecha_desde: string;
  fecha_hasta: string;

  tarjas: TarjaPendiente[];
  administraciones: AdministracionPendiente[];
  horas_extra: HoraExtraPendiente[];
  tarjas_externas: TarjaExternaPendiente[];
  resumen: {
    cantidad_tarjas: number;
    cantidad_horas_extra: number;
    cantidad_tarjas_externas: number;
    total_descuentos: string;
    total_tarjas: string;
    total_horas_extra: string;
    cantidad_administraciones: number;
    total_administracion: string | number;

    total: string;
  };
}

export interface LiquidarPersonalPayload {
  peon: number;

  fecha_desde: string;

  fecha_hasta: string;

  fecha_pago: string;

  cuenta_financiera: number;

  tarjas: number[];

  horas_extra: number[];

  administraciones: AdministracionLiquidar[];

  observacion: string;
}


export interface DetalleLiquidacionAdministracion {
  id: number;

  valor_administrador: number;

  administrador_nombre: string;

  anio: number;

  mes: number;

  cantidad_jornales: string;

  valor_jornal_aplicado: string;

  importe: string;
}


// ============================================================
// PERSONAL - LIQUIDACIONES
// ============================================================


export interface AdministracionPendiente {
  valor_administrador: number;
  anio: number;
  mes: number;
  mes_nombre: string;
  descripcion: string;
  cantidad_jornales: string | number;
  valor_jornal: string | number;
  importe: string | number;
}

export interface AdministracionLiquidar {
  valor_administrador: number;
  anio: number;
  mes: number;
}



export interface DetalleLiquidacionTarjaExterna {
  id: number;

  tarja: number;

  peon_origen: number;
  peon_origen_nombre: string;

  fecha: string;

  fraccion: string;

  valor_jornal_aplicado: string;

  importe: string;
}



export interface DetalleTarjaLiquidada {
  id: number;

  tarja: number;

  fecha: string;

  fraccion: string;

  valor_jornal_aplicado: string;

  importe: string;

  tarea: string;
  tarea_display: string;

  observacion: string;
}


export interface DetalleHoraExtraLiquidada {
  id: number;

  hora_extra: number;

  fecha: string;

  cantidad_horas: number;

  motivo: string;
  motivo_display: string;

  valor_jornal_aplicado: string;

  valor_hora: string;

  importe: string;
}
export interface LiquidacionPersonal {
  id: number;

  peon: number;

  peon_nombre: string;

  fecha_desde: string;

  fecha_hasta: string;

  fecha_pago: string;

  cuenta_financiera: number | null;

  cuenta_financiera_nombre: string | null;

  total_tarjas: string;

  total_horas_extra: string;

  total_administracion: string;

  total_descuentos: string;

  total: string;

  observacion: string;

  estado: EstadoLiquidacion;

  fecha_anulacion: string | null;

  motivo_anulacion: string;

  detalles_tarjas:
    DetalleTarjaLiquidada[];

  detalles_horas_extra:
    DetalleHoraExtraLiquidada[];

  detalles_tarjas_externas:
    DetalleLiquidacionTarjaExterna[];

  detalles_administracion:
    DetalleLiquidacionAdministracion[];
}

// ============================================================
// TRACTOR - PENDIENTES
// ============================================================

export interface TrabajoTractorPendiente {
  id: number;

  fecha: string;

  cantidad_horas: string;

  valor_hora: string;

  importe: string;

  observacion: string;
}


export interface TractorPendienteResponse {
  tipo: TipoTractor;

  proveedor: ProveedorSimple | null;

  fecha_desde: string;
  fecha_hasta: string;

  trabajos: TrabajoTractorPendiente[];

  resumen: {
    cantidad_trabajos: number;

    total_horas: string;

    total: string;
  };
}


export interface LiquidarTractorPayload {
  tipo: TipoTractor;

  proveedor?: number;

  fecha_desde: string;
  fecha_hasta: string;

  fecha_pago: string;

  trabajos: number[];
  cuenta_financiera: number;
  observacion: string;
}


// ============================================================
// TRACTOR - LIQUIDACIONES
// ============================================================

export interface DetalleTractorLiquidado {
  id: number;

  tractor_sergio: number | null;
  tractor_tercero: number | null;

  fecha: string;

  cantidad_horas: string;

  valor_hora: string;

  importe: string;

  observacion: string;
}


export interface LiquidacionTractor {
  id: number;

  tipo: TipoTractor;
  tipo_display: string;

  proveedor: number | null;
  proveedor_nombre: string | null;

  fecha_desde: string;
  fecha_hasta: string;

  cuenta_financiera: number | null;
  cuenta_financiera_nombre: string | null;

  fecha_pago: string;

  total_horas: string;

  total: string;

  observacion: string;

  estado: EstadoLiquidacion;

  fecha_anulacion: string | null;

  motivo_anulacion: string;

  detalles:
    DetalleTractorLiquidado[];
}


// ============================================================
// ALMACIGOS - PENDIENTES
// ============================================================

export interface AlmacigoPendiente {
  id: number;

  fecha: string;

  cantidad: number;

  valor_unitario: string;

  importe: string;

  observacion: string;
}


export interface AlmacigosPendientesResponse {
  fecha_desde: string;
  fecha_hasta: string;

  almacigos: AlmacigoPendiente[];

  resumen: {
    cantidad_registros: number;

    cantidad_total: number;

    total: string;
  };
}


export interface LiquidarAlmacigosPayload {
  fecha_desde: string;
  fecha_hasta: string;

  fecha_pago: string;

  almacigos: number[];
  cuenta_financiera: number;
  observacion: string;
}


// ============================================================
// ALMACIGOS - LIQUIDACIONES
// ============================================================

export interface DetalleAlmacigoLiquidado {
  id: number;

  almacigo: number;

  fecha: string;

  cantidad: number;

  valor_unitario: string;

  importe: string;

  observacion: string;
}


export interface LiquidacionAlmacigo {
  id: number;

  fecha_desde: string;
  fecha_hasta: string;

  fecha_pago: string;

  cantidad_total: number;

  total: string;

  observacion: string;

  estado: EstadoLiquidacion;

  fecha_anulacion: string | null;
  cuenta_financiera: number | null;
  cuenta_financiera_nombre: string | null;

  motivo_anulacion: string;

  detalles:
    DetalleAlmacigoLiquidado[];
}


// ============================================================
// RENDICIONES - PENDIENTES
// ============================================================

export interface PagoVentaPendiente {
  id: number;

  fecha: string;

  venta: number;

  comprador: {
    id: number;
    nombre: string;
  };

  cantidad_bolsas: number;

  precio_unitario: string;

  importe: string;

  observacion: string | null;
}


export interface RendicionesPendientesResponse {
  fecha_desde: string | null;
  fecha_hasta: string | null;

  pagos: PagoVentaPendiente[];

  resumen: {
    cantidad_pagos: number;

    total_pendiente_rendir: string;
  };
}


export interface CrearRendicionPayload {
  fecha: string;

  cuenta_financiera: number;

  pagos: number[];

  observacion: string;
}


// ============================================================
// RENDICIONES - HISTORIAL
// ============================================================

export interface DetalleRendicion {
  id: number;

  pago_venta: number;

  venta: number;

  comprador: number;
  comprador_nombre: string;

  fecha_pago: string;

  cantidad_bolsas: number;

  importe: string;
}

export interface RendicionVenta {
  id: number;

  fecha: string;

  cuenta_financiera: number | null;
  cuenta_financiera_nombre: string | null;

  total: string;

  observacion: string;

  estado: EstadoLiquidacion;

  fecha_anulacion: string | null;

  motivo_anulacion: string;

  detalles:
    DetalleRendicion[];
}

export interface TarjaExternaPendiente {
  id: number;

  fecha: string;

  peon: number;
  peon_nombre: string;

  fraccion: string;
  fraccion_display: string;

  valor_jornal: string;

  importe: string;

  observacion: string;
}
// ============================================================
// ANULACIONES
// ============================================================

export interface AnularPayload {
  motivo: string;
}



// ============================================================
// CARPIDAS
// ============================================================

export interface CarpidaPendiente {
  id: number;
  fecha: string;
  tipo_jornada: string;
  tipo_jornada_display: string;
  valor_jornal: string;
  importe: string;
  observacion: string;
  liquidada: boolean;
}

export interface CarpidasPendientesResumen {
  cantidad_registros: number;
  total: string;
}

export interface CarpidasPendientesResponse {
  fecha_desde: string;
  fecha_hasta: string;

  carpidas: CarpidaPendiente[];

  resumen: CarpidasPendientesResumen;
}


// ============================================================
// DETALLE LIQUIDACION CARPIDA
// ============================================================

export interface DetalleLiquidacionCarpida {
  id: number;

  jornal_carpida: number;

  fecha: string;

  tipo_jornada: string;

  tipo_jornada_display: string;

  valor_jornal_aplicado: string;

  importe: string;

  observacion: string;
}


// ============================================================
// LIQUIDACION CARPIDA
// ============================================================

export type EstadoLiquidacionCarpida =
  | "ACTIVA"
  | "ANULADA";

export interface LiquidacionCarpida {
  id: number;

  fecha_desde: string;

  fecha_hasta: string;

  fecha_pago: string;

  cuenta_financiera: number;

  cuenta_financiera_nombre: string;

  cantidad_carpidas: number;

  total: string;

  observacion: string;

  estado: EstadoLiquidacionCarpida;

  fecha_anulacion: string | null;

  motivo_anulacion: string;

  detalles: DetalleLiquidacionCarpida[];
}


// ============================================================
// PAYLOAD LIQUIDAR CARPIDAS
// ============================================================

export interface LiquidarCarpidasPayload {
  fecha_desde: string;

  fecha_hasta: string;

  fecha_pago: string;

  cuenta_financiera: number;

  carpidas: number[];

  observacion?: string;
}