export interface ResumenPeriodo {
  fecha_desde: string;
  fecha_hasta: string;
  campania: string;
}

export interface ResumenGeneral {
  jornales_san_isidro: string;
  horas_extra: string;
  horas_tractor_sergio: string;
  horas_tractor_terceros: string;
  cantidad_almacigos: number;
  jornales_mula: string;
  registros_mula: number;
  paleadas: string;
}

export interface JornalPorMes {
  anio: number;
  mes: number;
  mes_nombre: string;
  jornales: string;
}

export interface ResumenPorTarea {
  tarea: string;
  nombre: string;
  jornales: string;
  registros: number;
}

export interface ResumenColaborador {
  peon: number;
  nombre: string;
  jornales_san_isidro: string;
  jornales_externos_realizados: string;
  jornales_a_compensar: string;
  horas_extra: string;
}

export interface ResumenOperativo {
  periodo: ResumenPeriodo;
  resumen: ResumenGeneral;
  jornales_por_mes: JornalPorMes[];
  por_tarea: ResumenPorTarea[];
  colaboradores: ResumenColaborador[];
}