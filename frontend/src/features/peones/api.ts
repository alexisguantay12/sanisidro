import api from "../../api/axios";

import type {
  Peon,
  PeonPayload,
} from "./types";

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export async function getPeones(): Promise<Peon[]> {
  const response = await api.get<
    Peon[] | PaginatedResponse<Peon>
  >("peones/");

  if (Array.isArray(response.data)) {
    return response.data;
  }

  return response.data.results ?? [];
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