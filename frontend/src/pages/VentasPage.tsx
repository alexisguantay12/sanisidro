import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Banknote,
  Eye,
  Pencil,
  Plus,
  Search,
  ShoppingBasket,
  Trash2,
} from "lucide-react";

 
 
import { deleteVenta,getVentas } from "../features/ventas/api";


import type {
  EstadoVenta,
  Venta,
} from "../features/ventas/types";

import VentaModal from "../features/ventas/VentaModal";

import PagoVentaModal from "../features/ventas/PagoVentaModal";

import VentaDetalleModal from "../features/ventas/VentaDetalleModal";

import ConfirmDeleteVentaModal from "../features/ventas/ConfirmDeleteVentaModal";

function formatCurrency(
  value:
    | string
    | number
) {
  return new Intl.NumberFormat(
    "es-AR",
    {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 2,
    }
  ).format(
    Number(value)
  );
}

function formatFecha(
  value: string
) {
  const [
    year,
    month,
    day,
  ] = value.split("-");

  return `${day}/${month}/${year}`;
}

function EstadoBadge({
  estado,
}: {
  estado: EstadoVenta;
}) {
  const estilos = {
    PENDIENTE:
      "bg-amber-50 text-amber-700 border-amber-100",

    PARCIAL:
      "bg-orange-50 text-orange-700 border-orange-100",

    PAGADA:
      "bg-emerald-50 text-emerald-700 border-emerald-100",
  };

  const labels = {
    PENDIENTE:
      "Pendiente",

    PARCIAL:
      "Parcial",

    PAGADA:
      "Pagada",
  };

  return (
    <span
      className={`
        inline-flex
        items-center
        rounded-full
        border
        px-2.5
        py-1
        text-xs
        font-semibold
        ${estilos[estado]}
      `}
    >
      {labels[estado]}
    </span>
  );
}

