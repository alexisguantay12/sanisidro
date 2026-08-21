import api from "../../api/axios";

import type {
  CargaMensualPayload,
  Tarja,
} from "./types";


export async function getTarjasMes(
  peonId: number,
  year: number,
  month: number
): Promise<Tarja[]> {

  const response = await api.get<Tarja[]>(
    "tarjas/",
    {
      params: {
        peon: peonId,
        year,
        month,
      },
    }
  );

  return response.data;
}


export async function saveTarjasMes(
  data: CargaMensualPayload
) {
  const response = await api.post(
    "tarjas/carga-mensual/",
    data
  );

  return response.data;
}