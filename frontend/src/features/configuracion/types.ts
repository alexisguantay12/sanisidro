export interface Proveedor {
  id: number;
  nombre: string;
  observacion: string;
  activo: boolean;
}

export type TipoInsumo =
  | "herbicida"
  | "plaguicida"
  | "fungicida"
  | "insecticida"
  | "fertilizante";

export interface Insumo {
  id: number;
  nombre: string;
  tipo: TipoInsumo;
  tipo_display: string;
  observacion: string;
}

export interface ValorJornal {
  id: number;
  valor: string;
  vigente_desde: string;
  activo: boolean;
}

export interface ConfiguracionTractor {
  id: number;
  valor_hora_sergio: string;
}