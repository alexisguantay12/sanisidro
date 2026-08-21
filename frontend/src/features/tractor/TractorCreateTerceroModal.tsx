import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { X } from "lucide-react";

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

function money(value: number) {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2,
  }).format(value);
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
  const [fecha, setFecha] = useState(today());
  const [proveedor, setProveedor] = useState("");
  const [horas, setHoras] = useState("");
  const [precioHora, setPrecioHora] = useState("");
  const [observacion, setObservacion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    setFecha(today());
    setProveedor("");
    setHoras("");
    setPrecioHora("");
    setObservacion("");
    setError("");
  }, [open]);

  const total = useMemo(
    () =>
      Number(horas || 0) *
      Number(precioHora || 0),
    [horas, precioHora]
  );

  if (!open) {
    return null;
  }

  async function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    const cantidad =
      Number(horas);

    const precio =
      Number(precioHora);

    if (!proveedor) {
      setError(
        "Seleccioná un proveedor."
      );
      return;
    }

    if (
      cantidad < 1 ||
      cantidad > 50
    ) {
      setError(
        "Las horas deben estar entre 1 y 50."
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
        proveedor: Number(proveedor),
        cantidad_horas: cantidad,
        precio_hora: precio,
        observacion:
          observacion.trim(),
      });

      onClose();
      await onSuccess();
    } catch (error: any) {
      console.error(error);

      setError(
        error?.response?.data?.detail ??
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
            onClick={onClose}
            disabled={loading}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-[#747D77] transition hover:bg-[#F3F5F3] disabled:opacity-50"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
          {/* CONTENIDO */}
          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-5 sm:p-6">
            {error && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-medium text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#444B47]">
                Fecha
              </label>

              <input
                type="date"
                required
                value={fecha}
                onChange={(e) =>
                  setFecha(e.target.value)
                }
                disabled={loading}
                className="h-12 w-full rounded-2xl border border-[#DDE3DF] bg-white px-4 text-sm outline-none focus:border-[#9FB4A6] focus:ring-4 focus:ring-[#18392B]/5 disabled:bg-slate-50"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#444B47]">
                Proveedor
              </label>

              <select
                required
                value={proveedor}
                onChange={(e) =>
                  setProveedor(e.target.value)
                }
                disabled={loading}
                className="h-12 w-full rounded-2xl border border-[#DDE3DF] bg-white px-4 text-sm outline-none focus:border-[#9FB4A6] focus:ring-4 focus:ring-[#18392B]/5 disabled:bg-slate-50"
              >
                <option value="">
                  Seleccionar proveedor...
                </option>

                {proveedores.map(
                  (item) => (
                    <option
                      key={item.id}
                      value={item.id}
                    >
                      {item.nombre}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-2 block text-sm font-semibold text-[#444B47]">
                  Horas
                </label>

                <input
                  type="number"
                  min={1}
                  max={50}
                  step="0.5"
                  required
                  placeholder="5"
                  value={horas}
                  onChange={(e) =>
                    setHoras(e.target.value)
                  }
                  disabled={loading}
                  className="h-12 w-full rounded-2xl border border-[#DDE3DF] bg-white px-4 text-sm outline-none focus:border-[#9FB4A6] focus:ring-4 focus:ring-[#18392B]/5 disabled:bg-slate-50"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-[#444B47]">
                  Precio / hora
                </label>

                <input
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  placeholder="35000"
                  value={precioHora}
                  onChange={(e) =>
                    setPrecioHora(
                      e.target.value
                    )
                  }
                  disabled={loading}
                  className="h-12 w-full rounded-2xl border border-[#DDE3DF] bg-white px-4 text-sm outline-none focus:border-[#9FB4A6] focus:ring-4 focus:ring-[#18392B]/5 disabled:bg-slate-50"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#444B47]">
                Observación
              </label>

              <textarea
                rows={3}
                value={observacion}
                onChange={(e) =>
                  setObservacion(
                    e.target.value
                  )
                }
                placeholder="Detalle del trabajo..."
                disabled={loading}
                className="w-full resize-none rounded-2xl border border-[#DDE3DF] bg-white px-4 py-3 text-sm outline-none placeholder:text-[#A3AAA5] focus:border-[#9FB4A6] focus:ring-4 focus:ring-[#18392B]/5 disabled:bg-slate-50"
              />
            </div>

            <div className="rounded-[20px] bg-[#18392B] p-4 text-white">
              <p className="text-xs font-semibold uppercase tracking-wide text-white/60">
                Importe estimado
              </p>

              <p className="mt-2 text-2xl font-semibold tracking-tight">
                {money(total)}
              </p>
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
                onClick={onClose}
                disabled={loading}
                className="h-12 flex-1 rounded-2xl border border-[#DDE3DF] text-sm font-semibold text-[#59615C] transition hover:bg-[#F7F8F7] disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={loading}
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