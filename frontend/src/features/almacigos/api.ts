import api from "../../api/axios";

import type {
  Almacigo,
  AlmacigoPayload,
  ConfiguracionAlmacigo,
} from "./types";


export async function getAlmacigos() {
  const response =
    await api.get<Almacigo[]>(
      "/almacigos/"
    );

  return response.data;
}


export async function createAlmacigo(
  data: AlmacigoPayload
) {
  const response =
    await api.post<Almacigo>(
      "/almacigos/",
      data
    );

  return response.data;
}


export async function updateAlmacigo(
  id: number,
  data: AlmacigoPayload
) {
  const response =
    await api.patch<Almacigo>(
      `/almacigos/${id}/`,
      data
    );

  return response.data;
}


export async function deleteAlmacigo(
  id: number
) {
  await api.delete(
    `/almacigos/${id}/`
  );
}


export async function getConfiguracionAlmacigoActual() {
  const response =
    await api.get<ConfiguracionAlmacigo>(
      "/almacigos/configuracion/actual/"
    );

  return response.data;
}


export async function updateConfiguracionAlmacigoActual(
  valor: number
) {
  const response =
    await api.patch<ConfiguracionAlmacigo>(
      "/almacigos/configuracion/actual/",
      {
        valor,
      }
    );

  return response.data;
}