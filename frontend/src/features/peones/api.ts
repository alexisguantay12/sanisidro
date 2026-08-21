import api from "../../api/axios";

import type {
  Peon,
  PeonPayload,
} from "./types";


export async function getPeones(): Promise<Peon[]> {
  const response = await api.get<Peon[]>("peones/");

  return response.data;
}


export async function createPeon(
  data: PeonPayload
): Promise<Peon> {
  const response = await api.post<Peon>(
    "peones/",
    data
  );

  return response.data;
}


export async function updatePeon(
  id: number,
  data: Partial<PeonPayload>
): Promise<Peon> {
  const response = await api.patch<Peon>(
    `peones/${id}/`,
    data
  );

  return response.data;
}


export async function deletePeon(
  id: number
): Promise<void> {
  await api.delete(`peones/${id}/`);
}