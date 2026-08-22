import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Check,
  X,
} from "lucide-react";

import {
  createVenta,
  updateVenta,
} from "./api";

import {
  getCompradores,
} from "../configuracion/compradores/api";

import type {
  Comprador,
} from "../configuracion/compradores/types";

import type {
  Venta,
} from "./types";

interface Props {
  open: boolean;
  venta?: Venta | null;

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

export default function VentaModal({
  open,
  venta,
  onClose,
  onSuccess,
}: Props) {
  const [
    compradores,
    setCompradores,
  ] = useState<Comprador[]>([]);

  const [
    fecha,
    setFecha,
  ] = useState(fechaHoy());

  const [
    comprador,
    setComprador,
  ] = useState("");

  const [
    cantidadBolsas,
    setCantidadBolsas,
  ] = useState("");

  const [
    precioUnitario,
    setPrecioUnitario,
  ] = useState("");

  const [
    observacion,
    setObservacion,
  ] = useState("");

  const [
    pagoInicial,
    setPagoInicial,
  ] = useState(false);

  const [
    cantidadPagada,
    setCantidadPagada,
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
    if (!open) {
      return;
    }

    getCompradores()
      .then(
        setCompradores
      )
      .catch((error) => {
        console.error(
          "Error cargando compradores",
          error
        );
      });
  }, [open]);

  useEffect(() => {
    if (!open) {
      return;
    }

    if (venta) {
      setFecha(
        venta.fecha
      );

      setComprador(
        String(
          venta.comprador
        )
      );

      setCantidadBolsas(
        String(
          venta.cantidad_bolsas
        )
      );

      setPrecioUnitario(
        String(
          venta.precio_unitario
        )
      );

      setObservacion(
        venta.observacion ?? ""
      );

      setPagoInicial(false);
      setCantidadPagada("");
    } else {
      setFecha(
        fechaHoy()
      );

      setComprador("");

      setCantidadBolsas("");

      setPrecioUnitario("");

      setObservacion("");

      setPagoInicial(false);

      setCantidadPagada("");
    }

    setError("");
  }, [
    venta,
    open,
  ]);

  const cantidad =
    Number(
      cantidadBolsas
    ) || 0;

  const precio =
    Number(
      precioUnitario
    ) || 0;

  const pagadas =
    Number(
      cantidadPagada
    ) || 0;

  const total = useMemo(
    () =>
      cantidad *
      precio,
    [
      cantidad,
      precio,
    ]
  );

  const pagoCalculado =
    useMemo(
      () =>
        pagadas *
        precio,
      [
        pagadas,
        precio,
      ]
    );

  const saldo = Math.max(
    total -
      pagoCalculado,
    0
  );

  function handleCambioBolsas(
    value: string
  ) {
    setCantidadBolsas(
      value
    );

    if (
      pagoInicial &&
      !venta
    ) {
      setCantidadPagada(
        value
      );
    }
  }

