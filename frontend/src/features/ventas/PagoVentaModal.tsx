import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Banknote,
  X,
} from "lucide-react";

import {
  createPagoVenta,
} from "./api";

import type {
  Venta,
} from "./types";

interface Props {
  open: boolean;
  venta: Venta | null;

  onClose: () => void;
  onSuccess: () => void;
}

function fechaHoy() {
  return new Date()
    .toISOString()
    .slice(0, 10);
}

function formatCurrency(
  value: number
) {
  return new Intl.NumberFormat(
    "es-AR",
    {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 2,
    }
  ).format(value);
}

export default function PagoVentaModal({
  open,
  venta,
  onClose,
  onSuccess,
}: Props) {
  const [
    fecha,
    setFecha,
  ] = useState(fechaHoy());

  const [
    cantidad,
    setCantidad,
  ] = useState("");

  const [
    observacion,
    setObservacion,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  useEffect(() => {
    if (
      !open ||
      !venta
    ) {
      return;
    }

    setFecha(
      fechaHoy()
    );

    setCantidad(
      String(
        venta.cantidad_bolsas_pendientes
      )
    );

    setObservacion("");

    setError("");
  }, [
    open,
    venta,
  ]);

  const importe =
    useMemo(() => {
      if (!venta) {
        return 0;
      }

      return (
        (Number(
          cantidad
        ) || 0) *
        Number(
          venta.precio_unitario
        )
      );
    }, [
      cantidad,
      venta,
    ]);

  if (
    !open ||
    !venta
  ) {
    return null;
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const cantidadNumero =
      Number(
        cantidad
      );

    if (
      !cantidadNumero ||
      cantidadNumero < 1
    ) {
      setError(
        "La cantidad debe ser mayor a 0."
      );

      return;
    }
    if(!venta)return;
    if (
      cantidadNumero >
      venta.cantidad_bolsas_pendientes
    ) {
      setError(
        `Solo quedan ${venta.cantidad_bolsas_pendientes} bolsas pendientes.`
      );

      return;
    }

    try {
      setLoading(true);
      setError("");
      if(!venta)return;
      await createPagoVenta(
        {
          venta:
            venta.id,
          fecha,
          cantidad_bolsas:
            cantidadNumero,
          observacion:
            observacion.trim(),
        }
      );

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(
        "Error registrando pago",
        error
      );

      const data =
        error?.response
          ?.data;

      const detalle =
        data &&
        typeof data ===
          "object"
          ? Object.values(
              data
            )
              .flat()
              .join(" ")
          : null;

      setError(
        detalle ||
          "No se pudo registrar el pago."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/40 backdrop-blur-[2px] sm:items-center sm:p-4">
      <div className="flex w-full flex-col max-h-[92dvh] rounded-t-[28px] bg-white shadow-2xl sm:max-w-md sm:rounded-[28px]">
        <div className="flex items-start justify-between border-b border-black/5 px-5 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7A837D]">
              Cobranza
            </p>

            <h2 className="mt-1 text-xl font-semibold text-[#1B1E1C]">
              Registrar pago
            </h2>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            disabled={
              loading
            }
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100"
          >
            <X
              size={20}
            />
          </button>
        </div>

        <form
          onSubmit={
            handleSubmit
          }
          className="flex min-h-0 flex-1 flex-col"
        >
          <div className="min-h-0 flex-1 overflow-y-auto p-5">
            <div className="rounded-[20px] bg-[#F3F6F4] p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-[#18392B]">
                  <Banknote
                    size={
                      19
                    }
                  />
                </div>

                <div>
                  <p className="font-semibold text-[#242925]">
                    {
                      venta.comprador_nombre
                    }
                  </p>

                  <p className="mt-1 text-xs text-[#7A837D]">
                    Venta #
                    {
                      venta.id
                    }
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3">
                <div>
                  <p className="text-xs text-[#7A837D]">
                    Vendidas
                  </p>

                  <p className="mt-1 font-semibold text-[#242925]">
                    {
                      venta.cantidad_bolsas
                    }
                  </p>
                </div>

                <div>
                  <p className="text-xs text-[#7A837D]">
                    Pendientes
                  </p>

                  <p className="mt-1 font-semibold text-[#242925]">
                    {
                      venta.cantidad_bolsas_pendientes
                    }
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-semibold text-[#343A36]">
                Fecha
              </label>

              <input
                type="date"
                value={
                  fecha
                }
                onChange={(
                  e
                ) =>
                  setFecha(
                    e.target
                      .value
                  )
                }
                className="h-12 w-full rounded-xl border border-[#E0E5E1] px-4 outline-none focus:border-[#18392B] focus:ring-2 focus:ring-[#18392B]/10"
              />
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-semibold text-[#343A36]">
                Cantidad de
                bolsas
              </label>

            <input
            type="number"
            min="1"
            max={venta.cantidad_bolsas_pendientes}
            value={cantidad}
            onChange={(e) => {
                const value = e.target.value;

                if (value === "") {
                setCantidad("");
                return;
                }

                const numero = Number(value);

                if (
                numero >
                venta.cantidad_bolsas_pendientes
                ) {
                setCantidad(
                    String(
                    venta.cantidad_bolsas_pendientes
                    )
                );

                return;
                }

                setCantidad(value);
            }}
            className="h-12 w-full rounded-xl border border-[#E0E5E1] px-4 outline-none focus:border-[#18392B] focus:ring-2 focus:ring-[#18392B]/10"
            />
            </div>

            <div className="mt-4 rounded-2xl bg-[#18392B] p-4 text-white">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/60">
                Importe
              </p>

              <p className="mt-1 text-xl font-semibold">
                {formatCurrency(
                  importe
                )}
              </p>
            </div>

            <div className="mt-5">
              <label className="mb-2 block text-sm font-semibold text-[#343A36]">
                Observación
              </label>

              <textarea
                rows={3}
                value={
                  observacion
                }
                onChange={(
                  e
                ) =>
                  setObservacion(
                    e.target
                      .value
                  )
                }
                placeholder="Información adicional..."
                className="w-full resize-none rounded-xl border border-[#E0E5E1] px-4 py-3 outline-none focus:border-[#18392B] focus:ring-2 focus:ring-[#18392B]/10"
              />
            </div>

            {error && (
              <p className="mt-4 text-sm font-medium text-red-600">
                {error}
              </p>
            )}
          </div>

          <div className="border-t border-black/5 px-5 pt-3 pb-[calc(env(safe-area-inset-bottom)+16px)] sm:pb-5">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={
                  onClose
                }
                disabled={
                  loading
                }
                className="h-12 flex-1 rounded-xl border border-[#E0E5E1] font-semibold text-[#59615C]"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={
                  loading
                }
                className="h-12 flex-1 rounded-xl bg-[#18392B] font-semibold text-white transition hover:bg-[#204A38] disabled:opacity-60"
              >
                {loading
                  ? "Registrando..."
                  : "Registrar pago"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}