export default function VentasPage() {
  const [
    ventas,
    setVentas,
  ] = useState<Venta[]>([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    estado,
    setEstado,
  ] = useState<
    EstadoVenta | ""
  >("");

  const [
    modalOpen,
    setModalOpen,
  ] = useState(false);

  const [
    ventaEditando,
    setVentaEditando,
  ] = useState<Venta | null>(
    null
  );

  const [
    ventaPago,
    setVentaPago,
  ] = useState<Venta | null>(
    null
  );

  const [
    ventaDetalle,
    setVentaDetalle,
  ] = useState<Venta | null>(
    null
  );

  const [
    ventaEliminar,
    setVentaEliminar,
  ] = useState<Venta | null>(
    null
  );

  const [
    deleting,
    setDeleting,
  ] = useState(false);

  const cargarVentas =
    useCallback(
      async () => {
        try {
          setLoading(true);
          setError("");

          const data =
            await getVentas();

          setVentas(
            data
          );
        } catch (error) {
          console.error(
            "Error cargando ventas",
            error
          );

          setError(
            "No se pudieron cargar las ventas."
          );
        } finally {
          setLoading(false);
        }
      },
      []
    );

  useEffect(() => {
    cargarVentas();
  }, [
    cargarVentas,
  ]);

  const ventasFiltradas =
    useMemo(() => {
      const termino =
        search
          .trim()
          .toLowerCase();

      return ventas.filter(
        (venta) => {
          const coincideBusqueda =
            !termino ||
            venta.comprador_nombre
              .toLowerCase()
              .includes(
                termino
              );

          const coincideEstado =
            !estado ||
            venta.estado ===
              estado;

          return (
            coincideBusqueda &&
            coincideEstado
          );
        }
      );
    }, [
      ventas,
      search,
      estado,
    ]);

  function handleNueva() {
    setVentaEditando(
      null
    );

    setModalOpen(true);
  }

  function handleEditar(
    venta: Venta
  ) {
    setVentaEditando(
      venta
    );

    setModalOpen(true);
  }

  async function handleEliminar() {
    if (
      !ventaEliminar
    ) {
      return;
    }

    try {
      setDeleting(true);

      await deleteVenta(
        ventaEliminar.id
      );

      setVentaEliminar(
        null
      );

      await cargarVentas();
    } catch (error) {
      console.error(
        "Error eliminando venta",
        error
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="min-h-full bg-[#F6F8F6]">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 sm:py-7 lg:px-8">
        {/* HEADER */}
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#18392B] text-white shadow-[0_8px_22px_rgba(24,57,43,0.16)]">
              <ShoppingBasket
                size={20}
              />
            </div>

            <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-[#859089]">
              San Isidro
            </p>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-[#1B1E1C] sm:text-3xl">
              Ventas
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-6 text-[#78817B]">
              Administrá las
              ventas de cebolla,
              sus cobros y saldos
              pendientes.
            </p>
          </div>

          <button
            type="button"
            onClick={
              handleNueva
            }
            className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#18392B] px-5 text-sm font-semibold text-white shadow-[0_8px_24px_rgba(24,57,43,0.16)] transition hover:bg-[#204A38] sm:w-auto"
          >
            <Plus
              size={18}
            />

            Nueva venta
          </button>
        </div>

        {/* FILTROS */}
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-[#929B95]"
            />

            <input
              type="text"
              value={
                search
              }
              onChange={(
                e
              ) =>
                setSearch(
                  e.target
                    .value
                )
              }
              placeholder="Buscar comprador..."
              className="h-12 w-full rounded-xl border border-[#E1E6E2] bg-white pl-11 pr-4 text-sm outline-none transition focus:border-[#18392B] focus:ring-2 focus:ring-[#18392B]/10"
            />
          </div>

          <select
            value={
              estado
            }
            onChange={(
              e
            ) =>
              setEstado(
                e.target
                  .value as
                  | EstadoVenta
                  | ""
              )
            }
            className="h-12 rounded-xl border border-[#E1E6E2] bg-white px-4 text-sm outline-none focus:border-[#18392B] sm:w-48"
          >
            <option value="">
              Todos los
              estados
            </option>

            <option value="PENDIENTE">
              Pendiente
            </option>

            <option value="PARCIAL">
              Parcial
            </option>

            <option value="PAGADA">
              Pagada
            </option>
          </select>
        </div>

        {error && (
          <div className="mt-5 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-6 rounded-[24px] border border-[#E4E8E5] bg-white p-8 text-center">
            <p className="text-sm text-[#7B847E]">
              Cargando ventas...
            </p>
          </div>
        ) : ventasFiltradas.length ===
          0 ? (
          <div className="mt-6 rounded-[24px] border border-[#E4E8E5] bg-white px-5 py-12 text-center">
            <ShoppingBasket
              size={28}
              className="mx-auto text-[#18392B]"
            />

            <h2 className="mt-4 font-semibold text-[#242925]">
              No hay ventas
            </h2>

            <p className="mt-2 text-sm text-[#7B847E]">
              Registrá una nueva
              venta para comenzar.
            </p>
          </div>
        ) : (
          <>
            {/* MOBILE */}
            <div className="mt-6 space-y-3 lg:hidden">
              {ventasFiltradas.map(
                (venta) => (
                  <div
                    key={
                      venta.id
                    }
                    className="rounded-[22px] border border-[#E4E8E5] bg-white p-4 shadow-[0_6px_20px_rgba(27,30,28,0.035)]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-[#242925]">
                          {
                            venta.comprador_nombre
                          }
                        </p>

                        <p className="mt-1 text-xs text-[#7B847E]">
                          {formatFecha(
                            venta.fecha
                          )}
                        </p>
                      </div>

                      <EstadoBadge
                        estado={
                          venta.estado
                        }
                      />
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-[#7B847E]">
                          Bolsas
                        </p>

                        <p className="mt-1 text-sm font-semibold">
                          {
                            venta.cantidad_bolsas
                          }
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-[#7B847E]">
                          Total
                        </p>

                        <p className="mt-1 text-sm font-semibold">
                          {formatCurrency(
                            venta.total
                          )}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-[#7B847E]">
                          Pagadas
                        </p>

                        <p className="mt-1 text-sm font-semibold">
                          {
                            venta.cantidad_bolsas_pagadas
                          }
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-[#7B847E]">
                          Pendientes
                        </p>

                        <p className="mt-1 text-sm font-semibold">
                          {
                            venta.cantidad_bolsas_pendientes
                          }
                        </p>
                      </div>
                    </div>

                    {venta.estado !==
                      "PAGADA" && (
                      <button
                        type="button"
                        onClick={() =>
                          setVentaPago(
                            venta
                          )
                        }
                        className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#18392B] text-sm font-semibold text-white"
                      >
                        <Banknote
                          size={
                            17
                          }
                        />

                        Registrar
                        pago
                      </button>
                    )}

                    <div className="mt-3 flex gap-2 border-t border-[#EEF1EF] pt-3">
                      <button
                        type="button"
                        onClick={() =>
                          setVentaDetalle(
                            venta
                          )
                        }
                        className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-[#F2F5F3] text-sm font-semibold text-[#31503F]"
                      >
                        <Eye
                          size={
                            16
                          }
                        />

                        Detalle
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          handleEditar(
                            venta
                          )
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#F2F5F3] text-[#31503F]"
                      >
                        <Pencil
                          size={
                            16
                          }
                        />
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setVentaEliminar(
                            venta
                          )
                        }
                        className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600"
                      >
                        <Trash2
                          size={
                            16
                          }
                        />
                      </button>
                    </div>
                  </div>
                )
              )}
            </div>

            {/* DESKTOP */}
            <div className="mt-6 hidden overflow-hidden rounded-[24px] border border-[#E4E8E5] bg-white shadow-[0_8px_28px_rgba(27,30,28,0.04)] lg:block">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#EAEDEA] bg-[#FAFBFA]">
                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.1em] text-[#859089]">
                      Fecha
                    </th>

                    <th className="px-4 py-4 text-left text-xs font-semibold uppercase tracking-[0.1em] text-[#859089]">
                      Comprador
                    </th>

                    <th className="px-4 py-4 text-right text-xs font-semibold uppercase tracking-[0.1em] text-[#859089]">
                      Bolsas
                    </th>

                    <th className="px-4 py-4 text-right text-xs font-semibold uppercase tracking-[0.1em] text-[#859089]">
                      Total
                    </th>

                    <th className="px-4 py-4 text-right text-xs font-semibold uppercase tracking-[0.1em] text-[#859089]">
                      Pagadas
                    </th>

                    <th className="px-4 py-4 text-right text-xs font-semibold uppercase tracking-[0.1em] text-[#859089]">
                      Pendientes
                    </th>

                    <th className="px-4 py-4 text-center text-xs font-semibold uppercase tracking-[0.1em] text-[#859089]">
                      Estado
                    </th>

                    <th className="px-4 py-4 text-right text-xs font-semibold uppercase tracking-[0.1em] text-[#859089]">
                      Acciones
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {ventasFiltradas.map(
                    (
                      venta
                    ) => (
                      <tr
                        key={
                          venta.id
                        }
                        className="border-b border-[#EEF1EF] last:border-0 hover:bg-[#FAFBFA]"
                      >
                        <td className="px-4 py-4 text-sm text-[#59615C]">
                          {formatFecha(
                            venta.fecha
                          )}
                        </td>

                        <td className="px-4 py-4 text-sm font-semibold text-[#242925]">
                          {
                            venta.comprador_nombre
                          }
                        </td>

                        <td className="px-4 py-4 text-right text-sm">
                          {
                            venta.cantidad_bolsas
                          }
                        </td>

                        <td className="px-4 py-4 text-right text-sm font-semibold">
                          {formatCurrency(
                            venta.total
                          )}
                        </td>

                        <td className="px-4 py-4 text-right text-sm">
                          {
                            venta.cantidad_bolsas_pagadas
                          }
                        </td>

                        <td className="px-4 py-4 text-right text-sm">
                          {
                            venta.cantidad_bolsas_pendientes
                          }
                        </td>

                        <td className="px-4 py-4 text-center">
                          <EstadoBadge
                            estado={
                              venta.estado
                            }
                          />
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex justify-end gap-1">
                            {venta.estado !==
                              "PAGADA" && (
                              <button
                                type="button"
                                title="Registrar pago"
                                onClick={() =>
                                  setVentaPago(
                                    venta
                                  )
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-xl text-[#18392B] transition hover:bg-[#EEF3EF]"
                              >
                                <Banknote
                                  size={
                                    16
                                  }
                                />
                              </button>
                            )}

                            <button
                              type="button"
                              title="Detalle"
                              onClick={() =>
                                setVentaDetalle(
                                  venta
                                )
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-xl text-[#657069] hover:bg-[#EEF3EF]"
                            >
                              <Eye
                                size={
                                  16
                                }
                              />
                            </button>

                            <button
                              type="button"
                              title="Editar"
                              onClick={() =>
                                handleEditar(
                                  venta
                                )
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-xl text-[#657069] hover:bg-[#EEF3EF]"
                            >
                              <Pencil
                                size={
                                  16
                                }
                              />
                            </button>

                            <button
                              type="button"
                              title="Eliminar"
                              onClick={() =>
                                setVentaEliminar(
                                  venta
                                )
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-xl text-[#8A948E] hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2
                                size={
                                  16
                                }
                              />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}

        <VentaModal
          open={
            modalOpen
          }
          venta={
            ventaEditando
          }
          onClose={() => {
            setModalOpen(
              false
            );

            setVentaEditando(
              null
            );
          }}
          onSuccess={
            cargarVentas
          }
        />

        <PagoVentaModal
          open={
            ventaPago !==
            null
          }
          venta={
            ventaPago
          }
          onClose={() =>
            setVentaPago(
              null
            )
          }
          onSuccess={
            cargarVentas
          }
        />

        <VentaDetalleModal
          open={
            ventaDetalle !==
            null
          }
          venta={
            ventaDetalle
          }
          onClose={() =>
            setVentaDetalle(
              null
            )
          }
          onChanged={
            cargarVentas
          }
        />

        <ConfirmDeleteVentaModal
          open={
            ventaEliminar !==
            null
          }
          venta={
            ventaEliminar
          }
          loading={
            deleting
          }
          onCancel={() =>
            setVentaEliminar(
              null
            )
          }
          onConfirm={
            handleEliminar
          }
        />
      </div>
    </div>
  );
}