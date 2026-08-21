export type MotivoHoraExtra =
  | "riego"
  | "cosecha"
  | "fumigacion"
  | "otro";

export type EstadoHoraExtra =
  | "pendiente"
  | "liquidada";


export interface HoraExtra {
  id: number;

  peon: number;
  peon_nombre: string;

  fecha: string;

  cantidad_horas: number;

  motivo: MotivoHoraExtra;
  motivo_display: string;

  estado: EstadoHoraExtra;
  estado_display: string;

  valor_jornal_aplicado: string;
  valor_hora: string;
  total: string;
}


export interface HoraExtraCreate {
  peon: number;
  fecha: string;
  cantidad_horas: number;
  motivo: MotivoHoraExtra;
}