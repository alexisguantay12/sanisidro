import api from "../../api/axios";

import type {
  ConfiguracionTractor,
  Insumo,
  Proveedor,
  TipoInsumo,
  ValorJornal,
} from "./types";


// ============================================================
// PROVEEDORES
// ============================================================

export async function getProveedores() {
  const response =
    await api.get<Proveedor[]>(
      "/proveedores/"
    );

  return response.data;
}

export async function createProveedor(
  data: {
    nombre: string;
    observacion: string;
    activo: boolean;
  }
) {
  const response =
    await api.post<Proveedor>(
      "/proveedores/",
      data
    );

  return response.data;
}

export async function updateProveedor(
  id: number,
  data: {
    nombre: string;
    observacion: string;
    activo: boolean;
  }
) {
  const response =
    await api.patch<Proveedor>(
      `/proveedores/${id}/`,
      data
    );

  return response.data;
}

export async function deleteProveedor(
  id: number
) {
  await api.delete(
    `/proveedores/${id}/`
  );
}


// ============================================================
// INSUMOS
// ============================================================

export async function getInsumosConfiguracion() {
  const response =
    await api.get<Insumo[]>(
      "/insumos/"
    );

  return response.data;
}

export async function createInsumo(
  data: {
    nombre: string;
    tipo: TipoInsumo;
    observacion: string;
  }
) {
  const response =
    await api.post<Insumo>(
      "/insumos/",
      data
    );

  return response.data;
}

export async function updateInsumo(
  id: number,
  data: {
    nombre: string;
    tipo: TipoInsumo;
    observacion: string;
  }
) {
  const response =
    await api.patch<Insumo>(
      `/insumos/${id}/`,
      data
    );

  return response.data;
}

export async function deleteInsumo(
  id: number
) {
  await api.delete(
    `/insumos/${id}/`
  );
}


// ============================================================
// VALOR JORNAL
// ============================================================

export interface ValorJornalPayload {
  valor: number;

  vigente_desde: string;

  vigente_hasta:
    | string
    | null;
}


export async function getValoresJornal():
Promise<ValorJornal[]> {

  const response =
    await api.get<
      ValorJornal[]
    >(
      "valor-jornal/"
    );

  return response.data;
}


export async function getValorJornalActual():
Promise<ValorJornal> {

  const response =
    await api.get<
      ValorJornal
    >(
      "valor-jornal/actual/"
    );

  return response.data;
}


export async function createValorJornal(
  data: ValorJornalPayload
) {

  const response =
    await api.post<
      ValorJornal
    >(
      "valor-jornal/",
      data
    );

  return response.data;
}


export async function updateValorJornal(
  id: number,
  data: ValorJornalPayload
) {

  const response =
    await api.patch<
      ValorJornal
    >(
      `valor-jornal/${id}/`,
      data
    );

  return response.data;
}


// ============================================================
// TRACTOR SERGIO
// ============================================================

export async function getConfiguracionTractorActual() {
  const response =
    await api.get<ConfiguracionTractor>(
      "/tractor/configuracion/actual/"
    );

  return response.data;
}

export async function updateConfiguracionTractorActual(
  valor_hora_sergio: number
) {
  const response =
    await api.patch<ConfiguracionTractor>(
      "/tractor/configuracion/actual/",
      {
        valor_hora_sergio,
      }
    );

  return response.data;
}