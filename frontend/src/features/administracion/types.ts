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

  horas_extra: HoraExtraPendiente[];

  resumen: {
    cantidad_tarjas: number;
    cantidad_horas_extra: number;

    total_tarjas: string;
    total_horas_extra: string;

    total: string;
  };
}


export interface LiquidarPersonalPayload {
  peon: number;

  fecha_desde: string;
  fecha_hasta: string;

  fecha_pago: string;

  tarjas: number[];
  horas_extra: number[];

  observacion: string;
}


// ============================================================
// PERSONAL - LIQUIDACIONES
// ============================================================

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

  total_tarjas: string;
  total_horas_extra: string;

  total: string;

  observacion: string;

  estado: EstadoLiquidacion;

  fecha_anulacion: string | null;

  motivo_anulacion: string;

  detalles_tarjas:
    DetalleTarjaLiquidada[];

  detalles_horas_extra:
    DetalleHoraExtraLiquidada[];
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

  total: string;

  observacion: string;

  estado: EstadoLiquidacion;

  fecha_anulacion: string | null;

  motivo_anulacion: string;

  detalles:
    DetalleRendicion[];
}


// ============================================================
// ANULACIONES
// ============================================================

export interface AnularPayload {
  motivo: string;
}