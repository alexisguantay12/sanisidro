import api from "../../api/axios";

import type {
  AlmacigosPendientesResponse,
  CrearRendicionPayload,
  LiquidacionAlmacigo,
  LiquidacionPersonal,
  LiquidacionTractor,
  LiquidarAlmacigosPayload,
  LiquidarPersonalPayload,
  LiquidarTractorPayload,
  PeonSimple,
  PersonalPendienteResponse,
  ProveedorSimple,
  RendicionVenta,
  RendicionesPendientesResponse,
  TipoTractor,
  TractorPendienteResponse,
} from "./types";


// ============================================================
// PEONES
// ============================================================

export async function getPeones() {
  const response =
    await api.get<PeonSimple[]>(
      "/peones/",
    );

  return response.data;
}


// ============================================================
// PROVEEDORES
// ============================================================

export async function getProveedores() {
  const response =
    await api.get<ProveedorSimple[]>(
      "/proveedores/",
    );

  return response.data;
}


// ============================================================
// PERSONAL - PENDIENTES
// ============================================================

export async function getPersonalPendiente(
  peon: number,
  fechaDesde: string,
  fechaHasta: string,
) {
  const response =
    await api.get<PersonalPendienteResponse>(
      "/administracion/personal/pendientes/",
      {
        params: {
          peon,
          fecha_desde:
            fechaDesde,
          fecha_hasta:
            fechaHasta,
        },
      },
    );

  return response.data;
}


// ============================================================
// PERSONAL - LIQUIDAR
// ============================================================

export async function liquidarPersonal(
  payload: LiquidarPersonalPayload,
) {
  const response =
    await api.post<LiquidacionPersonal>(
      "/administracion/personal/liquidar/",
      payload,
    );

  return response.data;
}


// ============================================================
// PERSONAL - HISTORIAL
// ============================================================

export async function getLiquidacionesPersonal() {
  const response =
    await api.get<LiquidacionPersonal[]>(
      "/administracion/personal/",
    );

  return response.data;
}


export async function getLiquidacionPersonal(
  id: number,
) {
  const response =
    await api.get<LiquidacionPersonal>(
      `/administracion/personal/${id}/`,
    );

  return response.data;
}


// ============================================================
// PERSONAL - ANULAR
// ============================================================

export async function anularLiquidacionPersonal(
  id: number,
  motivo: string,
) {
  const response =
    await api.post<LiquidacionPersonal>(
      `/administracion/personal/${id}/anular/`,
      {
        motivo,
      },
    );

  return response.data;
}


// ============================================================
// TRACTOR - PENDIENTES
// ============================================================

export async function getTractorPendiente(
  tipo: TipoTractor,
  fechaDesde: string,
  fechaHasta: string,
  proveedor?: number,
) {
  const response =
    await api.get<TractorPendienteResponse>(
      "/administracion/tractor/pendientes/",
      {
        params: {
          tipo,

          fecha_desde:
            fechaDesde,

          fecha_hasta:
            fechaHasta,

          ...(proveedor
            ? {
                proveedor,
              }
            : {}),
        },
      },
    );

  return response.data;
}


// ============================================================
// TRACTOR - LIQUIDAR
// ============================================================

export async function liquidarTractor(
  payload: LiquidarTractorPayload,
) {
  const response =
    await api.post<LiquidacionTractor>(
      "/administracion/tractor/liquidar/",
      payload,
    );

  return response.data;
}


// ============================================================
// TRACTOR - HISTORIAL
// ============================================================

export async function getLiquidacionesTractor() {
  const response =
    await api.get<LiquidacionTractor[]>(
      "/administracion/tractor/",
    );

  return response.data;
}


export async function getLiquidacionTractor(
  id: number,
) {
  const response =
    await api.get<LiquidacionTractor>(
      `/administracion/tractor/${id}/`,
    );

  return response.data;
}


// ============================================================
// TRACTOR - ANULAR
// ============================================================

export async function anularLiquidacionTractor(
  id: number,
  motivo: string,
) {
  const response =
    await api.post<LiquidacionTractor>(
      `/administracion/tractor/${id}/anular/`,
      {
        motivo,
      },
    );

  return response.data;
}


// ============================================================
// ALMACIGOS - PENDIENTES
// ============================================================

export async function getAlmacigosPendientes(
  fechaDesde: string,
  fechaHasta: string,
) {
  const response =
    await api.get<AlmacigosPendientesResponse>(
      "/administracion/almacigos/pendientes/",
      {
        params: {
          fecha_desde:
            fechaDesde,

          fecha_hasta:
            fechaHasta,
        },
      },
    );

  return response.data;
}


// ============================================================
// ALMACIGOS - LIQUIDAR
// ============================================================

export async function liquidarAlmacigos(
  payload: LiquidarAlmacigosPayload,
) {
  const response =
    await api.post<LiquidacionAlmacigo>(
      "/administracion/almacigos/liquidar/",
      payload,
    );

  return response.data;
}


// ============================================================
// ALMACIGOS - HISTORIAL
// ============================================================

export async function getLiquidacionesAlmacigos() {
  const response =
    await api.get<LiquidacionAlmacigo[]>(
      "/administracion/almacigos/",
    );

  return response.data;
}


export async function getLiquidacionAlmacigos(
  id: number,
) {
  const response =
    await api.get<LiquidacionAlmacigo>(
      `/administracion/almacigos/${id}/`,
    );

  return response.data;
}


// ============================================================
// ALMACIGOS - ANULAR
// ============================================================

export async function anularLiquidacionAlmacigos(
  id: number,
  motivo: string,
) {
  const response =
    await api.post<LiquidacionAlmacigo>(
      `/administracion/almacigos/${id}/anular/`,
      {
        motivo,
      },
    );

  return response.data;
}


// ============================================================
// RENDICIONES - PENDIENTES
// ============================================================

export async function getRendicionesPendientes(
  fechaDesde?: string,
  fechaHasta?: string,
) {
  const response =
    await api.get<RendicionesPendientesResponse>(
      "/administracion/rendiciones/pendientes/",
      {
        params: {
          ...(fechaDesde
            ? {
                fecha_desde:
                  fechaDesde,
              }
            : {}),

          ...(fechaHasta
            ? {
                fecha_hasta:
                  fechaHasta,
              }
            : {}),
        },
      },
    );

  return response.data;
}


// ============================================================
// RENDICIONES - CREAR
// ============================================================

export async function crearRendicion(
  payload: CrearRendicionPayload,
) {
  const response =
    await api.post<RendicionVenta>(
      "/administracion/rendiciones/rendir/",
      payload,
    );

  return response.data;
}


// ============================================================
// RENDICIONES - HISTORIAL
// ============================================================

export async function getRendiciones() {
  const response =
    await api.get<RendicionVenta[]>(
      "/administracion/rendiciones/",
    );

  return response.data;
}


export async function getRendicion(
  id: number,
) {
  const response =
    await api.get<RendicionVenta>(
      `/administracion/rendiciones/${id}/`,
    );

  return response.data;
}


// ============================================================
// RENDICIONES - ANULAR
// ============================================================

export async function anularRendicion(
  id: number,
  motivo: string,
) {
  const response =
    await api.post<RendicionVenta>(
      `/administracion/rendiciones/${id}/anular/`,
      {
        motivo,
      },
    );

  return response.data;
}