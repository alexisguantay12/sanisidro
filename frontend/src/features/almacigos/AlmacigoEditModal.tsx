import {
  useEffect,
  useState,
} from "react";

import {
  Minus,
  Plus,
  X,
} from "lucide-react";

import {
  updateAlmacigo,
} from "./api";

import type {
  Almacigo,
} from "./types";

interface Props {
  open: boolean;
  almacigo: Almacigo | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AlmacigoEditModal({
  open,
  almacigo,
  onClose,
  onSuccess,
}: Props) {
  const [
    fecha,
    setFecha,
  ] = useState("");

  const [
    cantidad,
    setCantidad,
  ] = useState(1);

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
      !almacigo
    ) {
      return;
    }

    setFecha(
      almacigo.fecha
    );

    setCantidad(
      Number(
        almacigo.cantidad
      )
    );

    setObservacion(
      almacigo.observacion ?? ""
    );

    setError("");
  }, [
    open,
    almacigo,
  ]);

  if (
    !open ||
    !almacigo
  ) {
    return null;
  }

  function decreaseCantidad() {
    setCantidad((current) =>
      Math.max(
        1,
        current - 1
      )
    );
  }

  function increaseCantidad() {
    setCantidad((current) =>
      current + 1
    );
  }

  async function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    /*
     * IMPORTANTE:
     * aunque arriba hacemos return si almacigo es null,
     * dentro de esta función TypeScript puede volver
     * a considerar que es nullable.
     */
    if (!almacigo) {
      return;
    }

    if (
      !Number.isInteger(cantidad) ||
      cantidad < 1
    ) {
      setError(
        "La cantidad debe ser un número entero mayor o igual a 1."
      );

      return;
    }

    try {
      setLoading(true);
      setError("");

      await updateAlmacigo(
        almacigo.id,
        {
          fecha,
          cantidad,
          observacion:
            observacion.trim(),
        }
      );

      onClose();

      await onSuccess();
    } catch (error: any) {
      console.error(error);

      setError(
        error?.response?.data
          ?.detail ??
          "No se pudo modificar el registro."
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
              Almácigos
            </p>

            <h2 className="mt-1 text-xl font-semibold text-[#1B1E1C]">
              Editar registro
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

            {/* FECHA */}
            <div>
              <label className="mb-2 block text-sm font-semibold text-[#444B47]">
                Fecha
              </label>

              <input
                type="date"
                required
                value={fecha}
                onChange={(e) =>
                  setFecha(
                    e.target.value
                  )
                }
                disabled={loading}
                className="h-12 w-full rounded-2xl border border-[#DDE3DF] bg-white px-4 text-sm outline-none transition focus:border-[#9FB4A6] focus:ring-4 focus:ring-[#18392B]/5 disabled:bg-slate-50"
              />
            </div>

            {/* CANTIDAD */}
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label className="text-sm font-semibold text-[#444B47]">
                  Cantidad
                </label>

                <span className="shrink-0 text-xs font-medium text-[#8A938D]">
                  Mín. 1
                </span>
              </div>

              <div className="flex items-center justify-between rounded-2xl border border-[#E0E5E1] bg-[#FAFBFA] p-2">
                <button
                  type="button"
                  onClick={
                    decreaseCantidad
                  }
                  disabled={
                    loading ||
                    cantidad <= 1
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
                  <Minus size={20} />
                </button>

                <div className="min-w-[100px] flex-1 text-center">
                  <p className="text-3xl font-semibold tracking-tight text-[#18392B]">
                    {cantidad}
                  </p>

                  <p className="mt-0.5 text-xs font-medium text-[#7A837D]">
                    {cantidad === 1
                      ? "almácigo"
                      : "almácigos"}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={
                    increaseCantidad
                  }
                  disabled={loading}
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
                  <Plus size={20} />
                </button>
              </div>

              <p className="mt-2 text-center text-xs leading-5 text-[#89918C]">
                Cada toque suma o resta 1 unidad.
              </p>

              <p className="mt-1 text-center text-xs leading-5 text-[#89918C]">
                El importe se recalculará manteniendo el valor unitario con el que fue creado este registro.
              </p>
            </div>

            {/* OBSERVACIÓN */}
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
                disabled={loading}
                className="w-full resize-none rounded-2xl border border-[#DDE3DF] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#9FB4A6] focus:ring-4 focus:ring-[#18392B]/5 disabled:bg-slate-50"
              />
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
                  : "Guardar cambios"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}