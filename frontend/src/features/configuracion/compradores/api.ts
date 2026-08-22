import api from "../../../api/axios";

import type {
  Comprador,
  CompradorPayload,
} from "./types";

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export async function getCompradores(): Promise<
  Comprador[]
> {
  const response = await api.get<
    Comprador[] | PaginatedResponse<Comprador>
  >("compradores/");

  if (Array.isArray(response.data)) {
    return response.data;
  }

  return response.data.results ?? [];
}

export async function createComprador(
  data: CompradorPayload
): Promise<Comprador> {
  const response = await api.post<Comprador>(
    "compradores/",
    data
  );

  return response.data;
}

export async function updateComprador(
  id: number,
  data: Partial<CompradorPayload>
): Promise<Comprador> {
  const response = await api.patch<Comprador>(
    `compradores/${id}/`,
    data
  );

  return response.data;
}

export async function deleteComprador(
  id: number
): Promise<void> {
  await api.delete(
    `compradores/${id}/`
  );
}