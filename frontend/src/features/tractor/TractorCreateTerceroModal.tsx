import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Minus,
  Plus,
  X,
} from "lucide-react";

import {
  createTractorTercero,
} from "./api";

import type {
  Proveedor,
} from "./types";

interface Props {
  open: boolean;
  proveedores: Proveedor[];
  onClose: () => void;
  onSuccess: () => void;
}

function money(
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

function today() {
  return new Date()
    .toISOString()
    .slice(0, 10);
}

export default function TractorCreateTerceroModal({
  open,
  proveedores,
  onClose,
  onSuccess,
}: Props) {
  const [
    fecha,
    setFecha,
  ] = useState(
    today()
  );

  const [
    proveedor,
    setProveedor,
  ] = useState("");

  const [
    horas,
    setHoras,
  ] = useState(1);

  const [
    precioHora,
    setPrecioHora,
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
    if (!open) {
      return;
    }

    setFecha(today());
    setProveedor("");
    setHoras(1);
    setPrecioHora("");
    setObservacion("");
    setError("");
  }, [open]);

  const total =
    useMemo(() => {
      return (
        horas *
        Number(
          precioHora || 0
        )
      );
    }, [
      horas,
      precioHora,
    ]);

  if (!open) {
    return null;
  }

  function decreaseHours() {
    setHoras((current) =>
      Math.max(
        0.5,
        Number(
          (
            current - 0.5
          ).toFixed(1)
        )
      )
    );
  }

  function increaseHours() {
    setHoras((current) =>
      Math.min(
        50,
        Number(
          (
            current + 0.5
          ).toFixed(1)
        )
      )
    );
  }

  async function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    const precio =
      Number(
        precioHora
      );

    if (!proveedor) {
      setError(
        "Seleccioná un proveedor."
      );

      return;
    }

    if (
      horas < 0.5 ||
      horas > 50
    ) {
      setError(
        "Las horas deben estar entre 0,5 y 50."
      );

      return;
    }

    if (precio <= 0) {
      setError(
        "El precio por hora debe ser mayor a cero."
      );

      return;
    }

    try {
      setLoading(true);
      setError("");

      await createTractorTercero({
        fecha,
        proveedor:
          Number(
            proveedor
          ),
        cantidad_horas:
          horas,
        precio_hora:
          precio,
        observacion:
          observacion.trim(),
      });

      onClose();

      await onSuccess();
    } catch (error: any) {
      console.error(
        error
      );

      setError(
        error?.response?.data
          ?.detail ??
          "No se pudo registrar el trabajo."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-end justify-center bg-black/40 backdrop-blur-[2px] sm:items-center sm:p-4">
      <div
        className="
          flex w-full flex-col
          max-h-[90dvh]
          rounded-t-[28px]
          bg-white
          shadow-2xl
          sm:max-h-[90vh]
          sm:max-w-lg
          sm:rounded-[28px]
        "
      >
        {/* HEADER */}
        <div className="shrink-0 flex items-start justify-between border-b border-black/5 px-5 py-5 sm:px-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#859089]">
              Tractor · Terceros
            </p>

            <h2 className="mt-1 text-xl font-semibold text-[#1B1E1C]">
              Nuevo trabajo
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
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#747D77] transition hover:bg-[#F3F5F3] disabled:opacity-50"
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
          {/* CONTENIDO */}
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            {/* FECHA */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#444B47]">
                Fecha
              </label>

              <input
                type="date"
                required
                value={
                  fecha
                }
                onChange={(
                  e
                ) =>
                  setFecha(
                    e.target.value
                  )
                }
                disabled={
                  loading
                }
                className="h-12 w-full rounded-2xl border border-[#DDE3DF] bg-white px-4 text-sm outline-none transition focus:border-[#9FB4A6] focus:ring-4 focus:ring-[#18392B]/5 disabled:bg-slate-50"
              />
            </div>

            {/* PROVEEDOR */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#444B47]">
                Proveedor
              </label>

              <select
                required
                value={
                  proveedor
                }
                onChange={(
                  e
                ) =>
                  setProveedor(
                    e.target.value
                  )
                }
                disabled={
                  loading
                }
                className="h-12 w-full rounded-2xl border border-[#DDE3DF] bg-white px-4 text-sm outline-none transition focus:border-[#9FB4A6] focus:ring-4 focus:ring-[#18392B]/5 disabled:bg-slate-50"
              >
                <option value="">
                  Seleccionar proveedor...
                </option>

                {proveedores.map(
                  (
                    item
                  ) => (
                    <option
                      key={
                        item.id
                      }
                      value={
                        item.id
                      }
                    >
                      {
                        item.nombre
                      }
                    </option>
                  )
                )}
              </select>
            </div>

            {/* HORAS */}
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label className="text-sm font-semibold text-[#444B47]">
                  Cantidad de horas
                </label>

                <span className="shrink-0 text-xs font-medium text-[#8A938D]">
                  Mín. 0,5 · Máx. 50
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-[#E0E5E1] bg-[#FAFBFA] p-2">
                <button
                  type="button"
                  onClick={
                    decreaseHours
                  }
                  disabled={
                    loading ||
                    horas <= 0.5
                  }
                  className="
                    flex h-12 w-12
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-white
                    text-[#4F5852]
                    shadow-sm
                    transition
                    hover:bg-[#F2F4F2]
                    disabled:cursor-not-allowed
                    disabled:opacity-30
                  "
                >
                  <Minus
                    size={20}
                  />
                </button>

                <div className="min-w-[100px] flex-1 text-center">
                  <p className="text-3xl font-semibold tracking-tight text-[#18392B]">
                    {horas.toLocaleString(
                      "es-AR",
                      {
                        minimumFractionDigits:
                          horas % 1 === 0
                            ? 0
                            : 1,
                        maximumFractionDigits: 1,
                      }
                    )}
                  </p>

                  <p className="mt-0.5 text-xs font-medium text-[#7A837D]">
                    {horas <= 1
                      ? "hora"
                      : "horas"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    increaseHours
                  }
                  disabled={
                    loading ||
                    horas >= 50
                  }
                  className="
                    flex h-12 w-12
                    shrink-0
                    items-center
                    justify-center
                    rounded-xl
                    bg-[#EAF2ED]
                    text-[#18392B]
                    transition
                    hover:bg-[#DCE9E0]
                    disabled:cursor-not-allowed
                    disabled:opacity-30
                  "
                >
                  <Plus
                    size={20}
                  />
                </button>
              </div>

              <p className="mt-2 text-center text-xs text-[#828B85]">
                Cada toque suma o resta 0,5 horas
              </p>
            </div>

            {/* PRECIO HORA */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#444B47]">
                Precio por hora
              </label>

              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-[#7A837D]">
                  $
                </span>

                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  placeholder=""
                  value={
                    precioHora
                  }
                  onChange={(
                    e
                  ) =>
                    setPrecioHora(
                      e.target.value
                    )
                  }
                  disabled={
                    loading
                  }
                  className="h-12 w-full rounded-2xl border border-[#DDE3DF] bg-white pl-9 pr-4 text-sm outline-none transition focus:border-[#9FB4A6] focus:ring-4 focus:ring-[#18392B]/5 disabled:bg-slate-50"
                />
              </div>
            </div>

            {/* OBSERVACIÓN */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#444B47]">
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
                    e.target.value
                  )
                }
                placeholder="Detalle del trabajo..."
                disabled={
                  loading
                }
                className="w-full resize-none rounded-2xl border border-[#DDE3DF] bg-white px-4 py-3 text-sm outline-none transition placeholder:text-[#A3AAA5] focus:border-[#9FB4A6] focus:ring-4 focus:ring-[#18392B]/5 disabled:bg-slate-50"
              />
            </div>

            {/* RESUMEN */}
            <div className="rounded-[20px] bg-[#F4F7F5] p-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#87918A]">
                    Precio hora
                  </p>

                  <p className="mt-1 font-semibold text-[#1B1E1C]">
                    {precioHora
                      ? money(
                          Number(
                            precioHora
                          )
                        )
                      : money(
                          0
                        )}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#87918A]">
                    Total
                  </p>

                  <p className="mt-1 text-lg font-semibold text-[#18392B]">
                    {money(
                      total
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* FOOTER */}
          <div
            className="
              shrink-0
              border-t border-black/5
              bg-white
              px-5
              pt-3
              pb-[calc(env(safe-area-inset-bottom)+16px)]
              sm:px-6
              sm:pb-5
            "
          >
            <div className="flex gap-3">
              <button
                type="button"
                onClick={
                  onClose
                }
                disabled={
                  loading
                }
                className="h-12 flex-1 rounded-2xl border border-[#DDE3DF] text-sm font-semibold text-[#59615C] transition hover:bg-[#F7F8F7] disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={
                  loading
                }
                className="h-12 flex-1 rounded-2xl bg-[#18392B] text-sm font-semibold text-white shadow-[0_8px_22px_rgba(24,57,43,0.16)] transition hover:bg-[#204A38] disabled:cursor-not-allowed disabled:opacity-50"
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