export type TipoMovimiento =
  | "INGRESO"
  | "GASTO"
  | "TRANSFERENCIA"
  | "CAMBIO_MONEDA";


export type TipoGrupo =
  | "INGRESO"
  | "EGRESO"
  | "MIXTO";


export type OperacionCambioMoneda =
  | "COMPRAR_USD"
  | "COMPRAR_ARS";


export type TipoCuenta =
  | "BANCO"
  | "BILLETERA"
  | "EFECTIVO"
  | "TARJETA"
  | "OTRO";


export type MonedaCuenta =
  | "ARS"
  | "USD";


export interface CambioMonedaPayload {
  operacion: OperacionCambioMoneda;

  fecha: string;

  descripcion: string;

  monto: string;

  cotizacion: string;

  cuenta_origen: number;

  cuenta_destino: number;

  observacion?: string;
}


/* =========================================================
   GRUPOS
   ========================================================= */

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


/* =========================================================
   CATEGORIAS
   ========================================================= */

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


/* =========================================================
   CUENTAS
   ========================================================= */

export interface CuentaFinanciera {
  id: number;

  nombre: string;

  tipo: TipoCuenta;

  tipo_display: string;

  moneda: MonedaCuenta;

  moneda_display: string;

  saldo_inicial: string;

  saldo_actual: string;

  descripcion: string;

  activa: boolean;
}


export interface CuentaPayload {
  nombre: string;

  tipo: TipoCuenta;

  saldo_inicial:
    | string
    | number;

  descripcion: string;

  activa: boolean;

  moneda: MonedaCuenta;
}


/* =========================================================
   MOVIMIENTOS
   ========================================================= */

export interface MovimientoFinanciero {
  id: number;

  fecha: string;

  descripcion: string;

  tipo: TipoMovimiento;

  tipo_display: string;

  monto: string;

  monto_destino:
    | string
    | null;

  cotizacion:
    | string
    | null;

  categoria:
    | number
    | null;

  categoria_nombre:
    | string
    | null;

  grupo_id:
    | number
    | null;

  grupo_nombre:
    | string
    | null;

  cuenta_origen:
    | number
    | null;

  cuenta_origen_nombre:
    | string
    | null;

  cuenta_origen_moneda:
    | MonedaCuenta
    | null;

  cuenta_destino:
    | number
    | null;

  cuenta_destino_nombre:
    | string
    | null;

  cuenta_destino_moneda:
    | MonedaCuenta
    | null;

  saldo_cuenta_origen:
    | string
    | null;

  saldo_cuenta_destino:
    | string
    | null;

  observacion: string;
}


export interface MovimientoPayload {
  fecha: string;

  descripcion: string;

  tipo: TipoMovimiento;

  monto:
    | string
    | number;

  categoria:
    | number
    | null;

  cuenta_origen:
    | number
    | null;

  cuenta_destino:
    | number
    | null;

  observacion: string;
}


/* =========================================================
   RESUMEN
   ========================================================= */

export interface ResumenGrupo {
  nombre: string;

  total: string;
}


export interface ResumenFinanciero {
  ingresos: string;

  gastos: string;

  resultado: string;

  transferencias: string;

  ingresos_por_grupo:
    ResumenGrupo[];

  gastos_por_grupo:
    ResumenGrupo[];
}


/* =========================================================
   MOVIMIENTOS DE CUENTA
   ========================================================= */

export interface CuentaMovimientosData {
  cuenta: CuentaFinanciera;

  movimientos:
    MovimientoFinanciero[];
}


export interface CuentaMovimientosResponse {
  count: number;

  next:
    | string
    | null;

  previous:
    | string
    | null;

  results:
    CuentaMovimientosData;
}


/* =========================================================
   SELECTORES
   ========================================================= */

export interface CuentaSelector {
  id: number;

  nombre: string;

  moneda: MonedaCuenta;

  moneda_display: string;
}


export interface CategoriaSelector {
  id: number;

  nombre: string;

  grupo_nombre:
    | string
    | null;
}


/* =========================================================
   PAGINACION
   ========================================================= */

export interface PaginatedResponse<T> {
  count: number;

  next:
    | string
    | null;

  previous:
    | string
    | null;

  results: T[];
}