import api from "../../api/axios";

import type {
  HoraExtra,
  HoraExtraCreate,
} from "./types";


export async function getHorasExtra(): Promise<HoraExtra[]> {
  const response = await api.get<HoraExtra[]>(
    "horas-extra/"
  );

  return response.data;
}


export async function createHoraExtra(
  data: HoraExtraCreate
): Promise<HoraExtra> {

  const response = await api.post<HoraExtra>(
    "horas-extra/",
    data
  );

  return response.data;
}


export async function updateHoraExtra(
  id: number,
  cantidadHoras: number
): Promise<HoraExtra> {

  const response = await api.patch<HoraExtra>(
    `horas-extra/${id}/`,
    {
      cantidad_horas: cantidadHoras,
    }
  );

  return response.data;
}


export async function deleteHoraExtra(
  id: number
): Promise<void> {

  await api.delete(
    `horas-extra/${id}/`
  );
}