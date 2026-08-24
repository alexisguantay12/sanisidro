export type TipoJornadaCarpida =
  | "DIA"
  | "MEDIO_DIA";


export interface JornalCarpida {

  id: number;

  fecha: string;

  tipo_jornada:
    TipoJornadaCarpida;

  tipo_jornada_display: string;

  observacion: string;

  valor_jornal: string;

  importe: string;

  liquidada: boolean;

  estado: string;
}


export interface JornalCarpidaPayload {

  fecha: string;

  tipo_jornada:
    TipoJornadaCarpida;

  observacion: string;
}