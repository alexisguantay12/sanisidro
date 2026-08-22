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

  vigente_hasta:
    | string
    | null;

  vigente_hasta_display:
    string;

  activo: boolean;

  es_actual: boolean;
}

export interface ConfiguracionTractor {
  id: number;
  valor_hora_sergio: string;
}