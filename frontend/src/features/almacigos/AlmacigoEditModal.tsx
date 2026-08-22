import {
  useEffect,
  useState,
} from "react";

import { X } from "lucide-react";

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
      !almacigo
    ) {
      return;
    }

    setFecha(
      almacigo.fecha
    );

    setCantidad(
      String(
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

  async function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    const cantidadNumero =
      Number(cantidad);

    if (
      !Number.isInteger(
        cantidadNumero
      ) ||
      cantidadNumero < 1
    ) {
      setError(
        "La cantidad debe ser un número entero mayor o igual a 1."
      );

      return;
    }

    try {
      setLoading(true);
      setError("");
      if(!almacigo) return;
      await updateAlmacigo(
        almacigo.id,
        {
          fecha,
          cantidad:
            cantidadNumero,
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
      <div className="flex max-h-[90dvh] w-full flex-col rounded-t-[28px] bg-white shadow-2xl sm:max-h-[90vh] sm:max-w-lg sm:rounded-[28px]">
        <div className="flex shrink-0 items-start justify-between border-b border-black/5 px-5 py-5 sm:px-6">
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
            className="flex h-10 w-10 items-center justify-center rounded-xl text-[#747D77] hover:bg-[#F3F5F3]"
          >
            <X size={20} />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex min-h-0 flex-1 flex-col"
        >
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
                  setFecha(
                    e.target.value
                  )
                }
                disabled={loading}
                className="h-12 w-full rounded-2xl border border-[#DDE3DF] bg-white px-4 text-sm outline-none focus:border-[#9FB4A6] focus:ring-4 focus:ring-[#18392B]/5"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-[#444B47]">
                Cantidad
              </label>

              <input
                type="number"
                min={1}
                step={1}
                required
                value={cantidad}
                onChange={(e) =>
                  setCantidad(
                    e.target.value
                  )
                }
                disabled={loading}
                className="h-12 w-full rounded-2xl border border-[#DDE3DF] bg-white px-4 text-sm outline-none focus:border-[#9FB4A6] focus:ring-4 focus:ring-[#18392B]/5"
              />

              <p className="mt-2 text-xs leading-5 text-[#89918C]">
                El importe se recalculará manteniendo el valor unitario con el que fue creado este registro.
              </p>
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
                disabled={loading}
                className="w-full resize-none rounded-2xl border border-[#DDE3DF] px-4 py-3 text-sm outline-none focus:border-[#9FB4A6] focus:ring-4 focus:ring-[#18392B]/5"
              />
            </div>
          </div>

          <div className="shrink-0 border-t border-black/5 bg-white px-5 pt-3 pb-[calc(env(safe-area-inset-bottom)+16px)] sm:px-6 sm:pb-5">
            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="h-12 flex-1 rounded-2xl border border-[#DDE3DF] text-sm font-semibold text-[#59615C]"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={loading}
                className="h-12 flex-1 rounded-2xl bg-[#18392B] text-sm font-semibold text-white disabled:opacity-50"
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