import {
  useEffect,
  useState,
} from "react";

import {
  Banknote,
  CalendarDays,
  Package,
  Trash2,
  X,
} from "lucide-react";

import {
  deletePagoVenta,
  getVenta,
} from "./api";

import ConfirmDeletePagoModal from "./ConfirmDeletePagoModal";

import type {
  PagoVenta,
  Venta,
} from "./types";

interface Props {
  open: boolean;
  venta: Venta | null;

  onClose: () => void;
  onChanged: () => void;
}

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

export default function VentaDetalleModal({
  open,
  venta,
  onClose,
  onChanged,
}: Props) {
  const [
    detalle,
    setDetalle,
  ] = useState<Venta | null>(
    null
  );

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    pagoEliminar,
    setPagoEliminar,
  ] = useState<PagoVenta | null>(
    null
  );

  const [
    deleting,
    setDeleting,
  ] = useState(false);

  async function cargar() {
    if (!venta) {
      return;
    }

    try {
      setLoading(true);

      const data =
        await getVenta(
          venta.id
        );

      setDetalle(
        data
      );
    } catch (error) {
      console.error(
        "Error cargando venta",
        error
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (
      open &&
      venta
    ) {
      cargar();
    }
  }, [
    open,
    venta,
  ]);

  async function handleEliminarPago() {
    if (
      !pagoEliminar
    ) {
      return;
    }

    try {
      setDeleting(true);

      await deletePagoVenta(
        pagoEliminar.id
      );

      setPagoEliminar(
        null
      );

      await cargar();

      onChanged();
    } catch (error) {
      console.error(
        "Error eliminando pago",
        error
      );
    } finally {
      setDeleting(false);
    }
  }

  if (
    !open ||
    !venta
  ) {
    return null;
  }

  const data =
    detalle ?? venta;

  return (
    <>
      <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/40 backdrop-blur-[2px] sm:items-center sm:p-4">
        <div className="flex w-full flex-col max-h-[94dvh] rounded-t-[28px] bg-white shadow-2xl sm:max-w-2xl sm:rounded-[28px]">
          <div className="flex items-start justify-between border-b border-black/5 px-5 py-5">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7A837D]">
                Venta #
                {
                  data.id
                }
              </p>

              <h2 className="mt-1 text-xl font-semibold text-[#1B1E1C]">
                {
                  data.comprador_nombre
                }
              </h2>
            </div>

            <button
              type="button"
              onClick={
                onClose
              }
              className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
            >
              <X
                size={20}
              />
            </button>
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-5">
            {loading ? (
              <p className="py-10 text-center text-sm text-[#7A837D]">
                Cargando...
              </p>
            ) : (
              <>
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl bg-[#F6F8F6] p-4">
                    <CalendarDays
                      size={
                        18
                      }
                      className="text-[#18392B]"
                    />

                    <p className="mt-3 text-xs text-[#7A837D]">
                      Fecha
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[#242925]">
                      {formatFecha(
                        data.fecha
                      )}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#F6F8F6] p-4">
                    <Package
                      size={
                        18
                      }
                      className="text-[#18392B]"
                    />

                    <p className="mt-3 text-xs text-[#7A837D]">
                      Bolsas
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[#242925]">
                      {
                        data.cantidad_bolsas
                      }
                    </p>
                  </div>

                  <div className="rounded-2xl bg-[#F6F8F6] p-4">
                    <Banknote
                      size={
                        18
                      }
                      className="text-[#18392B]"
                    />

                    <p className="mt-3 text-xs text-[#7A837D]">
                      Total
                    </p>

                    <p className="mt-1 text-sm font-semibold text-[#242925]">
                      {formatCurrency(
                        data.total
                      )}
                    </p>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-2xl border border-[#E5E9E6] p-4">
                    <p className="text-xs text-[#7A837D]">
                      Pagadas
                    </p>

                    <p className="mt-1 font-semibold text-[#242925]">
                      {
                        data.cantidad_bolsas_pagadas
                      }
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#E5E9E6] p-4">
                    <p className="text-xs text-[#7A837D]">
                      Pendientes
                    </p>

                    <p className="mt-1 font-semibold text-[#242925]">
                      {
                        data.cantidad_bolsas_pendientes
                      }
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#E5E9E6] p-4">
                    <p className="text-xs text-[#7A837D]">
                      Cobrado
                    </p>

                    <p className="mt-1 font-semibold text-[#242925]">
                      {formatCurrency(
                        data.total_pagado
                      )}
                    </p>
                  </div>

                  <div className="rounded-2xl border border-[#E5E9E6] p-4">
                    <p className="text-xs text-[#7A837D]">
                      Saldo
                    </p>

                    <p className="mt-1 font-semibold text-[#242925]">
                      {formatCurrency(
                        data.saldo_pendiente
                      )}
                    </p>
                  </div>
                </div>

                <div className="mt-7">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#859089]">
                    Historial de
                    pagos
                  </p>

                  {data.pagos.length ===
                  0 ? (
                    <div className="mt-3 rounded-2xl border border-[#E4E8E5] p-5 text-sm text-[#7A837D]">
                      Esta venta
                      todavía no
                      tiene pagos
                      registrados.
                    </div>
                  ) : (
                    <div className="mt-3 overflow-hidden rounded-[20px] border border-[#E4E8E5]">
                      {data.pagos.map(
                        (
                          pago
                        ) => (
                          <div
                            key={
                              pago.id
                            }
                            className="flex items-center gap-3 border-b border-[#EEF1EF] px-4 py-4 last:border-b-0"
                          >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EEF3EF] text-[#18392B]">
                              <Banknote
                                size={
                                  18
                                }
                              />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-semibold text-[#242925]">
                                {
                                  pago.cantidad_bolsas
                                }{" "}
                                bolsas
                              </p>

                              <p className="mt-1 text-xs text-[#7A837D]">
                                {formatFecha(
                                  pago.fecha
                                )}{" "}
                                ·{" "}
                                {formatCurrency(
                                  pago.importe
                                )}
                              </p>
                            </div>

                            <button
                              type="button"
                              title="Eliminar pago"
                              onClick={() =>
                                setPagoEliminar(
                                  pago
                                )
                              }
                              className="flex h-9 w-9 items-center justify-center rounded-xl text-[#8A948E] transition hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2
                                size={
                                  16
                                }
                              />
                            </button>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          <div className="border-t border-black/5 px-5 pt-3 pb-[calc(env(safe-area-inset-bottom)+16px)] sm:pb-5">
            <button
              type="button"
              onClick={
                onClose
              }
              className="h-12 w-full rounded-xl bg-[#18392B] font-semibold text-white"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>

      <ConfirmDeletePagoModal
        open={
          pagoEliminar !==
          null
        }
        pago={
          pagoEliminar
        }
        loading={
          deleting
        }
        onCancel={() =>
          setPagoEliminar(
            null
          )
        }
        onConfirm={
          handleEliminarPago
        }
      />
    </>
  );
}