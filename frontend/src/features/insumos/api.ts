import api from "../../api/axios";

import type {
  ConsumoInsumo,
  ConsumoInsumoPayload,
  Insumo,
} from "./types";

export async function getInsumos() {
  const response =
    await api.get<Insumo[]>("/insumos/");

  return response.data;
}

export async function getConsumosInsumos() {
  const response =
    await api.get<ConsumoInsumo[]>(
      "/consumos-insumos/"
    );

  return response.data;
}

export async function createConsumoInsumo(
  data: ConsumoInsumoPayload
) {
  const response =
    await api.post<ConsumoInsumo>(
      "/consumos-insumos/",
      data
    );

  return response.data;
}

export async function updateConsumoInsumo(
  id: number,
  data: ConsumoInsumoPayload
) {
  const response =
    await api.patch<ConsumoInsumo>(
      `/consumos-insumos/${id}/`,
      data
    );

  return response.data;
}

export async function deleteConsumoInsumo(
  id: number
) {
  await api.delete(
    `/consumos-insumos/${id}/`
  );
}