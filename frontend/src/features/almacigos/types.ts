export type EstadoAlmacigo =
  | "PENDIENTE"
  | "PAGADA";


export interface Almacigo {
  id: number;

  fecha: string;

  cantidad: number;

  observacion: string;

  valor_unitario: string;

  importe: string;

  estado: EstadoAlmacigo;

  estado_display: string;
}


export interface AlmacigoPayload {
  fecha: string;

  cantidad: number;

  observacion: string;
}


export interface ConfiguracionAlmacigo {
  id: number;

  valor: string;
}