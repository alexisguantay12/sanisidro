export type TipoMovimiento =
  | "INGRESO"
  | "GASTO"
  | "TRANSFERENCIA";


export type TipoGrupo =
  | "INGRESO"
  | "EGRESO"
  | "MIXTO";


export type TipoCuenta =
  | "BANCO"
  | "BILLETERA"
  | "EFECTIVO"
  | "TARJETA"
  | "OTRO";


export interface GrupoFinanciero {
  id: number;
  nombre: string;
  tipo: TipoGrupo;
  tipo_display: string;
  descripcion: string;
  activo: boolean;
  cantidad_categorias: number;
}


export interface GrupoPayload {
  nombre: string;
  tipo: TipoGrupo;
  descripcion: string;
  activo: boolean;
}


export interface CategoriaFinanciera {
  id: number;

  grupo: number;
  grupo_nombre: string;
  grupo_tipo: TipoGrupo;
  grupo_tipo_display: string;

  nombre: string;
  descripcion: string;
  activo: boolean;

  cantidad_movimientos: number;
}


export interface CategoriaPayload {
  grupo: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
}


export interface CuentaFinanciera {
  id: number;
  nombre: string;
  tipo: TipoCuenta;
  tipo_display: string;

  saldo_inicial: string;
  saldo_actual: string;

  descripcion: string;
  activa: boolean;
}


export interface CuentaPayload {
  nombre: string;
  tipo: TipoCuenta;
  saldo_inicial: string | number;
  descripcion: string;
  activa: boolean;
}


export interface MovimientoFinanciero {
  id: number;

  fecha: string;
  descripcion: string;

  tipo: TipoMovimiento;
  tipo_display: string;

  monto: string;

  categoria: number | null;
  categoria_nombre: string | null;

  grupo_id: number | null;
  grupo_nombre: string | null;

  cuenta_origen: number | null;
  cuenta_origen_nombre: string | null;

  cuenta_destino: number | null;
  cuenta_destino_nombre: string | null;

  saldo_cuenta_origen: string | null;
  saldo_cuenta_destino: string | null;

  observacion: string;
}


export interface MovimientoPayload {
  fecha: string;
  descripcion: string;

  tipo: TipoMovimiento;

  monto: string | number;

  categoria: number | null;

  cuenta_origen: number | null;
  cuenta_destino: number | null;

  observacion: string;
}


export interface ResumenFinanciero {
  ingresos: string;
  gastos: string;
  resultado: string;
  transferencias: string;
}


export interface CuentaMovimientosResponse {
  cuenta: CuentaFinanciera;
  movimientos: MovimientoFinanciero[];
}



export interface CuentaSelector {
  id: number;
  nombre: string;
}


export interface CategoriaSelector {
  id: number;
  nombre: string;
  grupo_nombre: string | null;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}