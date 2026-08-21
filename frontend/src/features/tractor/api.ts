import api from "../../api/axios";

import type {
  ConfiguracionTractor,
  CreateTractorSergio,
  CreateTractorTercero,
  Proveedor,
  TractorResumen,
  TractorSergio,
  TractorTercero,
  UpdateTractorSergio,
  UpdateTractorTercero,
} from "./types";


function normalizeList<T>(
  data: T[] | { results: T[] }
): T[] {
  if (Array.isArray(data)) {
    return data;
  }

  return data.results ?? [];
}


// ============================================================
// SERGIO
// ============================================================


export async function getTractorSergio() {
  const response = await api.get<
    TractorSergio[] | {
      results: TractorSergio[];
    }
  >("/tractor/sergio/");

  return normalizeList(response.data);
}


export async function createTractorSergio(
  data: CreateTractorSergio
) {
  const response =
    await api.post<TractorSergio>(
      "/tractor/sergio/",
      data
    );

  return response.data;
}


export async function updateTractorSergio(
  id: number,
  data: UpdateTractorSergio
) {
  const response =
    await api.patch<TractorSergio>(
      `/tractor/sergio/${id}/`,
      data
    );

  return response.data;
}


export async function deleteTractorSergio(
  id: number
) {
  await api.delete(
    `/tractor/sergio/${id}/`
  );
}


export async function pagarTractorSergio(
  id: number
) {
  const response =
    await api.post<TractorSergio>(
      `/tractor/sergio/${id}/pagar/`
    );

  return response.data;
}


export async function getResumenSergio() {
  const response =
    await api.get<TractorResumen>(
      "/tractor/sergio/resumen/"
    );

  return response.data;
}


// ============================================================
// TERCEROS
// ============================================================


export async function getTractorTerceros() {
  const response = await api.get<
    TractorTercero[] | {
      results: TractorTercero[];
    }
  >("/tractor/terceros/");

  return normalizeList(response.data);
}


export async function createTractorTercero(
  data: CreateTractorTercero
) {
  const response =
    await api.post<TractorTercero>(
      "/tractor/terceros/",
      data
    );

  return response.data;
}


export async function updateTractorTercero(
  id: number,
  data: UpdateTractorTercero
) {
  const response =
    await api.patch<TractorTercero>(
      `/tractor/terceros/${id}/`,
      data
    );

  return response.data;
}


export async function deleteTractorTercero(
  id: number
) {
  await api.delete(
    `/tractor/terceros/${id}/`
  );
}


export async function pagarTractorTercero(
  id: number
) {
  const response =
    await api.post<TractorTercero>(
      `/tractor/terceros/${id}/pagar/`
    );

  return response.data;
}


export async function getResumenTerceros() {
  const response =
    await api.get<TractorResumen>(
      "/tractor/terceros/resumen/"
    );

  return response.data;
}


// ============================================================
// PROVEEDORES
// ============================================================


export async function getProveedores() {
  const response = await api.get<
    Proveedor[] | {
      results: Proveedor[];
    }
  >("/proveedores/");

  return normalizeList(response.data);
}


// ============================================================
// CONFIGURACION
// ============================================================


export async function getConfiguracionTractor() {
  const response = await api.get<
    ConfiguracionTractor[] | {
      results: ConfiguracionTractor[];
    }
  >("/tractor/configuracion/");

  const configuraciones =
    normalizeList(response.data);

  return configuraciones[0] ?? null;
}