  function handlePagoInicial(
    checked: boolean
  ) {
    setPagoInicial(
      checked
    );

    if (checked) {
      setCantidadPagada(
        cantidadBolsas
      );
    } else {
      setCantidadPagada(
        ""
      );
    }
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const compradorId =
      Number(comprador);

    const bolsas =
      Number(
        cantidadBolsas
      );

    const precio =
      Number(
        precioUnitario
      );

    if (!compradorId) {
      setError(
        "Seleccioná un comprador."
      );

      return;
    }

    if (
      !fecha
    ) {
      setError(
        "Ingresá la fecha."
      );

      return;
    }

    if (
      !bolsas ||
      bolsas < 1
    ) {
      setError(
        "La cantidad de bolsas debe ser mayor a 0."
      );

      return;
    }

    if (
      !precio ||
      precio <= 0
    ) {
      setError(
        "El precio unitario debe ser mayor a 0."
      );

      return;
    }

    if (
      pagoInicial &&
      !venta
    ) {
      const bolsasPagadas =
        Number(
          cantidadPagada
        );

      if (
        !bolsasPagadas ||
        bolsasPagadas < 1
      ) {
        setError(
          "Ingresá la cantidad de bolsas pagadas."
        );

        return;
      }

      if (
        bolsasPagadas >
        bolsas
      ) {
        setError(
          "No se pueden pagar más bolsas que las vendidas."
        );

        return;
      }
    }

    try {
      setLoading(true);
      setError("");

      if (venta) {
        await updateVenta(
          venta.id,
          {
            fecha,
            comprador:
              compradorId,
            cantidad_bolsas:
              bolsas,
            precio_unitario:
              String(
                precio
              ),
            observacion:
              observacion.trim(),
          }
        );
      } else {
        await createVenta(
          {
            fecha,
            comprador:
              compradorId,
            cantidad_bolsas:
              bolsas,
            precio_unitario:
              String(
                precio
              ),
            observacion:
              observacion.trim(),

            pago_inicial:
              pagoInicial,

            cantidad_bolsas_pagadas_inicial:
              pagoInicial
                ? Number(
                    cantidadPagada
                  )
                : null,
          }
        );
      }

      onSuccess();
      onClose();
    } catch (error: any) {
      console.error(
        "Error guardando venta",
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
          "No se pudo guardar la venta."
      );
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/40 backdrop-blur-[2px] sm:items-center sm:p-4">
      <div
        className="
          flex w-full flex-col
          max-h-[94dvh]
          rounded-t-[28px]
          bg-white
          shadow-2xl
          sm:max-h-[92vh]
          sm:max-w-xl
          sm:rounded-[28px]
        "
      >
        {/* HEADER */}
        <div className="shrink-0 flex items-start justify-between border-b border-black/5 px-5 py-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#7A837D]">
              Ventas
            </p>

            <h2 className="mt-1 text-xl font-semibold text-[#1B1E1C]">
              {venta
                ? "Editar venta"
                : "Nueva venta"}
            </h2>

            <p className="mt-1 text-sm text-[#7A837D]">
              {venta
                ? "Modificá los datos de la venta."
                : "Registrá una nueva venta de cebolla."}
            </p>
          </div>

          <button
            type="button"
            disabled={
              loading
            }
            onClick={
              onClose
            }
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 disabled:opacity-50"
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
            <div className="grid gap-5 sm:grid-cols-2">
              {/* FECHA */}
              <div>
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
                  disabled={
                    loading
                  }
                  className="h-12 w-full rounded-xl border border-[#E0E5E1] bg-white px-4 outline-none transition focus:border-[#18392B] focus:ring-2 focus:ring-[#18392B]/10"
                />
              </div>

              {/* COMPRADOR */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#343A36]">
                  Comprador
                </label>

                <select
                  value={
                    comprador
                  }
                  onChange={(
                    e
                  ) =>
                    setComprador(
                      e.target
                        .value
                    )
                  }
                  disabled={
                    loading
                  }
                  className="h-12 w-full rounded-xl border border-[#E0E5E1] bg-white px-4 outline-none transition focus:border-[#18392B] focus:ring-2 focus:ring-[#18392B]/10"
                >
                  <option value="">
                    Seleccionar...
                  </option>

                  {compradores.map(
                    (
                      comprador
                    ) => (
                      <option
                        key={
                          comprador.id
                        }
                        value={
                          comprador.id
                        }
                      >
                        {
                          comprador.nombre
                        }
                      </option>
                    )
                  )}
                </select>
              </div>

              {/* BOLSAS */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#343A36]">
                  Cantidad de
                  bolsas
                </label>

                <input
                  type="number"
                  min="1"
                  step="1"
                  value={
                    cantidadBolsas
                  }
                  onChange={(
                    e
                  ) =>
                    handleCambioBolsas(
                      e.target
                        .value
                    )
                  }
                  disabled={
                    loading
                  }
                  placeholder="Ej: 1000"
                  className="h-12 w-full rounded-xl border border-[#E0E5E1] bg-white px-4 outline-none transition focus:border-[#18392B] focus:ring-2 focus:ring-[#18392B]/10"
                />
              </div>

              {/* PRECIO */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#343A36]">
                  Precio
                  unitario
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={
                    precioUnitario
                  }
                  onChange={(
                    e
                  ) =>
                    setPrecioUnitario(
                      e.target
                        .value
                    )
                  }
                  disabled={
                    loading
                  }
                  placeholder="Ej: 8000"
                  className="h-12 w-full rounded-xl border border-[#E0E5E1] bg-white px-4 outline-none transition focus:border-[#18392B] focus:ring-2 focus:ring-[#18392B]/10"
                />
              </div>
            </div>

            {/* TOTAL */}
            <div className="mt-5 rounded-2xl bg-[#F3F6F4] p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#7A837D]">
                Total de la
                venta
              </p>

              <p className="mt-1 text-xl font-semibold text-[#18392B]">
                {formatCurrency(
                  total
                )}
              </p>
            </div>

            {/* OBSERVACION */}
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
                disabled={
                  loading
                }
                placeholder="Información adicional..."
                className="w-full resize-none rounded-xl border border-[#E0E5E1] bg-white px-4 py-3 outline-none transition focus:border-[#18392B] focus:ring-2 focus:ring-[#18392B]/10"
              />
            </div>

            {/* PAGO INICIAL SOLO CREACION */}
            {!venta && (
              <div className="mt-6 rounded-[20px] border border-[#E0E5E1] p-4">
                <button
                  type="button"
                  onClick={() =>
                    handlePagoInicial(
                      !pagoInicial
                    )
                  }
                  className="flex w-full items-center gap-3 text-left"
                >
                  <div
                    className={`
                      flex h-6 w-6 shrink-0
                      items-center justify-center
                      rounded-lg border
                      transition
                      ${
                        pagoInicial
                          ? "border-[#18392B] bg-[#18392B] text-white"
                          : "border-[#CBD2CD] bg-white"
                      }
                    `}
                  >
                    {pagoInicial && (
                      <Check
                        size={
                          15
                        }
                      />
                    )}
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-[#242925]">
                      Registrar
                      pago inicial
                    </p>

                    <p className="mt-1 text-xs leading-5 text-[#7A837D]">
                      Indicá si
                      el comprador
                      paga bolsas
                      al momento
                      de registrar
                      la venta.
                    </p>
                  </div>
                </button>

                {pagoInicial && (
                  <div className="mt-4 border-t border-[#EEF1EF] pt-4">
                    <label className="mb-2 block text-sm font-semibold text-[#343A36]">
                      Bolsas
                      pagadas
                    </label>

                    <input
                      type="number"
                      min="1"
                      max={
                        cantidad ||
                        undefined
                      }
                      value={
                        cantidadPagada
                      }
                      onChange={(
                        e
                      ) =>
                        setCantidadPagada(
                          e.target
                            .value
                        )
                      }
                      className="h-12 w-full rounded-xl border border-[#E0E5E1] bg-white px-4 outline-none transition focus:border-[#18392B] focus:ring-2 focus:ring-[#18392B]/10"
                    />

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <div className="rounded-xl bg-[#F6F8F6] p-3">
                        <p className="text-xs text-[#7A837D]">
                          Pago
                          inicial
                        </p>

                        <p className="mt-1 text-sm font-semibold text-[#242925]">
                          {formatCurrency(
                            pagoCalculado
                          )}
                        </p>
                      </div>

                      <div className="rounded-xl bg-[#F6F8F6] p-3">
                        <p className="text-xs text-[#7A837D]">
                          Saldo
                        </p>

                        <p className="mt-1 text-sm font-semibold text-[#242925]">
                          {formatCurrency(
                            saldo
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {error && (
              <p className="mt-4 text-sm font-medium text-red-600">
                {error}
              </p>
            )}
          </div>

          {/* FOOTER */}
          <div className="shrink-0 border-t border-black/5 bg-white px-5 pt-3 pb-[calc(env(safe-area-inset-bottom)+16px)] sm:pb-5">
            <div className="flex gap-3">
              <button
                type="button"
                disabled={
                  loading
                }
                onClick={
                  onClose
                }
                className="h-12 flex-1 rounded-xl border border-[#E0E5E1] bg-white font-semibold text-[#59615C] transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={
                  loading
                }
                className="h-12 flex-1 rounded-xl bg-[#18392B] font-semibold text-white shadow-[0_8px_24px_rgba(24,57,43,0.18)] transition hover:bg-[#204A38] disabled:opacity-60"
              >
                {loading
                  ? "Guardando..."
                  : "Guardar"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}