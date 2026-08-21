export interface TractorSergio {
  id: number;
  fecha: string;
  cantidad_horas: string;
  valor_hora: string;
  importe: string;
  observacion: string;
  estado: "pendiente" | "pagada";
  estado_display: string;
  puede_editar: boolean;
  puede_eliminar: boolean;
}


export interface TractorTercero {
  id: number;
  fecha: string;

  proveedor: number;
  proveedor_nombre: string;

  cantidad_horas: string;
  precio_hora: string;
  importe: string;

  observacion: string;

  estado: "pendiente" | "pagada";
  estado_display: string;

  puede_editar: boolean;
  puede_eliminar: boolean;
}


export interface Proveedor {
  id: number;
  nombre: string;
  observacion: string;
  activo: boolean;
}


export interface ConfiguracionTractor {
  id: number;
  valor_hora_sergio: string;
}


export interface TractorResumen {
  cantidad_pendientes: number;
  horas_pendientes: string;
  importe_pendiente: string;
}


export interface CreateTractorSergio {
  fecha: string;
  cantidad_horas: number;
  observacion: string;
}


export interface UpdateTractorSergio {
  cantidad_horas: number;
  observacion: string;
}


export interface CreateTractorTercero {
  fecha: string;
  proveedor: number;
  cantidad_horas: number;
  precio_hora: number;
  observacion: string;
}


export interface UpdateTractorTercero {
  proveedor: number;
  cantidad_horas: number;
  precio_hora: number;
  observacion: string;
}