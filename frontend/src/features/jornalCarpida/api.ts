import api from "../../api/axios";

import type {
  JornalCarpida,
  JornalCarpidaPayload,
} from "./types";


export async function getJornalesCarpida() {

  const response = await api.get<
    JornalCarpida[]
  >(
    "/jornales-carpida/"
  );

  return response.data;
}


export async function createJornalCarpida(
  data: JornalCarpidaPayload
) {

  const response = await api.post<
    JornalCarpida
  >(
    "/jornales-carpida/",
    data
  );

  return response.data;
}


export async function updateJornalCarpida(
  id: number,
  data: JornalCarpidaPayload
) {

  const response = await api.patch<
    JornalCarpida
  >(
    `/jornales-carpida/${id}/`,
    data
  );

  return response.data;
}


export async function deleteJornalCarpida(
  id: number
) {

  await api.delete(
    `/jornales-carpida/${id}/`
  );
}