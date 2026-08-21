export type FraccionTarja =
  | "1.0"
  | "0.5";


export type TareaTarja =
  | "plantacion"
  | "carpida"
  | "cultivada"
  | "riego"
  | "cosecha"
  | "embolsado"
  | "carga"
  | "paleada"
  | "otro";


export type DestinoTarja =
  | "san_isidro"
  | "externo";


export interface Tarja {
  id: number;

  peon: number;
  peon_nombre: string;

  fecha: string;

  fraccion: FraccionTarja;
  fraccion_display: string;

  tarea: TareaTarja | "";
  tarea_display: string;

  destino: DestinoTarja;
  destino_display: string;

  destinatario: number | null;
  destinatario_nombre: string | null;

  observacion: string;
}


export interface TarjaLocal {
  fecha: string;

  fraccion:
    | FraccionTarja
    | null;

  tarea:
    | TareaTarja
    | "";

  destino: DestinoTarja;

  destinatario:
    | number
    | null;

  destinatario_nombre?:
    | string
    | null;

  observacion: string;

  modified?: boolean;
}


export interface CargaMensualPayload {
  peon: number;

  registros: TarjaLocal[];
}