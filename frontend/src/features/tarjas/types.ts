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


export interface Tarja {
  id: number;
  peon: number;
  peon_nombre: string;

  fecha: string;

  fraccion: FraccionTarja;
  fraccion_display: string;

  tarea: TareaTarja | "";
  tarea_display: string;

  observacion: string;
}


export interface TarjaLocal {
  fecha: string;

  fraccion:
    | FraccionTarja
    | null;

  tarea: TareaTarja | "";

  observacion: string;

  modified?: boolean;
}


export interface CargaMensualPayload {
  peon: number;

  registros: TarjaLocal[];
}