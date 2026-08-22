export type EstadoVenta =
  | "PENDIENTE"
  | "PARCIAL"
  | "PAGADA";

export interface PagoVenta {
  id: number;
  venta: number;
  fecha: string;
  cantidad_bolsas: number;
  importe: string;
  observacion: string | null;

  comprador_nombre?: string;
  precio_unitario?: string;
}

export interface Venta {
  id: number;

  fecha: string;

  comprador: number;
  comprador_nombre: string;

  cantidad_bolsas: number;

  precio_unitario: string;

  total: string;

  observacion: string | null;

  estado: EstadoVenta;

  cantidad_bolsas_pagadas: number;
  cantidad_bolsas_pendientes: number;

  total_pagado: string;
  saldo_pendiente: string;

  pagos: PagoVenta[];
}

export interface VentaPayload {
  fecha: string;

  comprador: number;

  cantidad_bolsas: number;

  precio_unitario: string;

  observacion?: string;

  pago_inicial?: boolean;

  cantidad_bolsas_pagadas_inicial?: number | null;
}

export interface VentaUpdatePayload {
  fecha?: string;

  comprador?: number;

  cantidad_bolsas?: number;

  precio_unitario?: string;

  observacion?: string;
}

export interface PagoVentaPayload {
  venta: number;

  fecha: string;

  cantidad_bolsas: number;

  observacion?: string;
}