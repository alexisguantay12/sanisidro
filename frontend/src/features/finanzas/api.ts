import api from "../../api/axios";

import type {
  CategoriaFinanciera,
  CategoriaPayload,
  CuentaFinanciera,
  CuentaMovimientosResponse,
  CambioMonedaPayload,
  CuentaPayload,
  GrupoFinanciero,
  GrupoPayload,
  MovimientoFinanciero,
  MovimientoPayload,
  ResumenFinanciero,
  CategoriaSelector,
  CuentaSelector,
  PaginatedResponse,
} from "./types";


const BASE =
  "/finanzas";


/* =========================================================
   GRUPOS
   ========================================================= */

export async function getGrupos(
  params?: Record<
    string,
    unknown
  >
) {

  const response =
    await api.get<
      GrupoFinanciero[]
    >(
      `${BASE}/grupos/`,
      {
        params,
      }
    );

  return response.data;
}


export async function createGrupo(
  data: GrupoPayload
) {

  const response =
    await api.post<
      GrupoFinanciero
    >(
      `${BASE}/grupos/`,
      data
    );

  return response.data;
}


export async function updateGrupo(
  id: number,
  data: GrupoPayload
) {

  const response =
    await api.patch<
      GrupoFinanciero
    >(
      `${BASE}/grupos/${id}/`,
      data
    );

  return response.data;
}


export async function deleteGrupo(
  id: number
) {

  await api.delete(
    `${BASE}/grupos/${id}/`
  );
}


/* =========================================================
   CATEGORIAS
   ========================================================= */

export async function getCategorias(
  tipo?:
    | "INGRESO"
    | "GASTO",

  extraParams?: Record<
    string,
    unknown
  >
) {

  const response =
    await api.get<
      CategoriaFinanciera[]
    >(
      `${BASE}/categorias/`,
      {
        params: {
          ...extraParams,

          ...(tipo
            ? {
                tipo,
              }
            : {}),
        },
      }
    );

  return response.data;
}


export async function createCategoria(
  data: CategoriaPayload
) {

  const response =
    await api.post<
      CategoriaFinanciera
    >(
      `${BASE}/categorias/`,
      data
    );

  return response.data;
}


export async function updateCategoria(
  id: number,
  data: CategoriaPayload
) {

  const response =
    await api.patch<
      CategoriaFinanciera
    >(
      `${BASE}/categorias/${id}/`,
      data
    );

  return response.data;
}


export async function deleteCategoria(
  id: number
) {

  await api.delete(
    `${BASE}/categorias/${id}/`
  );
}


/* =========================================================
   SELECTORES
   ========================================================= */

export async function getCuentasSelector() {

  const response =
    await api.get<
      CuentaSelector[]
    >(
      `${BASE}/cuentas/selector/`
    );

  return response.data;
}


export async function getCategoriasSelector(
  tipo:
    | "INGRESO"
    | "GASTO"
) {

  const response =
    await api.get<
      CategoriaSelector[]
    >(
      `${BASE}/categorias/selector/`,
      {
        params: {
          tipo,
        },
      }
    );

  return response.data;
}


/* =========================================================
   CUENTAS
   ========================================================= */

export async function getCuentas(
  params?: Record<
    string,
    unknown
  >
) {

  const response =
    await api.get<
      CuentaFinanciera[]
    >(
      `${BASE}/cuentas/`,
      {
        params,
      }
    );

  return response.data;
}


export async function createCuenta(
  data: CuentaPayload
) {

  const response =
    await api.post<
      CuentaFinanciera
    >(
      `${BASE}/cuentas/`,
      data
    );

  return response.data;
}


export async function updateCuenta(
  id: number,
  data: CuentaPayload
) {

  const response =
    await api.patch<
      CuentaFinanciera
    >(
      `${BASE}/cuentas/${id}/`,
      data
    );

  return response.data;
}


export async function deleteCuenta(
  id: number
) {

  await api.delete(
    `${BASE}/cuentas/${id}/`
  );
}


export async function getCuentaMovimientos(
  id: number,
  page = 1
) {

  const response =
    await api.get<
      CuentaMovimientosResponse
    >(
      `${BASE}/cuentas/${id}/movimientos/`,
      {
        params: {
          page,
        },
      }
    );

  return response.data;
}


/* =========================================================
   MOVIMIENTOS
   ========================================================= */

export async function getMovimientos(
  params?: Record<
    string,
    string
    | number
    | undefined
  >
) {

  const response =
    await api.get<
      PaginatedResponse<
        MovimientoFinanciero
      >
    >(
      `${BASE}/movimientos/`,
      {
        params,
      }
    );

  return response.data;
}


export async function getResumenMovimientos(
  params?: Record<
    string,
    string
    | number
    | undefined
  >
) {

  const response =
    await api.get<
      ResumenFinanciero
    >(
      `${BASE}/movimientos/resumen/`,
      {
        params,
      }
    );

  return response.data;
}


export async function createMovimiento(
  data: MovimientoPayload
) {

  const response =
    await api.post<
      MovimientoFinanciero
    >(
      `${BASE}/movimientos/`,
      data
    );

  return response.data;
}


/* =========================================================
   CAMBIO DE MONEDA
   ========================================================= */

export async function createCambioMoneda(
  data: CambioMonedaPayload
) {

  const response =
    await api.post<
      MovimientoFinanciero
    >(
      `${BASE}/movimientos/cambio-moneda/`,
      data
    );

  return response.data;
}


export async function updateMovimiento(
  id: number,
  data: MovimientoPayload
) {

  const response =
    await api.patch<
      MovimientoFinanciero
    >(
      `${BASE}/movimientos/${id}/`,
      data
    );

  return response.data;
}


export async function deleteMovimiento(
  id: number
) {

  await api.delete(
    `${BASE}/movimientos/${id}/`
  );
}