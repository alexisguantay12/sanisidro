import api from "../../api/axios";

import type {
  PagoVenta,
  PagoVentaPayload,
  Venta,
  VentaPayload,
  VentaUpdatePayload,
} from "./types";

interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export async function getVentas(): Promise<
  Venta[]
> {
  const response = await api.get<
    Venta[] | PaginatedResponse<Venta>
  >("ventas/");

  if (Array.isArray(response.data)) {
    return response.data;
  }

  return response.data.results ?? [];
}

export async function getVenta(
  id: number
): Promise<Venta> {
  const response = await api.get<Venta>(
    `ventas/${id}/`
  );

  return response.data;
}

export async function createVenta(
  data: VentaPayload
): Promise<Venta> {
  const response = await api.post<Venta>(
    "ventas/",
    data
  );

  return response.data;
}

export async function updateVenta(
  id: number,
  data: VentaUpdatePayload
): Promise<Venta> {
  const response = await api.patch<Venta>(
    `ventas/${id}/`,
    data
  );

  return response.data;
}

export async function deleteVenta(
  id: number
): Promise<void> {
  await api.delete(
    `ventas/${id}/`
  );
}

export async function getPagosVenta(
  ventaId: number
): Promise<PagoVenta[]> {
  const response = await api.get<PagoVenta[]>(
    `ventas/${ventaId}/pagos/`
  );

  return response.data;
}

export async function createPagoVenta(
  data: PagoVentaPayload
): Promise<PagoVenta> {
  const response =
    await api.post<PagoVenta>(
      "pagos-ventas/",
      data
    );

  return response.data;
}

export async function deletePagoVenta(
  id: number
): Promise<void> {
  await api.delete(
    `pagos-ventas/${id}/`
  );
}