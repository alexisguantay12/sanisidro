import api from "../../api/axios";

import type {
  ResumenOperativo,
} from "./types";

export interface ResumenOperativoParams {
  fecha_desde?: string;
  fecha_hasta?: string;
}

export async function getResumenOperativo(
  params?: ResumenOperativoParams
) {
  const response =
    await api.get<ResumenOperativo>(
      "/resumen/operativo/",
      {
        params,
      }
    );

  return response.data;
}