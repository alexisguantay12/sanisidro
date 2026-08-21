export interface Insumo {
  id: number;
  nombre: string;
  tipo: string;
  tipo_display: string;
  observacion: string;
}

export type UnidadInsumo =
  | "l"
  | "g"
  | "kg"
  | "ml"
  | "unidad";

export interface ConsumoInsumo {
  id: number;

  fecha_aplicacion: string;

  insumo: number;
  insumo_nombre: string;
  insumo_tipo: string;
  insumo_tipo_display: string;

  cantidad: number;

  unidad: UnidadInsumo;
  unidad_display: string;

  observacion: string;
}

export interface ConsumoInsumoPayload {
  fecha_aplicacion: string;
  insumo: number;
  cantidad: number;
  unidad: UnidadInsumo;
  observacion: string;
}